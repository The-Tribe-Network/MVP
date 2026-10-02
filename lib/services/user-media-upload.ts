/**
 * User-scoped signed direct upload to Cloudinary + confirm (TRI-417): the profile photo and a tribe avatar
 * picked before the tribe exists. The signed-upload replacement for the multipart `/api/upload/avatar` and
 * `/api/upload/tribe-avatar`, which Vercel's 4.5 MB body cap breaks for phone photos. Same model as the
 * tribe-scoped pair in `media-upload.ts` (TRI-160), minus the tribe: no membership, no album, no webhook.
 *
 * sign:    one slot with a random public_id under `users/<userId>/<avatars|tribe-avatars>`, signed over
 *          folder, public_id, timestamp and the same 512×512 incoming transformation the multipart routes
 *          apply, so the stored asset matches what they store. Cloudinary rejects the form if any signed
 *          param differs. No `notification_url`: these are confirmed by the app, and the webhook only acts
 *          on `tribes/<id>/` uploads anyway.
 * confirm: the public_id must be under the caller's folder for that purpose; the Admin API's asset must
 *          exist, be an accepted image format, match the reported bytes/format/dimensions and be within the
 *          25 MB hard cap. Then exactly the multipart outcome: one `media` row (tribeId null, postId null)
 *          and, for `avatar`, `user.image` set to its URL, in one transaction. Idempotent per uploader: a
 *          public_id this user already confirmed comes back as it is, nothing re-applied.
 */

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { cloudinary } from "@/lib/clients/cloudinary";
import { db, getDbTransaction } from "@/lib/database/client";
import { media } from "@/lib/database/schemas/media";
import { user } from "@/lib/database/schemas/auth";
import { MAX_UPLOAD_BYTES_HARD_CAP } from "@/lib/utils/image";
import type { UploadAvatarResult } from "./media";
import type { ConfirmUserAssetInput, UserUploadPurpose } from "@/lib/validations/media-upload";
import {
  ACCEPTED_FORMATS,
  destroyQuietly,
  fetchResources,
  isPublicIdConflict,
  MediaUploadError,
  SIGNATURE_TTL_SECONDS,
  type SignedUpload,
  type SignedUploadBatch,
} from "./media-upload";

const USER_PURPOSE_FOLDER: Record<UserUploadPurpose, string> = {
  avatar: "avatars",
  "tribe-avatar": "tribe-avatars",
};

/**
 * The incoming transformation `uploadAvatar` / `uploadTribeAvatar` pass to the SDK, as the SDK serializes it
 * (`cloudinary.utils.generate_transformation_string`): 512×512 fill, quality auto:good, format auto.
 */
const AVATAR_INCOMING_TRANSFORMATION = "c_fill,h_512,w_512/q_auto:good/f_auto";

export function userUploadFolder(userId: string, purpose: UserUploadPurpose): string {
  return `users/${userId}/${USER_PURPOSE_FOLDER[purpose]}`;
}

/** One signed slot for the caller's own folder. Same `SignedUploadBatch` shape as the tribe-scoped sign. */
export function signUserUpload(userId: string, purpose: UserUploadPurpose): SignedUploadBatch {
  const folder = userUploadFolder(userId, purpose);
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((timestamp + SIGNATURE_TTL_SECONDS) * 1000).toISOString();
  const publicId = randomBytes(12).toString("base64url");

  const signed = { folder, public_id: publicId, timestamp, transformation: AVATAR_INCOMING_TRANSFORMATION };
  const signature = cloudinary.utils.api_sign_request(signed, process.env.CLOUDINARY_API_SECRET!);
  const upload: SignedUpload = {
    publicId,
    folder,
    timestamp,
    signature,
    expiresAt,
    params: {
      folder,
      public_id: publicId,
      timestamp: String(timestamp),
      transformation: AVATAR_INCOMING_TRANSFORMATION,
      signature,
    },
  };

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    uploads: [upload],
  };
}

export interface UserUploadConfirmResult {
  /** Same fields `/api/upload/avatar` and `/api/upload/tribe-avatar` return. */
  upload: UploadAvatarResult;
  /** False when this uploader had already confirmed the asset (the route answers 200 instead of 201). */
  created: boolean;
}

/**
 * Confirm an asset the caller uploaded through `signUserUpload`. `avatar` also sets `user.image`;
 * `tribe-avatar` only creates the media row whose id `POST /tribes` takes as `avatar`.
 */
export async function confirmUserUpload(
  userId: string,
  purpose: UserUploadPurpose,
  asset: ConfirmUserAssetInput,
): Promise<UserUploadConfirmResult> {
  try {
    return await confirmUserUploadOnce(userId, purpose, asset);
  } catch (error) {
    // Two confirms of the same asset at once (a retry racing the first): the loser sees it as existing.
    if (isPublicIdConflict(error)) {
      return confirmUserUploadOnce(userId, purpose, asset);
    }
    throw error;
  }
}

function toResult(row: typeof media.$inferSelect): UploadAvatarResult {
  return {
    id: row.id,
    url: row.fileUrl,
    width: row.width ?? 0,
    height: row.height ?? 0,
    fileSize: row.fileSize ?? 0,
    mimeType: row.mimeType ?? "",
  };
}

async function confirmUserUploadOnce(
  userId: string,
  purpose: UserUploadPurpose,
  asset: ConfirmUserAssetInput,
): Promise<UserUploadConfirmResult> {
  const prefix = `${userUploadFolder(userId, purpose)}/`;
  if (!asset.publicId.startsWith(prefix) || asset.publicId.includes("..")) {
    throw new MediaUploadError("INVALID_PUBLIC_ID", "public_id is not in your upload folder for this purpose");
  }

  const [existing] = await db.select().from(media).where(eq(media.publicId, asset.publicId)).limit(1);
  if (existing) {
    if (existing.uploadedBy !== userId) {
      throw new MediaUploadError("ALREADY_CONFIRMED", "Asset already confirmed");
    }
    return { upload: toResult(existing), created: false };
  }

  const resource = (await fetchResources([asset.publicId])).get(asset.publicId);
  if (!resource || !resource.secure_url) {
    throw new MediaUploadError("ASSET_NOT_FOUND", "Asset not found in Cloudinary");
  }
  const format = (resource.format ?? "").toLowerCase();
  const mimeType = ACCEPTED_FORMATS[format];
  if (!mimeType) {
    await destroyQuietly(asset.publicId);
    throw new MediaUploadError("UNSUPPORTED_FORMAT", `Format "${format}" is not an accepted image`);
  }
  if (
    resource.bytes !== asset.bytes ||
    format !== asset.format.toLowerCase() ||
    resource.width !== asset.width ||
    resource.height !== asset.height
  ) {
    throw new MediaUploadError("ASSET_MISMATCH", "Reported bytes/format/dimensions do not match the uploaded asset");
  }
  if ((resource.bytes ?? 0) > MAX_UPLOAD_BYTES_HARD_CAP) {
    await destroyQuietly(asset.publicId);
    throw new MediaUploadError(
      "FILE_TOO_LARGE",
      `${resource.bytes} bytes exceeds the limit of ${MAX_UPLOAD_BYTES_HARD_CAP} bytes`,
    );
  }

  // The multipart routes' row (uploadAvatar / uploadTribeAvatar), plus the public_id they also store.
  const row = await getDbTransaction().transaction(async (tx) => {
    const [created] = await tx
      .insert(media)
      .values({
        fileUrl: resource.secure_url!,
        fileType: "image",
        fileSize: resource.bytes ?? null,
        mimeType,
        width: resource.width ?? null,
        height: resource.height ?? null,
        uploadedBy: userId,
        tribeId: null,
        postId: null,
        duration: null,
        thumbnailUrl: null,
        altText: null,
        publicId: asset.publicId,
      })
      .returning();
    if (purpose === "avatar") {
      await tx.update(user).set({ image: created.fileUrl }).where(eq(user.id, userId));
    }
    return created;
  });

  return { upload: toResult(row), created: true };
}
