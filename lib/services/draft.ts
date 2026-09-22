import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/database/client";
import { draft, tribeMember } from "@/lib/database/schemas";
import type { CreateDraftInput, ListDraftsQuery } from "@/lib/validations/draft";

// Server-side drafts (TRI-168). Every function is scoped to the calling user: a draft that is not
// theirs does not resolve, so the routes answer 404 rather than 403 and ids never leak.

export type DraftRecord = {
  id: string;
  tribeId: string;
  kind: "post" | "event";
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

const columns = {
  id: draft.id,
  tribeId: draft.tribeId,
  kind: draft.kind,
  payload: draft.payload,
  createdAt: draft.createdAt,
  updatedAt: draft.updatedAt,
};

export async function listDrafts(userId: string, query: ListDraftsQuery): Promise<DraftRecord[]> {
  const conditions = [eq(draft.userId, userId)];
  if (query.tribeId) conditions.push(eq(draft.tribeId, query.tribeId));
  if (query.kind) conditions.push(eq(draft.kind, query.kind));

  return db
    .select(columns)
    .from(draft)
    .where(and(...conditions))
    .orderBy(desc(draft.updatedAt));
}

export class NotAMemberError extends Error {
  constructor() {
    super("You are not a member of this tribe");
    this.name = "NotAMemberError";
  }
}

export async function createDraft(userId: string, input: CreateDraftInput): Promise<DraftRecord> {
  const [member] = await db
    .select({ id: tribeMember.id })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, input.tribeId), eq(tribeMember.userId, userId)))
    .limit(1);
  if (!member) throw new NotAMemberError();

  const [created] = await db
    .insert(draft)
    .values({ userId, tribeId: input.tribeId, kind: input.kind, payload: input.payload })
    .returning(columns);
  return created;
}

// Replaces the payload wholesale; merging is the client's job (it owns the shape).
export async function updateDraft(
  userId: string,
  draftId: string,
  payload: Record<string, unknown>
): Promise<DraftRecord | null> {
  const [updated] = await db
    .update(draft)
    .set({ payload, updatedAt: new Date() })
    .where(and(eq(draft.id, draftId), eq(draft.userId, userId)))
    .returning(columns);
  return updated ?? null;
}

export async function deleteDraft(userId: string, draftId: string): Promise<boolean> {
  const deleted = await db
    .delete(draft)
    .where(and(eq(draft.id, draftId), eq(draft.userId, userId)))
    .returning({ id: draft.id });
  return deleted.length > 0;
}

// A member who leaves (or is removed) has nothing to post into that tribe any more.
export async function deleteDraftsForMember(userId: string, tribeId: string): Promise<void> {
  await db.delete(draft).where(and(eq(draft.userId, userId), eq(draft.tribeId, tribeId)));
}
