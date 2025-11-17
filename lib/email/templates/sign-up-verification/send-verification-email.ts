import { resend, fromEmail, appName } from '../../client';
import { VerificationEmailData } from './types';
import { generateVerificationEmailHtml } from './template-html';
import { generateVerificationEmailText } from './template-text';

export async function sendVerificationEmail(data: VerificationEmailData) {
  const { to, verificationUrl, userName } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Verify your email - ${appName}`,
    html: generateVerificationEmailHtml({ verificationUrl, userName, to }),
    text: generateVerificationEmailText({ verificationUrl, userName }),
  });
}
