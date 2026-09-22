import { z } from "zod";

// Mirrors the mobile contract's `EventSettingsPatch` (tribe-mobile docs/api/openapi.yaml): every field
// optional, dates as ISO strings, `reminderSchedule` as a "1d,1h" style list (TRI-13).
export const REMINDER_SCHEDULE_RE = /^(\d+[wdhm])(,\d+[wdhm])*$/;

export const updateEventSettingsSchema = z
  .object({
    capacityLimit: z.number().int().min(1).nullable().optional(),
    enableWaitlist: z.boolean().optional(),
    rsvpDeadline: z.coerce.date().nullable().optional(),
    attendeeVisibility: z.enum(["all_members", "count_only", "hidden"]).optional(),
    guestAllowance: z.number().int().min(0).max(20).optional(),
    requireRsvpApproval: z.boolean().optional(),
    enablePolls: z.boolean().optional(),
    pollCreationLevel: z.enum(["event_creator", "moderators", "admins"]).optional(),
    pollResultsVisibility: z
      .enum(["immediate", "after_voting", "after_close", "hidden"])
      .optional(),
    allowAnonymousPolls: z.boolean().optional(),
    linkedAlbumId: z.string().uuid().nullable().optional(),
    autoCreateAlbum: z.boolean().optional(),
    allowAttendeeUploads: z.boolean().optional(),
    enableReminders: z.boolean().optional(),
    reminderSchedule: z
      .string()
      .regex(REMINDER_SCHEDULE_RE, "Use a list like 1d,1h")
      .optional(),
    notifyOnRsvpChanges: z.boolean().optional(),
    notifyOnComments: z.boolean().optional(),
    notifyOnPollResults: z.boolean().optional(),
    editPermission: z.enum(["creator_only", "creator_and_admins", "all_members"]).optional(),
  })
  .strict();

export type UpdateEventSettingsInput = z.infer<typeof updateEventSettingsSchema>;

export const addCoHostSchema = z.object({ userId: z.string().uuid() });

export const eventLinkSchema = z.object({
  title: z.string().trim().min(1).max(100),
  url: z.string().url().max(2048),
  description: z.string().trim().max(200).optional(),
});
export type EventLinkInput = z.infer<typeof eventLinkSchema>;

export const announceSchema = z.object({ message: z.string().trim().min(1).max(500) });
