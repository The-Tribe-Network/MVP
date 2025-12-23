import { db } from "@/lib/database/client";
import { tribeSettings } from "@/lib/database/schemas";
import type {
  TribeSettings,
  TribeSettingsInsert,
  EventsSettings,
  TimelineSettings,
  MediaSettings,
} from "@/lib/database/types";
import type {
  UpdateEventsSettingsInput,
  UpdateTimelineSettingsInput,
  UpdateMediaSettingsInput,
} from "@/lib/validations/tribe-settings";
import { eq } from "drizzle-orm";

/**
 * Get tribe settings for a given tribe
 * If settings don't exist, creates default settings
 */
export async function getTribeSettings(
  tribeId: string
): Promise<TribeSettings> {
  const settings = await db.query.tribeSettings.findFirst({
    where: eq(tribeSettings.tribeId, tribeId),
  });

  if (!settings) {
    // Create default settings for this tribe
    return await createDefaultSettings(tribeId);
  }

  return settings;
}

/**
 * Get only timeline-related settings for a tribe
 */
export async function getTimelineSettings(
  tribeId: string
): Promise<TimelineSettings> {
  const settings = await getTribeSettings(tribeId);

  // Return only timeline-related fields
  return {
    postingPermissionLevel: settings.postingPermissionLevel,
    commentingPermissionLevel: settings.commentingPermissionLevel,
    allowPostEditing: settings.allowPostEditing,
    allowPostDeletion: settings.allowPostDeletion,
    enablePostLikes: settings.enablePostLikes,
    enableCommentLikes: settings.enableCommentLikes,
    enableNestedReplies: settings.enableNestedReplies,
    enablePinnedPosts: settings.enablePinnedPosts,
  };
}

/**
 * Get only events-related settings for a tribe
 */
export async function getEventsSettings(
  tribeId: string
): Promise<EventsSettings> {
  const settings = await getTribeSettings(tribeId);

  // Return only events-related fields
  return {
    eventsEnabled: settings.eventsEnabled,
    eventCreationPermissionLevel: settings.eventCreationPermissionLevel,
    eventEditPermissionLevel: settings.eventEditPermissionLevel,
    requireEventEndDate: settings.requireEventEndDate,
    requireEventLocation: settings.requireEventLocation,
    enableRsvps: settings.enableRsvps,
    showAttendeeList: settings.showAttendeeList,
    enableRsvpDeadline: settings.enableRsvpDeadline,
    enableCapacityLimit: settings.enableCapacityLimit,
    enableWaitlist: settings.enableWaitlist,
    enableEventPolls: settings.enableEventPolls,
    pollCreationPermissionLevel: settings.pollCreationPermissionLevel,
    allowAnonymousPolls: settings.allowAnonymousPolls,
    pollResultsVisibility: settings.pollResultsVisibility,
    enableEventReminders: settings.enableEventReminders,
    reminderTimings: settings.reminderTimings,
    notifyOnRsvpChanges: settings.notifyOnRsvpChanges,
    enableCalendarExport: settings.enableCalendarExport,
  };
}

/**
 * Update timeline settings for a tribe
 */
export async function updateTimelineSettings(
  tribeId: string,
  userId: string,
  data: UpdateTimelineSettingsInput
): Promise<TimelineSettings> {
  // Ensure settings exist first
  await ensureSettingsExist(tribeId);

  // Update the settings
  const [updated] = await db
    .update(tribeSettings)
    .set({
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(tribeSettings.tribeId, tribeId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update timeline settings");
  }

  // Return only timeline-related fields
  return {
    postingPermissionLevel: updated.postingPermissionLevel,
    commentingPermissionLevel: updated.commentingPermissionLevel,
    allowPostEditing: updated.allowPostEditing,
    allowPostDeletion: updated.allowPostDeletion,
    enablePostLikes: updated.enablePostLikes,
    enableCommentLikes: updated.enableCommentLikes,
    enableNestedReplies: updated.enableNestedReplies,
    enablePinnedPosts: updated.enablePinnedPosts,
  };
}

/**
 * Update events settings for a tribe
 */
export async function updateEventsSettings(
  tribeId: string,
  userId: string,
  data: UpdateEventsSettingsInput
): Promise<EventsSettings> {
  // Ensure settings exist first
  await ensureSettingsExist(tribeId);

  // Update the settings
  const [updated] = await db
    .update(tribeSettings)
    .set({
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(tribeSettings.tribeId, tribeId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update events settings");
  }

  // Return only events-related fields
  return {
    eventsEnabled: updated.eventsEnabled,
    eventCreationPermissionLevel: updated.eventCreationPermissionLevel,
    eventEditPermissionLevel: updated.eventEditPermissionLevel,
    requireEventEndDate: updated.requireEventEndDate,
    requireEventLocation: updated.requireEventLocation,
    enableRsvps: updated.enableRsvps,
    showAttendeeList: updated.showAttendeeList,
    enableRsvpDeadline: updated.enableRsvpDeadline,
    enableCapacityLimit: updated.enableCapacityLimit,
    enableWaitlist: updated.enableWaitlist,
    enableEventPolls: updated.enableEventPolls,
    pollCreationPermissionLevel: updated.pollCreationPermissionLevel,
    allowAnonymousPolls: updated.allowAnonymousPolls,
    pollResultsVisibility: updated.pollResultsVisibility,
    enableEventReminders: updated.enableEventReminders,
    reminderTimings: updated.reminderTimings,
    notifyOnRsvpChanges: updated.notifyOnRsvpChanges,
    enableCalendarExport: updated.enableCalendarExport,
  };
}

/**
 * Get only media-related settings for a tribe
 */
export async function getMediaSettings(
  tribeId: string
): Promise<MediaSettings> {
  const settings = await getTribeSettings(tribeId);

  // Return only media-related fields
  return {
    mediaUploadPermissionLevel: settings.mediaUploadPermissionLevel,
    maxMediaFileSize: settings.maxMediaFileSize,
    autoAddPostMediaToGallery: settings.autoAddPostMediaToGallery,
    albumCreationPermissionLevel: settings.albumCreationPermissionLevel,
    defaultAlbumPrivacy: settings.defaultAlbumPrivacy,
    allowCollaborativeAlbums: settings.allowCollaborativeAlbums,
    autoCreateEventAlbums: settings.autoCreateEventAlbums,
    enableMediaLikes: settings.enableMediaLikes,
    requireMediaApproval: settings.requireMediaApproval,
  };
}

/**
 * Update media settings for a tribe
 */
export async function updateMediaSettings(
  tribeId: string,
  userId: string,
  data: UpdateMediaSettingsInput
): Promise<MediaSettings> {
  // Ensure settings exist first
  await ensureSettingsExist(tribeId);

  // Update the settings
  const [updated] = await db
    .update(tribeSettings)
    .set({
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(tribeSettings.tribeId, tribeId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update media settings");
  }

  // Return only media-related fields
  return {
    mediaUploadPermissionLevel: updated.mediaUploadPermissionLevel,
    maxMediaFileSize: updated.maxMediaFileSize,
    autoAddPostMediaToGallery: updated.autoAddPostMediaToGallery,
    albumCreationPermissionLevel: updated.albumCreationPermissionLevel,
    defaultAlbumPrivacy: updated.defaultAlbumPrivacy,
    allowCollaborativeAlbums: updated.allowCollaborativeAlbums,
    autoCreateEventAlbums: updated.autoCreateEventAlbums,
    enableMediaLikes: updated.enableMediaLikes,
    requireMediaApproval: updated.requireMediaApproval,
  };
}

/**
 * Ensure settings exist for a tribe, create defaults if not
 */
export async function ensureSettingsExist(tribeId: string): Promise<void> {
  const settings = await db.query.tribeSettings.findFirst({
    where: eq(tribeSettings.tribeId, tribeId),
  });

  if (!settings) {
    await createDefaultSettings(tribeId);
  }
}

/**
 * Create default settings for a tribe
 */
async function createDefaultSettings(tribeId: string): Promise<TribeSettings> {
  const defaultSettings: TribeSettingsInsert = {
    tribeId,
    // All defaults are handled by the database schema
  };

  const [created] = await db
    .insert(tribeSettings)
    .values(defaultSettings)
    .returning();

  if (!created) {
    throw new Error("Failed to create default tribe settings");
  }

  return created;
}
