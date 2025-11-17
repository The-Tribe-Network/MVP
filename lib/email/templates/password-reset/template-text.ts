import { appName } from '../../client';

export function generatePasswordResetEmailText({ 
  resetUrl, 
  userName 
}: { 
  resetUrl: string; 
  userName?: string; 
}) {
  return `
Password Reset - ${appName}

${userName ? `Hi ${userName},` : 'Hi there,'}

We received a request to reset your password for your ${appName} account. Visit this link to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
