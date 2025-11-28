import { resend, fromEmail, appName } from '../../client';
import { TribeInvitationRejectedEmailData } from './types';
import { generateTribeInvitationRejectedEmailHtml } from './template-html';
import { generateTribeInvitationRejectedEmailText } from './template-text';

export async function sendTribeInvitationRejectedEmail(data: TribeInvitationRejectedEmailData) {
  const { to, tribeName, inviterName, rejectedUserName, tribeId } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `${rejectedUserName} has declined your invitation to ${tribeName} on ${appName}`,
    html: generateTribeInvitationRejectedEmailHtml({ tribeName, inviterName, rejectedUserName, tribeId }),
    text: generateTribeInvitationRejectedEmailText({ tribeName, inviterName, rejectedUserName, tribeId }),
  });
}

