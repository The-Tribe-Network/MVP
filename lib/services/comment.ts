import { db } from "@/lib/database/client";
import { comment, commentLike, post } from "@/lib/database/schemas/post";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, asc, count, inArray } from "drizzle-orm";
import type { Comment, CommentInsert, CommentWithAuthor } from "@/lib/database/types";
import { getUserTribeRole } from "./permissions";
import { getPostById } from "./post";

/**
 * Check if user can moderate comments (can edit/delete any comment)
 */
async function canUserModerateComments(tribeId: string, userId: string): Promise<boolean> {
  const role = await getUserTribeRole(tribeId, userId);
  if (role === "owner" || role === "admin" || role === "moderator") {
    return true;
  }

  // Check for permission override
  const [member] = await db
    .select({ id: tribeMember.id })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  if (!member) {
    return false;
  }

  const [permission] = await db
    .select({
      canModeratePosts: tribeMemberPermission.canModeratePosts,
      canDeleteAnyPost: tribeMemberPermission.canDeleteAnyPost,
    })
    .from(tribeMemberPermission)
    .where(eq(tribeMemberPermission.tribeMemberId, member.id))
    .limit(1);

  return permission?.canModeratePosts === true || permission?.canDeleteAnyPost === true;
}

/**
 * Create a new comment on a post
 */
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

  // Create comment
  const [createdComment] = await db
    .insert(comment)
    .values({
      postId,
      authorId: userId,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
    } as CommentInsert)
    .returning();

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
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(eq(comment.postId, postId))
    .orderBy(asc(comment.createdAt));

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
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<CommentWithAuthor> {
  // Get comment to check ownership
  const existingComment = await getCommentById(commentId);
  if (!existingComment) {
    throw new Error("Comment not found");
  }

  // Get post to check tribe
  const postData = await getPostById(existingComment.postId);
  if (!postData) {
    throw new Error("Post not found");
  }

  // Check if user is author or moderator
  const isAuthor = existingComment.authorId === userId;
  const canModerate = await canUserModerateComments(postData.tribeId, userId);

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
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  // Get comment to check ownership
  const existingComment = await getCommentById(commentId);
  if (!existingComment) {
    throw new Error("Comment not found");
  }

  // Get post to check tribe
  const postData = await getPostById(existingComment.postId);
  if (!postData) {
    throw new Error("Post not found");
  }

  // Check if user is author or moderator
  const isAuthor = existingComment.authorId === userId;
  const canModerate = await canUserModerateComments(postData.tribeId, userId);

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
    // Like
    await db.insert(commentLike).values({
      commentId,
      userId,
    });
    return true;
  }
}

