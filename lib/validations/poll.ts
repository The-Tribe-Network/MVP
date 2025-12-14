import { z } from "zod";

export const createPollSchema = z.object({
  question: z.string().min(1, "Poll question is required").max(500),
  options: z.array(z.string().min(1).max(200))
    .min(2, "Poll must have at least 2 options")
    .max(10, "Poll cannot have more than 10 options"),
  allowMultiple: z.boolean(),
  isAnonymous: z.boolean(),
  endsAt: z.string().datetime().optional(),
}).refine(
  (data) => new Set(data.options).size === data.options.length,
  { message: "Poll options must be unique", path: ["options"] }
);

export const pollVoteSchema = z.object({
  optionIds: z.array(z.string().uuid())
    .min(1, "Must select at least one option"),
});

export const pollIdParamSchema = z.object({
  poll_id: z.string().uuid("Invalid poll ID"),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type PollVoteInput = z.infer<typeof pollVoteSchema>;
