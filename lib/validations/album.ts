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

// ============================================
// Multi-step form schemas (3 steps)
// ============================================

/**
 * Full form schema for useForm (Step 1 fields only - media tracked separately)
 */
export const createAlbumFormSchema = z.object({
  name: z.string().min(1, "Album name is required").max(100, "Album name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().default(''),
  privacy: z.enum(["public", "private", "admin_only"]).default('public'),
  coverId: z.string().uuid().nullable().optional(),
  isNewCover: z.boolean().default(false),
});

export type CreateAlbumFormInput = z.infer<typeof createAlbumFormSchema>;

/**
 * Step 1: Album Details validation (name, description, privacy, cover photo)
 */
export const albumStep1Schema = z.object({
  name: z.string().min(1, "Album name is required").max(100, "Album name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().default(''),
  privacy: z.enum(["public", "private", "admin_only"]).default('public'),
  coverId: z.string().uuid().nullable().optional(),
  isNewCover: z.boolean().optional().default(false),
});

/**
 * Step 2: Upload media validation (max 20 images)
 */
export const albumStep2Schema = z.object({
  uploadedMediaIds: z.array(z.string().uuid()).max(20, "Maximum 20 images can be uploaded").optional(),
});

/**
 * Step 3: Select existing media validation
 */
export const albumStep3Schema = z.object({
  selectedMediaIds: z.array(z.string().uuid()).optional(),
});

/**
 * Cross-validation for Steps 2 & 3
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
