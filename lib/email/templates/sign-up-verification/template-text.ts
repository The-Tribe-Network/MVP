import { appName } from '../../client';

export function generateVerificationEmailText({ 
  verificationUrl, 
  userName 
}: { 
  verificationUrl: string; 
  userName?: string; 
}) {
  return `
Welcome to ${appName}!

${userName ? `Hi ${userName},` : 'Hi there,'}

Thank you for signing up! To complete your registration and start using ${appName}, please verify your email address by visiting this link:

${verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account with ${appName}, you can safely ignore this email.

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
