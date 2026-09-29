import { openInAppUrl } from '@/lib/landing/urls';
import { appLink } from '@/lib/services/notifications';
import { sendEmail, appName } from '../../client';
import { renderEmail } from '../../layout';
import { TribeInvitationAcceptedEmailData } from './types';

export async function sendTribeInvitationAcceptedEmail(data: TribeInvitationAcceptedEmailData) {
  const { to, tribeName, inviterName, acceptedUserName, tribeId } = data;
  const { html, text } = renderEmail({
    heading: `${acceptedUserName} joined ${tribeName}`,
    preheader: `Your invite to ${tribeName} was accepted.`,
    blocks: [
      `Hi ${inviterName.trim().split(/\s+/)[0] || 'there'}, ${acceptedUserName} accepted your invite and is now a member of ${tribeName}.`,
      'Say hi in the timeline, or bring them into your next plan.',
    ],
    button: { label: `Open ${tribeName}`, url: openInAppUrl(appLink.tribe(tribeId)) },
    reason: `You're getting this because you invited ${acceptedUserName} to ${tribeName} on ${appName}.`,
  });
  return await sendEmail({
    to,
    subject: `${acceptedUserName} has accepted your invitation to ${tribeName} on ${appName}!`,
    html,
    text,
  });
}
