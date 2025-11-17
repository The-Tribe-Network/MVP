import { resend, fromEmail, appName } from '../../client';
import { OTPSignInData } from './types';
import { generateOTPSignInEmailHtml } from './template-html';
import { generateOTPSignInEmailText } from './template-text';

export async function sendOTPSignInEmail(data: OTPSignInData) {
  const { to, otp, userName, expirationMinutes = 10 } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Sign in to ${appName} - Verification Code`,
    html: generateOTPSignInEmailHtml({ otp, userName, to, expirationMinutes }),
    text: generateOTPSignInEmailText({ otp, userName, expirationMinutes }),
  });
}
