import { db } from "@/lib/database/client";
import { event, eventAttendee } from "@/lib/database/schemas/event";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";
import { poll, pollOption } from "@/lib/database/schemas/poll";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { createActivity } from "./activity";
import type {
  EventWithCreator,
  EventWithDetails,
  Poll,
  Event
} from "@/lib/database/types";

type CreateEventPollData = {
  question: string;
  options: string[];
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt?: Date;
};

/**
 * Create a new event (with optional poll)
 * IMPORTANT: Check permissions before calling
 */
export async function createEvent(
  tribeId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    poll?: CreateEventPollData;
  }
): Promise<EventWithCreator> {
  // Use transaction for event + poll creation
  return await db.transaction(async (tx) => {
    // 1. Create event
    const [newEvent] = await tx
      .insert(event)
      .values({
        tribeId,
        createdBy: userId,
        title: data.title,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        location: data.location || null,
        status: "upcoming",
      })
      .returning();

    // 2. Create poll if provided
    if (data.poll) {
      const [newPoll] = await tx
        .insert(poll)
        .values({
          eventId: newEvent.id,
          createdBy: userId,
          question: data.poll.question,
          allowMultiple: data.poll.allowMultiple,
          isAnonymous: data.poll.isAnonymous,
          endsAt: data.poll.endsAt || null,
        })
        .returning();

      // 3. Create poll options
      const optionValues = data.poll.options.map((text, index) => ({
        pollId: newPoll.id,
        text,
        order: index,
      }));

      await tx.insert(pollOption).values(optionValues);
    }

    // 4. Create activity
    await createActivity({
      type: "event",
      userId,
      tribeId,
      eventId: newEvent.id,
      action: "created",
      preview: newEvent.title,
    });

    // 5. Fetch event with creator info
    const [eventWithCreator] = await tx
      .select({
        id: event.id,
        tribeId: event.tribeId,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        status: event.status,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        creator: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tribe: {
          id: tribe.id,
          name: tribe.name,
          description: tribe.description,
          avatar: tribe.avatar,
          location: tribe.location,
          privacy: tribe.privacy,
          category: tribe.category,
          isFeatured: tribe.isFeatured,
          isTrending: tribe.isTrending,
          createdBy: tribe.createdBy,
          createdAt: tribe.createdAt,
          updatedAt: tribe.updatedAt,
        },
      })
      .from(event)
      .innerJoin(user, eq(event.createdBy, user.id))
      .innerJoin(tribe, eq(event.tribeId, tribe.id))
      .where(eq(event.id, newEvent.id))
      .limit(1);

    return eventWithCreator as EventWithCreator;
  });
}

/**
 * Get all events for a tribe
 * OPTIMIZED: Single query with join
 */
export async function getTribeEvents(
  tribeId: string,
  options?: {
    status?: "upcoming" | "ongoing" | "completed" | "cancelled";
    limit?: number;
    offset?: number;
  }
): Promise<EventWithCreator[]> {
  const baseSelect = db
    .select({
      id: event.id,
      tribeId: event.tribeId,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tribe: {
        id: tribe.id,
        name: tribe.name,
        description: tribe.description,
        avatar: tribe.avatar,
        location: tribe.location,
        privacy: tribe.privacy,
        category: tribe.category,
        isFeatured: tribe.isFeatured,
        isTrending: tribe.isTrending,
        createdBy: tribe.createdBy,
        createdAt: tribe.createdAt,
        updatedAt: tribe.updatedAt,
      },
    })
    .from(event)
    .innerJoin(user, eq(event.createdBy, user.id))
    .innerJoin(tribe, eq(event.tribeId, tribe.id))
    .$dynamic();

  const conditions = options?.status
    ? and(eq(event.tribeId, tribeId), eq(event.status, options.status))
    : eq(event.tribeId, tribeId);

  let query = baseSelect.where(conditions).orderBy(desc(event.startDate));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return query as Promise<EventWithCreator[]>;
}

/**
 * Get single event by ID with attendee info
 * OPTIMIZED: Parallel queries for event data and attendee count
 */
export async function getEventById(
  eventId: string,
  userId?: string
): Promise<EventWithDetails | null> {
  const [eventData, attendeeCount, userAttendance] = await Promise.all([
    // Event with creator
    db
      .select({
        id: event.id,
        tribeId: event.tribeId,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        status: event.status,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        creator: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tribe: {
          id: tribe.id,
          name: tribe.name,
          description: tribe.description,
          avatar: tribe.avatar,
          location: tribe.location,
          privacy: tribe.privacy,
          category: tribe.category,
          isFeatured: tribe.isFeatured,
          isTrending: tribe.isTrending,
          createdBy: tribe.createdBy,
          createdAt: tribe.createdAt,
          updatedAt: tribe.updatedAt,
        },
      })
      .from(event)
      .innerJoin(user, eq(event.createdBy, user.id))
      .innerJoin(tribe, eq(event.tribeId, tribe.id))
      .where(eq(event.id, eventId))
      .limit(1),

    // Attendee count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventAttendee)
      .where(eq(eventAttendee.eventId, eventId)),

    // User attendance status
    userId
      ? db
        .select()
        .from(eventAttendee)
        .where(
          and(
            eq(eventAttendee.eventId, eventId),
            eq(eventAttendee.userId, userId)
          )
        )
        .limit(1)
      : Promise.resolve([]),
  ]);

  if (!eventData[0]) return null;

  return {
    ...eventData[0],
    attendeeCount: attendeeCount[0]?.count || 0,
    isUserAttending: userAttendance.length > 0,
    attendees: [], // Fetch separately if needed
  } as EventWithDetails;
}

/**
 * Update event
 * IMPORTANT: Check permissions before calling
 */
export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
  }>
): Promise<EventWithCreator | null> {
  const [updated] = await db
    .update(event)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(event.id, eventId))
    .returning();

  if (!updated) return null;

  // Create activity
  await createActivity({
    type: "event",
    userId,
    tribeId: updated.tribeId,
    eventId: updated.id,
    action: "updated",
    preview: updated.title,
  });

  // Fetch with creator
  return (await getEventById(eventId)) as EventWithCreator;
}

/**
 * Delete event
 * IMPORTANT: Check permissions before calling
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  const result = await db.delete(event).where(eq(event.id, eventId));
  return (result.rowCount ?? 0) > 0;
}

/**
 * Add attendee (RSVP)
 */
export async function addEventAttendee(
  eventId: string,
  userId: string,
  status: "going" | "maybe" | "not_going" = "going"
): Promise<void> {
  // Upsert pattern: insert or update if exists
  await db
    .insert(eventAttendee)
    .values({
      eventId,
      userId,
      status,
    })
    .onConflictDoUpdate({
      target: [eventAttendee.eventId, eventAttendee.userId],
      set: { status, updatedAt: new Date() },
    });

  // Get event for activity
  const eventData = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (eventData[0]) {
    await createActivity({
      type: "event",
      userId,
      tribeId: eventData[0].tribeId,
      eventId,
      action: "rsvp",
      preview: `RSVP: ${status}`,
    });
  }
}

/**
 * Remove attendee
 */
export async function removeEventAttendee(
  eventId: string,
  userId: string
): Promise<void> {
  await db
    .delete(eventAttendee)
    .where(
      and(
        eq(eventAttendee.eventId, eventId),
        eq(eventAttendee.userId, userId)
      )
    );
}

/**
 * Remove multiple attendees
 */
export async function removeMultipleEventAttendees(eventId: string, userIds: string[]): Promise<void> {
  await db
    .delete(eventAttendee)
    .where(
      and(
        eq(eventAttendee.eventId, eventId),
        inArray(eventAttendee.userId, userIds)
      )
    );
}