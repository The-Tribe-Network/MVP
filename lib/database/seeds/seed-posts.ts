/**
 * Seed Posts
 *
 * Creates posts for a tribe with proper author references.
 * Returns a map of post index -> postId for comment seeding.
 */

import { db } from "@/lib/database/client";
import { post } from "@/lib/database/schemas/post";
import type { SeedPostData, SeedUserData } from "./types";
import { daysAgo, logSuccess } from "./utils";

/**
 * Create posts for a tribe
 *
 * @param tribeId - The tribe ID
 * @param posts - Array of seed post data
 * @param users - Array of seed user data (for index reference)
 * @param emailToIdMap - Map of email -> userId
 * @returns Map of post index -> postId
 */
export async function seedPosts(
  tribeId: string,
  posts: SeedPostData[],
  users: SeedUserData[],
  emailToIdMap: Map<string, string>
): Promise<Map<number, string>> {
  const postIndexToIdMap = new Map<number, string>();

  for (let i = 0; i < posts.length; i++) {
    const postData = posts[i];

    // Get author user ID by index
    const author = users[postData.authorIndex];
    if (!author) {
      throw new Error(`Invalid author index ${postData.authorIndex} for post ${i}`);
    }

    const authorId = emailToIdMap.get(author.email);
    if (!authorId) {
      throw new Error(`Author user ID not found for email: ${author.email}`);
    }

    // Create post with backdated timestamp
    const createdAt = daysAgo(postData.daysAgo);

    const [createdPost] = await db
      .insert(post)
      .values({
        tribeId,
        authorId,
        content: postData.content,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();

    postIndexToIdMap.set(i, createdPost.id);
  }

  logSuccess(`Created ${posts.length} posts`);
  return postIndexToIdMap;
}
