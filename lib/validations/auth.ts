import { z } from "zod"
import { AUTH_CONSTANTS, AUTH_MESSAGES } from "@/lib/constants/auth"

// Base schemas for reusable validation rules
const emailSchema = z.string().email(AUTH_MESSAGES.VALIDATION.EMAIL_REQUIRED)
const passwordSchema = z
  .string()
  .min(AUTH_CONSTANTS.MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

const nameSchema = z
  .string()
  .min(1, AUTH_MESSAGES.VALIDATION.NAME_REQUIRED)
  .min(2, AUTH_MESSAGES.VALIDATION.NAME_MIN_LENGTH)
  .max(50, AUTH_MESSAGES.VALIDATION.NAME_MAX_LENGTH)

// Sign In Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, AUTH_MESSAGES.VALIDATION.PASSWORD_REQUIRED),
})

// Sign Up Schema
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    birthday: z
      .string()
      .min(1, AUTH_MESSAGES.VALIDATION.BIRTHDAY_REQUIRED)
      .refine((date) => {
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= AUTH_CONSTANTS.MIN_AGE
      }, AUTH_MESSAGES.VALIDATION.MIN_AGE),
    password: passwordSchema,
    confirmPassword: z.string().min(1, AUTH_MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: AUTH_MESSAGES.VALIDATION.TERMS_REQUIRED,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.VALIDATION.PASSWORDS_MISMATCH,
    path: ["confirmPassword"],
  })

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, AUTH_MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED),
    token: z.string().min(1, AUTH_MESSAGES.VALIDATION.TOKEN_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.VALIDATION.PASSWORDS_MISMATCH,
    path: ["confirmPassword"],
  })

// Type exports for TypeScript
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Validation helper function
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}
