import { appName, appUrl } from '../../client';

export function generateTribeInvitationRejectedEmailHtml({ 
  tribeName, 
  inviterName,
  rejectedUserName,
  tribeId
}: { 
  tribeName: string; 
  inviterName: string;
  rejectedUserName: string;
  tribeId: string;
}) {
  const tribeUrl = `${appUrl}/tribe/${tribeId}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${rejectedUserName} has declined your invitation to ${tribeName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📬 Invitation Update</h1>
        </div>
        <div class="content">
          <h2>Hi ${inviterName},</h2>
          <p><strong>${rejectedUserName}</strong> has declined your invitation to join <strong>${tribeName}</strong> on ${appName}.</p>
          
          <div class="info-box">
            <h3>Don't worry!</h3>
            <ul>
              <li>You can still invite other members to ${tribeName}</li>
              <li>This doesn't affect your tribe or other members</li>
              <li>You can always send another invitation in the future</li>
            </ul>
          </div>
          
          <a href="${tribeUrl}" class="button">View Tribe</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${tribeUrl}</p>
          
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

