import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Privacy type enum
const privacyTypeSchema = z.enum(["private", "public"], {
  errorMap: () => ({ message: "Privacy must be either 'private' or 'public'" }),
});

// Tribe category enum
const tribeCategorySchema = z.enum(
  ["social", "gaming", "family", "work", "hobbies", "other"],
  {
    errorMap: () => ({
      message: "Category must be one of: social, gaming, family, work, hobbies, other",
    }),
  }
);

// Create tribe schema
export const createTribeSchema = z.object({
  name: z
    .string()
    .min(1, "Tribe name is required")
    .min(2, "Tribe name must be at least 2 characters")
    .max(100, "Tribe name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  avatar: z
    .union([uuidSchema, z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  location: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  privacy: privacyTypeSchema.optional().default("private"),
  category: tribeCategorySchema.optional().default("other"),
});

// Update tribe schema (all fields optional except name if provided)
export const updateTribeSchema = z.object({
  name: z
    .string()
    .min(2, "Tribe name must be at least 2 characters")
    .max(100, "Tribe name must be less than 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  avatar: z
    .union([uuidSchema, z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  location: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  privacy: privacyTypeSchema.optional(),
  category: tribeCategorySchema.optional(),
});

// Tribe ID parameter schema
export const tribeIdParamSchema = z.object({
  id: uuidSchema,
});

// Step-specific validation schemas for multi-step form
export const step1Schema = z.object({
  tribeName: z
    .string()
    .min(1, "Tribe name is required")
    .trim()
    .refine((val) => val.length >= 2, "Tribe name must be at least 2 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .trim(),
});

export const step2Schema = z.object({
  location: z
    .string()
    .min(1, "Location is required")
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return parsed?.placeId != null && parsed?.displayName != null;
        } catch {
          return false;
        }
      },
      { message: "Location must be selected from the dropdown" }
    ),
});

export const step3Schema = z.object({
  privacy: privacyTypeSchema.default("private"),
});

export const step4Schema = z.object({}).passthrough(); // Invites are optional, so this step is always valid

// Type exports
export type CreateTribeInput = z.infer<typeof createTribeSchema>;
export type UpdateTribeInput = z.infer<typeof updateTribeSchema>;
export type TribeIdParam = z.infer<typeof tribeIdParamSchema>;

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

