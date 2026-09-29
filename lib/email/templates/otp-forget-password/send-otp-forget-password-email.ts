import { AUTH_CONSTANTS } from '@/lib/constants/auth';
import { sendEmail, appName } from '../../client';
import { codeBlock, renderEmail } from '../../layout';
import { OTPForgetPasswordData } from './types';

/** AUTH-04 → AUTH-05: the code that lets the user pick a new password. */
export async function sendOTPForgetPasswordEmail(data: OTPForgetPasswordData) {
  const { to, otp, userName, expirationMinutes = AUTH_CONSTANTS.OTP_EXPIRES_MINUTES } = data;
  const { html, text } = renderEmail({
    heading: 'Reset your password',
    preheader: `Your ${appName} password reset code is ${otp}.`,
    blocks: [
      `Hi ${firstName(userName)}, enter this code in ${appName} to choose a new password:`,
      codeBlock(otp),
      `It expires in ${expirationMinutes} minutes. Don't share it with anyone: ${appName} will never ask you for it.`,
      "If you didn't ask to reset your password, ignore this email. Your password stays the same.",
    ],
    reason: `You're getting this because a password reset was requested for ${to}.`,
  });
  return await sendEmail({ to, subject: `Reset your password - ${appName}`, html, text });
}

const firstName = (name?: string) => name?.trim().split(/\s+/)[0] || 'there';
