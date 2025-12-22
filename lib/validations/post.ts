import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Create post schema
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(5000, "Post content must be less than 5000 characters")
    .trim(),
  addToAlbum: z.boolean(),
  mediaId: z.string().uuid("Invalid media ID format").optional().nullable(),
  albumId: z.string().uuid("Invalid album ID format").optional().nullable(),
  linkedAlbumId: z.string().uuid("Invalid linked album ID format").optional().nullable(),
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

