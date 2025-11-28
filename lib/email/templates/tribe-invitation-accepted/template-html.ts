import { appName, appUrl } from '../../client';

export function generateTribeInvitationAcceptedEmailHtml({ 
  tribeName, 
  inviterName,
  acceptedUserName,
  tribeId
}: { 
  tribeName: string; 
  inviterName: string;
  acceptedUserName: string;
  tribeId: string;
}) {
  const tribeUrl = `${appUrl}/tribe/${tribeId}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${acceptedUserName} has accepted your invitation to ${tribeName}!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Great news!</h1>
        </div>
        <div class="content">
          <h2>Hi ${inviterName},</h2>
          <p><strong>${acceptedUserName}</strong> has accepted your invitation to join <strong>${tribeName}</strong> on ${appName}!</p>
          
          <div class="info-box">
            <h3>What's next?</h3>
            <ul>
              <li>${acceptedUserName} is now a member of ${tribeName}</li>
              <li>They can now participate in discussions and activities</li>
              <li>You can connect with them in the tribe</li>
            </ul>
          </div>
          
          <a href="${tribeUrl}" class="button">View Tribe</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #10b981;">${tribeUrl}</p>
          
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

