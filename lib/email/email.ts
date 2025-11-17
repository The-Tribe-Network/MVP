// Re-export all email functions and types from their respective modules
export { sendVerificationEmail } from './templates/sign-up-verification/send-verification-email';
export { sendPasswordResetEmail } from './templates/password-reset/send-password-reset-email';
export { sendWelcomeEmail } from './templates/welcome/send-welcome-email';
export { sendMagicLinkEmail } from './templates/magic-link/send-magic-link-email';

// Re-export all types
export type { VerificationEmailData } from './templates/sign-up-verification/types';
export type { ResetPasswordEmailData } from './templates/password-reset/types';
export type { WelcomeEmailData } from './templates/welcome/types';
export type { MagicLinkEmailData } from './templates/magic-link/types';

