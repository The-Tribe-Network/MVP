import { db } from "@/lib/database/client";
import { poll, pollOption, pollVote } from "@/lib/database/schemas/poll";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, sql, inArray, type SQL } from "drizzle-orm";
import type { PollWithDetails, PollOptionWithVotes } from "@/lib/database/types";
import { userPreviewColumns } from "@/lib/database/user-columns";

/**
 * Get all polls for an event with vote details
 * OPTIMIZED: Fetches polls, options, and votes in parallel, then aggregates
 */
export async function getEventPolls(
  eventId: string,
  currentUserId?: string
): Promise<PollWithDetails[]> {
  return loadPollsWithDetails(eq(poll.eventId, eventId), currentUserId);
}

/**
 * Get polls by id with options, vote counts and the caller's votes (posts that share a poll)
 */
export async function getPollsByIds(
  pollIds: string[],
  currentUserId?: string
): Promise<PollWithDetails[]> {
  if (pollIds.length === 0) return [];
  return loadPollsWithDetails(inArray(poll.id, pollIds), currentUserId);
}

async function loadPollsWithDetails(
  condition: SQL,
  currentUserId?: string
): Promise<PollWithDetails[]> {
  // 1. Fetch polls with creator info
  const polls = await db
    .select({
      id: poll.id,
      eventId: poll.eventId,
      question: poll.question,
      allowMultiple: poll.allowMultiple,
      isAnonymous: poll.isAnonymous,
      endsAt: poll.endsAt,
      createdBy: poll.createdBy,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      creator: userPreviewColumns,
    })
    .from(poll)
    .innerJoin(user, eq(poll.createdBy, user.id))
    .where(condition);

  if (polls.length === 0) return [];

  const pollIds = polls.map((p) => p.id);

  // 2. Fetch all options for these polls
  const options = await db
    .select()
    .from(pollOption)
    .where(inArray(pollOption.pollId, pollIds))
    .orderBy(pollOption.order);

  // 3. Fetch vote counts per option
  const voteCounts = await db
    .select({
      optionId: pollVote.optionId,
      count: sql<number>`count(*)::int`,
    })
    .from(pollVote)
    .where(inArray(pollVote.pollId, pollIds))
    .groupBy(pollVote.optionId);

  // 4. Fetch voters (only for non-anonymous polls)
  const nonAnonPollIds = polls
    .filter((p) => !p.isAnonymous)
    .map((p) => p.id);

  const voters =
    nonAnonPollIds.length > 0
      ? await db
          .select({
            optionId: pollVote.optionId,
            pollId: pollVote.pollId,
            user: userPreviewColumns,
          })
          .from(pollVote)
          .innerJoin(user, eq(pollVote.userId, user.id))
          .where(inArray(pollVote.pollId, nonAnonPollIds))
      : [];

  // 5. Fetch current user's votes
  const userVotes = currentUserId
    ? await db
        .select({
          pollId: pollVote.pollId,
          optionId: pollVote.optionId,
        })
        .from(pollVote)
        .where(
          and(
            inArray(pollVote.pollId, pollIds),
            eq(pollVote.userId, currentUserId)
          )
        )
    : [];

  // 6. Aggregate data
  const voteCountMap = new Map(
    voteCounts.map((vc) => [vc.optionId, vc.count])
  );
  const votersMap = new Map<string, any[]>();
  voters.forEach((v) => {
    if (!votersMap.has(v.optionId)) {
      votersMap.set(v.optionId, []);
    }
    votersMap.get(v.optionId)!.push(v.user);
  });

  const userVotesMap = new Map<string, string[]>();
  userVotes.forEach((uv) => {
    if (!userVotesMap.has(uv.pollId)) {
      userVotesMap.set(uv.pollId, []);
    }
    userVotesMap.get(uv.pollId)!.push(uv.optionId);
  });

  // 7. Build response
  return polls.map((p) => {
    const pollOptions = options
      .filter((o) => o.pollId === p.id)
      .map((o) => ({
        ...o,
        votes: voteCountMap.get(o.id) || 0,
        voters: p.isAnonymous ? [] : (votersMap.get(o.id) || []),
      }));

    const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

    return {
      ...p,
      options: pollOptions,
      userVotes: userVotesMap.get(p.id) || [],
      totalVotes,
    } as PollWithDetails;
  });
}

/**
 * Create a standalone poll for an event
 * IMPORTANT: Check permissions before calling
 */
export async function createPoll(
  eventId: string,
  userId: string,
  data: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    isAnonymous: boolean;
    endsAt?: Date;
  }
): Promise<PollWithDetails> {
  return await db.transaction(async (tx) => {
    // 1. Create poll
    const [newPoll] = await tx
      .insert(poll)
      .values({
        eventId,
        createdBy: userId,
        question: data.question,
        allowMultiple: data.allowMultiple,
        isAnonymous: data.isAnonymous,
        endsAt: data.endsAt || null,
      })
      .returning();

    // 2. Create options
    const optionValues = data.options.map((text, index) => ({
      pollId: newPoll.id,
      text,
      order: index,
    }));

    const createdOptions = await tx
      .insert(pollOption)
      .values(optionValues)
      .returning();

    // 3. Fetch creator
    const [creator] = await tx
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return {
      ...newPoll,
      creator,
      options: createdOptions.map((o) => ({
        ...o,
        votes: 0,
        voters: [],
      })),
      userVotes: [],
      totalVotes: 0,
    } as PollWithDetails;
  });
}

/**
 * Vote on a poll
 * Handles both single and multiple choice polls
 */
export async function votePoll(
  pollId: string,
  userId: string,
  optionIds: string[]
): Promise<void> {
  return await db.transaction(async (tx) => {
    // 1. Get poll to check allowMultiple
    const [pollData] = await tx
      .select()
      .from(poll)
      .where(eq(poll.id, pollId))
      .limit(1);

    if (!pollData) {
      throw new Error("Poll not found");
    }

    // 2. For single-choice polls, remove existing votes first
    if (!pollData.allowMultiple) {
      await tx
        .delete(pollVote)
        .where(
          and(eq(pollVote.pollId, pollId), eq(pollVote.userId, userId))
        );
    }

    // 3. Insert new votes
    const voteValues = optionIds.map((optionId) => ({
      pollId,
      optionId,
      userId,
    }));

    await tx.insert(pollVote).values(voteValues).onConflictDoNothing();
  });
}

/**
 * Remove user's vote from a poll
 */
export async function removeVote(
  pollId: string,
  userId: string,
  optionId?: string
): Promise<void> {
  if (optionId) {
    // Remove specific option vote
    await db
      .delete(pollVote)
      .where(
        and(
          eq(pollVote.pollId, pollId),
          eq(pollVote.userId, userId),
          eq(pollVote.optionId, optionId)
        )
      );
  } else {
    // Remove all votes for this poll
    await db
      .delete(pollVote)
      .where(
        and(eq(pollVote.pollId, pollId), eq(pollVote.userId, userId))
      );
  }
}

/**
 * Delete a poll
 * IMPORTANT: Check permissions before calling
 */
export async function deletePoll(pollId: string): Promise<boolean> {
  const result = await db.delete(poll).where(eq(poll.id, pollId));
  return (result.rowCount ?? 0) > 0;
}
