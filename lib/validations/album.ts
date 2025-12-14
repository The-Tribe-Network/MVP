import { z } from "zod";

export const createAlbumSchema = z.object({
  name: z.string().min(1, "Album name is required").max(100),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private", "admin_only"]).optional(),
  coverId: z.string().uuid("Invalid cover media ID").optional(),
  mediaIds: z.array(z.string().uuid("Invalid media ID")).max(100).optional(),
  isNewCover: z.boolean().optional(),
});

export const updateAlbumSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private", "admin_only"]).optional(),
  coverId: z.string().uuid().optional(),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;

// Step-by-step validation schemas for multi-step form

/**
 * Step 1: Basic Info validation (name, description, privacy)
 */
export const albumStep1Schema = z.object({
  name: z.string().min(1, "Album name is required").max(100),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private", "admin_only"]),
});

/**
 * Step 2: Cover photo validation (optional)
 */
export const albumStep2Schema = z.object({
  coverId: z.string().uuid().optional(),
});

/**
 * Step 3: Upload media validation (max 20 images)
 */
export const albumStep3Schema = z.object({
  uploadedMediaIds: z.array(z.string().uuid()).max(20).optional(),
});

/**
 * Step 4: Select existing media validation
 */
export const albumStep4Schema = z.object({
  selectedMediaIds: z.array(z.string().uuid()).optional(),
});

/**
 * Cross-validation for Steps 3 & 4
 * At least one media item must be uploaded OR selected
 */
export const albumMediaValidation = z.object({
  uploadedMediaIds: z.array(z.string().uuid()).optional(),
  selectedMediaIds: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    const totalMedia = (data.uploadedMediaIds?.length || 0) + (data.selectedMediaIds?.length || 0);
    return totalMedia > 0;
  },
  { message: "At least one media item must be uploaded or selected" }
);

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
