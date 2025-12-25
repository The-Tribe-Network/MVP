/**
 * Seed Comments
 *
 * Creates flat comments on posts (no nesting).
 */

import { db } from "@/lib/database/client";
import { comment } from "@/lib/database/schemas/post";
import type { SeedPostData, SeedUserData } from "./types";
import { daysAgo, logSuccess } from "./utils";

/**
 * Create comments for posts
 *
 * @param posts - Array of seed post data
 * @param postIndexToIdMap - Map of post index -> postId
 * @param users - Array of seed user data (for index reference)
 * @param emailToIdMap - Map of email -> userId
 * @returns Total number of comments created
 */
export async function seedComments(
  posts: SeedPostData[],
  postIndexToIdMap: Map<number, string>,
  users: SeedUserData[],
  emailToIdMap: Map<string, string>
): Promise<number> {
  let totalComments = 0;

  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const postData = posts[postIndex];

    // Skip if post has no comments
    if (!postData.comments || postData.comments.length === 0) {
      continue;
    }

    const postId = postIndexToIdMap.get(postIndex);
    if (!postId) {
      throw new Error(`Post ID not found for index: ${postIndex}`);
    }

    // Create each comment (flat, no nesting)
    for (const commentData of postData.comments) {
      const author = users[commentData.authorIndex];
      if (!author) {
        throw new Error(`Invalid author index ${commentData.authorIndex} for comment`);
      }

      const authorId = emailToIdMap.get(author.email);
      if (!authorId) {
        throw new Error(`Author user ID not found for email: ${author.email}`);
      }

      const createdAt = daysAgo(commentData.daysAgo);

      await db.insert(comment).values({
        postId,
        eventId: null, // Comments are on posts, not events
        authorId,
        content: commentData.content,
        parentCommentId: null, // Flat comments, no nesting
        createdAt,
        updatedAt: createdAt,
      });

      totalComments++;
    }
  }

  if (totalComments > 0) {
    logSuccess(`Created ${totalComments} comments`);
  }

  return totalComments;
}
