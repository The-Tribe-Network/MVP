/**
 * Seed Events
 *
 * Creates events with attendees for a tribe.
 */

import { db } from "@/lib/database/client";
import { event, eventAttendee } from "@/lib/database/schemas/event";
import type { SeedEventData, SeedUserData } from "./types";
import { daysFromNow, logSuccess } from "./utils";

/**
 * Create events for a tribe with attendees
 *
 * @param tribeId - The tribe ID
 * @param events - Array of seed event data
 * @param users - Array of seed user data (for index reference)
 * @param emailToIdMap - Map of email -> userId
 */
export async function seedEvents(
  tribeId: string,
  events: SeedEventData[],
  users: SeedUserData[],
  emailToIdMap: Map<string, string>
): Promise<void> {
  let totalAttendees = 0;

  for (const eventData of events) {
    // Get creator user ID by index
    const creator = users[eventData.creatorIndex];
    if (!creator) {
      throw new Error(`Invalid creator index ${eventData.creatorIndex} for event "${eventData.title}"`);
    }

    const creatorId = emailToIdMap.get(creator.email);
    if (!creatorId) {
      throw new Error(`Creator user ID not found for email: ${creator.email}`);
    }

    // Calculate dates
    const startDate = daysFromNow(eventData.startDaysFromNow);
    const endDate = eventData.endDaysFromNow !== undefined
      ? daysFromNow(eventData.endDaysFromNow)
      : null;

    // Create event
    const [createdEvent] = await db
      .insert(event)
      .values({
        tribeId,
        createdBy: creatorId,
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        startDate,
        endDate,
        status: eventData.status,
      })
      .returning();

    // Create attendees
    for (const attendeeIndex of eventData.attendeeIndices) {
      const attendee = users[attendeeIndex];
      if (!attendee) {
        throw new Error(`Invalid attendee index ${attendeeIndex} for event "${eventData.title}"`);
      }

      const attendeeId = emailToIdMap.get(attendee.email);
      if (!attendeeId) {
        throw new Error(`Attendee user ID not found for email: ${attendee.email}`);
      }

      await db.insert(eventAttendee).values({
        eventId: createdEvent.id,
        userId: attendeeId,
        status: "going",
      });

      totalAttendees++;
    }
  }

  logSuccess(`Created ${events.length} events with ${totalAttendees} attendees`);
}
