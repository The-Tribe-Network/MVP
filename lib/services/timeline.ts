import { db } from "@/lib/database/client";
import { timeline } from "@/lib/database/schemas/timeline";
import { and, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

export const GLOBAL_TIMELINE_NAME = "Global";

// The http `db` or a transaction, as for notify()
type Executor = Pick<PgDatabase<PgQueryResultHKT, any, any>, "select" | "insert">;

/** Every tribe gets its Global timeline in the transaction that creates it (TRI-313). */
export async function createGlobalTimeline(tx: Executor, tribeId: string, createdBy: string) {
  const [created] = await tx
    .insert(timeline)
    .values({ tribeId, name: GLOBAL_TIMELINE_NAME, type: "posts", isGlobal: true, position: 0, createdBy })
    .returning();
  return created;
}

/** The tribe's Global timeline id: where posts go when no timeline is given. */
export async function getGlobalTimelineId(tribeId: string, executor: Executor = db): Promise<string> {
  const [row] = await executor
    .select({ id: timeline.id })
    .from(timeline)
    .where(and(eq(timeline.tribeId, tribeId), eq(timeline.isGlobal, true)))
    .limit(1);
  if (!row) {
    throw new Error(`Tribe ${tribeId} has no Global timeline`);
  }
  return row.id;
}
