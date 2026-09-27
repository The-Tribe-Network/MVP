import { sendEmail, appName } from '../../client';
import { WelcomeEmailData } from './types';
import { generateWelcomeEmailHtml } from './template-html';
import { generateWelcomeEmailText } from './template-text';

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { to, userName, loginUrl } = data;
  
  return await sendEmail({
    to,
    subject: `Welcome to ${appName}!`,
    html: generateWelcomeEmailHtml({ userName, loginUrl, to }),
    text: generateWelcomeEmailText({ userName, loginUrl }),
  });
}
