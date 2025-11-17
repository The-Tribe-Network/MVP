import { appName } from '../../client';

export function generateMagicLinkEmailHtml({ 
  magicLink, 
  userName, 
  to 
}: { 
  magicLink: string; 
  userName?: string; 
  to: string; 
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in to ${appName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Sign in to ${appName}</h1>
        </div>
        <div class="content">
          <h2>Your magic link is ready!</h2>
          <p>${userName ? `Hi ${userName},` : 'Hi there,'}</p>
          <p>You requested to sign in to ${appName}. Click the button below to securely sign in without a password:</p>
          <a href="${magicLink}" class="button">Sign In</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${magicLink}">${magicLink}</a></p>
          <p>This link will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </body>
    </html>
  `;
}
