import { db, getDbTransaction } from "@/lib/database/client";
import { chatMessage, chatMessageMedia, chatMessageReaction, type LinkPreview } from "@/lib/database/schemas/chat";
import { media } from "@/lib/database/schemas/media";
import { user } from "@/lib/database/schemas/auth";
import { tribeMember } from "@/lib/database/schemas/tribe";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { userPreviewColumns } from "@/lib/database/user-columns";
import { getMemberWithPermissions, type MemberWithPermissions } from "./permissions";
import { resolveEffectivePermissions } from "./member-permissions";
import { excludeBlocked, isBlockedPair } from "./blocks";
import { excerpt } from "./notifications";
import { getTimelineInTribe, roleMeetsTimelinePermission, type Timeline } from "./timeline";
import { fetchLinkPreview, firstUrl } from "./link-preview";

/**
 * Chat in chat timelines (TRI-315, PRD §5.13 R13.6). Messages have text, photos, a reply, @mentions and
 * reactions; authors edit and delete their own, whoever has `canDeleteAnyPost` deletes any. Blocked pairs never
 * see each other's messages (TRI-238). Live delivery is TRI-316; mention and reply notifications TRI-317.
 */

export const CHAT_PAGE_DEFAULT = 30;

type UserPreview = { id: string; name: string; displayName: string | null; image: string | null };

export type ChatImage = { id: string; url: string; width?: number; height?: number; blurhash?: string };

export type ChatReaction = { emoji: string; count: number; reactedByMe: boolean };

export type ChatReplyPreview = { id: string; author: UserPreview; excerpt: string; isDeleted: boolean };

export type ChatMessageDto = {
  id: string;
  timelineId: string;
  author: UserPreview;
  body: string;
  media: ChatImage[];
  // Null when the message isn't a reply, or its parent is gone or hidden from the viewer (blocked pair)
  replyTo: ChatReplyPreview | null;
  mentionUserIds: string[];
  reactions: ChatReaction[];
  linkPreview: LinkPreview | null;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
};

export class ChatError extends Error {
  constructor(
    public code: "NOT_A_MEMBER" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_MEDIA" | "INVALID_REPLY" | "EMPTY_MESSAGE" | "MESSAGE_DELETED",
    message: string,
    public status: 400 | 403 | 404,
  ) {
    super(message);
    this.name = "ChatError";
  }
}

type ChatContext = { memberData: MemberWithPermissions; timeline: Timeline };

/** The caller's membership and the chat timeline, or a ChatError (a posts timeline is as unknown here). */
async function chatContext(tribeId: string, timelineId: string, userId: string): Promise<ChatContext> {
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new ChatError("NOT_A_MEMBER", "You must be a member of this tribe", 403);
  }
  const target = await getTimelineInTribe(tribeId, timelineId);
  if (!target || target.type !== "chat") {
    throw new ChatError("NOT_FOUND", "Chat timeline not found", 404);
  }
  return { memberData, timeline: target };
}

async function permissionsOf(tribeId: string, memberData: MemberWithPermissions) {
  return (await resolveEffectivePermissions(tribeId, memberData)).effectivePermissions;
}

const messageColumns = {
  id: chatMessage.id,
  timelineId: chatMessage.timelineId,
  authorId: chatMessage.authorId,
  body: chatMessage.body,
  replyToId: chatMessage.replyToId,
  mentionUserIds: chatMessage.mentionUserIds,
  linkPreview: chatMessage.linkPreview,
  editedAt: chatMessage.editedAt,
  deletedAt: chatMessage.deletedAt,
  createdAt: chatMessage.createdAt,
};


/** Rows → DTOs with authors, photos, reactions and reply previews, in a constant number of queries. */
async function hydrate(rows: Array<{ id: string; authorId: string; replyToId: string | null } & Record<string, any>>, viewerId: string): Promise<ChatMessageDto[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const parentIds = [...new Set(rows.map((row) => row.replyToId).filter((id): id is string => Boolean(id)))];
  const authorIds = [...new Set(rows.map((row) => row.authorId))];

  const notBlockedParent = excludeBlocked(viewerId, chatMessage.authorId);
  const [authors, photos, reactions, parents] = await Promise.all([
    db.select(userPreviewColumns).from(user).where(inArray(user.id, authorIds)),
    db
      .select({
        messageId: chatMessageMedia.messageId,
        id: media.id,
        url: media.fileUrl,
        width: media.width,
        height: media.height,
        blurhash: media.blurhash,
      })
      .from(chatMessageMedia)
      .innerJoin(media, eq(chatMessageMedia.mediaId, media.id))
      .where(inArray(chatMessageMedia.messageId, ids))
      .orderBy(asc(chatMessageMedia.displayOrder)),
    db
      .select({
        messageId: chatMessageReaction.messageId,
        emoji: chatMessageReaction.emoji,
        count: sql<number>`count(*)::int`,
        mine: sql<boolean>`bool_or(${chatMessageReaction.userId} = ${viewerId}::uuid)`,
        first: sql<Date>`min(${chatMessageReaction.createdAt})`,
      })
      .from(chatMessageReaction)
      .where(and(inArray(chatMessageReaction.messageId, ids), excludeBlocked(viewerId, chatMessageReaction.userId)))
      .groupBy(chatMessageReaction.messageId, chatMessageReaction.emoji)
      .orderBy(sql`min(${chatMessageReaction.createdAt})`),
    parentIds.length === 0
      ? Promise.resolve([])
      : db
          .select({ id: chatMessage.id, body: chatMessage.body, deletedAt: chatMessage.deletedAt, author: userPreviewColumns })
          .from(chatMessage)
          .innerJoin(user, eq(chatMessage.authorId, user.id))
          .where(notBlockedParent ? and(inArray(chatMessage.id, parentIds), notBlockedParent) : inArray(chatMessage.id, parentIds)),
  ]);

  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const photoMap = new Map<string, ChatImage[]>();
  for (const p of photos) {
    const list = photoMap.get(p.messageId) ?? [];
    list.push({ id: p.id, url: p.url, width: p.width ?? undefined, height: p.height ?? undefined, blurhash: p.blurhash ?? undefined });
    photoMap.set(p.messageId, list);
  }
  const reactionMap = new Map<string, ChatReaction[]>();
  for (const r of reactions) {
    const list = reactionMap.get(r.messageId) ?? [];
    list.push({ emoji: r.emoji, count: Number(r.count), reactedByMe: r.mine === true });
    reactionMap.set(r.messageId, list);
  }
  const parentMap = new Map(
    parents.map((p) => [
      p.id,
      { id: p.id, author: p.author, excerpt: p.deletedAt ? "" : excerpt(p.body, 120), isDeleted: p.deletedAt !== null },
    ]),
  );

  return rows.map((row) => ({
    id: row.id,
    timelineId: row.timelineId,
    author: authorMap.get(row.authorId) ?? { id: row.authorId, name: "Deleted user", displayName: null, image: null },
    body: row.body,
    media: photoMap.get(row.id) ?? [],
    replyTo: row.replyToId ? parentMap.get(row.replyToId) ?? null : null,
    mentionUserIds: row.mentionUserIds ?? [],
    reactions: reactionMap.get(row.id) ?? [],
    linkPreview: row.linkPreview ?? null,
    editedAt: row.editedAt,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
  }));
}

/** One message as the viewer sees it (null when missing, in another timeline or hidden by a block). */
async function getVisibleMessage(timelineId: string, messageId: string, viewerId: string) {
  const conditions = [eq(chatMessage.id, messageId), eq(chatMessage.timelineId, timelineId)];
  const notBlocked = excludeBlocked(viewerId, chatMessage.authorId);
  if (notBlocked) conditions.push(notBlocked);
  const [row] = await db.select(messageColumns).from(chatMessage).where(and(...conditions)).limit(1);
  return row ?? null;
}

/** History, newest first, `limit` per page before the `before` message. Deleted messages stay as placeholders. */
export async function listMessages(
  tribeId: string,
  timelineId: string,
  userId: string,
  options: { before?: string; limit?: number } = {},
): Promise<{ messages: ChatMessageDto[]; hasMore: boolean }> {
  await chatContext(tribeId, timelineId, userId);
  const limit = options.limit ?? CHAT_PAGE_DEFAULT;

  const conditions = [eq(chatMessage.timelineId, timelineId)];
  const notBlocked = excludeBlocked(userId, chatMessage.authorId);
  if (notBlocked) conditions.push(notBlocked);
  if (options.before) {
    const [cursor] = await db
      .select({ id: chatMessage.id })
      .from(chatMessage)
      .where(and(eq(chatMessage.id, options.before), eq(chatMessage.timelineId, timelineId)))
      .limit(1);
    if (!cursor) {
      throw new ChatError("NOT_FOUND", "The `before` message is not in this timeline", 404);
    }
    // Compared in SQL: a JS Date would drop the timestamp's microseconds and shift its zone
    conditions.push(
      sql`(${chatMessage.createdAt}, ${chatMessage.id}) < (select c.created_at, c.id from ${chatMessage} c where c.id = ${cursor.id}::uuid)`,
    );
  }

  const rows = await db
    .select(messageColumns)
    .from(chatMessage)
    .where(and(...conditions))
    .orderBy(desc(chatMessage.createdAt), desc(chatMessage.id))
    .limit(limit + 1);

  const page = rows.slice(0, limit);
  return { messages: await hydrate(page, userId), hasMore: rows.length > limit };
}

/** Mentioned ids that are members of the tribe, deduped, in the order given. */
async function memberIdsOf(tribeId: string, ids: string[] | undefined): Promise<string[]> {
  const unique = [...new Set(ids ?? [])];
  if (unique.length === 0) return [];
  const rows = await db
    .select({ userId: tribeMember.userId })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), inArray(tribeMember.userId, unique)));
  const members = new Set(rows.map((row) => row.userId));
  return unique.filter((id) => members.has(id));
}

/** Send a message. Needs `canSendMessages` and the timeline's "who can post". */
export async function sendMessage(
  tribeId: string,
  timelineId: string,
  userId: string,
  input: { body?: string; mediaIds?: string[]; replyToId?: string | null; mentionUserIds?: string[] },
): Promise<ChatMessageDto> {
  const { memberData, timeline: target } = await chatContext(tribeId, timelineId, userId);
  const permissions = await permissionsOf(tribeId, memberData);
  if (!permissions.canSendMessages || !roleMeetsTimelinePermission(memberData.member.role, target.postPermission)) {
    throw new ChatError("FORBIDDEN", "You do not have permission to send messages in this timeline", 403);
  }

  const body = (input.body ?? "").trim();
  const mediaIds = [...new Set(input.mediaIds ?? [])];
  if (!body && mediaIds.length === 0) {
    throw new ChatError("EMPTY_MESSAGE", "A message needs text or a photo", 400);
  }

  // Photos: the sender's own images in this tribe, not on a post or another message
  if (mediaIds.length > 0) {
    const rows = await db
      .select({ id: media.id })
      .from(media)
      .leftJoin(chatMessageMedia, eq(chatMessageMedia.mediaId, media.id))
      .where(
        and(
          inArray(media.id, mediaIds),
          eq(media.tribeId, tribeId),
          eq(media.uploadedBy, userId),
          eq(media.fileType, "image"),
          isNull(media.postId),
          isNull(chatMessageMedia.id),
        ),
      );
    if (rows.length !== mediaIds.length) {
      throw new ChatError("INVALID_MEDIA", "One or more photos cannot be attached to this message", 400);
    }
  }

  if (input.replyToId) {
    const parent = await getVisibleMessage(timelineId, input.replyToId, userId);
    if (!parent) {
      throw new ChatError("INVALID_REPLY", "The message you're replying to isn't in this timeline", 400);
    }
  }

  const mentionUserIds = await memberIdsOf(tribeId, input.mentionUserIds);

  const created = await getDbTransaction().transaction(async (tx) => {
    const [row] = await tx
      .insert(chatMessage)
      .values({ timelineId, tribeId, authorId: userId, body, replyToId: input.replyToId ?? null, mentionUserIds })
      .returning();
    if (mediaIds.length > 0) {
      await tx.insert(chatMessageMedia).values(mediaIds.map((mediaId, index) => ({ messageId: row.id, mediaId, displayOrder: index })));
    }
    return row;
  });

  const [dto] = await hydrate([created], userId);
  return dto;
}

async function visibleOrThrow(timelineId: string, messageId: string, userId: string) {
  const row = await getVisibleMessage(timelineId, messageId, userId);
  if (!row) {
    throw new ChatError("NOT_FOUND", "Message not found", 404);
  }
  return row;
}

/** Edit your own message's text (photos stay). The link preview is refreshed after the response. */
export async function editMessage(
  tribeId: string,
  timelineId: string,
  messageId: string,
  userId: string,
  input: { body: string; mentionUserIds?: string[] },
): Promise<ChatMessageDto> {
  await chatContext(tribeId, timelineId, userId);
  const row = await visibleOrThrow(timelineId, messageId, userId);
  if (row.authorId !== userId) {
    throw new ChatError("FORBIDDEN", "You can only edit your own messages", 403);
  }
  if (row.deletedAt) {
    throw new ChatError("MESSAGE_DELETED", "This message was deleted", 400);
  }
  const body = input.body.trim();
  if (!body) {
    const [photo] = await db.select({ id: chatMessageMedia.id }).from(chatMessageMedia).where(eq(chatMessageMedia.messageId, messageId)).limit(1);
    if (!photo) {
      throw new ChatError("EMPTY_MESSAGE", "A message needs text or a photo", 400);
    }
  }
  const mentionUserIds = input.mentionUserIds ? await memberIdsOf(tribeId, input.mentionUserIds) : row.mentionUserIds;
  const urlChanged = firstUrl(body) !== firstUrl(row.body);

  const [updated] = await db
    .update(chatMessage)
    .set({ body, mentionUserIds, editedAt: new Date(), ...(urlChanged ? { linkPreview: null } : {}) })
    .where(eq(chatMessage.id, messageId))
    .returning();
  const [dto] = await hydrate([updated], userId);
  return dto;
}

/**
 * Delete a message: your own, or any with `canDeleteAnyPost`. The row stays as a "Message deleted" placeholder
 * (replies keep a parent); its text, preview and mentions are cleared and its photos and reactions removed.
 */
export async function deleteMessage(tribeId: string, timelineId: string, messageId: string, userId: string): Promise<void> {
  const { memberData } = await chatContext(tribeId, timelineId, userId);
  const row = await visibleOrThrow(timelineId, messageId, userId);
  if (row.deletedAt) return;
  if (row.authorId !== userId) {
    const permissions = await permissionsOf(tribeId, memberData);
    if (!permissions.canDeleteAnyPost) {
      throw new ChatError("FORBIDDEN", "You do not have permission to delete this message", 403);
    }
  }

  await getDbTransaction().transaction(async (tx) => {
    // The photos go too (their chat_message_media and album rows cascade), as for a deleted post
    await tx.delete(media).where(
      inArray(media.id, tx.select({ id: chatMessageMedia.mediaId }).from(chatMessageMedia).where(eq(chatMessageMedia.messageId, messageId))),
    );
    await tx.delete(chatMessageReaction).where(eq(chatMessageReaction.messageId, messageId));
    await tx
      .update(chatMessage)
      .set({ body: "", linkPreview: null, mentionUserIds: [], deletedAt: new Date() })
      .where(eq(chatMessage.id, messageId));
  });
}

/** React with an emoji (idempotent). */
export async function addReaction(tribeId: string, timelineId: string, messageId: string, userId: string, emoji: string) {
  await chatContext(tribeId, timelineId, userId);
  const row = await visibleOrThrow(timelineId, messageId, userId);
  if (row.deletedAt) {
    throw new ChatError("MESSAGE_DELETED", "This message was deleted", 400);
  }
  await db.insert(chatMessageReaction).values({ messageId, userId, emoji }).onConflictDoNothing();
  const [dto] = await hydrate([row], userId);
  return dto.reactions;
}

/** Take back your reaction (idempotent). */
export async function removeReaction(tribeId: string, timelineId: string, messageId: string, userId: string, emoji: string) {
  await chatContext(tribeId, timelineId, userId);
  const row = await visibleOrThrow(timelineId, messageId, userId);
  await db
    .delete(chatMessageReaction)
    .where(and(eq(chatMessageReaction.messageId, messageId), eq(chatMessageReaction.userId, userId), eq(chatMessageReaction.emoji, emoji)));
  const [dto] = await hydrate([row], userId);
  return dto.reactions;
}

/** After a send or an edit: unfurl the first URL, if the message still says the same thing. */
export async function refreshLinkPreview(messageId: string): Promise<void> {
  const [row] = await db
    .select({ body: chatMessage.body, deletedAt: chatMessage.deletedAt, linkPreview: chatMessage.linkPreview })
    .from(chatMessage)
    .where(eq(chatMessage.id, messageId))
    .limit(1);
  if (!row || row.deletedAt || row.linkPreview) return;
  const url = firstUrl(row.body);
  if (!url) return;
  const preview = await fetchLinkPreview(url);
  if (!preview) return;
  await db
    .update(chatMessage)
    .set({ linkPreview: preview })
    .where(and(eq(chatMessage.id, messageId), eq(chatMessage.body, row.body), isNull(chatMessage.deletedAt)));
}
