import { appName } from '../../client';

export function generateOTPSignInEmailText({ 
  otp, 
  userName,
  expirationMinutes = 10
}: { 
  otp: string; 
  userName?: string;
  expirationMinutes?: number;
}) {
  return `
Sign in to ${appName}

${userName ? `Hi ${userName},` : 'Hi there,'}

You requested to sign in to ${appName}. Use the verification code below to complete your sign-in:

VERIFICATION CODE: ${otp}

Valid for ${expirationMinutes} minutes.

SECURITY NOTICE:
- Never share this code with anyone
- ${appName} will never ask for this code via phone or email
- This code will expire in ${expirationMinutes} minutes

If you didn't request to sign in to ${appName}, you can safely ignore this email.

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
