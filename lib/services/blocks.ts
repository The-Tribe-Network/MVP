import { and, count, desc, eq, isNull, or, sql, type AnyColumn, type SQL } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { user } from "@/lib/database/schemas/auth";
import { userBlock } from "@/lib/database/schemas/safety";

/**
 * User blocking (TRI-238; owner decision TRI-105: blocking filtered everywhere, built for the alpha).
 *
 * A block is one row (blocker → blocked) but filters in **both directions**: neither user sees the other's
 * posts, comments, photos, RSVPs, member row, profile or notifications. Tribe membership is untouched.
 *
 * Every read applies the same condition, `excludeBlocked(viewerId, <user id column>)`, in its WHERE: two
 * NOT EXISTS probes, one on the unique (blocker_id, blocked_id) index and one on
 * idx_user_block_blocked_blocker (blocked_id, blocker_id), so each row costs two index lookups (and nothing
 * when the viewer has no blocks). See docs/specs/TRI-237-238-reports-and-blocking.md for the route map.
 */

/**
 * SQL over the outer row: `userIdColumn` is neither blocked by nor blocking `viewerId`. Undefined (no
 * filter) without a viewer, so `and(...)` drops it. A null user id (e.g. a system notification's actor)
 * passes. Works on columns of aliased subqueries too.
 */
export function excludeBlocked(viewerId: string | null | undefined, userIdColumn: AnyColumn | SQL): SQL | undefined {
  if (!viewerId) return undefined;
  return sql`(not exists (select 1 from ${userBlock} ub where ub.blocker_id = ${viewerId}::uuid and ub.blocked_id = ${userIdColumn})
    and not exists (select 1 from ${userBlock} ub where ub.blocked_id = ${viewerId}::uuid and ub.blocker_id = ${userIdColumn}))`;
}

/** Whether `a` and `b` are a blocked pair, either direction. Never true for a user and themself. */
export async function isBlockedPair(a: string, b: string | null | undefined): Promise<boolean> {
  if (!b || a === b) return false;
  const [row] = await db
    .select({ id: userBlock.id })
    .from(userBlock)
    .where(
      or(
        and(eq(userBlock.blockerId, a), eq(userBlock.blockedId, b)),
        and(eq(userBlock.blockerId, b), eq(userBlock.blockedId, a))
      )
    )
    .limit(1);
  return !!row;
}

// ── /me/blocks ──

// Same as album.ts UUID_PATTERN; kept local so this module, which every read service imports, imports none of them
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BlockedUser = {
  id: string;
  name: string;
  displayName: string | null;
  username: string | null;
  image: string | null;
};

export type Block = { user: BlockedUser; createdAt: Date };

const blockedUserColumns = {
  id: user.id,
  name: user.name,
  displayName: user.displayName,
  username: user.username,
  image: user.image,
};

export type BlockUserResult =
  | { ok: true; created: boolean; block: Block }
  | { ok: false; code: "INVALID_USER_ID" | "CANNOT_BLOCK_SELF" | "USER_NOT_FOUND" };

/** POST /me/blocks/:userId. Idempotent: blocking someone already blocked returns the existing block. */
export async function blockUser(blockerId: string, blockedId: string): Promise<BlockUserResult> {
  if (!UUID_PATTERN.test(blockedId)) return { ok: false, code: "INVALID_USER_ID" };
  if (blockedId === blockerId) return { ok: false, code: "CANNOT_BLOCK_SELF" };

  const [target] = await db
    .select(blockedUserColumns)
    .from(user)
    .where(and(eq(user.id, blockedId), isNull(user.deletedAt)))
    .limit(1);
  if (!target) return { ok: false, code: "USER_NOT_FOUND" };

  const [inserted] = await db
    .insert(userBlock)
    .values({ blockerId, blockedId })
    .onConflictDoNothing({ target: [userBlock.blockerId, userBlock.blockedId] })
    .returning({ createdAt: userBlock.createdAt });
  if (inserted) return { ok: true, created: true, block: { user: target, createdAt: inserted.createdAt } };

  const [existing] = await db
    .select({ createdAt: userBlock.createdAt })
    .from(userBlock)
    .where(and(eq(userBlock.blockerId, blockerId), eq(userBlock.blockedId, blockedId)))
    .limit(1);
  return { ok: true, created: false, block: { user: target, createdAt: existing?.createdAt ?? new Date() } };
}

export type UnblockUserResult =
  | { ok: true; removed: boolean }
  | { ok: false; code: "INVALID_USER_ID" | "CANNOT_BLOCK_SELF" };

/** DELETE /me/blocks/:userId. Idempotent: `removed` is false when there was no block. */
export async function unblockUser(blockerId: string, blockedId: string): Promise<UnblockUserResult> {
  if (!UUID_PATTERN.test(blockedId)) return { ok: false, code: "INVALID_USER_ID" };
  if (blockedId === blockerId) return { ok: false, code: "CANNOT_BLOCK_SELF" };
  const removed = await db
    .delete(userBlock)
    .where(and(eq(userBlock.blockerId, blockerId), eq(userBlock.blockedId, blockedId)))
    .returning({ id: userBlock.id });
  return { ok: true, removed: removed.length > 0 };
}

/** GET /me/blocks (USET-06 blocked list): the users the caller blocked, newest first. */
export async function listBlocks(blockerId: string, page: { limit: number; offset: number }) {
  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ createdAt: userBlock.createdAt, user: blockedUserColumns })
      .from(userBlock)
      .innerJoin(user, eq(userBlock.blockedId, user.id))
      .where(eq(userBlock.blockerId, blockerId))
      .orderBy(desc(userBlock.createdAt), desc(userBlock.id))
      .limit(page.limit)
      .offset(page.offset),
    db.select({ n: count() }).from(userBlock).where(eq(userBlock.blockerId, blockerId)),
  ]);
  const total = Number(totalRow?.n ?? 0);
  const blocks: Block[] = rows.map((r) => ({ user: r.user, createdAt: r.createdAt }));
  return { blocks, total, hasMore: page.offset + rows.length < total };
}
