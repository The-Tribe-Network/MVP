import { resend, fromEmail, appName } from '../../client';
import { WelcomeEmailData } from './types';
import { generateWelcomeEmailHtml } from './template-html';
import { generateWelcomeEmailText } from './template-text';

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { to, userName, loginUrl } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Welcome to ${appName}!`,
    html: generateWelcomeEmailHtml({ userName, loginUrl, to }),
    text: generateWelcomeEmailText({ userName, loginUrl }),
  });
}
