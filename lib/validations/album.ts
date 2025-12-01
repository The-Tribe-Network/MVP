import { z } from "zod";

export const createAlbumSchema = z.object({
  name: z.string().min(1, "Album name is required").max(100),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private", "admin_only"]).optional(),
  coverId: z.string().uuid("Invalid cover media ID").optional(),
  mediaIds: z.array(z.string().uuid("Invalid media ID")).max(100).optional(),
});

export const updateAlbumSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private", "admin_only"]).optional(),
  coverId: z.string().uuid().optional(),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;

/**
 * Validation helper for API requests
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success/error
 */
export function validateApiRequest<T>(schema: z.Schema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false as const,
      error: result.error.flatten(),
    };
  }
  return {
    success: true as const,
    data: result.data,
  };
}
