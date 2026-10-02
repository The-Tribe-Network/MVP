import { z } from "zod";

/** Request bodies for the signed direct-upload flow (TRI-160): `signMediaUpload`, `confirmMediaUpload`. */

export const MEDIA_UPLOAD_PURPOSES = [
  "media",
  "post-image",
  "album-cover",
  "event-cover",
  "tribe-avatar",
  "tribe-banner",
  "avatar",
] as const;

export type MediaUploadPurpose = (typeof MEDIA_UPLOAD_PURPOSES)[number];

export const MAX_SIGNED_UPLOADS = 20;

export const signMediaUploadSchema = z.object({
  count: z.number().int().min(1).max(MAX_SIGNED_UPLOADS),
  purpose: z.enum(MEDIA_UPLOAD_PURPOSES).default("media"),
  // The album target the webhook confirm will use (TRI-275); same meaning as on confirm. Checked at sign.
  albumId: z.string().uuid().nullable().optional(),
  addToAlbum: z.boolean().default(true),
});

export const confirmAssetSchema = z.object({
  publicId: z.string().min(1).max(255),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  format: z.string().min(1).max(16),
  altText: z.string().max(500).optional(),
});

export const confirmMediaUploadSchema = z.object({
  assets: z.array(confirmAssetSchema).min(1).max(MAX_SIGNED_UPLOADS),
  albumId: z.string().uuid().nullable().optional(),
  addToAlbum: z.boolean().default(true),
});

export type SignMediaUploadInput = z.infer<typeof signMediaUploadSchema>;
export type ConfirmAssetInput = z.infer<typeof confirmAssetSchema>;
export type ConfirmMediaUploadInput = z.infer<typeof confirmMediaUploadSchema>;

/**
 * User-scoped signed upload (TRI-417): images that belong to the caller rather than a tribe, so no
 * membership applies. `avatar` = the profile photo (`/upload/avatar`), `tribe-avatar` = a tribe avatar
 * uploaded before the tribe exists (`/upload/tribe-avatar`, its media id goes to `POST /tribes` as `avatar`).
 */
export const USER_UPLOAD_PURPOSES = ["avatar", "tribe-avatar"] as const;

export type UserUploadPurpose = (typeof USER_UPLOAD_PURPOSES)[number];

export const signUserUploadSchema = z.object({
  purpose: z.enum(USER_UPLOAD_PURPOSES),
});

export const confirmUserUploadSchema = z.object({
  purpose: z.enum(USER_UPLOAD_PURPOSES),
  asset: confirmAssetSchema.omit({ altText: true }),
});

export type SignUserUploadInput = z.infer<typeof signUserUploadSchema>;
export type ConfirmUserUploadInput = z.infer<typeof confirmUserUploadSchema>;
export type ConfirmUserAssetInput = ConfirmUserUploadInput["asset"];
