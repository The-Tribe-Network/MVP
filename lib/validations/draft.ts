import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid UUID format");

export const DRAFT_KINDS = ["post", "event"] as const;
export const DRAFT_PAYLOAD_MAX_BYTES = 64 * 1024;

// The payload is opaque to the server (the create input in progress plus client-owned UI fields);
// only its shape and size are checked.
const payloadSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => JSON.stringify(value).length <= DRAFT_PAYLOAD_MAX_BYTES, {
    message: `Draft payload must be at most ${DRAFT_PAYLOAD_MAX_BYTES / 1024} KB`,
  });

export const listDraftsQuerySchema = z.object({
  tribeId: uuidSchema.optional(),
  kind: z.enum(DRAFT_KINDS).optional(),
});

export const createDraftSchema = z.object({
  tribeId: uuidSchema,
  kind: z.enum(DRAFT_KINDS),
  payload: payloadSchema,
});

export const updateDraftSchema = z.object({
  payload: payloadSchema,
});

export const draftIdParamSchema = z.object({
  draft_id: uuidSchema,
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
export type ListDraftsQuery = z.infer<typeof listDraftsQuerySchema>;

export function validateApiRequest<T>(schema: z.Schema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false as const, error: result.error.flatten() };
  }
  return { success: true as const, data: result.data };
}
