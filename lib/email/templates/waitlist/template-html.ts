import { appName } from '../../client';

export function generateWaitlistEmailHtml({ 
  to 
}: { 
  to: string; 
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${appName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .content p { font-size: 16px; color: #4b5563; line-height: 1.8; }
          .content p:first-of-type { font-size: 18px; color: #1f2937; margin-top: 0; }
          .content ul { font-size: 16px; color: #4b5563; line-height: 1.8; }
          .content strong { color: #1f2937; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; }
          .footer p { font-size: 14px; color: #6b7280; margin: 0; }
          .copyright { text-align: center; margin-top: 20px; padding: 20px; }
          .copyright p { font-size: 12px; color: #9ca3af; margin: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to ${appName}!</h1>
        </div>
        <div class="content">
          <p>
            Thanks for joining our waitlist! 🎉
          </p>

          <p>
            We're building something special for communities like yours. You'll be among the first to know when ${appName} launches.
          </p>

          <p>
            <strong>What to expect:</strong>
          </p>

          <ul>
            <li>Early access to ${appName}</li>
            <li>Exclusive updates on our progress</li>
            <li>A chance to shape the product</li>
          </ul>

          <p>
            In the meantime, stay tuned for updates!
          </p>

          <p>
            Want to learn more about ${appName}? Visit our homepage to discover how we're helping communities thrive.
          </p>

          <div class="button-container">
            <a href="https://tribehq.io" class="button">Learn More About ${appName}</a>
          </div>

          <div class="footer">
            <p>
              The ${appName} Team
            </p>
          </div>
        </div>

        <div class="copyright">
          <p>
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}
