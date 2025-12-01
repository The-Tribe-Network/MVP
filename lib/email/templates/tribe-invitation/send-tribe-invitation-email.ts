import { resend, fromEmail, appName } from '../../client';
import { TribeInvitationEmailData } from './types';
import { generateTribeInvitationEmailHtml } from './template-html';
import { generateTribeInvitationEmailText } from './template-text';

export async function sendTribeInvitationEmail(data: TribeInvitationEmailData) {
  const { to, tribeName, inviterName, invitationId } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `You've been invited to join ${tribeName} on ${appName}!`,
    html: generateTribeInvitationEmailHtml({ tribeName, inviterName, invitationId, to }),
    text: generateTribeInvitationEmailText({ tribeName, inviterName, invitationId }),
  });
}

