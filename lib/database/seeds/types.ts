/**
 * Seed Data Type Definitions
 *
 * These types define the structure for seed data used to populate
 * the database with realistic mock data for marketing screenshots.
 */

export type SeedUserData = {
  name: string;
  email: string;
  role: "owner" | "admin" | "moderator" | "member";
  avatarGender: "male" | "female";
};

export type SeedCommentData = {
  /** Index of the author in the users array */
  authorIndex: number;
  content: string;
  /** How many days ago this comment was made */
  daysAgo: number;
};

export type SeedPostData = {
  /** Index of the author in the users array */
  authorIndex: number;
  content: string;
  /** How many days ago this post was made */
  daysAgo: number;
  /** Flat array of comments (no nesting) */
  comments?: SeedCommentData[];
  /** Indices of users who liked this post */
  likerIndices?: number[];
};

export type SeedEventData = {
  /** Index of the creator in the users array */
  creatorIndex: number;
  title: string;
  description: string;
  location: string;
  /** Negative = days ago, Positive = days from now */
  startDaysFromNow: number;
  /** Negative = days ago, Positive = days from now (optional) */
  endDaysFromNow?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  /** Indices of users who are attending */
  attendeeIndices: number[];
};

export type SeedTribeData = {
  tribe: {
    name: string;
    description: string;
    location: string;
    privacy: "private" | "public";
    category: "social" | "gaming" | "family" | "work" | "hobbies" | "other";
  };
  users: SeedUserData[];
  posts: SeedPostData[];
  events: SeedEventData[];
};
