// Re-export all email functions and types from their respective modules
export { sendWelcomeEmail } from './templates/welcome/send-welcome-email';
export { sendTribeInvitationEmail } from './templates/tribe-invitation/send-tribe-invitation-email';
export { sendTribeInvitationAcceptedEmail } from './templates/tribe-invitation-accepted/send-tribe-invitation-accepted-email';
export { sendTribeInvitationRejectedEmail } from './templates/tribe-invitation-rejected/send-tribe-invitation-rejected-email';

// Re-export all types
export type { WelcomeEmailData } from './templates/welcome/types';
export type { TribeInvitationEmailData } from './templates/tribe-invitation/types';
export type { TribeInvitationAcceptedEmailData } from './templates/tribe-invitation-accepted/types';
export type { TribeInvitationRejectedEmailData } from './templates/tribe-invitation-rejected/types';
