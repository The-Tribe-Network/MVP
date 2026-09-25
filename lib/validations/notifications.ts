import { z } from "zod";

// TRI-7 · query and body shapes for /api/me/notifications*
const filterSchema = z.enum(["all", "mentions", "events", "invites"]).default("all");

export const listNotificationGroupsQuerySchema = z.object({
  filter: filterSchema,
  perGroup: z.coerce.number().int().min(1).max(10).default(3),
});

export const listNotificationsQuerySchema = z.object({
  filter: filterSchema,
  tribeId: z.string().uuid().optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const markAllReadBodySchema = z.object({ tribeId: z.string().uuid().optional() }).default({});
