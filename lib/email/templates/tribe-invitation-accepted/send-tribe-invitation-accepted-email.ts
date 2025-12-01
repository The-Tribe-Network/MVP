import { resend, fromEmail, appName } from '../../client';
import { TribeInvitationAcceptedEmailData } from './types';
import { generateTribeInvitationAcceptedEmailHtml } from './template-html';
import { generateTribeInvitationAcceptedEmailText } from './template-text';

export async function sendTribeInvitationAcceptedEmail(data: TribeInvitationAcceptedEmailData) {
  const { to, tribeName, inviterName, acceptedUserName, tribeId } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `${acceptedUserName} has accepted your invitation to ${tribeName} on ${appName}!`,
    html: generateTribeInvitationAcceptedEmailHtml({ tribeName, inviterName, acceptedUserName, tribeId }),
    text: generateTribeInvitationAcceptedEmailText({ tribeName, inviterName, acceptedUserName, tribeId }),
  });
}

