import { db } from "@/lib/database/client";
import { post, postLike, comment } from "@/lib/database/schemas/post";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { album, albumMedia, media } from "@/lib/database/schemas/media";
import { eq, and, desc, count, inArray, sql, isNotNull, isNull, asc } from "drizzle-orm";
import type { Post, PostInsert, PostWithAuthor, LinkedAlbumPreview } from "@/lib/database/types";
import { getMemberWithPermissions } from "./permissions";

/**
 * Check if user can post in a tribe
 * OPTIMIZED: 1 DB call instead of 3
 * - Must be a member
 * - If permission override exists and is false, cannot post
 * - Otherwise, members can post by default
 */
async function canUserPost(tribeId: string, userId: string): Promise<boolean> {
  // Get member and permissions in a single query
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    return false;
  }

  // If permission override exists and is false, cannot post
  if (memberData.permissions?.canPost === false) {
    return false;
  }

  // Default: members can post
  return true;
}

/**
 * Check if user can moderate posts (can edit/delete any post)
 * OPTIMIZED: 1 DB call instead of 3
 */
async function canUserModeratePosts(tribeId: string, userId: string): Promise<boolean> {
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
 * Create a new post in a tribe
 */
export async function createPost(
  tribeId: string,
  userId: string,
  content: string,
  addToAlbum: boolean,
  mediaId?: string | null,
  albumId?: string | null,
  linkedAlbumId?: string | null,
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
      linkedAlbumId: linkedAlbumId || null,
    } as PostInsert)
    .returning();

  // If the user attached media to the post, we need to update the media record and add it to the album media table
  if (mediaId && addToAlbum === true) {
    // If the user wants to add the media to an album, add it to the album media table
    await Promise.all([
      db
        .update(media)
        .set({ postId: createdPost.id })
        .where(eq(media.id, mediaId)),
      db
        .insert(albumMedia)
        .values({
          addedAt: new Date(),
          albumId: albumId || null, // If albumId is null, the media will be added to the general album
          mediaId,
          addedBy: userId,
        }),
    ]);
  } else if (mediaId) {
    // If the user doesnt want to add the media to an album and just attach a post to it
    await db
      .update(media)
      .set({ postId: createdPost.id })
      .where(eq(media.id, mediaId));
  }

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

export type PostSortOption = 'new' | 'hot' | 'top';
export type PostContentType = 'all' | 'text' | 'media' | 'announcements';

/**
 * Get posts for a tribe with author info, like count, comment count, user's like status, image, and linked album
 */
export async function getTribePosts(
  tribeId: string,
  limit: number = 20,
  offset: number = 0,
  currentUserId?: string,
  sort: PostSortOption = 'new',
  contentType: PostContentType = 'all'
): Promise<Array<PostWithAuthor & { likeCount: number; commentCount: number; isLiked: boolean; image: { id: string; url: string; width?: number; height?: number } | null; linkedAlbum: LinkedAlbumPreview | null }>> {
  // Build base query conditions
  const conditions = [eq(post.tribeId, tribeId)];

  // For "hot" and "top" sorting, we need to join with like counts
  // Create subquery for like counts
  const likeCountSubquery = db
    .select({
      postId: postLike.postId,
      likeCount: count(postLike.id).as('like_count'),
    })
    .from(postLike)
    .groupBy(postLike.postId)
    .as('like_counts');

  // Fetch posts with author
  let postsQuery = db
    .select({
      id: post.id,
      tribeId: post.tribeId,
      authorId: post.authorId,
      content: post.content,
      linkedAlbumId: post.linkedAlbumId,
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
        profileCompleted: user.profileCompleted,
      },
      sortLikeCount: sql<number>`COALESCE(${likeCountSubquery.likeCount}, 0)`,
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .leftJoin(likeCountSubquery, eq(post.id, likeCountSubquery.postId))
    .where(and(...conditions))
    .$dynamic();

  // Apply content type filter via post-processing (media filter needs post IDs)
  // We'll fetch more posts and filter after if needed

  // Apply sorting
  if (sort === 'new') {
    postsQuery = postsQuery.orderBy(desc(post.createdAt));
  } else if (sort === 'hot') {
    // Hot: combination of recency and likes (simple formula: likes / age in hours)
    // For simplicity, we'll order by likes descending, then by date for ties
    postsQuery = postsQuery.orderBy(
      desc(sql`COALESCE(${likeCountSubquery.likeCount}, 0)`),
      desc(post.createdAt)
    );
  } else if (sort === 'top') {
    // Top: purely by like count
    postsQuery = postsQuery.orderBy(
      desc(sql`COALESCE(${likeCountSubquery.likeCount}, 0)`),
      desc(post.createdAt)
    );
  }

  // For content type filtering, we need to handle it differently
  // For 'media' posts, we need to check if they have media attached
  // Fetch more posts initially if filtering by content type
  const fetchLimit = contentType === 'all' ? limit : limit * 3;

  const posts = await postsQuery.limit(fetchLimit).offset(offset);

  // Get all post IDs for metadata queries
  const allPostIds = posts.map((p) => p.id);

  if (allPostIds.length === 0) {
    return [];
  }

  // Get media records for all posts (for content type filtering)
  const postMedia = await db
    .select({
      postId: media.postId,
      id: media.id,
      fileUrl: media.fileUrl,
      width: media.width,
      height: media.height,
    })
    .from(media)
    .where(and(inArray(media.postId, allPostIds), eq(media.fileType, 'image')))
    .orderBy(media.createdAt);

  // Group media by postId
  const mediaMap = new Map<string, { id: string; url: string; width?: number; height?: number }>();
  const postsWithMedia = new Set<string>();
  for (const m of postMedia) {
    if (m.postId) {
      postsWithMedia.add(m.postId);
      if (!mediaMap.has(m.postId)) {
        mediaMap.set(m.postId, {
          id: m.id,
          url: m.fileUrl,
          width: m.width || undefined,
          height: m.height || undefined,
        });
      }
    }
  }

  // Filter posts by content type
  let filteredPosts = posts;
  if (contentType === 'text') {
    // Text-only posts (no media)
    filteredPosts = posts.filter((p) => !postsWithMedia.has(p.id));
  } else if (contentType === 'media') {
    // Posts with media
    filteredPosts = posts.filter((p) => postsWithMedia.has(p.id));
  }
  // 'announcements' would require an announcement flag on posts - for now treat as 'all'
  // 'all' keeps all posts

  // Apply limit after filtering
  filteredPosts = filteredPosts.slice(0, limit);

  const postIds = filteredPosts.map((p) => p.id);

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

  // Get linked albums for filtered posts that have linkedAlbumId
  const linkedAlbumIds = filteredPosts
    .map((p) => p.linkedAlbumId)
    .filter((id): id is string => id !== null);

  const linkedAlbumsMap = new Map<string, LinkedAlbumPreview>();

  if (linkedAlbumIds.length > 0) {
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
        coverUrl: media.fileUrl,
        photoCount: sql<number>`COALESCE(${albumMediaCountSubquery.count}, 0)`,
      })
      .from(album)
      .leftJoin(media, eq(album.coverId, media.id))
      .leftJoin(albumMediaCountSubquery, eq(album.id, albumMediaCountSubquery.albumId))
      .where(inArray(album.id, linkedAlbumIds));

    for (const a of linkedAlbums) {
      linkedAlbumsMap.set(a.id, {
        id: a.id,
        name: a.name,
        coverUrl: a.coverUrl || null,
        photoCount: Number(a.photoCount) || 0,
      });
    }
  }

  // Create maps for quick lookup
  const likeCountMap = new Map(likeCounts.map((lc) => [lc.postId, Number(lc.count)]));
  const commentCountMap = new Map(commentCounts.map((cc) => [cc.postId, Number(cc.count)]));

  // Combine data using filteredPosts
  return filteredPosts.map((p) => ({
    id: p.id,
    tribeId: p.tribeId,
    authorId: p.authorId,
    content: p.content,
    linkedAlbumId: p.linkedAlbumId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    author: {
      ...p.author,
      profileCompleted: p.author.profileCompleted || false,
    },
    likeCount: likeCountMap.get(p.id) || 0,
    commentCount: commentCountMap.get(p.id) || 0,
    isLiked: userLikedPostIds.has(p.id),
    image: mediaMap.get(p.id) || null,
    linkedAlbum: p.linkedAlbumId ? linkedAlbumsMap.get(p.linkedAlbumId) || null : null,
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
      linkedAlbumId: post.linkedAlbumId,
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
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        profileCompleted: user.profileCompleted,
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
    linkedAlbumId: postData.linkedAlbumId,
    createdAt: postData.createdAt,
    updatedAt: postData.updatedAt,
    author: postData.author,
  };
}

/**
 * Get a single post by ID with author info, like count, comment count, user's like status, image, and linked album
 * OPTIMIZED: 2 DB calls instead of 5 (1 for post, 1 parallel for all metadata)
 */
export async function getPostByIdWithMetadata(
  postId: string,
  currentUserId?: string
): Promise<(PostWithAuthor & { likeCount: number; commentCount: number; isLiked: boolean; image: { id: string; url: string; width?: number; height?: number } | null; linkedAlbum: LinkedAlbumPreview | null }) | null> {
  // Fetch post with author
  const [postData] = await db
    .select({
      id: post.id,
      tribeId: post.tribeId,
      authorId: post.authorId,
      content: post.content,
      linkedAlbumId: post.linkedAlbumId,
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
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        profileCompleted: user.profileCompleted,
      },
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.id, postId))
    .limit(1);

  if (!postData) {
    return null;
  }

  // Fetch all metadata in parallel
  const metadataQueries = [
    // Get like count
    db.select({ count: count() }).from(postLike).where(eq(postLike.postId, postId)),
    // Get comment count
    db.select({ count: count() }).from(comment).where(eq(comment.postId, postId)),
    // Get media record
    db.select({
      id: media.id,
      fileUrl: media.fileUrl,
      width: media.width,
      height: media.height,
    }).from(media).where(and(eq(media.postId, postId), eq(media.fileType, 'image'))).limit(1),
    // Add user like check if currentUserId provided
    ...(currentUserId
      ? [
        db
          .select({ postId: postLike.postId })
          .from(postLike)
          .where(and(eq(postLike.postId, postId), eq(postLike.userId, currentUserId)))
          .limit(1) as Promise<Array<{ postId: string }>>,
      ]
      : []),
  ];

  const results = await Promise.all(metadataQueries);
  const likeCountResult = results[0] as Array<{ count: number }>;
  const commentCountResult = results[1] as Array<{ count: number }>;
  const postMedia = results[2] as Array<{
    id: string;
    fileUrl: string;
    width: number | null;
    height: number | null;
  }>;
  const userLike = results[3] as Array<{ postId: string }> | undefined;

  const likeCount = Number(likeCountResult[0]?.count || 0);
  const commentCount = Number(commentCountResult[0]?.count || 0);
  const isLiked = currentUserId ? !!userLike?.[0] : false;

  const image = postMedia?.[0]
    ? {
      id: postMedia[0].id,
      url: postMedia[0].fileUrl,
      width: postMedia[0].width || undefined,
      height: postMedia[0].height || undefined,
    }
    : null;

  // Get linked album if exists
  // OPTIMIZED: Single query with subquery for photo count
  let linkedAlbum: LinkedAlbumPreview | null = null;
  if (postData.linkedAlbumId) {
    // Subquery for photo count
    const mediaCountSubquery = db
      .select({
        albumId: albumMedia.albumId,
        count: count(albumMedia.id).as('count'),
      })
      .from(albumMedia)
      .groupBy(albumMedia.albumId)
      .as('media_counts');

    const [albumData] = await db
      .select({
        id: album.id,
        name: album.name,
        coverUrl: media.fileUrl,
        photoCount: sql<number>`COALESCE(${mediaCountSubquery.count}, 0)`,
      })
      .from(album)
      .leftJoin(media, eq(album.coverId, media.id))
      .leftJoin(mediaCountSubquery, eq(album.id, mediaCountSubquery.albumId))
      .where(eq(album.id, postData.linkedAlbumId))
      .limit(1);

    if (albumData) {
      linkedAlbum = {
        id: albumData.id,
        name: albumData.name,
        coverUrl: albumData.coverUrl || null,
        photoCount: Number(albumData.photoCount) || 0,
      };
    }
  }

  return {
    id: postData.id,
    tribeId: postData.tribeId,
    authorId: postData.authorId,
    content: postData.content,
    linkedAlbumId: postData.linkedAlbumId,
    createdAt: postData.createdAt,
    updatedAt: postData.updatedAt,
    author: postData.author,
    likeCount,
    commentCount,
    isLiked,
    image,
    linkedAlbum,
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
 * Verify post exists and user is tribe member in a single query
 * OPTIMIZED: Replaces separate checkTribeMembership + getPostById calls
 * @returns Post data with tribeId, or null if post not found or user not member
 */
export async function verifyPostAccessAndMembership(
  postId: string,
  tribeId: string,
  userId: string
): Promise<{ tribeId: string; authorId: string } | null> {
  const [result] = await db
    .select({
      postTribeId: post.tribeId,
      postAuthorId: post.authorId,
      memberExists: tribeMember.id,
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
  if (!result || result.postTribeId !== tribeId || !result.memberExists) {
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

