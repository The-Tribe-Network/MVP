import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { user, session, account, verification } from "./schemas/auth";
import { tribe, tribeMember, tribeMemberPermission, tribeInvitation } from "./schemas/tribe";

// Auth types
export type User = InferSelectModel<typeof user>;
export type UserInsert = InferInsertModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;

// Tribe types
export type Tribe = InferSelectModel<typeof tribe>;
export type TribeInsert = InferInsertModel<typeof tribe>;
export type TribeMember = InferSelectModel<typeof tribeMember>;
export type TribeMemberInsert = InferInsertModel<typeof tribeMember>;
export type TribeMemberPermission = InferSelectModel<typeof tribeMemberPermission>;
export type TribeInvitation = InferSelectModel<typeof tribeInvitation>;

// Extended types for API responses
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

