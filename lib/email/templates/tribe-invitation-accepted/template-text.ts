import { appName, appUrl } from '../../client';

export function generateTribeInvitationAcceptedEmailText({ 
  tribeName, 
  inviterName,
  acceptedUserName,
  tribeId
}: { 
  tribeName: string; 
  inviterName: string;
  acceptedUserName: string;
  tribeId: string;
}) {
  const tribeUrl = `${appUrl}/tribe/${tribeId}`;
  
  return `
Hi ${inviterName},

${acceptedUserName} has accepted your invitation to join ${tribeName} on ${appName}!

What's next?
- ${acceptedUserName} is now a member of ${tribeName}
- They can now participate in discussions and activities
- You can connect with them in the tribe

View the tribe here:
${tribeUrl}

Best regards,
The ${appName} Team
  `.trim();
}

