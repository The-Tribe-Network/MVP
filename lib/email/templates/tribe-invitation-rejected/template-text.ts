import { appName, appUrl } from '../../client';

export function generateTribeInvitationRejectedEmailText({ 
  tribeName, 
  inviterName,
  rejectedUserName,
  tribeId
}: { 
  tribeName: string; 
  inviterName: string;
  rejectedUserName: string;
  tribeId: string;
}) {
  const tribeUrl = `${appUrl}/tribe/${tribeId}`;
  
  return `
Hi ${inviterName},

${rejectedUserName} has declined your invitation to join ${tribeName} on ${appName}.

Don't worry!
- You can still invite other members to ${tribeName}
- This doesn't affect your tribe or other members
- You can always send another invitation in the future

View the tribe here:
${tribeUrl}

Best regards,
The ${appName} Team
  `.trim();
}

