export interface TribeInvitationAcceptedEmailData {
  to: string; // Email of the user who created the invite (invitedBy)
  inviterName: string; // Name of the user who created the invite
  acceptedUserName: string; // Name of the user who accepted the invite
  tribeName: string;
  tribeId: string;
}

