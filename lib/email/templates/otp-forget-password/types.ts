export interface OTPForgetPasswordData {
  to: string;
  otp: string;
  userName?: string;
  expirationMinutes?: number;
}
