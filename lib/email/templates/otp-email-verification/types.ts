export interface OTPEmailVerificationData {
  to: string;
  otp: string;
  userName?: string;
  expirationMinutes?: number;
};
