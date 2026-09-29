import { openInAppUrl } from '@/lib/landing/urls';
import { appLink } from '@/lib/services/notifications';
import { sendEmail, appName } from '../../client';
import { renderEmail } from '../../layout';
import { TribeInvitationRejectedEmailData } from './types';

export async function sendTribeInvitationRejectedEmail(data: TribeInvitationRejectedEmailData) {
  const { to, tribeName, inviterName, rejectedUserName, tribeId } = data;
  const { html, text } = renderEmail({
    heading: `${rejectedUserName} passed on ${tribeName}`,
    preheader: `Your invite to ${tribeName} was declined.`,
    blocks: [
      `Hi ${inviterName.trim().split(/\s+/)[0] || 'there'}, ${rejectedUserName} declined your invite to ${tribeName}.`,
      "Nothing else changes for your tribe, and you can invite them again any time.",
    ],
    button: { label: `Open ${tribeName}`, url: openInAppUrl(appLink.tribe(tribeId)) },
    reason: `You're getting this because you invited ${rejectedUserName} to ${tribeName} on ${appName}.`,
  });
  return await sendEmail({
    to,
    subject: `${rejectedUserName} has declined your invitation to ${tribeName} on ${appName}`,
    html,
    text,
  });
}
