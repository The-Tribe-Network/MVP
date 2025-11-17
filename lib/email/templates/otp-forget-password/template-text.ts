import { appName } from '../../client';

export function generateOTPForgetPasswordEmailText({ 
  otp, 
  userName,
  expirationMinutes = 10
}: { 
  otp: string; 
  userName?: string;
  expirationMinutes?: number;
}) {
  return `
Password Reset Request - ${appName}

${userName ? `Hi ${userName},` : 'Hi there,'}

We received a request to reset your password for your ${appName} account. Use the verification code below to proceed with resetting your password:

PASSWORD RESET CODE: ${otp}

Valid for ${expirationMinutes} minutes.

⚠️ SECURITY NOTICE:
- Never share this code with anyone
- ${appName} will never ask for this code via phone or email
- This code will expire in ${expirationMinutes} minutes
- If you didn't request this password reset, please ignore this email

🔐 ADDITIONAL SECURITY:
For your security, this password reset request will expire automatically. If you need to reset your password again, you'll need to request a new code.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}

