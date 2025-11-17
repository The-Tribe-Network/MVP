import { appName } from '../../client';

export function generateOTPSignInEmailHtml({ 
  otp, 
  userName, 
  to,
  expirationMinutes = 10
}: { 
  otp: string; 
  userName?: string; 
  to: string;
  expirationMinutes?: number;
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
          .otp-container { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e9ecef; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Sign in to ${appName}</h1>
        </div>
        <div class="content">
          <h2>Your verification code</h2>
          <p>${userName ? `Hi ${userName},` : 'Hi there,'}</p>
          <p>You requested to sign in to ${appName}. Use the verification code below to complete your sign-in:</p>
          
          <div class="otp-container">
            <h3>Verification Code</h3>
            <div class="otp-code">${otp}</div>
            <p><strong>Valid for ${expirationMinutes} minutes</strong></p>
          </div>
          
          <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <p>• Never share this code with anyone</p>
            <p>• ${appName} will never ask for this code via phone or email</p>
            <p>• This code will expire in ${expirationMinutes} minutes</p>
          </div>
          
          <p>If you didn't request to sign in to ${appName}, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </body>
    </html>
  `;
}
