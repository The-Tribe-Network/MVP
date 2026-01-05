import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  tribe,
  tribeMember,
  tribeMemberPermission,
  tribeMemberPreference,
  tribeInvitation,
  tribeSettings,
} from "./schemas/tribe";
import {
  tribeRolePermission,
} from "./schemas/permissions";
import {
  post,
  postLike,
  comment,
  commentLike,
} from "./schemas/post";
import {
  album,
  media,
  albumMedia,
} from "./schemas/media";
import {
  event,
  eventAttendee,
  eventSettings,
  eventCoHost,
  eventLink,
} from "./schemas/event";
import {
  poll,
  pollOption,
  pollVote,
} from "./schemas/poll";
import {
  activity,
  notification,
} from "./schemas/activity";
import {
  hashtag,
  postHashtag,
} from "./schemas/hashtag";
import {
  message,
  messageRead,
} from "./schemas/message";
import {
  waitlistSurvey,
} from "./schemas/waitlist";
import { auth } from "@/lib/clients/auth";
import { session, user } from "./schemas/auth";

// ============================================
// User types
// ============================================
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;

// Drizzle schema types (includes all database fields)
export type InsertUser = typeof user.$inferInsert
export type SelectUser = typeof user.$inferSelect

export type SessionInsert = typeof session.$inferInsert
export type SelectSession = typeof session.$inferSelect

// ============================================
// Tribe types
// ============================================
export type Tribe = InferSelectModel<typeof tribe>;
export type TribeInsert = InferInsertModel<typeof tribe>;
export type TribeMember = InferSelectModel<typeof tribeMember>;
export type TribeMemberInsert = InferInsertModel<typeof tribeMember>;
export type TribeMemberPermission = InferSelectModel<typeof tribeMemberPermission>;
export type TribeMemberPermissionInsert = InferInsertModel<typeof tribeMemberPermission>;
export type TribeMemberPreference = InferSelectModel<typeof tribeMemberPreference>;
export type TribeMemberPreferenceInsert = InferInsertModel<typeof tribeMemberPreference>;
export type TribeInvitation = InferSelectModel<typeof tribeInvitation>;
export type TribeInvitationInsert = InferInsertModel<typeof tribeInvitation>;
export type TribeRolePermission = InferSelectModel<typeof tribeRolePermission>;
export type TribeRolePermissionInsert = InferInsertModel<typeof tribeRolePermission>;
export type TribeSettings = InferSelectModel<typeof tribeSettings>;
export type TribeSettingsInsert = InferInsertModel<typeof tribeSettings>;

// Partial type for timeline settings only
export type TimelineSettings = Pick<TribeSettings,
  | 'postingPermissionLevel'
  | 'commentingPermissionLevel'
  | 'allowPostEditing'
  | 'allowPostDeletion'
  | 'enablePostLikes'
  | 'enableCommentLikes'
  | 'enableNestedReplies'
  | 'enablePinnedPosts'
>;

// Partial type for events settings only
export type EventsSettings = Pick<TribeSettings,
  | 'eventsEnabled'
  | 'eventCreationPermissionLevel'
  | 'eventEditPermissionLevel'
  | 'requireEventEndDate'
  | 'requireEventLocation'
  | 'enableRsvps'
  | 'showAttendeeList'
  | 'enableRsvpDeadline'
  | 'enableCapacityLimit'
  | 'enableWaitlist'
  | 'enableEventPolls'
  | 'pollCreationPermissionLevel'
  | 'allowAnonymousPolls'
  | 'pollResultsVisibility'
  | 'enableEventReminders'
  | 'reminderTimings'
  | 'notifyOnRsvpChanges'
  | 'enableCalendarExport'
>;

// Partial type for media settings only
export type MediaSettings = Pick<TribeSettings,
  | 'mediaUploadPermissionLevel'
  | 'maxMediaFileSize'
  | 'autoAddPostMediaToGallery'
  | 'albumCreationPermissionLevel'
  | 'defaultAlbumPrivacy'
  | 'allowCollaborativeAlbums'
  | 'autoCreateEventAlbums'
  | 'enableMediaLikes'
  | 'requireMediaApproval'
>;

// ============================================
// Post types
// ============================================
export type Post = InferSelectModel<typeof post>;
export type PostInsert = InferInsertModel<typeof post>;
export type PostLike = InferSelectModel<typeof postLike>;
export type PostLikeInsert = InferInsertModel<typeof postLike>;
export type Comment = InferSelectModel<typeof comment>;
export type CommentInsert = InferInsertModel<typeof comment>;
export type CommentLike = InferSelectModel<typeof commentLike>;
export type CommentLikeInsert = InferInsertModel<typeof commentLike>;

// ============================================
// Media types
// ============================================
export type Album = InferSelectModel<typeof album>;
export type AlbumInsert = InferInsertModel<typeof album>;
export type AlbumMedia = InferSelectModel<typeof albumMedia>;
export type AlbumMediaInsert = InferInsertModel<typeof albumMedia>;
export type Media = InferSelectModel<typeof media>;
export type MediaInsert = InferInsertModel<typeof media>;

// ============================================
// Event types
// ============================================
export type Event = InferSelectModel<typeof event>;
export type EventInsert = InferInsertModel<typeof event>;
export type EventAttendee = InferSelectModel<typeof eventAttendee>;
export type EventAttendeeInsert = InferInsertModel<typeof eventAttendee>;
export type EventSettings = InferSelectModel<typeof eventSettings>;
export type EventSettingsInsert = InferInsertModel<typeof eventSettings>;
export type EventCoHost = InferSelectModel<typeof eventCoHost>;
export type EventCoHostInsert = InferInsertModel<typeof eventCoHost>;
export type EventLink = InferSelectModel<typeof eventLink>;
export type EventLinkInsert = InferInsertModel<typeof eventLink>;

// ============================================
// Poll types
// ============================================
export type Poll = InferSelectModel<typeof poll>;
export type PollInsert = InferInsertModel<typeof poll>;
export type PollOption = InferSelectModel<typeof pollOption>;
export type PollOptionInsert = InferInsertModel<typeof pollOption>;
export type PollVote = InferSelectModel<typeof pollVote>;
export type PollVoteInsert = InferInsertModel<typeof pollVote>;

// ============================================
// Activity types
// ============================================
export type Activity = InferSelectModel<typeof activity>;
export type ActivityInsert = InferInsertModel<typeof activity>;
export type Notification = InferSelectModel<typeof notification>;
export type NotificationInsert = InferInsertModel<typeof notification>;

// ============================================
// Hashtag types
// ============================================
export type Hashtag = InferSelectModel<typeof hashtag>;
export type HashtagInsert = InferInsertModel<typeof hashtag>;
export type PostHashtag = InferSelectModel<typeof postHashtag>;
export type PostHashtagInsert = InferInsertModel<typeof postHashtag>;

// ============================================
// Message types
// ============================================
export type Message = InferSelectModel<typeof message>;
export type MessageInsert = InferInsertModel<typeof message>;
export type MessageRead = InferSelectModel<typeof messageRead>;
export type MessageReadInsert = InferInsertModel<typeof messageRead>;

// ============================================
// Utility types for composing extended types
// ============================================

// Utility type to pick specific user fields (for partial user objects)
export type UserPreview = Pick<User, 'id' | 'name' | 'image'>;
export type UserWithUsername = Pick<User, 'id' | 'name' | 'username' | 'image'>;
export type UserBasic = Pick<User, 'id' | 'name' | 'email' | 'image' | 'username'>;

// ============================================
// Extended types for API responses
// ============================================

// Tribe extended types
export type TribeWithCreator = Tribe & {
  creator: User;
};

export type TribeWithMembers = TribeWithCreator & {
  memberCount: number;
  eventCount: number;
  mediaCount: number;
};

// Tribe member extended types
export type TribeMemberWithUser = TribeMember & {
  user: User;
};

export type TribeMemberWithPermissions = TribeMember & {
  user: User;
  permissions: TribeMemberPermission | null;
};

export type MemberListItem = Pick<TribeMember, 'id' | 'role' | 'joinedAt'> & {
  user: UserBasic;
  hasCustomPermissions: boolean;
  restrictionReason: string | null;
};

// Invitation extended types
export interface TribeInvitationWithInviter {
  id: string;
  tribeId: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date | null;
  createdAt: Date;
  inviterName: string | null;
  inviterEmail: string;
  inviterId: string;
}

export type PaginatedMembers = {
  members: MemberListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// Permission system types
export type PermissionSet = Record<string, boolean | null>;

export type RolePermissionMatrix = {
  role: 'owner' | 'admin' | 'moderator' | 'member';
  permissions: PermissionSet;
  isLocked: boolean;
  memberCount?: number;
};

export type MemberPermissionDetail = {
  member: TribeMember;
  user: UserWithUsername;
  individualOverrides: TribeMemberPermission | null;
  roleDefaults: PermissionSet;
  effectivePermissions: PermissionSet;
  hasOverrides: boolean;
};

export type TribeMemberWithPermissionsExtended = TribeMember & {
  permissions: TribeMemberPermission | null;
  user: UserWithUsername;
  hasOverrides: boolean;
};

// Post extended types
export type PostWithAuthor = Post & {
  author: User;
};

export type PostWithAuthorAndTribe = PostWithAuthor & {
  tribe: Tribe;
};

// Comment extended types
export type CommentWithAuthor = Comment & {
  author: User;
};

export type CommentWithStats = CommentWithAuthor & {
  likeCount: number;
  isLiked: boolean;
};

export type CommentWithAuthorAndReplies = CommentWithAuthor & {
  replies?: CommentWithAuthor[];
};

// Event extended types - build up progressively
export type EventWithCreator = Event & {
  creator: User;
  tribe: Tribe;
};

export type EventAttendeeWithUser = EventAttendee & {
  user: User;
};

export type EventWithAttendees = EventWithCreator & {
  attendees: EventAttendeeWithUser[];
};

export type EventWithDetails = EventWithAttendees & {
  attendeeCount: number;
  isUserAttending?: boolean;
};

// Event settings extended types
export type EventCoHostWithUser = EventCoHost & {
  user: UserPreview;
  addedByUser: UserPreview;
};

export type EventLinkWithCreator = EventLink & {
  createdByUser: UserPreview;
};

export type EventSettingsWithRelations = EventSettings & {
  linkedAlbum?: Pick<Album, 'id' | 'name'> & { coverUrl: string | null } | null;
};

export type EventWithSettings = EventWithDetails & {
  settings: EventSettingsWithRelations | null;
  coHosts: EventCoHostWithUser[];
  links: EventLinkWithCreator[];
  isUserCreator: boolean;
  isUserCoHost: boolean;
  canUserEdit: boolean;
};

// Poll extended types
export type PollOptionWithVotes = PollOption & {
  votes: number;
  voters: User[];
};

export type PollWithDetails = Poll & {
  creator: User;
  options: PollOptionWithVotes[];
  userVotes: string[];
  totalVotes: number;
};

export type EventWithPolls = EventWithCreator & {
  polls: PollWithDetails[];
};

// Media extended types
export type MediaWithUploader = Media & {
  uploader: User;
  tribe: Tribe;
};

// Album extended types - build up progressively
export type AlbumWithCreator = Album & {
  creator: User;
  tribe: Tribe;
  coverUrl?: string | null; // Resolved from coverId
  photoCount?: number;
};

export type AlbumWithMedia = AlbumWithCreator & {
  media: Media[];
  photoCount: number; // Override optional to required
};

// Message extended types
export type MessageWithSender = Message & {
  sender: User;
  recipient?: User;
  tribe?: Tribe;
};

// Activity extended types
export type ActivityWithUser = Activity & {
  user: User;
  tribe?: Tribe;
  post?: Post;
  event?: Event;
  media?: Media;
  targetUser?: User;
};

// ============================================
// Extended types with engagement stats
// ============================================

// Linked album preview for posts
export type LinkedAlbumPreview = Pick<Album, 'id' | 'name'> & {
  coverUrl: string | null;
  photoCount: number;
};

// Post with engagement stats
export type PostWithStats = PostWithAuthor & {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  image: { id: string; url: string; width?: number; height?: number } | null;
  linkedAlbum: LinkedAlbumPreview | null;
};

// Media with engagement stats (uses partial User type)
export type MediaWithStats = Media & {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  uploader?: UserPreview; // Uses the Pick utility type defined above
};

// Media with album relationship (includes junction table data)
export type MediaWithAlbumInfo = Media & {
  mediaId: string; // Junction table ID
  albumId: string | null;
  uploader: UserPreview; // Now properly typed
  likeCount: number;
  commentCount: number;
};

// Album with full details
export type AlbumWithStats = AlbumWithMedia & {
  stats: {
    mediaCount: number;
    likeCount: number;
  };
};

// Event with full attendance details
export type EventWithAttendance = EventWithDetails & {
  isAttending: boolean;
};

// ============================================
// API Response wrappers
// ============================================

// Paginated response wrapper
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

// Specific paginated responses
export type PostsResponse = PaginatedResponse<PostWithStats>;
export type MediaResponse = PaginatedResponse<MediaWithStats>;
export type AlbumsResponse = PaginatedResponse<AlbumWithStats>;
export type EventsResponse = PaginatedResponse<EventWithAttendance>;

// ============================================
// Component prop utility types
// ============================================

// Helper types for component props - when components need subset of fields
export type PostCardProps = PostWithStats;
export type CommentItemProps = CommentWithAuthor;
export type AlbumCardProps = AlbumWithStats;
export type EventCardProps = EventWithAttendance;
export type MediaItemProps = MediaWithStats;

// ============================================
// Security types
// ============================================
export type SessionWithDevice = SelectSession & {
  deviceName: string;
  browser: string;
  os: string;
  location: string | null;
  isCurrentSession: boolean;
  lastActive: Date;
};

// ============================================
// Waitlist Survey types
// ============================================
export type WaitlistSurvey = InferSelectModel<typeof waitlistSurvey>;
export type WaitlistSurveyInsert = InferInsertModel<typeof waitlistSurvey>;

