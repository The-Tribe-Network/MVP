import { z } from "zod";

export function parseDialogPayload<T extends z.ZodSchema>(
  schema: T,
  payload: unknown
): z.infer<T> | null {
  const result = schema.safeParse(payload);
  if (!result.success) {
    console.error("Invalid dialog payload:", result.error.flatten());
    return null;
  }
  return result.data;
}