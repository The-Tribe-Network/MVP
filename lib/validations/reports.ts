import { z } from "zod";

/** TRI-237. Values mirror the `report_target_type` / `report_reason` enums (lib/database/schemas/enums.ts). */
export const REPORT_TARGET_TYPES = ["post", "comment", "media", "user"] as const;
export const REPORT_REASONS = ["spam", "harassment", "hate", "sexual_content", "violence", "self_harm", "other"] as const;
export const REPORT_NOTE_MAX = 1000;

/** POST /reports body. `note` is trimmed; empty → null. Unknown keys are ignored. */
export const createReportSchema = z
  .object({
    tribeId: z.string().uuid(),
    targetType: z.enum(REPORT_TARGET_TYPES),
    targetId: z.string().uuid(),
    reason: z.enum(REPORT_REASONS),
    note: z
      .string()
      .trim()
      .max(REPORT_NOTE_MAX)
      .nullish()
      .transform((v) => (v ? v : null)),
  });

export type CreateReportInput = z.infer<typeof createReportSchema>;

/** GET /me/blocks paging. */
export const listBlocksQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
