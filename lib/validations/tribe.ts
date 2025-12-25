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
  banner: z
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
    .union([uuidSchema, z.literal(""), z.null()])
    .transform((val) => (val === "" ? null : val))
    .optional(),
  banner: z
    .union([uuidSchema, z.literal(""), z.null()])
    .transform((val) => (val === "" ? null : val))
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

// Unified schema for react-hook-form (4-step create tribe form)
export const createTribeFormSchema = z.object({
  // Step 1: Basic Info
  tribeName: z
    .string()
    .min(1, "Tribe name is required")
    .min(2, "Tribe name must be at least 2 characters")
    .max(100, "Tribe name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters")
    .trim(),
  avatar: z.string().optional().default(""),
  avatarUrl: z.string().optional().default(""), // For preview only
  banner: z.string().optional().default(""),
  bannerUrl: z.string().optional().default(""), // For preview only
  category: tribeCategorySchema.default("other"),

  // Step 2: Location
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
      { message: "Please select a location from the dropdown" }
    ),

  // Step 3: Privacy
  privacy: privacyTypeSchema.default("private"),

  // Step 4: Invitations (optional)
  invitations: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum(["admin", "moderator", "member"]).default("member"),
      })
    )
    .optional()
    .default([]),
});

// Field arrays for step validation
export const step1Fields = ["tribeName", "description"] as const;
export const step2Fields = ["location"] as const;
export const step3Fields = ["privacy"] as const;

export type CreateTribeFormInput = z.infer<typeof createTribeFormSchema>;

// Tribe role enum
const tribeRoleSchema = z.enum(["admin", "moderator", "member"], {
  errorMap: () => ({
    message: "Role must be one of: admin, moderator, member",
  }),
});

// Invite tribe members schema
export const inviteTribeMembersSchema = z.object({
  invitations: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: tribeRoleSchema.optional().default("member"),
      })
    )
    .min(1, "At least one invitation is required")
    .max(50, "Cannot send more than 50 invitations at once"),
});

// Transfer ownership schema
export const transferOwnershipSchema = z.object({
  newOwnerId: uuidSchema,
});

// Delete tribe confirmation schema
export const deleteTribeConfirmationSchema = z.object({
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "You must type DELETE to confirm" }),
  }),
});

// Type exports
export type CreateTribeInput = z.infer<typeof createTribeSchema>;
export type UpdateTribeInput = z.infer<typeof updateTribeSchema>;
export type TribeIdParam = z.infer<typeof tribeIdParamSchema>;
export type InviteTribeMembersInput = z.infer<typeof inviteTribeMembersSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
export type DeleteTribeConfirmationInput = z.infer<typeof deleteTribeConfirmationSchema>;

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

