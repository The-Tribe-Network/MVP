import { resend, fromEmail, appName } from "@/lib/email/client";

export async function sendWaitlistEmail(email: string) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Welcome to the ${appName} Waitlist!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${appName}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to ${appName}!</h1>
            </div>

            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 18px; color: #1f2937; margin-top: 0;">
                Thanks for joining our waitlist! 🎉
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.8;">
                We're building something special for communities like yours. You'll be among the first to know when ${appName} launches.
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.8;">
                <strong>What to expect:</strong>
              </p>

              <ul style="font-size: 16px; color: #4b5563; line-height: 1.8;">
                <li>Early access to ${appName}</li>
                <li>Exclusive updates on our progress</li>
                <li>A chance to shape the product</li>
              </ul>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.8;">
                In the meantime, stay tuned for updates!
              </p>

              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  The ${appName} Team
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; padding: 20px;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send waitlist email:", error);
    // Don't throw - we don't want email failures to block waitlist signups
  }
}
