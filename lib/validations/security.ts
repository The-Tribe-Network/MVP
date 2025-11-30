import { z } from "zod";

// Password strength validation - min 8 characters, at least one letter and one number
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
    revokeOtherSessions: z.boolean().optional().default(true),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

// Session Management Schemas
export const revokeSessionSchema = z.object({
  sessionToken: z.string().min(1, "Session token is required"),
});

// Export types
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;

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

