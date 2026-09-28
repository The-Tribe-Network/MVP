import { randomBytes } from "node:crypto";
import { and, eq, isNull, or, gt, lt, sql } from "drizzle-orm";
import { db, getDbTransaction } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { getTribeById } from "./tribe";
import type { TribeWithMembers } from "@/lib/database/types";
import { landingBaseUrl } from "@/lib/landing/urls";

/**
 * Shareable invite links (TRI-14 · DATA-MODEL-DELTA §5 · TRIBE-09, TSET-09, TRIBE-02).
 *
 * A tribe has at most one live code. The code is the whole secret: anyone who has it can join,
 * private tribes included (approval flows are not in the MVP). Rotating writes a new code, which
 * retires the old one because there is only the one column. A link may carry limits (TRI-307): an
 * expiry and a maximum number of joins; null means none. `useCount` counts real joins through the
 * current code (a member re-opening it doesn't count) and restarts at 0 when the code rotates.
 */

export type InviteLink = {
  code: string;
  url: string;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
};

/** Limits to set on a link; an absent field is left as it is (on rotate: none). */
export type InviteLinkLimits = { maxUses?: number | null; expiresAt?: Date | null };

type LinkRow = {
  inviteCode: string | null;
  inviteCodeExpiresAt: Date | null;
  inviteCodeMaxUses: number | null;
  inviteCodeUseCount: number;
};

const linkColumns = {
  inviteCode: tribe.inviteCode,
  inviteCodeExpiresAt: tribe.inviteCodeExpiresAt,
  inviteCodeMaxUses: tribe.inviteCodeMaxUses,
  inviteCodeUseCount: tribe.inviteCodeUseCount,
};

/** Why a code can't admit anyone right now, or null when it can. The join route, the landing page and the app agree on this. */
export function inviteLinkBlock(
  row: Pick<LinkRow, "inviteCodeExpiresAt" | "inviteCodeMaxUses" | "inviteCodeUseCount">,
  now = new Date()
): "expired" | "used_up" | null {
  if (row.inviteCodeExpiresAt !== null && row.inviteCodeExpiresAt <= now) return "expired";
  if (row.inviteCodeMaxUses !== null && row.inviteCodeUseCount >= row.inviteCodeMaxUses) return "used_up";
  return null;
}

/** Crockford base32: no I, L, O or U, so codes survive being read aloud or retyped. */
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const INVITE_CODE_LENGTH = 10;

/** 10 chars × 5 bits = 50 bits of entropy, so a guess against the unique column is hopeless. */
export function generateInviteCode(): string {
  const bytes = randomBytes(INVITE_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

/**
 * Codes are stored upper-case. Links are copied verbatim but a code may also be typed, so accept
 * any case and the common misreads of the letters the alphabet leaves out.
 */
export function normalizeInviteCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0")
    .replace(/U/g, "V");
}

const INVITE_CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`);

export function isWellFormedInviteCode(code: string): boolean {
  return INVITE_CODE_PATTERN.test(code);
}

/** Share link for a tribe's invite code: the `/join/:code` landing page (TRI-340; host per TRI-339). */
export function inviteLinkUrl(code: string): string {
  return `${landingBaseUrl()}/join/${code}`;
}

function toInviteLink(row: LinkRow & { inviteCode: string }): InviteLink {
  return {
    code: row.inviteCode,
    url: inviteLinkUrl(row.inviteCode),
    expiresAt: row.inviteCodeExpiresAt,
    maxUses: row.inviteCodeMaxUses,
    useCount: row.inviteCodeUseCount,
  };
}

/**
 * Current link for a tribe, with its limits and use count. Generates a code on first call (the
 * column is null until first shared). An expired or used-up link comes back as it is, so the
 * manager sees why it stopped working and resets it (TRI-307). Returns null when the tribe does
 * not exist. Permission is the route's job.
 */
export async function getInviteLink(tribeId: string): Promise<InviteLink | null> {
  const [row] = await db.select(linkColumns).from(tribe).where(eq(tribe.id, tribeId)).limit(1);
  if (!row) return null;
  if (row.inviteCode) return toInviteLink({ ...row, inviteCode: row.inviteCode });
  return rotateInviteLink(tribeId);
}

/**
 * Replace the code, with the given limits (none by default) and a fresh use count. The old one
 * stops working the moment this commits: join looks the code up by value and there is only one
 * column per tribe. Retries on the (astronomically unlikely) unique collision instead of
 * surfacing a 500.
 */
export async function rotateInviteLink(
  tribeId: string,
  limits: InviteLinkLimits = {}
): Promise<InviteLink | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = generateInviteCode();
    try {
      const [updated] = await db
        .update(tribe)
        .set({
          inviteCode: code,
          inviteCodeExpiresAt: limits.expiresAt ?? null,
          inviteCodeMaxUses: limits.maxUses ?? null,
          inviteCodeUseCount: 0,
        })
        .where(eq(tribe.id, tribeId))
        .returning(linkColumns);
      if (!updated || !updated.inviteCode) return null;
      return toInviteLink({ ...updated, inviteCode: updated.inviteCode });
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) throw error;
    }
  }
  return null;
}

/**
 * Change the current link's limits and keep its code (TSET-09 "Link settings", TRI-307). The use
 * count carries on, so lowering `maxUses` below it stops the link at once. With no code yet, one
 * is made with these limits.
 */
export async function updateInviteLinkLimits(
  tribeId: string,
  limits: InviteLinkLimits
): Promise<InviteLink | null> {
  const [updated] = await db
    .update(tribe)
    .set({
      ...(limits.expiresAt !== undefined ? { inviteCodeExpiresAt: limits.expiresAt } : {}),
      ...(limits.maxUses !== undefined ? { inviteCodeMaxUses: limits.maxUses } : {}),
    })
    .where(and(eq(tribe.id, tribeId), sql`${tribe.inviteCode} is not null`))
    .returning(linkColumns);
  if (updated?.inviteCode) return toInviteLink({ ...updated, inviteCode: updated.inviteCode });

  const [exists] = await db.select({ id: tribe.id }).from(tribe).where(eq(tribe.id, tribeId)).limit(1);
  return exists ? rotateInviteLink(tribeId, limits) : null;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

export type JoinByCodeResult =
  | { status: "joined" | "already_member"; tribe: TribeWithMembers }
  | { status: "not_found" | "expired" | "used_up" };

class LinkUsedUp extends Error {}

/**
 * Join the tribe whose live code this is, as a plain member. Idempotent: an existing member gets
 * the tribe back with `already_member` and no second row (the (tribe_id, user_id) unique constraint
 * backs that up under a race), and doesn't use up the link. Unknown code → not_found; a code past
 * its expiry → expired; one whose joins reached `maxUses` → used_up (TRI-307).
 */
export async function joinByInviteCode(rawCode: string, userId: string): Promise<JoinByCodeResult> {
  const code = normalizeInviteCode(rawCode);
  if (!isWellFormedInviteCode(code)) return { status: "not_found" };

  const [match] = await db
    .select({ id: tribe.id, ...linkColumns })
    .from(tribe)
    .where(eq(tribe.inviteCode, code))
    .limit(1);
  if (!match) return { status: "not_found" };

  // A member re-opening the link gets their tribe back even when the link stopped admitting people
  const [member] = await db
    .select({ id: tribeMember.id })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, match.id), eq(tribeMember.userId, userId)))
    .limit(1);
  const block = member ? null : inviteLinkBlock(match);
  if (block) return { status: block };

  // Insert, then take a use under the limits in the same transaction: a rotate between the lookup
  // and here, the expiry passing, or the last use going to someone else rolls the insert back.
  let status: "joined" | "already_member";
  try {
    status = await getDbTransaction().transaction(async (tx) => {
      const inserted = await tx
        .insert(tribeMember)
        .values({ tribeId: match.id, userId, role: "member" })
        .onConflictDoNothing({ target: [tribeMember.tribeId, tribeMember.userId] })
        .returning({ id: tribeMember.id });
      if (inserted.length === 0) return "already_member" as const;

      const [counted] = await tx
        .update(tribe)
        .set({ inviteCodeUseCount: sql`${tribe.inviteCodeUseCount} + 1` })
        .where(
          and(
            eq(tribe.id, match.id),
            eq(tribe.inviteCode, code),
            or(isNull(tribe.inviteCodeExpiresAt), gt(tribe.inviteCodeExpiresAt, new Date())),
            or(isNull(tribe.inviteCodeMaxUses), lt(tribe.inviteCodeUseCount, tribe.inviteCodeMaxUses)),
          ),
        )
        .returning({ id: tribe.id });
      if (!counted) throw new LinkUsedUp();
      return "joined" as const;
    });
  } catch (error) {
    if (!(error instanceof LinkUsedUp)) throw error;
    // Rolled back: say why the link stopped admitting people, as of now
    const [now] = await db.select(linkColumns).from(tribe).where(eq(tribe.id, match.id)).limit(1);
    if (!now || now.inviteCode !== code) return { status: "not_found" };
    return { status: inviteLinkBlock(now) ?? "used_up" };
  }

  const joinedTribe = await getTribeById(match.id);
  if (!joinedTribe) return { status: "not_found" };
  return { status, tribe: joinedTribe };
}
