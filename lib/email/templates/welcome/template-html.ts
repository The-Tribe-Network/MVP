import { appName } from '../../client';

export function generateWelcomeEmailHtml({ 
  userName, 
  loginUrl, 
  to 
}: { 
  userName: string; 
  loginUrl: string; 
  to: string; 
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${appName}!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to ${appName}!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Welcome to ${appName}! We're excited to have you on board. Your account has been successfully created and verified.</p>
          
          <div class="features">
            <h3>What's next?</h3>
            <ul>
              <li>Complete your profile setup</li>
              <li>Explore our features and tools</li>
              <li>Connect with other users</li>
              <li>Start building amazing things!</li>
            </ul>
          </div>
          
          <a href="${loginUrl}" class="button">Get Started</a>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Happy building!</p>
          <p>The ${appName} Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </body>
    </html>
  `;
}
