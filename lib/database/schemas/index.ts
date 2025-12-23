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
  invitationStatus,
  eventStatus,
  messageType,
  albumPrivacy,
} from "@/lib/database/schemas/enums";

// Tribe tables
export {
  tribe,
  tribeMember,
  tribeMemberPermission,
  tribeInvitation,
  tribeMemberPreference,
} from "@/lib/database/schemas/tribe";

// Permission tables
export {
  tribeRolePermission,
} from "@/lib/database/schemas/permissions";

// Post tables
export {
  post,
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

// Relations
export {
  accountRelations,
  userRelations,
  eventRelations,
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
} from "@/lib/database/schemas/relations";

