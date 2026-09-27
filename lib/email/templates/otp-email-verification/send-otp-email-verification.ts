import { AUTH_CONSTANTS } from '@/lib/constants/auth';
import { sendEmail, appName } from '../../client';
import { OTPEmailVerificationData } from './types';
import { generateOTPEmailVerificationHtml } from './template-html';
import { generateOTPEmailVerificationText } from './template-text';

export async function sendOTPEmailVerification(data: OTPEmailVerificationData) {
  const { to, otp, userName, expirationMinutes = AUTH_CONSTANTS.OTP_EXPIRES_MINUTES } = data;
  
  return await sendEmail({
    to,
    subject: `Verify your email - ${appName}`,
    html: generateOTPEmailVerificationHtml({ otp, userName, to, expirationMinutes }),
    text: generateOTPEmailVerificationText({ otp, userName, expirationMinutes }),
  });
}
