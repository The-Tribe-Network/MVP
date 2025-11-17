import { resend, fromEmail, appName } from '../../client';
import { OTPForgetPasswordData } from './types';
import { generateOTPForgetPasswordEmailHtml } from './template-html';
import { generateOTPForgetPasswordEmailText } from './template-text';

export async function sendOTPForgetPasswordEmail(data: OTPForgetPasswordData) {
  const { to, otp, userName, expirationMinutes = 10 } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Reset your password - ${appName}`,
    html: generateOTPForgetPasswordEmailHtml({ otp, userName, to, expirationMinutes }),
    text: generateOTPForgetPasswordEmailText({ otp, userName, expirationMinutes }),
  });
}

