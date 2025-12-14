import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  tribe,
  tribeMember,
  tribeMemberPermission,
  tribeInvitation,
} from "./schemas/tribe";
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
export type TribeInvitation = InferSelectModel<typeof tribeInvitation>;
export type TribeInvitationInsert = InferInsertModel<typeof tribeInvitation>;

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
// Extended types for API responses
// ============================================
export type TribeWithCreator = Tribe & {
  creator: User;
};

export type TribeWithMembers = Tribe & {
  creator: User;
  memberCount: number;
};

export type TribeMemberWithUser = TribeMember & {
  user: User;
};

export type PostWithAuthor = Post & {
  author: User;
};

export type PostWithAuthorAndTribe = Post & {
  author: User;
  tribe: Tribe;
};

export type CommentWithAuthor = Comment & {
  author: User;
};

export type CommentWithAuthorAndReplies = Comment & {
  author: User;
  replies?: CommentWithAuthor[];
};

export type EventWithCreator = Event & {
  creator: User;
  tribe: Tribe;
};

export type EventWithAttendees = Event & {
  creator: User;
  tribe: Tribe;
  attendees: (EventAttendee & { user: User })[];
};

export type EventWithDetails = Event & {
  creator: User;
  tribe: Tribe;
  attendees: (EventAttendee & { user: User })[];
  attendeeCount: number;
  isUserAttending?: boolean;
};

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

export type MediaWithUploader = Media & {
  uploader: User;
  tribe: Tribe;
};

export type AlbumWithCreator = Album & {
  creator: User;
  tribe: Tribe;
  coverUrl?: string | null; // Resolved from coverId
  photoCount?: number;
};

export type AlbumWithMedia = Album & {
  creator: User;
  tribe: Tribe;
  coverUrl?: string | null;
  media: Media[];
  photoCount: number;
};

export type MessageWithSender = Message & {
  sender: User;
  recipient?: User;
  tribe?: Tribe;
};

export type ActivityWithUser = Activity & {
  user: User;
  tribe?: Tribe;
  post?: Post;
  event?: Event;
  media?: Media;
  targetUser?: User;
};

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

