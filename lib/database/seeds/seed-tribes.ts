/**
 * Seed Tribes
 *
 * Creates tribes with members and settings.
 * Follows the pattern from lib/services/tribe.ts for proper entity creation.
 */

import { getDbTransaction, db } from "@/lib/database/client";
import { tribe, tribeMember, tribeSettings } from "@/lib/database/schemas/tribe";
import type { SeedTribeData, SeedUserData } from "./types";
import { REAL_USER_ID, logSuccess } from "./utils";
import { createGlobalTimeline } from "@/lib/services/timeline";

/**
 * Create a tribe with its owner, settings, and all members
 *
 * @param tribeData - The seed tribe data
 * @param users - Array of seed user data
 * @param emailToIdMap - Map of email -> userId
 * @returns The created tribe ID
 */
export async function seedTribe(
  tribeData: SeedTribeData,
  emailToIdMap: Map<string, string>
): Promise<string> {
  const users = tribeData.users;

  // Find the owner (first user with role "owner")
  const ownerData = users.find((u) => u.role === "owner");
  if (!ownerData) {
    throw new Error("Tribe data must have at least one user with role 'owner'");
  }

  const ownerId = emailToIdMap.get(ownerData.email);
  if (!ownerId) {
    throw new Error(`Owner user ID not found for email: ${ownerData.email}`);
  }

  // Create tribe, owner member, and settings in a transaction
  const dbTx = getDbTransaction();
  const createdTribe = await dbTx.transaction(async (tx) => {
    // 1. Insert tribe
    const [newTribe] = await tx
      .insert(tribe)
      .values({
        name: tribeData.tribe.name,
        description: tribeData.tribe.description,
        location: tribeData.tribe.location,
        privacy: tribeData.tribe.privacy,
        category: tribeData.tribe.category,
        createdBy: ownerId,
      })
      .returning();

    // 2. Insert owner as tribeMember
    await tx.insert(tribeMember).values({
      tribeId: newTribe.id,
      userId: ownerId,
      role: "owner",
    });

    // 3. Insert tribeSettings with defaults
    await tx.insert(tribeSettings).values({
      tribeId: newTribe.id,
    });

    // 4. Global timeline (TRI-313)
    await createGlobalTimeline(tx, newTribe.id, ownerId);

    return newTribe;
  });

  // 4. Add real user as admin (outside transaction)
  await db.insert(tribeMember).values({
    tribeId: createdTribe.id,
    userId: REAL_USER_ID,
    role: "admin",
  });

  // 5. Add other members (non-owners)
  const otherMembers = users.filter((u) => u.role !== "owner");
  for (const memberData of otherMembers) {
    const userId = emailToIdMap.get(memberData.email);
    if (!userId) {
      throw new Error(`User ID not found for email: ${memberData.email}`);
    }

    await db.insert(tribeMember).values({
      tribeId: createdTribe.id,
      userId: userId,
      role: memberData.role,
    });
  }

  const totalMembers = users.length + 1; // +1 for real user
  logSuccess(`Created tribe "${tribeData.tribe.name}" with ${totalMembers} members`);

  return createdTribe.id;
}
