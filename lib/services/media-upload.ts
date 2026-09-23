/**
 * Signed direct upload to Cloudinary + confirm (TRI-160, "path 2" in tribe-mobile API.md §7).
 *
 * sign:    the app asks for N upload slots; each gets a random public_id under the tribe's folder and
 *          a signature over exactly the params the app must send (folder, public_id, timestamp).
 *          Cloudinary rejects the form if any signed param differs, so the app cannot pick another
 *          folder or public_id. Signatures are Cloudinary-valid for 1 hour after `timestamp`; we tell
 *          the app 10 minutes (`expiresAt`) so it refreshes instead of racing the edge.
 * confirm: for each asset the app reports, check the public_id is under the tribe's folder, ask the
 *          Admin API for the real asset and compare bytes/format/dimensions, enforce the tribe's
 *          maxMediaFileSize, then insert `media` (+ `album_media`) rows in one transaction and
 *          return them in the `Media` shape the list endpoints use.
 */

import { randomBytes } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { cloudinary } from "@/lib/clients/cloudinary";
import { db, getDbTransaction } from "@/lib/database/client";
import { albumMedia, media } from "@/lib/database/schemas/media";
import { user } from "@/lib/database/schemas/auth";
import { getTribeSettings } from "./tribe-settings";
import { canUserUploadMedia } from "./permissions";
import { assertAlbumInTribe } from "./album";
import { blurhashForCloudinaryImage } from "@/lib/utils/blurhash";
import { MAX_UPLOAD_BYTES_HARD_CAP } from "@/lib/utils/image";
import type { ConfirmAssetInput, MediaUploadPurpose } from "@/lib/validations/media-upload";

/** How long the app may treat a signature as usable. Cloudinary itself accepts it for 60 minutes. */
export const SIGNATURE_TTL_SECONDS = 10 * 60;

/** Image formats Cloudinary may report for an asset we will accept. Everything else is rejected. */
const ACCEPTED_FORMATS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
};

const PURPOSE_FOLDER: Record<MediaUploadPurpose, string> = {
  media: "media",
  "post-image": "posts",
  "album-cover": "albums",
  "event-cover": "events",
  "tribe-avatar": "avatar",
  "tribe-banner": "banner",
  avatar: "members",
};

export type MediaUploadErrorCode =
  | "FORBIDDEN"
  | "INVALID_PUBLIC_ID"
  | "ASSET_NOT_FOUND"
  | "ASSET_MISMATCH"
  | "UNSUPPORTED_FORMAT"
  | "FILE_TOO_LARGE"
  | "ALREADY_CONFIRMED";

/** A confirm/sign input the caller can fix. Routes map FORBIDDEN to 403, FILE_TOO_LARGE to 413, the rest to 400. */
export class MediaUploadError extends Error {
  constructor(
    public readonly code: MediaUploadErrorCode,
    message: string,
    /** Index into the request's `assets` when the error is about one asset. */
    public readonly index?: number,
  ) {
    super(message);
    this.name = "MediaUploadError";
  }
}

export function tribeMediaFolder(tribeId: string, purpose: MediaUploadPurpose = "media"): string {
  return `tribes/${tribeId}/${PURPOSE_FOLDER[purpose]}`;
}

/** The prefix every public_id confirmed for this tribe must carry, whatever the purpose. */
export function tribeFolderPrefix(tribeId: string): string {
  return `tribes/${tribeId}/`;
}

export interface SignedUpload {
  publicId: string;
  folder: string;
  timestamp: number;
  signature: string;
  expiresAt: string;
}

export interface SignedUploadBatch {
  cloudName: string;
  apiKey: string;
  uploads: SignedUpload[];
}

export async function signMediaUploads(
  tribeId: string,
  userId: string,
  count: number,
  purpose: MediaUploadPurpose,
): Promise<SignedUploadBatch> {
  if (!(await canUserUploadMedia(tribeId, userId))) {
    throw new MediaUploadError("FORBIDDEN", "User does not have permission to upload media");
  }

  const folder = tribeMediaFolder(tribeId, purpose);
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((timestamp + SIGNATURE_TTL_SECONDS) * 1000).toISOString();
  const secret = process.env.CLOUDINARY_API_SECRET!;

  const uploads: SignedUpload[] = [];
  for (let i = 0; i < count; i++) {
    const publicId = randomBytes(12).toString("base64url");
    const signature = cloudinary.utils.api_sign_request({ folder, public_id: publicId, timestamp }, secret);
    uploads.push({ publicId, folder, timestamp, signature, expiresAt });
  }

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    uploads,
  };
}

type CloudinaryResource = {
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  secure_url?: string;
  resource_type?: string;
};

async function fetchResources(publicIds: string[]): Promise<Map<string, CloudinaryResource>> {
  const found = new Map<string, CloudinaryResource>();
  // resources_by_ids takes up to 100 ids in one Admin API call.
  const response = (await cloudinary.api.resources_by_ids(publicIds, { resource_type: "image" })) as {
    resources?: CloudinaryResource[];
  };
  for (const resource of response.resources ?? []) {
    found.set(resource.public_id, resource);
  }
  return found;
}

export interface ConfirmedMedia {
  id: string;
  postId: string | null;
  uploadedBy: string;
  tribeId: string | null;
  fileUrl: string;
  fileType: "image" | "video" | "document";
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnailUrl: string | null;
  altText: string | null;
  blurhash: string | null;
  createdAt: Date;
  albumId: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  uploader: { id: string; name: string; username: string | null; image: string | null };
}

export async function confirmMediaUploads(
  tribeId: string,
  userId: string,
  assets: ConfirmAssetInput[],
  albumId: string | null | undefined,
  addToAlbum: boolean,
): Promise<ConfirmedMedia[]> {
  if (!(await canUserUploadMedia(tribeId, userId))) {
    throw new MediaUploadError("FORBIDDEN", "User does not have permission to upload media");
  }

  // The album must belong to this tribe (throws InvalidAlbumError, the route's 400 INVALID_ALBUM). Null = general album.
  if (addToAlbum) {
    await assertAlbumInTribe(albumId, tribeId);
  }

  const prefix = tribeFolderPrefix(tribeId);
  assets.forEach((asset, index) => {
    if (!asset.publicId.startsWith(prefix) || asset.publicId.includes("..")) {
      throw new MediaUploadError("INVALID_PUBLIC_ID", `Asset ${index}: public_id is not in this tribe's folder`, index);
    }
  });
  const publicIds = assets.map((a) => a.publicId);
  if (new Set(publicIds).size !== publicIds.length) {
    throw new MediaUploadError("INVALID_PUBLIC_ID", "Duplicate public_id in request");
  }

  const existing = await db.select({ publicId: media.publicId }).from(media).where(inArray(media.publicId, publicIds));
  if (existing.length > 0) {
    const index = publicIds.indexOf(existing[0].publicId!);
    throw new MediaUploadError("ALREADY_CONFIRMED", `Asset ${index}: already confirmed`, index);
  }

  const settings = await getTribeSettings(tribeId);
  const maxBytes = Math.min(settings.maxMediaFileSize * 1024 * 1024, MAX_UPLOAD_BYTES_HARD_CAP);

  const resources = await fetchResources(publicIds);

  type Verified = { asset: ConfirmAssetInput; resource: CloudinaryResource; mimeType: string };
  const verified: Verified[] = [];
  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index];
    const resource = resources.get(asset.publicId);
    if (!resource || !resource.secure_url) {
      throw new MediaUploadError("ASSET_NOT_FOUND", `Asset ${index}: not found in Cloudinary`, index);
    }
    const format = (resource.format ?? "").toLowerCase();
    const mimeType = ACCEPTED_FORMATS[format];
    if (!mimeType) {
      await destroyQuietly(asset.publicId);
      throw new MediaUploadError("UNSUPPORTED_FORMAT", `Asset ${index}: format "${format}" is not an accepted image`, index);
    }
    if (
      resource.bytes !== asset.bytes ||
      format !== asset.format.toLowerCase() ||
      resource.width !== asset.width ||
      resource.height !== asset.height
    ) {
      throw new MediaUploadError("ASSET_MISMATCH", `Asset ${index}: reported bytes/format/dimensions do not match the uploaded asset`, index);
    }
    if ((resource.bytes ?? 0) > maxBytes) {
      // Ours (signed into our folder) but over the tribe's limit: remove it so it does not linger unreferenced.
      await destroyQuietly(asset.publicId);
      throw new MediaUploadError(
        "FILE_TOO_LARGE",
        `Asset ${index}: ${resource.bytes} bytes exceeds the tribe limit of ${maxBytes} bytes`,
        index,
      );
    }
    verified.push({ asset, resource, mimeType });
  }

  const blurhashes = await Promise.all(verified.map((v) => blurhashForCloudinaryImage(v.resource.secure_url!)));

  const inserted = await getDbTransaction().transaction(async (tx) => {
    const rows = await tx
      .insert(media)
      .values(
        verified.map((v, i) => ({
          uploadedBy: userId,
          tribeId,
          postId: null,
          fileUrl: v.resource.secure_url!,
          fileType: "image" as const,
          fileSize: v.resource.bytes ?? null,
          mimeType: v.mimeType,
          width: v.resource.width ?? null,
          height: v.resource.height ?? null,
          duration: null,
          thumbnailUrl: null,
          altText: v.asset.altText ?? null,
          publicId: v.asset.publicId,
          blurhash: blurhashes[i],
        })),
      )
      .returning();

    if (addToAlbum) {
      await tx.insert(albumMedia).values(
        rows.map((row, i) => ({
          albumId: albumId ?? null,
          mediaId: row.id,
          addedBy: userId,
          addedAt: new Date(),
          displayOrder: i,
        })),
      );
    }
    return rows;
  });

  const [uploader] = await db
    .select({ id: user.id, name: user.name, username: user.username, image: user.image })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return inserted.map((row) => ({
    id: row.id,
    postId: row.postId,
    uploadedBy: row.uploadedBy,
    tribeId: row.tribeId,
    fileUrl: row.fileUrl,
    fileType: row.fileType,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    duration: row.duration,
    thumbnailUrl: row.thumbnailUrl,
    altText: row.altText,
    blurhash: row.blurhash,
    createdAt: row.createdAt,
    albumId: addToAlbum ? (albumId ?? null) : null,
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    uploader,
  }));
}

async function destroyQuietly(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.warn(`confirm: could not remove rejected asset ${publicId}`, error instanceof Error ? error.message : error);
  }
}
