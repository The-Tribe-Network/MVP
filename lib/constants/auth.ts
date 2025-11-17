export type OTPVerificationType = "email" | "reset" | "check";
export const OTP_VERIFICATION_TYPES: OTPVerificationType[] = ["email", "reset", "check"];

export const DEFAULT_USER_IMAGE = "https://ui.shadcn.com/avatar.svg" as const;

export const AUTH_CONSTANTS = {
  PASSWORD_REQUIREMENTS: "Password must be at least 8 characters with uppercase, lowercase, and number",
  MIN_AGE: 13,
  MIN_PASSWORD_LENGTH: 8,
} as const

export const AUTH_MESSAGES = {
  VALIDATION: {
    EMAIL_REQUIRED: "Please enter a valid email address",
    PASSWORD_REQUIRED: "Password is required",
    NAME_REQUIRED: "Name is required",
    NAME_MIN_LENGTH: "Name must be at least 2 characters",
    NAME_MAX_LENGTH: "Name must be less than 50 characters",
    BIRTHDAY_REQUIRED: "Birthday is required",
    MIN_AGE: "You must be at least 13 years old",
    CONFIRM_PASSWORD_REQUIRED: "Please confirm your password",
    PASSWORDS_MISMATCH: "Passwords do not match",
    TERMS_REQUIRED: "You must agree to the terms and conditions",
    TOKEN_REQUIRED: "Reset token is required",
  },
  SUCCESS: {
    SIGN_IN: "You have been signed in successfully.",
    SIGN_UP: "Account created successfully. Please check your email to verify your account.",
    PASSWORD_RESET_EMAIL: "Password reset email sent. Please check your inbox.",
    PASSWORD_RESET: "Password reset successfully. You can now sign in with your new password.",
    SIGN_OUT: "You have been signed out successfully.",
    EMAIL_SENT: "Check your email for password reset instructions.",
  },
  ERROR: {
    SIGN_IN_FAILED: "Failed to sign in. Please try again.",
    SIGN_UP_FAILED: "Failed to create account. Please try again.",
    PASSWORD_RESET_FAILED: "Failed to reset password. Please try again.",
    EMAIL_SEND_FAILED: "Failed to send reset email. Please try again.",
    SIGN_OUT_FAILED: "Failed to sign out. Please try again.",
    VALIDATION_ERROR: "Please fix the errors below and try again.",
  },
} as const

export const AUTH_PAGES = {
  "/sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to your account to continue",
    cardTitle: "Sign in",
    cardDescription: "Enter your credentials to access your account",
    footerText: "Don't have an account?",
    footerLink: "/sign-up",
    footerLinkText: "Sign up",
  },
  "/sign-up": {
    title: "Create your account",
    subtitle: "Join us today and get started",
    cardTitle: "Sign up",
    cardDescription: "Create a new account to get started",
    footerText: "Already have an account?",
    footerLink: "/sign-in",
    footerLinkText: "Sign in",
  },
  "/forgot": {
    title: "Forgot your password?",
    subtitle: "No worries, we'll send you reset instructions",
    cardTitle: "Reset password",
    cardDescription: "Enter your email address and we'll send you a link to reset your password",
    footerText: "Remember your password?",
    footerLink: "/sign-in",
    footerLinkText: "Back to sign in",
  },
  "/reset": {
    title: "Reset your password",
    subtitle: "Enter your new password below",
    cardTitle: "New password",
    cardDescription: "Choose a strong password for your account",
    footerText: "Remember your password?",
    footerLink: "/sign-in",
    footerLinkText: "Back to sign in",
  },
  "/verify": {
    title: "Verify your email",
    subtitle: "Enter the code sent to your email",
    cardTitle: "Enter the code",
    cardDescription: "We've sent a 6-digit verification code to your email address. Please enter it below to continue.",
    footerText: "Didn't receive the code?",
    footerLink: null,
    footerLinkText: null,
  },
} as const
