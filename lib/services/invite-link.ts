import { randomBytes } from "node:crypto";
import { and, eq, isNull, or, gt } from "drizzle-orm";
import { db, getDbTransaction } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { getTribeById } from "./tribe";
import type { TribeWithMembers } from "@/lib/database/types";

/**
 * Shareable invite links (TRI-14 · DATA-MODEL-DELTA §5 · TRIBE-09, TSET-09, TRIBE-02).
 *
 * A tribe has at most one live code. The code is the whole secret: anyone who has it can join,
 * private tribes included (approval flows are not in the MVP). Rotating writes a new code, which
 * retires the old one because there is only the one column. `inviteCodeExpiresAt` is honoured on
 * join but never set here — a null expiry means the code lives until rotated.
 */

export type InviteLink = {
  code: string;
  url: string;
  expiresAt: Date | null;
};

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

/** Universal link the app registers (`applinks:tribe.app`, `tribe://join/:code` in linking.ts). */
export function inviteLinkUrl(code: string): string {
  const base = (process.env.INVITE_LINK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://tribe.app").replace(/\/+$/, "");
  return `${base}/join/${code}`;
}

function toInviteLink(code: string, expiresAt: Date | null): InviteLink {
  return { code, url: inviteLinkUrl(code), expiresAt };
}

/**
 * Current link for a tribe. Generates a code on first call (the column is null until first shared)
 * or when the stored one has expired, so the caller always gets something that works.
 * Returns null when the tribe does not exist. Permission is the route's job.
 */
export async function getInviteLink(tribeId: string): Promise<InviteLink | null> {
  const [row] = await db
    .select({ inviteCode: tribe.inviteCode, inviteCodeExpiresAt: tribe.inviteCodeExpiresAt })
    .from(tribe)
    .where(eq(tribe.id, tribeId))
    .limit(1);
  if (!row) return null;

  const expired = row.inviteCodeExpiresAt !== null && row.inviteCodeExpiresAt <= new Date();
  if (row.inviteCode && !expired) {
    return toInviteLink(row.inviteCode, row.inviteCodeExpiresAt);
  }
  return rotateInviteLink(tribeId);
}

/**
 * Replace the code. The old one stops working the moment this commits: join looks the code up by
 * value and there is only one column per tribe. Retries on the (astronomically unlikely) unique
 * collision instead of surfacing a 500.
 */
export async function rotateInviteLink(tribeId: string): Promise<InviteLink | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = generateInviteCode();
    try {
      const [updated] = await db
        .update(tribe)
        .set({ inviteCode: code, inviteCodeExpiresAt: null })
        .where(eq(tribe.id, tribeId))
        .returning({ inviteCode: tribe.inviteCode, inviteCodeExpiresAt: tribe.inviteCodeExpiresAt });
      if (!updated || !updated.inviteCode) return null;
      return toInviteLink(updated.inviteCode, updated.inviteCodeExpiresAt);
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) throw error;
    }
  }
  return null;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

export type JoinByCodeResult =
  | { status: "joined" | "already_member"; tribe: TribeWithMembers }
  | { status: "not_found" | "expired" };

/**
 * Join the tribe whose live code this is, as a plain member. Idempotent: an existing member gets
 * the tribe back with `already_member` and no second row (the (tribe_id, user_id) unique constraint
 * backs that up under a race). Unknown code → not_found; a code past its expiry → expired.
 */
export async function joinByInviteCode(rawCode: string, userId: string): Promise<JoinByCodeResult> {
  const code = normalizeInviteCode(rawCode);
  if (!isWellFormedInviteCode(code)) return { status: "not_found" };

  const [match] = await db
    .select({ id: tribe.id, inviteCodeExpiresAt: tribe.inviteCodeExpiresAt })
    .from(tribe)
    .where(eq(tribe.inviteCode, code))
    .limit(1);
  if (!match) return { status: "not_found" };
  if (match.inviteCodeExpiresAt !== null && match.inviteCodeExpiresAt <= new Date()) {
    return { status: "expired" };
  }

  // Re-check the code inside the transaction so a rotate that lands between the lookup and the
  // insert cannot admit someone holding the retired code.
  const status = await getDbTransaction().transaction(async (tx) => {
    const [live] = await tx
      .select({ id: tribe.id })
      .from(tribe)
      .where(
        and(
          eq(tribe.id, match.id),
          eq(tribe.inviteCode, code),
          or(isNull(tribe.inviteCodeExpiresAt), gt(tribe.inviteCodeExpiresAt, new Date())),
        ),
      )
      .limit(1);
    if (!live) return "not_found" as const;

    const inserted = await tx
      .insert(tribeMember)
      .values({ tribeId: match.id, userId, role: "member" })
      .onConflictDoNothing({ target: [tribeMember.tribeId, tribeMember.userId] })
      .returning({ id: tribeMember.id });
    return inserted.length > 0 ? ("joined" as const) : ("already_member" as const);
  });
  if (status === "not_found") return { status };

  const joinedTribe = await getTribeById(match.id);
  if (!joinedTribe) return { status: "not_found" };
  return { status, tribe: joinedTribe };
}
