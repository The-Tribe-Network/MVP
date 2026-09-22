import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

export const POST_MAX_PHOTOS = 10;

// Create post schema
// `mediaIds` is the canonical photo list; `mediaId` is the legacy single-image field and is read
// only when `mediaIds` is absent. Content may be empty when the post carries an attachment.
export const createPostSchema = z
  .object({
    content: z
      .string()
      .max(5000, "Post content must be less than 5000 characters")
      .trim(),
    addToAlbum: z.boolean(),
    mediaId: z.string().uuid("Invalid media ID format").optional().nullable(),
    mediaIds: z
      .array(z.string().uuid("Invalid media ID format"))
      .max(POST_MAX_PHOTOS, `A post can have at most ${POST_MAX_PHOTOS} photos`)
      .optional(),
    albumId: z.string().uuid("Invalid album ID format").optional().nullable(),
    linkedAlbumId: z.string().uuid("Invalid linked album ID format").optional().nullable(),
    eventId: z.string().uuid("Invalid event ID format").optional().nullable(),
    pollId: z.string().uuid("Invalid poll ID format").optional().nullable(),
    isPinned: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasMedia = (data.mediaIds?.length ?? 0) > 0 || Boolean(data.mediaId);
    const links = [data.eventId, data.pollId, data.linkedAlbumId].filter(Boolean).length;

    if (links > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventId"],
        message: "A post can link only one of an event, a poll or an album",
      });
    }

    if (data.content.length === 0 && !hasMedia && links === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Post content is required",
      });
    }
  });

// Feed query schema (GET /posts)
export const listPostsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["new", "hot", "top"]).default("new"),
  contentType: z.enum(["all", "text", "media", "announcements", "events", "polls"]).default("all"),
});

// Update post schema
export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content must be less than 5000 characters")
    .trim(),
});

// Post ID parameter schema
export const postIdParamSchema = z.object({
  post_id: uuidSchema,
});

// Tribe ID parameter schema (for nested routes)
export const tribeIdParamSchema = z.object({
  tribe_id: uuidSchema,
});

// Combined schema for nested routes
export const tribePostIdParamSchema = z.object({
  tribe_id: uuidSchema,
  post_id: uuidSchema,
});

// Export types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type TribeIdParam = z.infer<typeof tribeIdParamSchema>;
export type TribePostIdParam = z.infer<typeof tribePostIdParamSchema>;

// Validation helper for API routes
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: z.ZodError } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { success: false, error: errorMessage, details: error };
    }
    return { success: false, error: "Validation failed" };
  }
}

