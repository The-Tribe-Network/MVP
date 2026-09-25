import { db, getDbTransaction } from "@/lib/database/client";
import { comment, commentLike, post } from "@/lib/database/schemas/post";
import { event, eventSettings } from "@/lib/database/schemas/event";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, asc, count, inArray, or, isNull, sql } from "drizzle-orm";
import type { Comment, CommentInsert, CommentWithAuthor } from "@/lib/database/types";
import { getMemberWithPermissions } from "./permissions";
import { getPostById } from "./post";
import { getEventById } from "./event";
import { userWithProfileColumns } from "@/lib/database/user-columns";
import { appLink, eventHostIds, excerpt, notify, type NotifyExecutor } from "./notifications";
import { excludeBlocked } from "./blocks";

/**
 * TRI-238: after the blocked pair's comments are filtered out in SQL, replies under a hidden comment go too
 * (they answer something the viewer cannot see). Rows are oldest first, so a parent precedes its replies.
 */
function withoutOrphanReplies<T extends { id: string; parentCommentId: string | null }>(rows: T[]): T[] {
  const kept = new Set<string>();
  return rows.filter((row) => {
    if (row.parentCommentId && !kept.has(row.parentCommentId)) return false;
    kept.add(row.id);
    return true;
  });
}

/**
 * Check if user can moderate comments (can edit/delete any comment)
 * OPTIMIZED: 1 DB call instead of 3
 */
async function canUserModerateComments(tribeId: string, userId: string): Promise<boolean> {
  // Get member and permissions in a single query
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    return false;
  }

  const role = memberData.member.role;
  if (role === "owner" || role === "admin" || role === "moderator") {
    return true;
  }

  // Check for permission override
  return memberData.permissions?.canModeratePosts === true ||
    memberData.permissions?.canDeleteAnyPost === true;
}

/**
 * Create a new comment on a post
 */
/**
 * TRI-186: a reply tells the parent comment's author, unless they already got the comment row (`alreadyTold`) or
 * wrote the reply. One collapsing row per parent comment.
 */
async function notifyParentAuthor(
  tx: NotifyExecutor,
  reply: Comment,
  actorId: string,
  tribeId: string,
  alreadyTold: string[],
  link: string
) {
  if (!reply.parentCommentId) return;
  const [parent] = await tx
    .select({ authorId: comment.authorId })
    .from(comment)
    .where(eq(comment.id, reply.parentCommentId));
  if (!parent || alreadyTold.includes(parent.authorId)) return;
  await notify(tx, {
    type: "reply",
    actorId,
    tribeId,
    entityType: "comment",
    entityId: reply.parentCommentId,
    recipients: [parent.authorId],
    title: "replied to your comment",
    message: excerpt(reply.content),
    link,
    collapse: true,
  });
}

/** EVT-11 "Comments": whether the hosts hear about comments on the event (default on). */
async function hostsWantCommentNotices(tx: NotifyExecutor, eventId: string) {
  const [settings] = await tx
    .select({ on: eventSettings.notifyOnComments })
    .from(eventSettings)
    .where(eq(eventSettings.eventId, eventId));
  return settings?.on ?? true;
}

export async function createComment(
  postId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<CommentWithAuthor> {
  // Verify post exists and get tribe ID
  const postData = await getPostById(postId);
  if (!postData) {
    throw new Error("Post not found");
  }

  // The comment and its notifications commit together (TRI-186)
  const createdComment = await getDbTransaction().transaction(async (tx) => {
    const [row] = await tx
      .insert(comment)
      .values({
        postId,
        authorId: userId,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
      } as CommentInsert)
      .returning();
    const link = `${appLink.post(postData.tribeId, postId)}?commentId=${row.id}`;
    await notify(tx, {
      type: "comment",
      actorId: userId,
      tribeId: postData.tribeId,
      entityType: "post",
      entityId: postId,
      recipients: [postData.authorId],
      title: "commented on your post",
      message: excerpt(row.content),
      link,
      collapse: true,
    });
    await notifyParentAuthor(tx, row, userId, postData.tribeId, [postData.authorId], link);
    return row;
  });

  // Fetch author info
  const [author] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!author) {
    throw new Error("Author not found");
  }

  return {
    ...createdComment,
    author,
  };
}

/**
 * Get all comments for a post with author info, like count, and user's like status
 */
export async function getPostComments(
  postId: string,
  currentUserId?: string
): Promise<Array<CommentWithAuthor & { likeCount: number; isLiked: boolean }>> {
  // Fetch comments with author
  const comments = await db
    .select({
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: userWithProfileColumns,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(and(eq(comment.postId, postId), excludeBlocked(currentUserId, comment.authorId)))
    .orderBy(asc(comment.createdAt))
    .then(withoutOrphanReplies);

  if (comments.length === 0) {
    return [];
  }

  const commentIds = comments.map((c) => c.id);

  // Get like counts for all comments
  const likeCounts = await db
    .select({
      commentId: commentLike.commentId,
      count: count(),
    })
    .from(commentLike)
    .where(inArray(commentLike.commentId, commentIds))
    .groupBy(commentLike.commentId);

  // Get user's likes if currentUserId is provided
  const userLikes = currentUserId
    ? await db
      .select({ commentId: commentLike.commentId })
      .from(commentLike)
      .where(and(inArray(commentLike.commentId, commentIds), eq(commentLike.userId, currentUserId)))
    : [];

  const userLikedCommentIds = new Set(userLikes.map((l) => l.commentId));

  // Create map for quick lookup
  const likeCountMap = new Map(likeCounts.map((lc) => [lc.commentId, Number(lc.count)]));

  // Combine data
  return comments.map((c) => ({
    id: c.id,
    postId: c.postId,
    eventId: null,
    authorId: c.authorId,
    content: c.content,
    parentCommentId: c.parentCommentId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: c.author,
    likeCount: likeCountMap.get(c.id) || 0,
    isLiked: userLikedCommentIds.has(c.id),
  }));
}

/**
 * Get a single comment by ID with author info
 */
export async function getCommentById(commentId: string): Promise<CommentWithAuthor | null> {
  const [commentData] = await db
    .select({
      id: comment.id,
      postId: comment.postId,
      eventId: comment.eventId,
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: userWithProfileColumns,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(eq(comment.id, commentId))
    .limit(1);

  if (!commentData) {
    return null;
  }

  return {
    id: commentData.id,
    postId: commentData.postId,
    eventId: commentData.eventId,
    authorId: commentData.authorId,
    content: commentData.content,
    parentCommentId: commentData.parentCommentId,
    createdAt: commentData.createdAt,
    updatedAt: commentData.updatedAt,
    author: commentData.author,
  };
}

/**
 * Update a comment
 * OPTIMIZED: Combines queries to reduce from 7 DB calls to 3 DB calls
 * Supports both post and event comments
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<CommentWithAuthor> {
  // Get comment with author and post/event info in single query with joins
  const [existingComment] = await db
    .select({
      id: comment.id,
      postId: comment.postId,
      eventId: comment.eventId,
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: userWithProfileColumns,
      post: {
        tribeId: post.tribeId,
      },
      event: {
        tribeId: event.tribeId,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .leftJoin(post, eq(comment.postId, post.id))
    .leftJoin(event, eq(comment.eventId, event.id))
    .where(eq(comment.id, commentId))
    .limit(1);

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  // Determine tribe ID from either post or event
  const tribeId = existingComment.post?.tribeId || existingComment.event?.tribeId;
  if (!tribeId) {
    throw new Error("Comment must be associated with a post or event");
  }

  // Check if user is author or moderator
  const isAuthor = existingComment.authorId === userId;
  const canModerate = isAuthor ? false : await canUserModerateComments(tribeId, userId);

  if (!isAuthor && !canModerate) {
    throw new Error("You do not have permission to edit this comment");
  }

  // Update comment
  const [updatedComment] = await db
    .update(comment)
    .set({
      content: content.trim(),
      updatedAt: new Date(),
    })
    .where(eq(comment.id, commentId))
    .returning();

  return {
    ...updatedComment,
    author: existingComment.author,
  };
}

/**
 * Delete a comment
 * OPTIMIZED: Combines queries to reduce from 7 DB calls to 3 DB calls
 * Supports both post and event comments
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  // Get comment with post/event info in single query with joins
  const [existingComment] = await db
    .select({
      id: comment.id,
      postId: comment.postId,
      eventId: comment.eventId,
      authorId: comment.authorId,
      post: {
        tribeId: post.tribeId,
      },
      event: {
        tribeId: event.tribeId,
      },
    })
    .from(comment)
    .leftJoin(post, eq(comment.postId, post.id))
    .leftJoin(event, eq(comment.eventId, event.id))
    .where(eq(comment.id, commentId))
    .limit(1);

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  // Determine tribe ID from either post or event
  const tribeId = existingComment.post?.tribeId || existingComment.event?.tribeId;
  if (!tribeId) {
    throw new Error("Comment must be associated with a post or event");
  }

  // Check if user is author or moderator
  const isAuthor = existingComment.authorId === userId;
  const canModerate = isAuthor ? false : await canUserModerateComments(tribeId, userId);

  if (!isAuthor && !canModerate) {
    throw new Error("You do not have permission to delete this comment");
  }

  // Delete comment (cascade will handle likes)
  await db.delete(comment).where(eq(comment.id, commentId));
}

/**
 * Toggle like on a comment
 * Returns true if liked, false if unliked
 */
export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  // Check if like exists
  const [existingLike] = await db
    .select()
    .from(commentLike)
    .where(and(eq(commentLike.commentId, commentId), eq(commentLike.userId, userId)))
    .limit(1);

  if (existingLike) {
    // Unlike
    await db
      .delete(commentLike)
      .where(and(eq(commentLike.commentId, commentId), eq(commentLike.userId, userId)));
    return false;
  } else {
    // Like, and tell the comment's author in the same transaction (TRI-193). An unlike leaves the row alone.
    await getDbTransaction().transaction(async (tx) => {
      await tx.insert(commentLike).values({ commentId, userId });
      const [target] = await tx
        .select({
          authorId: comment.authorId,
          content: comment.content,
          postId: comment.postId,
          eventId: comment.eventId,
          tribeId: sql<string>`coalesce(${post.tribeId}, ${event.tribeId})`,
        })
        .from(comment)
        .leftJoin(post, eq(post.id, comment.postId))
        .leftJoin(event, eq(event.id, comment.eventId))
        .where(eq(comment.id, commentId));
      if (!target) return;
      await notify(tx, {
        type: "like",
        actorId: userId,
        tribeId: target.tribeId,
        entityType: "comment",
        entityId: commentId,
        recipients: [target.authorId],
        title: "liked your comment",
        message: excerpt(target.content),
        link: target.postId
          ? `${appLink.post(target.tribeId, target.postId)}?commentId=${commentId}`
          : appLink.event(target.tribeId, target.eventId!),
        collapse: true,
      });
    });
    return true;
  }
}

/**
 * Create a new comment on an event
 */
export async function createEventComment(
  eventId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<CommentWithAuthor> {
  // Verify event exists and get tribe ID
  const eventData = await getEventById(eventId);
  if (!eventData) {
    throw new Error("Event not found");
  }

  // The comment and its notifications commit together (TRI-186)
  const createdComment = await getDbTransaction().transaction(async (tx) => {
    const [row] = await tx
      .insert(comment)
      .values({
        eventId,
        authorId: userId,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
      } as CommentInsert)
      .returning();
    const link = appLink.event(eventData.tribeId, eventId);
    const hosts = (await hostsWantCommentNotices(tx, eventId)) ? await eventHostIds(tx, eventId) : [];
    await notify(tx, {
      type: "comment",
      actorId: userId,
      tribeId: eventData.tribeId,
      entityType: "event",
      entityId: eventId,
      recipients: hosts,
      title: `commented on ${eventData.title}`,
      message: excerpt(row.content),
      link,
      collapse: true,
    });
    await notifyParentAuthor(tx, row, userId, eventData.tribeId, hosts, link);
    return row;
  });

  // Fetch author info
  const [author] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!author) {
    throw new Error("Author not found");
  }

  return {
    ...createdComment,
    author,
  };
}

/**
 * Get all comments for an event with author info, like count, and user's like status
 */
export async function getEventComments(
  eventId: string,
  currentUserId?: string
): Promise<Array<CommentWithAuthor & { likeCount: number; isLiked: boolean }>> {
  // Fetch comments with author
  const comments = await db
    .select({
      id: comment.id,
      postId: comment.postId,
      eventId: comment.eventId,
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: userWithProfileColumns,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(and(eq(comment.eventId, eventId), excludeBlocked(currentUserId, comment.authorId)))
    .orderBy(asc(comment.createdAt))
    .then(withoutOrphanReplies);

  if (comments.length === 0) {
    return [];
  }

  const commentIds = comments.map((c) => c.id);

  // Get like counts for all comments
  const likeCounts = await db
    .select({
      commentId: commentLike.commentId,
      count: count(),
    })
    .from(commentLike)
    .where(inArray(commentLike.commentId, commentIds))
    .groupBy(commentLike.commentId);

  // Get user's likes if currentUserId is provided
  const userLikes = currentUserId
    ? await db
      .select({ commentId: commentLike.commentId })
      .from(commentLike)
      .where(and(inArray(commentLike.commentId, commentIds), eq(commentLike.userId, currentUserId)))
    : [];

  const userLikedCommentIds = new Set(userLikes.map((l) => l.commentId));

  // Create map for quick lookup
  const likeCountMap = new Map(likeCounts.map((lc) => [lc.commentId, Number(lc.count)]));

  // Combine data
  return comments.map((c) => ({
    id: c.id,
    postId: c.postId,
    eventId: c.eventId,
    authorId: c.authorId,
    content: c.content,
    parentCommentId: c.parentCommentId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: c.author,
    likeCount: likeCountMap.get(c.id) || 0,
    isLiked: userLikedCommentIds.has(c.id),
  }));
}

