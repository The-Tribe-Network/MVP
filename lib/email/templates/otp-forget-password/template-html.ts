import { appName } from '../../client';

export function generateOTPForgetPasswordEmailHtml({ 
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
        <title>Reset your password - ${appName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-container { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #e9ecef; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e74c3c; margin: 20px 0; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .security-notice { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset your password</h2>
          <p>${userName ? `Hi ${userName},` : 'Hi there,'}</p>
          <p>We received a request to reset your password for your ${appName} account. Use the verification code below to proceed with resetting your password:</p>
          
          <div class="otp-container">
            <h3>Password Reset Code</h3>
            <div class="otp-code">${otp}</div>
            <p><strong>Valid for ${expirationMinutes} minutes</strong></p>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <p>• Never share this code with anyone</p>
            <p>• ${appName} will never ask for this code via phone or email</p>
            <p>• This code will expire in ${expirationMinutes} minutes</p>
            <p>• If you didn't request this password reset, please ignore this email</p>
          </div>
          
          <div class="security-notice">
            <p><strong>🔐 Additional Security:</strong></p>
            <p>For your security, this password reset request will expire automatically. If you need to reset your password again, you'll need to request a new code.</p>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This email was sent to ${to}</p>
        </div>
      </body>
    </html>
  `;
}

