// Main email exports - this is the primary entry point
export * from './email';

export { resend, fromEmail, appName, appUrl, supportEmail, sendEmail } from './client';

// OTP email exports
export { sendOTPEmailVerification } from './templates/otp-email-verification/send-otp-email-verification';
export { sendOTPForgetPasswordEmail } from './templates/otp-forget-password/send-otp-forget-password-email';
export { sendEmailChangeOTP, sendEmailChangedNotice } from './templates/email-change/send-email-change-emails';

// OTP type exports
export type { OTPEmailVerificationData } from './templates/otp-email-verification/types';
export type { OTPForgetPasswordData } from './templates/otp-forget-password/types';
