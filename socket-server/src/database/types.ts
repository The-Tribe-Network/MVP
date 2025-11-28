import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { User } from "better-auth"
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
} from "./schemas/media";
import {
  event,
  eventAttendee,
} from "./schemas/event";
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

export type MediaWithUploader = Media & {
  uploader: User;
  tribe: Tribe;
};

export type AlbumWithCreator = Album & {
  creator: User;
  tribe: Tribe;
  media?: Media[];
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

