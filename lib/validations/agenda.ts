import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid UUID format");
const dateTimeSchema = z
  .string()
  .datetime({ offset: true, message: "Expected an ISO 8601 date-time" })
  .transform((value) => new Date(value));

// GET /me/agenda?from&to&tribeId?&limit (mobile contract getAgenda)
export const agendaQuerySchema = z
  .object({
    from: dateTimeSchema,
    to: dateTimeSchema,
    tribeId: uuidSchema.optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100),
  })
  .refine((q) => q.from <= q.to, { message: "`from` must not be after `to`", path: ["to"] });

// GET /me/catch-up?since&tribeId&cursor&limit (getCatchUp)
export const catchUpQuerySchema = z.object({
  since: dateTimeSchema.optional(),
  tribeId: uuidSchema.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// POST /me/catch-up/done (markCatchUpDone): optional single tribe, default all memberships
export const catchUpDoneSchema = z.object({
  tribeId: uuidSchema.optional(),
});

export type AgendaQuery = z.infer<typeof agendaQuerySchema>;
export type CatchUpQuery = z.infer<typeof catchUpQuerySchema>;

// Input differs from output here (ISO strings become Dates), so the schema is typed on its output only
export function validateApiRequest<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false as const, error: result.error.flatten() };
  }
  return { success: true as const, data: result.data };
}
