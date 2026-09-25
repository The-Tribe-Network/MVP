import { asc, eq, sql } from "drizzle-orm";

import { db, getDbTransaction } from "@/lib/database/client";
import { user } from "@/lib/database/schemas/auth";
import { media } from "@/lib/database/schemas/media";
import { userPrivacy, userSocialLink } from "@/lib/database/schemas/profile";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import type { SocialLinkInput, SocialNetwork, UpdatePrivacyInput } from "@/lib/validations/profile";
import type { UpdateProfileInput } from "./user";
import { getAlbumAccessContext, UUID_PATTERN } from "./album";
import { countEventsHostedBy, getEventsHostedBy } from "./event";
import { countMediaByTribe, getMediaByTribe } from "./media";
import { countPostsByAuthor, getPostsByAuthor } from "./post";

/**
 * Member profiles, social links and privacy preferences (TRI-15; mobile PROF-02, PROF-03, USET-06).
 *
 * The rule everything here follows (PRD R9.2, §10 decision 4): the viewer sees content only from tribes they
 * share with the member, and the server never sends the name or id of a tribe they don't share — only
 * `privateTribeCount`. A `tribeId` the viewer doesn't share scopes to nothing, the same whether the member
 * belongs to it or not, so the response cannot be used to probe memberships.
 */

// ── privacy ──

export type PrivacyPreferences = {
  profileVisibility: "everyone" | "tribe_members";
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showJoinDate: boolean;
  showSharedTribes: boolean;
};

/** What a user without a `user_privacy` row has (the column defaults; DATA-MODEL-DELTA §7). */
export const DEFAULT_PRIVACY: PrivacyPreferences = {
  profileVisibility: "everyone",
  showOnlineStatus: true,
  showLastSeen: true,
  showEmail: false,
  showLocation: true,
  showJoinDate: true,
  showSharedTribes: true,
};

const privacyColumns = {
  profileVisibility: userPrivacy.profileVisibility,
  showOnlineStatus: userPrivacy.showOnlineStatus,
  showLastSeen: userPrivacy.showLastSeen,
  showEmail: userPrivacy.showEmail,
  showLocation: userPrivacy.showLocation,
  showJoinDate: userPrivacy.showJoinDate,
  showSharedTribes: userPrivacy.showSharedTribes,
};

function toPreferences(row: Omit<PrivacyPreferences, "profileVisibility"> & { profileVisibility: string }): PrivacyPreferences {
  return { ...row, profileVisibility: row.profileVisibility === "everyone" ? "everyone" : "tribe_members" };
}

export async function getPrivacyPreferences(userId: string): Promise<PrivacyPreferences> {
  const [row] = await db.select(privacyColumns).from(userPrivacy).where(eq(userPrivacy.userId, userId)).limit(1);
  return row ? toPreferences(row) : { ...DEFAULT_PRIVACY };
}

/** Partial update; the first write creates the row from the defaults. One statement (upsert). */
export async function updatePrivacyPreferences(userId: string, patch: UpdatePrivacyInput): Promise<PrivacyPreferences> {
  if (Object.keys(patch).length === 0) return getPrivacyPreferences(userId);
  const [row] = await db
    .insert(userPrivacy)
    .values({ ...DEFAULT_PRIVACY, ...patch, userId })
    .onConflictDoUpdate({ target: userPrivacy.userId, set: { ...patch, updatedAt: new Date() } })
    .returning(privacyColumns);
  return toPreferences(row);
}

// ── social links ──

export type SocialLink = { network: SocialNetwork; value: string; order: number };

export async function getSocialLinks(userId: string): Promise<SocialLink[]> {
  return db
    .select({ network: userSocialLink.network, value: userSocialLink.value, order: userSocialLink.order })
    .from(userSocialLink)
    .where(eq(userSocialLink.userId, userId))
    .orderBy(asc(userSocialLink.order), asc(userSocialLink.network));
}

/**
 * PATCH /user/profile: the user columns and, when `socialLinks` is present, the replace-all of the links, in
 * one transaction (WebSocket driver; the HTTP `db` has none). Returns the user row plus `socialLinks`.
 */
export async function updateProfileWithSocialLinks(
  userId: string,
  data: UpdateProfileInput & { socialLinks?: SocialLinkInput[] }
) {
  const updateData: Partial<typeof user.$inferInsert> = {};
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.username !== undefined) updateData.username = data.username.toLowerCase();
  if (data.location !== undefined) updateData.location = data.location;
  if (data.removeAvatar === true) updateData.image = null;
  // Avatar upload is handled by the upload endpoint which updates user.image

  const updatedUser = await getDbTransaction().transaction(async (tx) => {
    // Always touch the row (updatedAt), so a links-only PATCH still returns the user
    const [row] = await tx
      .update(user)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();

    if (data.socialLinks) {
      await tx.delete(userSocialLink).where(eq(userSocialLink.userId, userId));
      if (data.socialLinks.length > 0) {
        await tx.insert(userSocialLink).values(
          data.socialLinks.map((link) => ({ userId, network: link.network, value: link.value, order: link.order }))
        );
      }
    }
    return row;
  });

  return { ...updatedUser, socialLinks: await getSocialLinks(userId) };
}

// ── member profile ──

type Role = (typeof tribeMember.$inferSelect)["role"];
export type SharedTribe = { id: string; name: string; avatar: string | null; color: string | null; role: Role };

/**
 * The member's tribes the viewer also belongs to (with the member's role), and how many of the member's
 * tribes are not shared. One query; unshared rows never leave this function except as a count.
 */
async function sharedTribesOf(viewerId: string, targetId: string): Promise<{ shared: SharedTribe[]; privateCount: number }> {
  const rows = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      avatar: tribe.avatar,
      avatarUrl: media.fileUrl,
      color: tribe.color,
      role: tribeMember.role,
      joinedAt: tribeMember.joinedAt,
      shared: sql<boolean>`exists (select 1 from ${tribeMember} viewer_membership
        where viewer_membership.tribe_id = ${tribeMember.tribeId} and viewer_membership.user_id = ${viewerId})`,
    })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .leftJoin(media, eq(tribe.avatar, media.id))
    .where(eq(tribeMember.userId, targetId))
    .orderBy(asc(tribeMember.joinedAt), asc(tribe.id));

  const shared = rows
    .filter((r) => r.shared === true)
    .map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatarUrl || r.avatar || null,
      color: r.color ?? null,
      role: r.role,
    }));
  return { shared, privateCount: rows.length - shared.length };
}

/** The tribes a content tab reads: all shared ones, or the one `tribeId` if it is shared, else none. */
function scopeTribeIds(shared: SharedTribe[], tribeId?: string): string[] {
  const ids = shared.map((t) => t.id);
  return tribeId === undefined ? ids : ids.includes(tribeId) ? [tribeId] : [];
}

async function userExists(userId: string) {
  if (!UUID_PATTERN.test(userId)) return false;
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1);
  return !!row;
}

export type MemberProfile = {
  id: string;
  name: string;
  displayName: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  location: string | null;
  joinedAt: Date | null;
  email: string | null;
  socialLinks: SocialLink[];
  sharedTribes: SharedTribe[];
  privateTribeCount: number;
  canViewContent: boolean;
  counts: { posts: number; events: number; photos: number };
};

/**
 * GET /users/{id}/profile. Null when the user does not exist (or the id is malformed).
 *
 * Privacy (the member's `user_privacy`, defaults when no row), never applied to the member's own view:
 * - `profileVisibility = 'tribe_members'` and no shared tribe → only id, name, displayName, username, image;
 *   bio, location, joinedAt, email, socialLinks and privateTribeCount are blanked.
 * - `showLocation` / `showJoinDate` false → `location` / `joinedAt` null.
 * - `showEmail` false (default) → `email` null.
 * - `showSharedTribes` false → `sharedTribes` [] and `privateTribeCount` 0; content stays viewable
 *   (`canViewContent` still follows actual sharing).
 * - `showOnlineStatus` / `showLastSeen`: stored only; there is no presence data to filter yet.
 */
export async function getMemberProfile(viewerId: string, targetId: string, tribeId?: string): Promise<MemberProfile | null> {
  if (!UUID_PATTERN.test(targetId)) return null;
  const [target] = await db
    .select({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      username: user.username,
      image: user.image,
      bio: user.bio,
      location: user.location,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, targetId))
    .limit(1);
  if (!target) return null;

  const isSelf = viewerId === targetId;
  const [privacy, socialLinks, { shared, privateCount }] = await Promise.all([
    getPrivacyPreferences(targetId),
    getSocialLinks(targetId),
    sharedTribesOf(viewerId, targetId),
  ]);

  const scope = scopeTribeIds(shared, tribeId);
  const [posts, events, photos] = await Promise.all([
    countPostsByAuthor(targetId, scope),
    countEventsHostedBy(targetId, scope),
    countPhotosByUploader(viewerId, targetId, scope),
  ]);

  const limited = !isSelf && privacy.profileVisibility === "tribe_members" && shared.length === 0;
  const see = (flag: boolean) => isSelf || (!limited && flag);

  return {
    id: target.id,
    name: target.name,
    displayName: target.displayName,
    username: target.username,
    image: target.image,
    bio: limited ? null : target.bio,
    location: see(privacy.showLocation) ? target.location : null,
    joinedAt: see(privacy.showJoinDate) ? target.createdAt : null,
    email: see(privacy.showEmail) ? target.email : null,
    socialLinks: limited ? [] : socialLinks,
    sharedTribes: see(privacy.showSharedTribes) ? shared : [],
    privateTribeCount: see(privacy.showSharedTribes) ? privateCount : 0,
    canViewContent: shared.length > 0,
    counts: { posts, events, photos },
  };
}

// ── member content tabs ──

type ContentQuery = { tribeId?: string; limit: number; offset: number };

/** Null when the user does not exist; else the tribes the tab may read. */
async function contentScope(viewerId: string, targetId: string, tribeId?: string): Promise<string[] | null> {
  if (!(await userExists(targetId))) return null;
  const { shared } = await sharedTribesOf(viewerId, targetId);
  return scopeTribeIds(shared, tribeId);
}

/** GET /users/{id}/posts: feed-shaped posts plus `tribe` (TribeRef), since the list spans tribes. */
export async function getMemberPosts(viewerId: string, targetId: string, query: ContentQuery) {
  if (!(await userExists(targetId))) return null;
  const { shared } = await sharedTribesOf(viewerId, targetId);
  const scope = scopeTribeIds(shared, query.tribeId);
  const posts = await getPostsByAuthor(targetId, scope, query.limit, query.offset, viewerId);
  const refs = new Map(shared.map(({ role: _role, ...ref }) => [ref.id, ref]));
  return posts.map((p) => ({ ...p, tribe: refs.get(p.tribeId) ?? null }));
}

/** GET /users/{id}/events: events the member hosts or co-hosts, in the tribe events list shape. */
export async function getMemberEvents(viewerId: string, targetId: string, query: ContentQuery) {
  const scope = await contentScope(viewerId, targetId, query.tribeId);
  if (scope === null) return null;
  return getEventsHostedBy(targetId, scope, { limit: query.limit, offset: query.offset, userId: viewerId });
}

async function countPhotosByUploader(viewerId: string, targetId: string, tribeIds: string[]): Promise<number> {
  if (tribeIds.length === 0) return 0;
  const counts = await Promise.all(
    tribeIds.map(async (id) =>
      countMediaByTribe(id, {
        type: "image",
        uploadedBy: [targetId],
        viewerAccess: await getAlbumAccessContext(id, viewerId),
      })
    )
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

/**
 * GET /users/{id}/media: the member's photos the viewer may see (the tribe gallery's rules per tribe:
 * general library, visible albums, post images), newest first, in the `listMedia` shape `{ media, total, hasMore }`.
 * Each tribe is read with the tribe gallery query and the pages merged; members share few tribes.
 */
export async function getMemberMedia(viewerId: string, targetId: string, query: ContentQuery) {
  const scope = await contentScope(viewerId, targetId, query.tribeId);
  if (scope === null) return null;
  if (scope.length === 0) return { media: [], total: 0, hasMore: false };

  const perTribe = await Promise.all(
    scope.map(async (id) => {
      const filters = {
        type: "image" as const,
        uploadedBy: [targetId],
        viewerAccess: await getAlbumAccessContext(id, viewerId),
      };
      const [rows, total] = await Promise.all([
        getMediaByTribe(id, { ...filters, sort: "newest", limit: query.offset + query.limit, offset: 0 }),
        countMediaByTribe(id, filters),
      ]);
      return { rows, total };
    })
  );

  const merged = perTribe
    .flatMap((t) => t.rows)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
  const page = merged.slice(query.offset, query.offset + query.limit);
  const total = perTribe.reduce((sum, t) => sum + t.total, 0);
  return { media: page, total, hasMore: query.offset + page.length < total };
}
