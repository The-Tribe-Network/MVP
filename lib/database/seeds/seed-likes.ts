/**
 * Seed Post Likes
 *
 * Creates likes on posts from specified users.
 */

import { db } from "@/lib/database/client";
import { postLike } from "@/lib/database/schemas/post";
import type { SeedPostData, SeedUserData } from "./types";
import { daysAgo, logSuccess } from "./utils";

/**
 * Create likes for posts
 *
 * @param posts - Array of seed post data
 * @param postIndexToIdMap - Map of post index -> postId
 * @param users - Array of seed user data (for index reference)
 * @param emailToIdMap - Map of email -> userId
 * @returns Total number of likes created
 */
export async function seedPostLikes(
  posts: SeedPostData[],
  postIndexToIdMap: Map<number, string>,
  users: SeedUserData[],
  emailToIdMap: Map<string, string>
): Promise<number> {
  let totalLikes = 0;

  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const postData = posts[postIndex];

    // Skip if post has no likes
    if (!postData.likerIndices || postData.likerIndices.length === 0) {
      continue;
    }

    const postId = postIndexToIdMap.get(postIndex);
    if (!postId) {
      throw new Error(`Post ID not found for index: ${postIndex}`);
    }

    // Create each like
    for (const likerIndex of postData.likerIndices) {
      const liker = users[likerIndex];
      if (!liker) {
        throw new Error(`Invalid liker index ${likerIndex} for post`);
      }

      const likerId = emailToIdMap.get(liker.email);
      if (!likerId) {
        throw new Error(`Liker user ID not found for email: ${liker.email}`);
      }

      // Like timestamp slightly after post creation
      const likeDate = daysAgo(Math.max(0, postData.daysAgo - 1));

      await db.insert(postLike).values({
        postId,
        userId: likerId,
        createdAt: likeDate,
      });

      totalLikes++;
    }
  }

  if (totalLikes > 0) {
    logSuccess(`Created ${totalLikes} post likes`);
  }

  return totalLikes;
}
