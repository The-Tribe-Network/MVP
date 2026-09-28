import { sendEmail, appName } from '../../client';
import { renderEmail } from '../../layout';
import { invitationLandingUrl } from '@/lib/landing/urls';
import { TribeInvitationEmailData } from './types';

/** An email invite to a tribe. The button opens the invite page (TRI-340), which opens the app or says how to get it. */
export async function sendTribeInvitationEmail(data: TribeInvitationEmailData) {
  const { to, tribeName, inviterName, invitationId } = data;
  const { html, text } = renderEmail({
    heading: `${inviterName} invited you to ${tribeName}`,
    preheader: `Join ${tribeName} on ${appName}.`,
    blocks: [
      `${inviterName} invited you to join ${tribeName} on ${appName}, where the group keeps its plans, posts, chat and photos.`,
      `To join, sign up in ${appName} with this email address (${to}), then open the invite.`,
      'The invite is good for 7 days.',
    ],
    button: { label: 'Open the invite', url: invitationLandingUrl(invitationId) },
    reason: `You're getting this because ${inviterName} invited ${to}. If you didn't expect it, you can ignore it.`,
  });
  return await sendEmail({ to, subject: `${inviterName} invited you to ${tribeName} on ${appName}`, html, text });
}
