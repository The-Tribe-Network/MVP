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

/**
 * UserPreview — the default for an embedded user: author, creator, voter, activity actor.
 * `displayName` is the profile name clients show first (`displayName ?? name`); a deleted user's
 * tombstone has it scrubbed to null, so they read as `name` = "Deleted user".
 */
export const userPreviewColumns = {
  id: user.id,
  name: user.name,
  displayName: user.displayName,
  image: user.image,
};

/** UserWithUsername — UserPreview plus the handle, where the UI links to a profile or @mentions. */
export const userWithUsernameColumns = {
  ...userPreviewColumns,
  username: user.username,
};

/** Kept for existing callers; identical to `userWithUsernameColumns` now that every preview carries `displayName`. */
export const userWithProfileColumns = userWithUsernameColumns;

/** UserBasic — includes `email`. Member management only; never embed this in feed-shaped data. */
export const userBasicColumns = {
  ...userWithUsernameColumns,
  email: user.email,
};
