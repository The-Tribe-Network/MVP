import { user } from "@/lib/database/schemas/auth";

/**
 * Shared column sets for embedding a user in a response.
 *
 * Selecting the whole `user` row sends `email` (and everything else) to every client that can see
 * the parent record — a feed page handed out every author's address. Pick one of these instead, so
 * what goes over the wire matches what the mobile contract declares
 * (`docs/api/openapi.yaml`: UserPreview / UserWithUsername / UserBasic).
 *
 * `email` belongs to `userBasicColumns` only, which is for member management (MemberListItem).
 */

/** UserPreview — the default for an embedded user: author, creator, voter, activity actor. */
export const userPreviewColumns = {
  id: user.id,
  name: user.name,
  image: user.image,
};

/** UserWithUsername — UserPreview plus the handle, where the UI links to a profile or @mentions. */
export const userWithUsernameColumns = {
  ...userPreviewColumns,
  username: user.username,
};

/**
 * UserWithUsername plus `displayName`, for comment authors: the web comment list prefers a user's
 * chosen display name over their account name. Not in the mobile contract, which declares comment
 * authors as UserWithUsername — either the contract gains the field or web drops the preference.
 */
export const userWithProfileColumns = {
  ...userWithUsernameColumns,
  displayName: user.displayName,
};

/** UserBasic — includes `email`. Member management only; never embed this in feed-shaped data. */
export const userBasicColumns = {
  ...userWithUsernameColumns,
  email: user.email,
};
