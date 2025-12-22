import { z } from "zod";

// Zod schemas for dialog payloads
export const imagePreviewSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().optional(),
});

export const mediaUploadSchema = z.object({
  tribeId: z.string().min(1),
});

export const dialogPayloadSchemas = {
  'image-preview': imagePreviewSchema,
  'media-upload': mediaUploadSchema,
} as const;

export type DialogPayloadSchema = typeof dialogPayloadSchemas;