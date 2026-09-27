import { sendEmail, appName } from '../../client';
import { WaitlistEmailData } from './types';
import { generateWaitlistEmailHtml } from './template-html';
import { generateWaitlistEmailText } from './template-text';

export async function sendWaitlistEmail(data: WaitlistEmailData) {
  const { to } = data;

  return await sendEmail({
    to,
    subject: `Welcome to the ${appName} Waitlist!`,
    html: generateWaitlistEmailHtml({ to }),
    text: generateWaitlistEmailText({ to }),
  });
}
