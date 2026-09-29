import { AUTH_CONSTANTS } from '@/lib/constants/auth';
import { sendEmail, appName } from '../../client';
import { codeBlock, renderEmail } from '../../layout';
import { OTPEmailVerificationData } from './types';

/** AUTH-03's code: after sign-up, and when an unverified account signs in (production). */
export async function sendOTPEmailVerification(data: OTPEmailVerificationData) {
  const { to, otp, userName, expirationMinutes = AUTH_CONSTANTS.OTP_EXPIRES_MINUTES } = data;
  const { html, text } = renderEmail({
    heading: 'Verify your email',
    preheader: `Your ${appName} code is ${otp}.`,
    blocks: [
      `Hi ${firstName(userName)}, enter this code in ${appName} to verify your email address:`,
      codeBlock(otp),
      `It expires in ${expirationMinutes} minutes.`,
    ],
    reason: `You're getting this because someone signed up for ${appName} with ${to}. If it wasn't you, ignore this email.`,
  });
  return await sendEmail({ to, subject: `Verify your email - ${appName}`, html, text });
}

const firstName = (name?: string) => name?.trim().split(/\s+/)[0] || 'there';
