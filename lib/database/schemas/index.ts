// Auth tables
export {
  account,
  session,
  user,
  verification,
} from "@/lib/database/schemas/auth";

// Enums
export {
  privacyType,
  tribeRole,
  tribeCategory,
  activityType,
  mediaType,
  postKind,
  invitationStatus,
  eventStatus,
  messageType,
  albumPrivacy,
  permissionLevel,
  eventEditPermission,
  attendeeListVisibility,
  pollCreationPermission,
  pollResultsVisibility,
  draftKind,
} from "@/lib/database/schemas/enums";

// Tribe tables
export {
  tribe,
  tribeMember,
  tribeMemberPermission,
  tribeInvitation,
  tribeMemberPreference,
  tribeSettings,
} from "@/lib/database/schemas/tribe";

// Permission tables
export {
  tribeRolePermission,
} from "@/lib/database/schemas/permissions";

// Post tables
export {
  post,
  postMedia,
  postLike,
  comment,
  commentLike,
} from "@/lib/database/schemas/post";

// Media tables
export {
  album,
  media,
  albumMedia,
  mediaLike,
} from "@/lib/database/schemas/media";

// Event tables
export {
  event,
  eventAttendee,
  eventSettings,
  eventCoHost,
  eventLink,
} from "@/lib/database/schemas/event";

// Poll tables
export {
  poll,
  pollOption,
  pollVote,
} from "@/lib/database/schemas/poll";

// Activity & Notification tables
export {
  activity,
  notification,
} from "@/lib/database/schemas/activity";

// Draft tables
export { draft } from "@/lib/database/schemas/draft";

// Hashtag tables
export {
  hashtag,
  postHashtag,
} from "@/lib/database/schemas/hashtag";

// Message tables
export {
  message,
  messageRead,
} from "@/lib/database/schemas/message";

// Waitlist tables and enums
export {
  waitlist,
  waitlistSurvey,
  surveyRoleEnum,
  surveyPricingEnum,
} from "@/lib/database/schemas/waitlist";

// Relations
export {
  accountRelations,
  userRelations,
  eventRelations,
  eventSettingsRelations,
  eventCoHostRelations,
  eventLinkRelations,
  tribeRelations,
  activityRelations,
  mediaRelations,
  postRelations,
  commentRelations,
  commentLikeRelations,
  eventAttendeeRelations,
  messageRelations,
  messageReadRelations,
  notificationRelations,
  postHashtagRelations,
  hashtagRelations,
  postLikeRelations,
  postMediaRelations,
  sessionRelations,
  tribeInvitationRelations,
  tribeMemberRelations,
  tribeMemberPermissionRelations,
  albumRelations,
  mediaLikeRelations,
  tribeMemberPreferenceRelations,
  albumMediaRelations,
  pollRelations,
  pollOptionRelations,
  pollVoteRelations,
  draftRelations,
} from "@/lib/database/schemas/relations";

