import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Auth schemas
import {
  user,
  session,
  account,
  verification,
} from "./schemas/auth";

// Tribe schemas
import {
  tribe,
  tribeMember,
  tribeMemberPermission,
  tribeInvitation,
} from "./schemas/tribe";

// Post schemas
import {
  post,
  postLike,
  comment,
  commentLike,
} from "./schemas/post";

// Media schemas
import {
  album,
  media,
} from "./schemas/media";

// Event schemas
import {
  event,
  eventAttendee,
} from "./schemas/event";

// Activity schemas
import {
  activity,
  notification,
} from "./schemas/activity";

// Hashtag schemas
import {
  hashtag,
  postHashtag,
} from "./schemas/hashtag";

// Message schemas
import {
  message,
  messageRead,
} from "./schemas/message";

// ============================================
// AUTH TYPES
// ============================================

export type User = InferSelectModel<typeof user>;
export type UserInsert = InferInsertModel<typeof user>;

export type Session = InferSelectModel<typeof session>;
export type SessionInsert = InferInsertModel<typeof session>;

export type Account = InferSelectModel<typeof account>;
export type AccountInsert = InferInsertModel<typeof account>;

export type Verification = InferSelectModel<typeof verification>;
export type VerificationInsert = InferInsertModel<typeof verification>;

// ============================================
// TRIBE TYPES
// ============================================

export type Tribe = InferSelectModel<typeof tribe>;
export type TribeInsert = InferInsertModel<typeof tribe>;

export type TribeMember = InferSelectModel<typeof tribeMember>;
export type TribeMemberInsert = InferInsertModel<typeof tribeMember>;

export type TribeMemberPermission = InferSelectModel<typeof tribeMemberPermission>;
export type TribeMemberPermissionInsert = InferInsertModel<typeof tribeMemberPermission>;

export type TribeInvitation = InferSelectModel<typeof tribeInvitation>;
export type TribeInvitationInsert = InferInsertModel<typeof tribeInvitation>;

// Composite types for common use cases
export type TribeWithCreator = Tribe & {
  creator: Pick<User, "id" | "name" | "email" | "image">;
};

export type TribeWithMembers = Tribe & {
  creator: Pick<User, "id" | "name" | "email" | "image">;
  memberCount: number;
};

// ============================================
// POST TYPES
// ============================================

export type Post = InferSelectModel<typeof post>;
export type PostInsert = InferInsertModel<typeof post>;

export type PostLike = InferSelectModel<typeof postLike>;
export type PostLikeInsert = InferInsertModel<typeof postLike>;

export type Comment = InferSelectModel<typeof comment>;
export type CommentInsert = InferInsertModel<typeof comment>;

export type CommentLike = InferSelectModel<typeof commentLike>;
export type CommentLikeInsert = InferInsertModel<typeof commentLike>;

// Composite types
export type PostWithAuthor = Post & {
  author: Pick<User, "id" | "name" | "email" | "image">;
};

export type PostWithDetails = Post & {
  author: Pick<User, "id" | "name" | "email" | "image">;
  tribe: Pick<Tribe, "id" | "name" | "avatar">;
  likeCount: number;
  commentCount: number;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "email" | "image">;
};

export type CommentWithDetails = Comment & {
  author: Pick<User, "id" | "name" | "email" | "image">;
  likeCount: number;
  replies?: CommentWithDetails[];
};

// ============================================
// MEDIA TYPES
// ============================================

export type Album = InferSelectModel<typeof album>;
export type AlbumInsert = InferInsertModel<typeof album>;

export type Media = InferSelectModel<typeof media>;
export type MediaInsert = InferInsertModel<typeof media>;

// Composite types
export type AlbumWithMedia = Album & {
  media: Media[];
  mediaCount: number;
};

export type MediaWithUploader = Media & {
  uploader: Pick<User, "id" | "name" | "email" | "image">;
};

// ============================================
// EVENT TYPES
// ============================================

export type Event = InferSelectModel<typeof event>;
export type EventInsert = InferInsertModel<typeof event>;

export type EventAttendee = InferSelectModel<typeof eventAttendee>;
export type EventAttendeeInsert = InferInsertModel<typeof eventAttendee>;

// Composite types
export type EventWithCreator = Event & {
  creator: Pick<User, "id" | "name" | "email" | "image">;
};

export type EventWithDetails = Event & {
  creator: Pick<User, "id" | "name" | "email" | "image">;
  tribe: Pick<Tribe, "id" | "name" | "avatar">;
  attendeeCount: number;
  attendees: (EventAttendee & {
    user: Pick<User, "id" | "name" | "email" | "image">;
  })[];
};

// ============================================
// ACTIVITY TYPES
// ============================================

export type Activity = InferSelectModel<typeof activity>;
export type ActivityInsert = InferInsertModel<typeof activity>;

export type Notification = InferSelectModel<typeof notification>;
export type NotificationInsert = InferInsertModel<typeof notification>;

// Composite types
export type ActivityWithUser = Activity & {
  user: Pick<User, "id" | "name" | "email" | "image">;
};

export type ActivityWithDetails = Activity & {
  user: Pick<User, "id" | "name" | "email" | "image">;
  tribe?: Pick<Tribe, "id" | "name" | "avatar"> | null;
  post?: Pick<Post, "id" | "content"> | null;
  event?: Pick<Event, "id" | "title"> | null;
};

// ============================================
// HASHTAG TYPES
// ============================================

export type Hashtag = InferSelectModel<typeof hashtag>;
export type HashtagInsert = InferInsertModel<typeof hashtag>;

export type PostHashtag = InferSelectModel<typeof postHashtag>;
export type PostHashtagInsert = InferInsertModel<typeof postHashtag>;

// Composite types
export type HashtagWithPosts = Hashtag & {
  posts: Post[];
};

// ============================================
// MESSAGE TYPES
// ============================================

export type Message = InferSelectModel<typeof message>;
export type MessageInsert = InferInsertModel<typeof message>;

export type MessageRead = InferSelectModel<typeof messageRead>;
export type MessageReadInsert = InferInsertModel<typeof messageRead>;

// Composite types
export type MessageWithSender = Message & {
  sender: Pick<User, "id" | "name" | "email" | "image">;
};

export type MessageWithDetails = Message & {
  sender: Pick<User, "id" | "name" | "email" | "image">;
  recipient?: Pick<User, "id" | "name" | "email" | "image"> | null;
  tribe?: Pick<Tribe, "id" | "name" | "avatar"> | null;
  readBy: (MessageRead & {
    user: Pick<User, "id" | "name" | "email" | "image">;
  })[];
};
