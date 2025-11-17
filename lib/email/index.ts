// Main email exports - this is the primary entry point
export * from './email';

export { resend, fromEmail, appName, appUrl } from './client';
// Individual email type exports for direct access
export { sendVerificationEmail } from './templates/sign-up-verification/send-verification-email';
export { sendPasswordResetEmail } from './templates/password-reset/send-password-reset-email';
export { sendWelcomeEmail } from './templates/welcome/send-welcome-email';
export { sendMagicLinkEmail } from './templates/magic-link/send-magic-link-email';

// OTP email exports
export { sendOTPSignInEmail } from './templates/otp-signin/send-otp-signin-email';
export { sendOTPEmailVerification } from './templates/otp-email-verification/send-otp-email-verification';
export { sendOTPForgetPasswordEmail } from './templates/otp-forget-password/send-otp-forget-password-email';

// Template exports for advanced usage
export { generateVerificationEmailHtml } from './templates/sign-up-verification/template-html';
export { generateVerificationEmailText } from './templates/sign-up-verification/template-text';
export { generatePasswordResetEmailHtml } from './templates/password-reset/template-html';
export { generatePasswordResetEmailText } from './templates/password-reset/template-text';
export { generateWelcomeEmailHtml } from './templates/welcome/template-html';
export { generateWelcomeEmailText } from './templates/welcome/template-text';
export { generateMagicLinkEmailHtml } from './templates/magic-link/template-html';
export { generateMagicLinkEmailText } from './templates/magic-link/template-text';

// OTP template exports
export { generateOTPSignInEmailHtml } from './templates/otp-signin/template-html';
export { generateOTPSignInEmailText } from './templates/otp-signin/template-text';
export { generateOTPEmailVerificationHtml } from './templates/otp-email-verification/template-html';
export { generateOTPEmailVerificationText } from './templates/otp-email-verification/template-text';
export { generateOTPForgetPasswordEmailHtml } from './templates/otp-forget-password/template-html';
export { generateOTPForgetPasswordEmailText } from './templates/otp-forget-password/template-text';

// Type exports
export type { VerificationEmailData } from './templates/sign-up-verification/types';
export type { ResetPasswordEmailData } from './templates/password-reset/types';
export type { WelcomeEmailData } from './templates/welcome/types';
export type { MagicLinkEmailData } from './templates/magic-link/types';

// OTP type exports
export type { OTPSignInData } from './templates/otp-signin/types';
export type { OTPEmailVerificationData } from './templates/otp-email-verification/types';
export type { OTPForgetPasswordData } from './templates/otp-forget-password/types';
