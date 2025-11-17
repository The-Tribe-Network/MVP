import { appName } from '../../client';

export function generateMagicLinkEmailText({ 
  magicLink, 
  userName 
}: { 
  magicLink: string; 
  userName?: string; 
}) {
  return `
Sign in to ${appName}

${userName ? `Hi ${userName},` : 'Hi there,'}

You requested to sign in to ${appName}. Visit this link to securely sign in without a password:

${magicLink}

This link will expire in 10 minutes for security reasons.

If you didn't request this sign-in link, you can safely ignore this email.

---
© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;
}
