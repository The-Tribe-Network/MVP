import { z } from "zod";

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

// Step 1: Avatar, Display Name, Bio
export const profileStep1Schema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .trim(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),
  avatar: z
    .union([uuidSchema, z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

// Step 2: Username
export const profileStep2Schema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim()
    .refine((val) => !val.startsWith("_"), {
      message: "Username cannot start with underscore",
    })
    .transform((val) => val.toLowerCase()),
});

// Step 3: Location (reuse tribe location pattern)
export const profileStep3Schema = z.object({
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

// Complete profile update schema (all fields optional for partial updates)
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),
  avatar: z
    .union([uuidSchema, z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  removeAvatar: z.boolean().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .refine((val) => !val.startsWith("_"), {
      message: "Username cannot start with underscore",
    })
    .transform((val) => val.toLowerCase())
    .optional(),
  location: z.string().optional(),
});

// Export types
export type ProfileStep1Input = z.infer<typeof profileStep1Schema>;
export type ProfileStep2Input = z.infer<typeof profileStep2Schema>;
export type ProfileStep3Input = z.infer<typeof profileStep3Schema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

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
