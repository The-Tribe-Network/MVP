import { appName } from '../../client';

export function generateOTPEmailVerificationHtml({ 
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
        <title>Verify your email - ${appName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-container { background: white; border: 2px solid #667eea; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; font-family: 'Courier New', monospace; }
          .otp-label { font-size: 14px; color: #666; margin-bottom: 10px; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Email Verification Code</h2>
          <p>${userName ? `Hi ${userName},` : 'Hi there,'}</p>
          <p>To complete your email verification, please use the verification code below:</p>
          
          <div class="otp-container">
            <div class="otp-label">Your verification code is:</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This code will expire in ${expirationMinutes} minutes for security reasons.
          </div>
          
          <p>Enter this code in the verification form to confirm your email address and complete your account setup.</p>
          
          <p>If you didn't request this verification code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </body>
    </html>
  `;
}
