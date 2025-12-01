export interface TribeInvitationRejectedEmailData {
  to: string; // Email of the user who created the invite (invitedBy)
  inviterName: string; // Name of the user who created the invite
  rejectedUserName: string; // Name of the user who rejected the invite
  tribeName: string;
  tribeId: string;
}

