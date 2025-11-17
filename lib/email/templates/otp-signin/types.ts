export interface OTPSignInData {
  to: string;
  otp: string;
  userName?: string;
  expirationMinutes?: number;
}
