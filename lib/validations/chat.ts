import { z } from "zod";

// TRI-315 · chat messages (PRD §5.13 R13.6)

const uuid = z.string().uuid();
export const CHAT_MAX_PHOTOS = 10;
export const CHAT_BODY_MAX = 4000;
const mentions = z.array(uuid).max(20).optional();
// One emoji (or a short ZWJ sequence); the app sends what the picker gives it
const emoji = z.string().trim().min(1).max(16);

export const sendMessageSchema = z.object({
  body: z.string().max(CHAT_BODY_MAX, `A message can be at most ${CHAT_BODY_MAX} characters`).optional(),
  mediaIds: z.array(uuid).max(CHAT_MAX_PHOTOS, `A message can have at most ${CHAT_MAX_PHOTOS} photos`).optional(),
  replyToId: uuid.nullable().optional(),
  mentionUserIds: mentions,
});

export const editMessageSchema = z.object({
  body: z.string().max(CHAT_BODY_MAX, `A message can be at most ${CHAT_BODY_MAX} characters`),
  mentionUserIds: mentions,
});

export const reactionSchema = z.object({ emoji });

export const listMessagesQuerySchema = z.object({
  before: uuid.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const chatMessageParamsSchema = z.object({
  tribe_id: uuid,
  timeline_id: uuid,
  message_id: uuid,
});
