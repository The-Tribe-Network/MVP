import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
