import { db } from "@/lib/database/client";
import { post, postLike, comment } from "@/lib/database/schemas/post";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import type { Post, PostInsert, PostWithAuthor } from "@/lib/database/types";
import { checkTribeMembership, getUserTribeRole } from "./permissions";

/**
 * Check if user can post in a tribe
 * - Must be a member
 * - If permission override exists and is false, cannot post
 * - Otherwise, members can post by default
 */
async function canUserPost(tribeId: string, userId: string): Promise<boolean> {
  // Check membership
  const isMember = await checkTribeMembership(tribeId, userId);
  if (!isMember) {
    return false;
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
    .select({ canPost: tribeMemberPermission.canPost })
    .from(tribeMemberPermission)
    .where(eq(tribeMemberPermission.tribeMemberId, member.id))
    .limit(1);

  // If permission override exists and is false, cannot post
  if (permission?.canPost === false) {
    return false;
  }

  // Default: members can post
  return true;
}

/**
 * Check if user can moderate posts (can edit/delete any post)
 */
async function canUserModeratePosts(tribeId: string, userId: string): Promise<boolean> {
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
 * Create a new post in a tribe
 */
export async function createPost(
  tribeId: string,
  userId: string,
  content: string
): Promise<PostWithAuthor> {
  // Check permission
  const canPost = await canUserPost(tribeId, userId);
  if (!canPost) {
    throw new Error("You do not have permission to post in this tribe");
  }

  // Create post
  const [createdPost] = await db
    .insert(post)
    .values({
      tribeId,
      authorId: userId,
      content: content.trim(),
    } as PostInsert)
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

  // Create activity for new post (non-blocking - don't fail if activity creation fails)
  try {
    const { createPostActivity } = await import("./activity");
    await createPostActivity(createdPost.id, userId, tribeId, content);
  } catch (error) {
    // Log error but don't fail post creation
    console.error("Failed to create post activity (post was still created):", error);
  }

  return {
    ...createdPost,
    author,
  };
}

/**
 * Get posts for a tribe with author info, like count, comment count, and user's like status
 */
export async function getTribePosts(
  tribeId: string,
  limit: number = 20,
  offset: number = 0,
  currentUserId?: string
): Promise<Array<PostWithAuthor & { likeCount: number; commentCount: number; isLiked: boolean }>> {
  // Fetch posts with author
  const posts = await db
    .select({
      id: post.id,
      tribeId: post.tribeId,
      authorId: post.authorId,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
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
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.tribeId, tribeId))
    .orderBy(desc(post.createdAt))
    .limit(limit)
    .offset(offset);

  // Get like counts and comment counts for all posts
  const postIds = posts.map((p) => p.id);

  if (postIds.length === 0) {
    return [];
  }

  // Get like counts
  const likeCounts = await db
    .select({
      postId: postLike.postId,
      count: count(),
    })
    .from(postLike)
    .where(inArray(postLike.postId, postIds))
    .groupBy(postLike.postId);

  // Get comment counts
  const commentCounts = await db
    .select({
      postId: comment.postId,
      count: count(),
    })
    .from(comment)
    .where(inArray(comment.postId, postIds))
    .groupBy(comment.postId);

  // Get user's likes if currentUserId is provided
  const userLikes = currentUserId
    ? await db
        .select({ postId: postLike.postId })
        .from(postLike)
        .where(and(inArray(postLike.postId, postIds), eq(postLike.userId, currentUserId)))
    : [];

  const userLikedPostIds = new Set(userLikes.map((l) => l.postId));

  // Create maps for quick lookup
  const likeCountMap = new Map(likeCounts.map((lc) => [lc.postId, Number(lc.count)]));
  const commentCountMap = new Map(commentCounts.map((cc) => [cc.postId, Number(cc.count)]));

  // Combine data
  return posts.map((p) => ({
    id: p.id,
    tribeId: p.tribeId,
    authorId: p.authorId,
    content: p.content,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    author: p.author,
    likeCount: likeCountMap.get(p.id) || 0,
    commentCount: commentCountMap.get(p.id) || 0,
    isLiked: userLikedPostIds.has(p.id),
  }));
}

/**
 * Get a single post by ID with author info
 */
export async function getPostById(postId: string): Promise<PostWithAuthor | null> {
  const [postData] = await db
    .select({
      id: post.id,
      tribeId: post.tribeId,
      authorId: post.authorId,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
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
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.id, postId))
    .limit(1);

  if (!postData) {
    return null;
  }

  return {
    id: postData.id,
    tribeId: postData.tribeId,
    authorId: postData.authorId,
    content: postData.content,
    createdAt: postData.createdAt,
    updatedAt: postData.updatedAt,
    author: postData.author,
  };
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

  // Check if user is author or moderator
  const isAuthor = existingPost.authorId === userId;
  const canModerate = await canUserModeratePosts(existingPost.tribeId, userId);

  if (!isAuthor && !canModerate) {
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

  // Check if user is author or moderator
  const isAuthor = existingPost.authorId === userId;
  const canModerate = await canUserModeratePosts(existingPost.tribeId, userId);

  if (!isAuthor && !canModerate) {
    throw new Error("You do not have permission to delete this post");
  }

  // Delete post (cascade will handle likes and comments)
  await db.delete(post).where(eq(post.id, postId));
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
    // Like
    await db.insert(postLike).values({
      postId,
      userId,
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

