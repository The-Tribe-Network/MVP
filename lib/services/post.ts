import { db, getDbTransaction } from "@/lib/database/client";
import { post, postLike, postMedia, comment, commentLike } from "@/lib/database/schemas/post";
import { event, eventAttendee } from "@/lib/database/schemas/event";
import { poll } from "@/lib/database/schemas/poll";
import { postKind } from "@/lib/database/schemas/enums";
import { tribe, tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { album, albumMedia, media } from "@/lib/database/schemas/media";
import { eq, and, desc, count, inArray, sql, isNotNull, isNull, asc, lte, type SQL } from "drizzle-orm";
import { getGlobalTimelineId } from "./timeline";
import type {
  Post,
  PostInsert,
  PostWithAuthor,
  LinkedAlbumPreview,
  PollWithDetails,
  CommentWithStats,
  UserPreview,
} from "@/lib/database/types";
import type { CreatePostInput } from "@/lib/validations/post";
import { checkPermission } from "./role-permissions";
import {
  assertAlbumInTribe,
  assertCanAddToAlbum,
  canUserSeeAlbum,
  getAlbumAccessContext,
  insertAlbumMediaRows,
  InvalidAlbumError,
  isAlbumVisibleTo,
  type AlbumAccessContext,
} from "./album";
import { getTribeSettings } from "./tribe-settings";
import { getPollsByIds } from "./poll";
import { getAgendaItems, type AgendaItemPreview } from "./event";
import { userPreviewColumns, userWithProfileColumns, userWithUsernameColumns } from "@/lib/database/user-columns";
import { appLink, excerpt, notify, tribeMemberIds, type NotifyExecutor } from "./notifications";
import { excludeBlocked, isBlockedPair } from "./blocks";

/**
 * Post rights resolve like `effectivePermissions` (`checkPermission`): individual override → tribe role
 * default → system default, and for posting the tribe's `postingPermissionLevel` too. Non-members resolve
 * false.
 */
function canUserPost(tribeId: string, userId: string): Promise<boolean> {
  return checkPermission(tribeId, userId, "canPost");
}

/** Edit or pin any post (`canModeratePosts`). */
function canUserModeratePosts(tribeId: string, userId: string): Promise<boolean> {
  return checkPermission(tribeId, userId, "canModeratePosts");
}

/** Delete any post: `canModeratePosts` or `canDeleteAnyPost`. */
async function canUserDeleteAnyPost(tribeId: string, userId: string): Promise<boolean> {
  return (
    (await checkPermission(tribeId, userId, "canModeratePosts")) ||
    (await checkPermission(tribeId, userId, "canDeleteAnyPost"))
  );
}

/**
 * A create-post input the caller can fix (bad media, event or poll reference). Routes map it to 400.
 */
export class PostInputError extends Error {
  constructor(
    public readonly code: "INVALID_MEDIA" | "INVALID_EVENT" | "INVALID_POLL",
    message: string,
  ) {
    super(message);
    this.name = "PostInputError";
  }
}

type PostKind = (typeof postKind.enumValues)[number];

// First match wins. The mobile client derives the same kind in the same order when the server
// does not send one, so keep the two in step.
function derivePostKind(input: {
  isPinned: boolean;
  eventId: string | null;
  pollId: string | null;
  mediaCount: number;
  linkedAlbumId: string | null;
}): PostKind {
  if (input.isPinned) return "announcement";
  if (input.eventId) return "event";
  if (input.pollId) return "poll";
  if (input.mediaCount > 1) return "photos";
  if (input.mediaCount === 1) return "photo";
  if (input.linkedAlbumId) return "album";
  return "text";
}

/**
 * Create a new post in a tribe
 */
export async function createPost(
  tribeId: string,
  userId: string,
  input: CreatePostInput,
): Promise<PostWithMetadata> {
  // Check permission
  const canPost = await canUserPost(tribeId, userId);
  if (!canPost) {
    throw new Error("You do not have permission to post in this tribe");
  }

  const content = input.content.trim();
  const linkedAlbumId = input.linkedAlbumId || null;
  const albumId = input.albumId || null;
  const eventId = input.eventId || null;
  const pollId = input.pollId || null;
  const isPinned = input.isPinned === true;

  // `mediaIds` is canonical; `mediaId` is the legacy single-image field
  const mediaIds = [...new Set(input.mediaIds ?? (input.mediaId ? [input.mediaId] : []))];

  if (isPinned) {
    const [canModerate, settings] = await Promise.all([
      canUserModeratePosts(tribeId, userId),
      getTribeSettings(tribeId),
    ]);
    if (!canModerate) {
      throw new Error("You do not have permission to pin posts in this tribe");
    }
    if (!settings.enablePinnedPosts) {
      throw new Error("You do not have permission to pin posts: pinned posts are turned off for this tribe");
    }
  }

  // Attached media must be the caller's own upload to this tribe and not already on a post
  if (mediaIds.length > 0) {
    const rows = await db
      .select({ id: media.id })
      .from(media)
      .where(
        and(
          inArray(media.id, mediaIds),
          eq(media.tribeId, tribeId),
          eq(media.uploadedBy, userId),
          eq(media.fileType, "image"),
          isNull(media.postId),
        ),
      );
    if (rows.length !== mediaIds.length) {
      throw new PostInputError("INVALID_MEDIA", "One or more photos cannot be attached to this post");
    }
  }

  if (eventId) {
    const [linkedEvent] = await db
      .select({ id: event.id })
      .from(event)
      .where(and(eq(event.id, eventId), eq(event.tribeId, tribeId)))
      .limit(1);
    if (!linkedEvent) {
      throw new PostInputError("INVALID_EVENT", "Event not found in this tribe");
    }
  }

  // A post can share an event's poll. Polls made in the composer are not supported yet.
  if (pollId) {
    const [linkedPoll] = await db
      .select({ id: poll.id })
      .from(poll)
      .innerJoin(event, eq(poll.eventId, event.id))
      .where(and(eq(poll.id, pollId), eq(event.tribeId, tribeId)))
      .limit(1);
    if (!linkedPoll) {
      throw new PostInputError("INVALID_POLL", "Poll not found in this tribe");
    }
  }

  // Both album references must be albums of this tribe (InvalidAlbumError → the route's 400 INVALID_ALBUM).
  // `albumId` null means the general album.
  await assertAlbumInTribe(linkedAlbumId, tribeId);
  if (linkedAlbumId) {
    // Linking only displays the album, so seeing it is enough; one the author cannot see is as unknown (TRI-273).
    const [linked] = await db
      .select({ tribeId: album.tribeId, createdBy: album.createdBy, privacy: album.privacy })
      .from(album)
      .where(eq(album.id, linkedAlbumId))
      .limit(1);
    if (!linked || !(await canUserSeeAlbum(linked, userId))) {
      throw new InvalidAlbumError();
    }
  }
  if (input.addToAlbum === true && mediaIds.length > 0) {
    // The photos are filed into `albumId`: the one add rule (TRI-274, AlbumForbiddenError → 403 ALBUM_FORBIDDEN).
    await assertCanAddToAlbum(albumId, tribeId, userId);
  } else {
    await assertAlbumInTribe(albumId, tribeId);
  }

  const kind = derivePostKind({ isPinned, eventId, pollId, mediaCount: mediaIds.length, linkedAlbumId });
  // Every post lives in a timeline; choosing one is TRI-314, until then new posts go to Global
  const timelineId = await getGlobalTimelineId(tribeId);

  const createdPost = await getDbTransaction().transaction(async (tx) => {
    const [newPost] = await tx
      .insert(post)
      .values({
        tribeId,
        timelineId,
        authorId: userId,
        content,
        linkedAlbumId,
        eventId,
        pollId,
        kind,
        isPinned,
        pinnedAt: isPinned ? new Date() : null,
        pinnedBy: isPinned ? userId : null,
      } as PostInsert)
      .returning();

    if (mediaIds.length > 0) {
      await tx.insert(postMedia).values(
        mediaIds.map((mediaId, index) => ({ postId: newPost.id, mediaId, displayOrder: index })),
      );

      // media.postId stays in sync for the web app. The isNull guard makes a concurrent attach of
      // the same photo fail here instead of moving it between posts.
      const attached = await tx
        .update(media)
        .set({ postId: newPost.id })
        .where(and(inArray(media.id, mediaIds), isNull(media.postId)))
        .returning({ id: media.id });
      if (attached.length !== mediaIds.length) {
        throw new PostInputError("INVALID_MEDIA", "One or more photos cannot be attached to this post");
      }

      if (input.addToAlbum === true) {
        const addedAt = new Date();
        // Skips general-library rows the photos already got at confirm (no duplicate null-album rows, TRI-274).
        await insertAlbumMediaRows(
          mediaIds.map((mediaId) => ({
            addedAt,
            albumId, // null means the general album
            mediaId,
            addedBy: userId,
          })),
          tx,
        );
      }
    }

    // TRI-189: a post created as an announcement tells every other member, in the same transaction
    if (isPinned) await announcePost(tx, newPost, userId, "posted an announcement");
    // TRI-192: any other post tells the members through one collapsing "new posts" row per tribe
    else
      await notify(tx, {
        type: "new_post",
        actorId: userId,
        tribeId,
        entityType: "tribe",
        entityId: tribeId,
        recipients: await tribeMemberIds(tx, tribeId),
        title: "shared a new post",
        message: excerpt(newPost.content),
        link: appLink.post(tribeId, newPost.id),
        collapse: true,
      });

    return newPost;
  });

  // Create activity for new post (non-blocking - don't fail if activity creation fails)
  try {
    const { createPostActivity } = await import("./activity");
    await createPostActivity(createdPost.id, userId, tribeId, content);
  } catch (error) {
    // Log error but don't fail post creation
    console.error("Failed to create post activity (post was still created):", error);
  }

  const created = await getPostByIdWithMetadata(createdPost.id, userId);
  if (!created) {
    throw new Error("Post not found after creation");
  }
  return created;
}

export type PostSortOption = 'new' | 'hot' | 'top';
export type PostContentType = 'all' | 'text' | 'media' | 'announcements' | 'events' | 'polls';

export type PostImage = { id: string; url: string; width?: number; height?: number; blurhash?: string };

export type PostWithMetadata = PostWithAuthor & {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  // Legacy single image (first of `media`); the web app reads this
  image: PostImage | null;
  media: PostImage[];
  linkedAlbum: LinkedAlbumPreview | null;
  event: AgendaItemPreview | null;
  poll: PollWithDetails | null;
  // POST-01 preview: the comment with the most likes, newest on a tie (TRI-149)
  topComment: CommentWithStats | null;
  // POST-02 "Liked by A, B and N others": the three most recent likers (TRI-149)
  likers: UserPreview[];
};

const postColumns = {
  id: post.id,
  tribeId: post.tribeId,
  timelineId: post.timelineId,
  authorId: post.authorId,
  content: post.content,
  linkedAlbumId: post.linkedAlbumId,
  eventId: post.eventId,
  pollId: post.pollId,
  kind: post.kind,
  isPinned: post.isPinned,
  pinnedAt: post.pinnedAt,
  pinnedBy: post.pinnedBy,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
};

const authorColumns = userWithUsernameColumns;

// `kind` is written by createPost, so every feed filter is a plain WHERE and pages stay stable
function contentTypeCondition(contentType: PostContentType): SQL | undefined {
  switch (contentType) {
    case 'text':
      return eq(post.kind, 'text');
    case 'media':
      return inArray(post.kind, ['photo', 'photos', 'video']);
    case 'announcements':
      return eq(post.isPinned, true);
    case 'events':
      return eq(post.kind, 'event');
    case 'polls':
      return eq(post.kind, 'poll');
    default:
      return undefined;
  }
}

/**
 * Linked album previews (cover + photo count), keyed by album id. Only albums the viewer may see
 * (TRI-273); without a viewer, only public albums. Rights are resolved once per tribe, not per album.
 */
async function getLinkedAlbumPreviews(
  albumIds: string[],
  viewerId?: string
): Promise<Map<string, LinkedAlbumPreview>> {
  const previews = new Map<string, LinkedAlbumPreview>();
  if (albumIds.length === 0) return previews;

  // Subquery to get media count per album
  const albumMediaCountSubquery = db
    .select({
      albumId: albumMedia.albumId,
      count: count(albumMedia.id).as('count'),
    })
    .from(albumMedia)
    .groupBy(albumMedia.albumId)
    .as('album_media_counts');

  // Get albums with cover URL and photo count in single query
  const linkedAlbums = await db
    .select({
      id: album.id,
      name: album.name,
      tribeId: album.tribeId,
      createdBy: album.createdBy,
      privacy: album.privacy,
      coverUrl: media.fileUrl,
      photoCount: sql<number>`COALESCE(${albumMediaCountSubquery.count}, 0)`,
    })
    .from(album)
    .leftJoin(media, eq(album.coverId, media.id))
    .leftJoin(albumMediaCountSubquery, eq(album.id, albumMediaCountSubquery.albumId))
    .where(inArray(album.id, albumIds));

  const accessByTribe = new Map<string, AlbumAccessContext>();
  if (viewerId) {
    const tribeIds = [...new Set(linkedAlbums.map((a) => a.tribeId))];
    const contexts = await Promise.all(tribeIds.map((id) => getAlbumAccessContext(id, viewerId)));
    tribeIds.forEach((id, i) => accessByTribe.set(id, contexts[i]));
  }

  for (const a of linkedAlbums) {
    const access = accessByTribe.get(a.tribeId);
    const visible = access ? isAlbumVisibleTo(access, a) : a.privacy === "public";
    if (!visible) continue;
    previews.set(a.id, {
      id: a.id,
      name: a.name,
      coverUrl: a.coverUrl || null,
      photoCount: Number(a.photoCount) || 0,
    });
  }

  return previews;
}

/**
 * Top comment per post: most liked, newest on a tie. One windowed query over the page's post ids.
 */
async function getTopComments(
  postIds: string[],
  currentUserId?: string
): Promise<Map<string, CommentWithStats>> {
  const topComments = new Map<string, CommentWithStats>();
  if (postIds.length === 0) return topComments;

  const commentLikeCounts = db
    .select({
      commentId: commentLike.commentId,
      likeCount: count(commentLike.id).as('like_count'),
    })
    .from(commentLike)
    .groupBy(commentLike.commentId)
    .as('comment_like_counts');

  const rankedComments = db
    .select({
      id: comment.id,
      postId: comment.postId,
      eventId: comment.eventId,
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likeCount: sql<number>`COALESCE(${commentLikeCounts.likeCount}, 0)`.as('top_like_count'),
      rank: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${comment.postId} ORDER BY COALESCE(${commentLikeCounts.likeCount}, 0) DESC, ${comment.createdAt} DESC, ${comment.id})`.as('rank'),
    })
    .from(comment)
    .leftJoin(commentLikeCounts, eq(comment.id, commentLikeCounts.commentId))
    // A blocked pair's comments are never the preview (TRI-238)
    .where(and(inArray(comment.postId, postIds), excludeBlocked(currentUserId, comment.authorId)))
    .as('ranked_comments');

  const rows = await db
    .select({
      id: rankedComments.id,
      postId: rankedComments.postId,
      eventId: rankedComments.eventId,
      authorId: rankedComments.authorId,
      content: rankedComments.content,
      parentCommentId: rankedComments.parentCommentId,
      createdAt: rankedComments.createdAt,
      updatedAt: rankedComments.updatedAt,
      likeCount: rankedComments.likeCount,
      author: userWithProfileColumns,
      isLiked: currentUserId
        ? sql<boolean>`EXISTS (SELECT 1 FROM ${commentLike} WHERE ${commentLike.commentId} = ${rankedComments.id} AND ${commentLike.userId} = ${currentUserId})`
        : sql<boolean>`false`,
    })
    .from(rankedComments)
    .innerJoin(user, eq(rankedComments.authorId, user.id))
    .where(eq(rankedComments.rank, 1));

  for (const c of rows) {
    if (!c.postId) continue;
    topComments.set(c.postId, {
      id: c.id,
      postId: c.postId,
      eventId: c.eventId,
      authorId: c.authorId,
      content: c.content,
      parentCommentId: c.parentCommentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: c.author,
      likeCount: Number(c.likeCount) || 0,
      isLiked: c.isLiked === true,
    });
  }

  return topComments;
}

/**
 * Up to three most recent likers per post, as UserPreview. One windowed query over the page. Likers in a
 * blocked pair with the viewer are skipped (TRI-238); `likeCount` still counts them.
 */
async function getPostLikers(postIds: string[], viewerId?: string): Promise<Map<string, UserPreview[]>> {
  const likers = new Map<string, UserPreview[]>();
  if (postIds.length === 0) return likers;

  const rankedLikes = db
    .select({
      postId: postLike.postId,
      userId: postLike.userId,
      rank: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${postLike.postId} ORDER BY ${postLike.createdAt} DESC, ${postLike.id})`.as('rank'),
    })
    .from(postLike)
    .where(and(inArray(postLike.postId, postIds), excludeBlocked(viewerId, postLike.userId)))
    .as('ranked_likes');

  const rows = await db
    .select({
      postId: rankedLikes.postId,
      rank: rankedLikes.rank,
      ...userPreviewColumns,
    })
    .from(rankedLikes)
    .innerJoin(user, eq(rankedLikes.userId, user.id))
    .where(lte(rankedLikes.rank, 3))
    .orderBy(asc(rankedLikes.postId), asc(rankedLikes.rank));

  for (const row of rows) {
    const list = likers.get(row.postId) ?? [];
    list.push({ id: row.id, name: row.name, displayName: row.displayName, image: row.image });
    likers.set(row.postId, list);
  }

  return likers;
}

/**
 * Attach counts, like state, photos, linked album, event and poll to a page of posts.
 * One query per relation for the whole page, never per post.
 */
async function attachPostMetadata(
  posts: PostWithAuthor[],
  currentUserId?: string
): Promise<PostWithMetadata[]> {
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const present = (id: string | null): id is string => id !== null;
  const albumIds = [...new Set(posts.map((p) => p.linkedAlbumId).filter(present))];
  const eventIds = [...new Set(posts.map((p) => p.eventId).filter(present))];
  const pollIds = [...new Set(posts.map((p) => p.pollId).filter(present))];

  const [likeCounts, commentCounts, userLikes, photos, albumPreviews, eventPreviews, polls, topComments, likers] = await Promise.all([
    db
      .select({ postId: postLike.postId, count: count() })
      .from(postLike)
      .where(inArray(postLike.postId, postIds))
      .groupBy(postLike.postId),
    db
      .select({ postId: comment.postId, count: count() })
      .from(comment)
      .where(inArray(comment.postId, postIds))
      .groupBy(comment.postId),
    currentUserId
      ? db
        .select({ postId: postLike.postId })
        .from(postLike)
        .where(and(inArray(postLike.postId, postIds), eq(postLike.userId, currentUserId)))
      : Promise.resolve([]),
    db
      .select({
        postId: postMedia.postId,
        id: media.id,
        fileUrl: media.fileUrl,
        width: media.width,
        height: media.height,
        blurhash: media.blurhash,
      })
      .from(postMedia)
      .innerJoin(media, eq(postMedia.mediaId, media.id))
      .where(and(inArray(postMedia.postId, postIds), eq(media.fileType, 'image')))
      .orderBy(asc(postMedia.displayOrder)),
    getLinkedAlbumPreviews(albumIds, currentUserId),
    getAgendaItems(eventIds, currentUserId),
    getPollsByIds(pollIds, currentUserId),
    getTopComments(postIds, currentUserId),
    getPostLikers(postIds, currentUserId),
  ]);

  const likeCountMap = new Map(likeCounts.map((lc) => [lc.postId, Number(lc.count)]));
  const commentCountMap = new Map(commentCounts.map((cc) => [cc.postId, Number(cc.count)]));
  const userLikedPostIds = new Set(userLikes.map((l) => l.postId));
  const pollMap = new Map(polls.map((p) => [p.id, p]));

  const photosMap = new Map<string, PostImage[]>();
  for (const m of photos) {
    const list = photosMap.get(m.postId) ?? [];
    list.push({
      id: m.id,
      url: m.fileUrl,
      width: m.width || undefined,
      height: m.height || undefined,
      blurhash: m.blurhash || undefined,
    });
    photosMap.set(m.postId, list);
  }

  return posts.map((p) => {
    const postPhotos = photosMap.get(p.id) ?? [];
    // A linked album the viewer may not see is no link at all for them (TRI-273): both fields null.
    const linkedAlbum = p.linkedAlbumId ? albumPreviews.get(p.linkedAlbumId) || null : null;
    return {
      ...p,
      linkedAlbumId: linkedAlbum ? p.linkedAlbumId : null,
      likeCount: likeCountMap.get(p.id) || 0,
      commentCount: commentCountMap.get(p.id) || 0,
      isLiked: userLikedPostIds.has(p.id),
      image: postPhotos[0] ?? null,
      media: postPhotos,
      linkedAlbum,
      event: p.eventId ? eventPreviews.get(p.eventId) || null : null,
      poll: p.pollId ? pollMap.get(p.pollId) || null : null,
      topComment: topComments.get(p.id) ?? null,
      likers: likers.get(p.id) ?? [],
    };
  });
}

/**
 * The tribe's announcement: its most recently pinned post, shaped like any feed post.
 * Served on the tribe detail response for the TRIBE-01 banner (idx_post_tribe_pinned_created).
 */
export async function getTribeAnnouncement(
  tribeId: string,
  currentUserId?: string
): Promise<PostWithMetadata | null> {
  const [pinned] = await db
    .select({ ...postColumns, author: authorColumns })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(and(eq(post.tribeId, tribeId), eq(post.isPinned, true), excludeBlocked(currentUserId, post.authorId)))
    .orderBy(sql`${post.pinnedAt} DESC NULLS LAST`, desc(post.createdAt))
    .limit(1);

  if (!pinned) return null;

  const [withMetadata] = await attachPostMetadata([pinned], currentUserId);
  return withMetadata ?? null;
}

/**
 * Get all posts for a tribe with author info, like counts, and comment counts
 */
export async function getTribePosts(
  tribeId: string,
  limit: number = 20,
  offset: number = 0,
  currentUserId?: string,
  sort: PostSortOption = 'new',
  contentType: PostContentType = 'all'
): Promise<PostWithMetadata[]> {
  const conditions = [eq(post.tribeId, tribeId)];
  const typeCondition = contentTypeCondition(contentType);
  if (typeCondition) {
    conditions.push(typeCondition);
  }
  // Neither side of a block sees the other's posts (TRI-238)
  const notBlocked = excludeBlocked(currentUserId, post.authorId);
  if (notBlocked) {
    conditions.push(notBlocked);
  }

  // For "hot" and "top" sorting, we need to join with like counts
  const likeCountSubquery = db
    .select({
      postId: postLike.postId,
      likeCount: count(postLike.id).as('like_count'),
    })
    .from(postLike)
    .groupBy(postLike.postId)
    .as('like_counts');

  let postsQuery = db
    .select({ ...postColumns, author: authorColumns })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .leftJoin(likeCountSubquery, eq(post.id, likeCountSubquery.postId))
    .where(and(...conditions))
    .$dynamic();

  if (sort === 'new') {
    // Pinned posts lead the feed (idx_post_tribe_pinned_created)
    postsQuery = postsQuery.orderBy(desc(post.isPinned), desc(post.createdAt));
  } else {
    // Hot and top: likes descending, then date for ties
    postsQuery = postsQuery.orderBy(
      desc(sql`COALESCE(${likeCountSubquery.likeCount}, 0)`),
      desc(post.createdAt)
    );
  }

  const posts = await postsQuery.limit(limit).offset(offset);

  return attachPostMetadata(
    posts,
    currentUserId
  );
}

/**
 * A member's posts in the given tribes, newest first, in the feed shape (PROF-02 Posts tab, TRI-15).
 * The caller decides which tribes the viewer may see; no pin boost on a profile.
 */
export async function getPostsByAuthor(
  authorId: string,
  tribeIds: string[],
  limit: number,
  offset: number,
  currentUserId?: string
): Promise<PostWithMetadata[]> {
  if (tribeIds.length === 0) return [];
  const posts = await db
    .select({ ...postColumns, author: authorColumns })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(and(eq(post.authorId, authorId), inArray(post.tribeId, tribeIds), excludeBlocked(currentUserId, post.authorId)))
    .orderBy(desc(post.createdAt), desc(post.id))
    .limit(limit)
    .offset(offset);
  return attachPostMetadata(posts, currentUserId);
}

/** How many posts `getPostsByAuthor` can page through: `MemberProfile.counts.posts`. */
export async function countPostsByAuthor(authorId: string, tribeIds: string[]): Promise<number> {
  if (tribeIds.length === 0) return 0;
  const [row] = await db
    .select({ n: count() })
    .from(post)
    .where(and(eq(post.authorId, authorId), inArray(post.tribeId, tribeIds)));
  return Number(row?.n ?? 0);
}

/**
 * Posts by id with author, counts, like state, photos, linked album, event and poll — the shape
 * of a feed row — in no particular order. A constant number of queries for any number of posts.
 */
export async function getPostsByIds(
  postIds: string[],
  currentUserId?: string
): Promise<PostWithMetadata[]> {
  if (postIds.length === 0) return [];
  const posts = await db
    .select({ ...postColumns, author: authorColumns })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(and(inArray(post.id, postIds), excludeBlocked(currentUserId, post.authorId)));
  return attachPostMetadata(posts, currentUserId);
}

/**
 * Get a single post by ID with author info
 */
export async function getPostById(postId: string): Promise<PostWithAuthor | null> {
  const [postData] = await db
    .select({ ...postColumns, author: authorColumns })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.id, postId))
    .limit(1);

  if (!postData) {
    return null;
  }

  return postData;
}

/**
 * Get a single post by ID with full metadata (likes, comments, photos, linked album, event, poll).
 * Null for a post whose author is in a blocked pair with `currentUserId` (TRI-238), as for a missing one.
 */
export async function getPostByIdWithMetadata(
  postId: string,
  currentUserId?: string
): Promise<PostWithMetadata | null> {
  const postData = await getPostById(postId);
  if (!postData) {
    return null;
  }
  if (currentUserId && (await isBlockedPair(currentUserId, postData.authorId))) {
    return null;
  }

  const [withMetadata] = await attachPostMetadata([postData], currentUserId);
  return withMetadata;
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  userId: string,
  content: string
): Promise<PostWithAuthor> {
  // Get post to check ownership
  const existingPost = await getPostById(postId);
  if (!existingPost) {
    throw new Error("Post not found");
  }

  // The author with `canEditOwnPosts`, or a moderator
  const isAuthor = existingPost.authorId === userId;
  const canEdit =
    (isAuthor && (await checkPermission(existingPost.tribeId, userId, "canEditOwnPosts"))) ||
    (await canUserModeratePosts(existingPost.tribeId, userId));

  if (!canEdit) {
    throw new Error("You do not have permission to edit this post");
  }

  // Update post
  const [updatedPost] = await db
    .update(post)
    .set({
      content: content.trim(),
      updatedAt: new Date(),
    })
    .where(eq(post.id, postId))
    .returning();

  return {
    ...updatedPost,
    author: existingPost.author,
  };
}

/**
 * Delete a post
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
  // Get post to check ownership
  const existingPost = await getPostById(postId);
  if (!existingPost) {
    throw new Error("Post not found");
  }

  // The author with `canDeleteOwnPosts`, or whoever may delete any post
  const isAuthor = existingPost.authorId === userId;
  const canDelete =
    (isAuthor && (await checkPermission(existingPost.tribeId, userId, "canDeleteOwnPosts"))) ||
    (await canUserDeleteAnyPost(existingPost.tribeId, userId));

  if (!canDelete) {
    throw new Error("You do not have permission to delete this post");
  }

  // Delete post (cascade will handle likes and comments)
  await db.delete(post).where(eq(post.id, postId));
}

/**
 * Verify post exists and user is tribe member in a single query
 * OPTIMIZED: Replaces separate checkTribeMembership + getPostById calls
 *
 * Also null when the post's author and `userId` are a blocked pair (TRI-238), so the post detail, its
 * comments, commenting and liking all answer 404 as for a missing post. `ignoreBlocks` is for moderation
 * (pin / unpin), which a moderator may do whoever wrote the post.
 * @returns Post data with tribeId, or null if post not found or user not member
 */
export async function verifyPostAccessAndMembership(
  postId: string,
  tribeId: string,
  userId: string,
  options: { ignoreBlocks?: boolean } = {}
): Promise<{ tribeId: string; authorId: string } | null> {
  const [result] = await db
    .select({
      postTribeId: post.tribeId,
      postAuthorId: post.authorId,
      memberExists: tribeMember.id,
      blocked: options.ignoreBlocks
        ? sql<boolean>`false`
        : sql<boolean>`not ${excludeBlocked(userId, post.authorId)}`,
    })
    .from(post)
    .leftJoin(
      tribeMember,
      and(
        eq(tribeMember.tribeId, post.tribeId),
        eq(tribeMember.userId, userId)
      )
    )
    .where(eq(post.id, postId))
    .limit(1);

  // Check if post exists, belongs to tribe, and user is member
  if (!result || result.postTribeId !== tribeId || !result.memberExists || result.blocked === true) {
    return null;
  }

  return {
    tribeId: result.postTribeId,
    authorId: result.postAuthorId,
  };
}

/**
 * Toggle like on a post
 * Returns true if liked, false if unliked
 */
export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
  // Get post info for activity creation
  const postData = await getPostById(postId);
  if (!postData) {
    throw new Error("Post not found");
  }

  // Check if like exists
  const [existingLike] = await db
    .select()
    .from(postLike)
    .where(and(eq(postLike.postId, postId), eq(postLike.userId, userId)))
    .limit(1);

  if (existingLike) {
    // Unlike
    await db
      .delete(postLike)
      .where(and(eq(postLike.postId, postId), eq(postLike.userId, userId)));
    return false;
  } else {
    // Like, and tell the author in the same transaction (TRI-193). An unlike leaves the row alone.
    await getDbTransaction().transaction(async (tx) => {
      await tx.insert(postLike).values({ postId, userId });
      await notify(tx, {
        type: "like",
        actorId: userId,
        tribeId: postData.tribeId,
        entityType: "post",
        entityId: postId,
        recipients: [postData.authorId],
        title: "liked your post",
        message: excerpt(postData.content),
        link: appLink.post(postData.tribeId, postId),
        collapse: true,
      });
    });

    // Get updated like count
    const newLikeCount = await getPostLikeCount(postId);

    // Check for milestone and create activity (non-blocking)
    try {
      const { checkAndCreateLikeMilestone } = await import("./activity");
      await checkAndCreateLikeMilestone(
        postId,
        newLikeCount,
        userId,
        postData.tribeId,
        postData.authorId
      );
    } catch (error) {
      // Log error but don't fail like operation
      console.error("Failed to create like milestone activity (like was still recorded):", error);
    }

    return true;
  }
}

/**
 * Pin or unpin a post. Returns the new pinned state.
 * `kind` is left alone: it says what the post carries, `isPinned` says where it sits.
 * IMPORTANT: verify the post belongs to the tribe before calling
 */
export async function togglePostPin(postId: string, tribeId: string, userId: string): Promise<boolean> {
  const [canModerate, settings] = await Promise.all([
    canUserModeratePosts(tribeId, userId),
    getTribeSettings(tribeId),
  ]);
  if (!canModerate) {
    throw new Error("You do not have permission to pin posts in this tribe");
  }
  if (!settings.enablePinnedPosts) {
    throw new Error("You do not have permission to pin posts: pinned posts are turned off for this tribe");
  }

  const updated = await getDbTransaction().transaction(async (tx) => {
    // Single statement, so two moderators toggling at once cannot leave pinnedAt out of step
    const [row] = await tx
      .update(post)
      .set({
        isPinned: sql`NOT ${post.isPinned}`,
        pinnedAt: sql`CASE WHEN ${post.isPinned} THEN NULL ELSE now() END`,
        pinnedBy: sql`CASE WHEN ${post.isPinned} THEN NULL ELSE ${userId}::uuid END`,
      })
      .where(and(eq(post.id, postId), eq(post.tribeId, tribeId)))
      .returning({ id: post.id, tribeId: post.tribeId, content: post.content, isPinned: post.isPinned });
    // TRI-189: pinning announces (owner: both announcements and pins notify, TRI-257); unpinning says nothing
    if (row?.isPinned) await announcePost(tx, row, userId, "pinned a post");
    return row;
  });

  if (!updated) {
    throw new Error("Post not found");
  }
  return updated.isPinned;
}

/**
 * TRI-189: every member but the actor hears about an announcement. One row per member per post: pin, unpin and
 * pin again while it is unread stays one row. One insert of (members − 1) rows inside the author's transaction;
 * fine at alpha tribe sizes (hundreds), revisit with a broadcast row if tribes reach thousands.
 */
async function announcePost(
  tx: NotifyExecutor,
  row: { id: string; tribeId: string; content: string | null },
  actorId: string,
  title: string
) {
  await notify(tx, {
    type: "announcement",
    actorId,
    tribeId: row.tribeId,
    entityType: "post",
    entityId: row.id,
    recipients: await tribeMemberIds(tx, row.tribeId),
    title,
    message: excerpt(row.content),
    link: appLink.post(row.tribeId, row.id),
    collapse: true,
  });
}

/**
 * Get like count for a post
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(postLike)
    .where(eq(postLike.postId, postId));

  return result?.count || 0;
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const [like] = await db
    .select()
    .from(postLike)
    .where(and(eq(postLike.postId, postId), eq(postLike.userId, userId)))
    .limit(1);

  return !!like;
}

