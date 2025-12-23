import { z } from "zod";

/**
 * Validation schema for updating timeline settings
 */
export const updateTimelineSettingsSchema = z.object({
  // Posting settings
  postingPermissionLevel: z.enum([
    "all_members",
    "moderators",
    "admins",
    "owner_only",
  ]).optional(),
  commentingPermissionLevel: z.enum([
    "all_members",
    "moderators",
    "admins",
    "owner_only",
  ]).optional(),
  allowPostEditing: z.boolean().optional(),
  allowPostDeletion: z.boolean().optional(),

  // Engagement settings
  enablePostLikes: z.boolean().optional(),
  enableCommentLikes: z.boolean().optional(),
  enableNestedReplies: z.boolean().optional(),
  enablePinnedPosts: z.boolean().optional(),
});

export type UpdateTimelineSettingsInput = z.infer<typeof updateTimelineSettingsSchema>;

/**
 * Validation schema for updating events settings
 */
export const updateEventsSettingsSchema = z.object({
  // Event creation
  eventCreationPermissionLevel: z.enum([
    "all_members",
    "moderators",
    "admins",
    "owner_only",
  ]),
  eventEditPermissionLevel: z.enum([
    "creator_only",
    "creator_and_admins",
    "all_members",
  ]),
  requireEventEndDate: z.boolean(),
  requireEventLocation: z.boolean(),

  // RSVPs
  enableRsvps: z.boolean(),
  showAttendeeList: z.enum(["all_members", "count_only", "hidden"]),
  enableRsvpDeadline: z.boolean(),
  enableCapacityLimit: z.boolean(),
  enableWaitlist: z.boolean(),

  // Polls
  enableEventPolls: z.boolean(),
  pollCreationPermissionLevel: z.enum([
    "event_creator",
    "moderators",
    "admins",
  ]),
  allowAnonymousPolls: z.boolean(),
  pollResultsVisibility: z.enum([
    "immediate",
    "after_voting",
    "after_close",
    "hidden",
  ]),

  // Reminders
  enableEventReminders: z.boolean(),
  reminderTimings: z
    .string()
    .regex(/^(\d+[dhm])(,\d+[dhm])*$/, "Invalid reminder timings format. Use format like '1d,1h,15m'")
    .default("1d,1h"),
  notifyOnRsvpChanges: z.boolean(),

  // Calendar
  enableCalendarExport: z.boolean(),
});

export type UpdateEventsSettingsInput = z.infer<typeof updateEventsSettingsSchema>;

/**
 * Validation schema for updating media settings
 */
export const updateMediaSettingsSchema = z.object({
  // Upload settings
  mediaUploadPermissionLevel: z.enum([
    "all_members",
    "moderators",
    "admins",
    "owner_only",
  ]).optional(),
  maxMediaFileSize: z.number().int().min(1).max(100).optional(),
  autoAddPostMediaToGallery: z.boolean().optional(),

  // Album settings
  albumCreationPermissionLevel: z.enum([
    "all_members",
    "moderators",
    "admins",
    "owner_only",
  ]).optional(),
  defaultAlbumPrivacy: z.enum([
    "public",
    "private",
    "admin_only",
  ]).optional(),
  allowCollaborativeAlbums: z.boolean().optional(),
  autoCreateEventAlbums: z.boolean().optional(),

  // Gallery display
  enableMediaLikes: z.boolean().optional(),

  // Moderation
  requireMediaApproval: z.boolean().optional(),
});

export type UpdateMediaSettingsInput = z.infer<typeof updateMediaSettingsSchema>;

/**
 * Helper function to validate API requests against a schema
 */
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
