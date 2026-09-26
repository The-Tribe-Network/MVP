import { z } from "zod";

// TRI-314 · timeline routes (PRD §5.13)

const name = z.string().trim().min(1, "Name is required").max(50, "Name must be 50 characters or fewer");
const emoji = z.string().trim().max(16, "Emoji is too long").nullable();
const postPermission = z.enum(["everyone", "admins"]);

export const createTimelineSchema = z.object({
  name,
  type: z.enum(["posts", "chat"]),
  emoji: emoji.optional(),
  postPermission: postPermission.optional(),
});

export const updateTimelineSchema = z
  .object({ name: name.optional(), emoji: emoji.optional(), postPermission: postPermission.optional() })
  .refine((data) => Object.keys(data).length > 0, { message: "Nothing to update" });

export const reorderTimelinesSchema = z.object({
  timelineIds: z.array(z.string().uuid("Invalid timeline ID format")).min(1),
});

export const selectTimelineSchema = z.object({
  timelineId: z.string().uuid("Invalid timeline ID format").nullable(),
});

export const tribeTimelineParamsSchema = z.object({
  tribe_id: z.string().uuid("Invalid tribe ID format"),
  timeline_id: z.string().uuid("Invalid timeline ID format"),
});
