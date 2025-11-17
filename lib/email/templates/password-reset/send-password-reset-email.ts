import { resend, fromEmail, appName } from '../../client';
import { ResetPasswordEmailData } from './types';
import { generatePasswordResetEmailHtml } from './template-html';
import { generatePasswordResetEmailText } from './template-text';

export async function sendPasswordResetEmail(data: ResetPasswordEmailData) {
  const { to, resetUrl, userName } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Reset your password - ${appName}`,
    html: generatePasswordResetEmailHtml({ resetUrl, userName, to }),
    text: generatePasswordResetEmailText({ resetUrl, userName }),
  });
}
