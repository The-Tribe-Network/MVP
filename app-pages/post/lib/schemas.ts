import { z } from "zod";

// Zod schemas for dialog payloads
export const imagePreviewSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().optional(),
});

export const deletePostSchema = z.object({
  tribeId: z.string().min(1),
  postId: z.string().min(1),
  postContent: z.string().optional(),
});

export const deleteCommentSchema = z.object({
  tribeId: z.string().min(1),
  postId: z.string().min(1),
  commentId: z.string().min(1),
  commentContent: z.string().optional(),
});

export const dialogPayloadSchemas = {
  'image-preview': imagePreviewSchema,
  'delete-post': deletePostSchema,
  'delete-comment': deleteCommentSchema,
} as const;

export type DialogPayloadSchema = typeof dialogPayloadSchemas;
