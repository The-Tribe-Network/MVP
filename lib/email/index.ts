// Main email exports - this is the primary entry point
export * from './email';

export { resend, fromEmail, appName, appUrl, supportEmail, sendEmail } from './client';

// OTP email exports
export { sendOTPEmailVerification } from './templates/otp-email-verification/send-otp-email-verification';
export { sendOTPForgetPasswordEmail } from './templates/otp-forget-password/send-otp-forget-password-email';
export { sendEmailChangeOTP, sendEmailChangedNotice } from './templates/email-change/send-email-change-emails';

// Template exports for advanced usage
export { generateWelcomeEmailHtml } from './templates/welcome/template-html';
export { generateWelcomeEmailText } from './templates/welcome/template-text';
export { generateOTPEmailVerificationHtml } from './templates/otp-email-verification/template-html';
export { generateOTPEmailVerificationText } from './templates/otp-email-verification/template-text';
export { generateOTPForgetPasswordEmailHtml } from './templates/otp-forget-password/template-html';
export { generateOTPForgetPasswordEmailText } from './templates/otp-forget-password/template-text';

// OTP type exports
export type { OTPEmailVerificationData } from './templates/otp-email-verification/types';
export type { OTPForgetPasswordData } from './templates/otp-forget-password/types';
