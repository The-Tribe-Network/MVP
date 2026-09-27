import { AUTH_CONSTANTS } from '@/lib/constants/auth';
import { sendEmail, appName } from '../../client';
import { OTPForgetPasswordData } from './types';
import { generateOTPForgetPasswordEmailHtml } from './template-html';
import { generateOTPForgetPasswordEmailText } from './template-text';

export async function sendOTPForgetPasswordEmail(data: OTPForgetPasswordData) {
  const { to, otp, userName, expirationMinutes = AUTH_CONSTANTS.OTP_EXPIRES_MINUTES } = data;
  
  return await sendEmail({
    to,
    subject: `Reset your password - ${appName}`,
    html: generateOTPForgetPasswordEmailHtml({ otp, userName, to, expirationMinutes }),
    text: generateOTPForgetPasswordEmailText({ otp, userName, expirationMinutes }),
  });
}

