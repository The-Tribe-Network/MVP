import { sendEmail, appName } from '../../client';
import { renderEmail } from '../../layout';
import { WaitlistEmailData } from './types';

/** The landing page's waitlist sign-up (POST /api/waitlist). */
export async function sendWaitlistEmail(data: WaitlistEmailData) {
  const { to } = data;
  const { html, text } = renderEmail({
    heading: `You're on the ${appName} waitlist`,
    preheader: "Thanks for signing up. Two minutes of your time would help us a lot.",
    blocks: [
      `Thanks for joining. ${appName} is a home for groups: plans, posts, chat and photos in one place. You'll be among the first to hear when it's ready for you.`,
      'Help us build it for your group: a two-minute survey tells us what you need, and your answers shape what we build first.',
    ],
    button: { label: 'Take the survey', url: `https://tribehq.io/survey?email=${encodeURIComponent(to)}` },
    reason: `You're getting this because ${to} joined the ${appName} waitlist.`,
  });
  return await sendEmail({ to, subject: `Welcome to the ${appName} Waitlist!`, html, text });
}
