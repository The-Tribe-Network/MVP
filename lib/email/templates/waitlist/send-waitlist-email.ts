import { resend, fromEmail, appName } from '../../client';
import { WaitlistEmailData } from './types';
import { generateWaitlistEmailHtml } from './template-html';
import { generateWaitlistEmailText } from './template-text';

export async function sendWaitlistEmail(data: WaitlistEmailData) {
  const { to } = data;

  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Welcome to the ${appName} Waitlist!`,
    html: generateWaitlistEmailHtml({ to }),
    text: generateWaitlistEmailText({ to }),
  });
}
