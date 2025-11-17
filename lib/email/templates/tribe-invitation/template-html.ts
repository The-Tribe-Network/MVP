import { appName, appUrl } from '../../client';

export function generateTribeInvitationEmailHtml({ 
  tribeName, 
  inviterName, 
  invitationId,
  to 
}: { 
  tribeName: string; 
  inviterName: string; 
  invitationId: string;
  to: string; 
}) {
  const acceptUrl = `${appUrl}/invitations/accept/${invitationId}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You've been invited to join ${tribeName}!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 You've been invited!</h1>
        </div>
        <div class="content">
          <h2>Hi there,</h2>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${tribeName}</strong> on ${appName}!</p>
          
          <div class="info-box">
            <h3>About this invitation:</h3>
            <ul>
              <li>You'll be able to connect with other members</li>
              <li>Share posts, photos, and events</li>
              <li>Participate in discussions and activities</li>
            </ul>
          </div>
          
          <a href="${acceptUrl}" class="button">Accept Invitation</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${acceptUrl}</p>
          
          <p>This invitation will expire in 7 days.</p>
          
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </body>
    </html>
  `;
}

