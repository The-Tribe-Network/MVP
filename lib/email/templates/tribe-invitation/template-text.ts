import { appName, appUrl } from '../../client';

export function generateTribeInvitationEmailText({ 
  tribeName, 
  inviterName, 
  invitationId
}: { 
  tribeName: string; 
  inviterName: string; 
  invitationId: string;
}) {
  const acceptUrl = `${appUrl}/invitations/accept/${invitationId}`;
  
  return `
Hi there,

${inviterName} has invited you to join ${tribeName} on ${appName}!

About this invitation:
- You'll be able to connect with other members
- Share posts, photos, and events
- Participate in discussions and activities

Accept your invitation by clicking this link:
${acceptUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

Best regards,
The ${appName} Team
  `.trim();
}

