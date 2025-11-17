import { appName } from '../../client';

export function generateOTPEmailVerificationText({ 
  otp, 
  userName,
  expirationMinutes = 10
}: { 
  otp: string; 
  userName?: string;
  expirationMinutes?: number;
}) {
  return `
Email Verification Code - ${appName}

${userName ? `Hi ${userName},` : 'Hi there,'}

To complete your email verification, please use the verification code below:

VERIFICATION CODE: ${otp}

⏰ IMPORTANT: This code will expire in ${expirationMinutes} minutes for security reasons.

Enter this code in the verification form to confirm your email address and complete your account setup.

If you didn't request this verification code, you can safely ignore this email.

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
