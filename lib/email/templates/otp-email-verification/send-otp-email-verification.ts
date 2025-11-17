import { resend, fromEmail, appName } from '../../client';
import { OTPEmailVerificationData } from './types';
import { generateOTPEmailVerificationHtml } from './template-html';
import { generateOTPEmailVerificationText } from './template-text';

export async function sendOTPEmailVerification(data: OTPEmailVerificationData) {
  const { to, otp, userName, expirationMinutes = 10 } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Verify your email - ${appName}`,
    html: generateOTPEmailVerificationHtml({ otp, userName, to, expirationMinutes }),
    text: generateOTPEmailVerificationText({ otp, userName, expirationMinutes }),
  });
}
