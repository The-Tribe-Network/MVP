import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Create comment schema
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(5000, "Comment content must be less than 5000 characters")
    .trim(),
  parentCommentId: z.string().uuid("Invalid parent comment ID format").optional(),
});

// Update comment schema
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(5000, "Comment content must be less than 5000 characters")
    .trim(),
});

// Comment ID parameter schema
export const commentIdParamSchema = z.object({
  comment_id: uuidSchema,
});

// Combined schema for nested routes (tribe_id, post_id, comment_id)
export const tribePostCommentIdParamSchema = z.object({
  tribe_id: uuidSchema,
  post_id: uuidSchema,
  comment_id: uuidSchema,
});

// Combined schema for event comment routes (tribe_id, event_id, comment_id)
export const tribeEventCommentIdParamSchema = z.object({
  tribe_id: uuidSchema,
  event_id: uuidSchema,
  comment_id: uuidSchema,
});

// Export types
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
export type TribePostCommentIdParam = z.infer<typeof tribePostCommentIdParamSchema>;
export type TribeEventCommentIdParam = z.infer<typeof tribeEventCommentIdParamSchema>;

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

