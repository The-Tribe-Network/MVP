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
 *          return them in the `Media` shape the list endpoints use. Idempotent per uploader: an asset the
 *          same user already confirmed in the tribe is returned as it is.
 * webhook: with CLOUDINARY_NOTIFICATION_URL set, each slot also signs `notification_url` and a `context`
 *          naming the uploader and album target, and Cloudinary's upload notification runs the same
 *          confirm server-side (TRI-275), so an upload finishes even if the app never calls confirm.
 */

import { randomBytes } from "node:crypto";
import { and, asc, count, eq, inArray, isNotNull } from "drizzle-orm";
import { cloudinary } from "@/lib/clients/cloudinary";
import { db, getDbTransaction } from "@/lib/database/client";
import { albumMedia, media, mediaLike } from "@/lib/database/schemas/media";
import { comment } from "@/lib/database/schemas/post";
import { user } from "@/lib/database/schemas/auth";
import { getTribeSettings } from "./tribe-settings";
import { canUserUploadMedia } from "./permissions";
import { AlbumForbiddenError, assertCanAddToAlbum, insertAlbumMediaRows, InvalidAlbumError } from "./album";
import { blurhashForCloudinaryImage } from "@/lib/utils/blurhash";
import { MAX_UPLOAD_BYTES_HARD_CAP } from "@/lib/utils/image";
import { MEDIA_UPLOAD_PURPOSES, type ConfirmAssetInput, type MediaUploadPurpose } from "@/lib/validations/media-upload";

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
  | "ALBUM_FORBIDDEN"
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
  /**
   * Every form field the app must POST to Cloudinary besides `file` and `api_key`, verbatim (TRI-275):
   * `folder`, `public_id`, `timestamp`, `signature`, plus `notification_url` and `context` when the server
   * has `CLOUDINARY_NOTIFICATION_URL` set. The fields above stay for older clients.
   */
  params: Record<string, string>;
}

export interface SignedUploadBatch {
  cloudName: string;
  apiKey: string;
  uploads: SignedUpload[];
}

/** What the webhook needs to confirm an upload the app never confirmed (TRI-275), carried in Cloudinary `context`. */
export interface UploadContext {
  uploaderId: string;
  albumId: string | null;
  addToAlbum: boolean;
  purpose: MediaUploadPurpose;
}

/** `uid=<uploaderId>|alb=<albumId or empty>|add=<1|0>|pur=<purpose>`: a Cloudinary context string. */
export function encodeUploadContext(context: UploadContext): string {
  return `uid=${context.uploaderId}|alb=${context.albumId ?? ""}|add=${context.addToAlbum ? 1 : 0}|pur=${context.purpose}`;
}

/**
 * Read our upload context back from a notification: Cloudinary reports it as `{ custom: { uid, … } }`,
 * but a raw `a=b|c=d` string or a flat object is accepted too. Null when `uid` is missing.
 */
export function parseUploadContext(raw: unknown): UploadContext | null {
  let fields: Record<string, unknown> = {};
  if (typeof raw === "string") {
    for (const pair of raw.split("|")) {
      const at = pair.indexOf("=");
      if (at > 0) fields[pair.slice(0, at)] = pair.slice(at + 1);
    }
  } else if (raw && typeof raw === "object") {
    const custom = (raw as { custom?: unknown }).custom;
    fields = (custom && typeof custom === "object" ? custom : raw) as Record<string, unknown>;
  }
  const uid = typeof fields.uid === "string" ? fields.uid : "";
  if (!uid) return null;
  const alb = typeof fields.alb === "string" && fields.alb !== "" ? fields.alb : null;
  const pur = (MEDIA_UPLOAD_PURPOSES as readonly string[]).includes(String(fields.pur))
    ? (fields.pur as MediaUploadPurpose)
    : "media";
  return { uploaderId: uid, albumId: alb, addToAlbum: String(fields.add ?? "1") !== "0", purpose: pur };
}

/** The webhook URL Cloudinary should call after each signed upload, or null when not configured. */
function notificationUrl(): string | null {
  const url = process.env.CLOUDINARY_NOTIFICATION_URL?.trim();
  return url ? url : null;
}

/**
 * The album add rule at sign time (TRI-274/275), so a slot that will be confirmed into an album by the
 * webhook is only issued to someone allowed to add to it. Null album = general library.
 */
async function assertAlbumTarget(tribeId: string, userId: string, albumId: string | null | undefined, addToAlbum: boolean) {
  if (!addToAlbum) return;
  try {
    await assertCanAddToAlbum(albumId, tribeId, userId);
  } catch (error) {
    if (error instanceof AlbumForbiddenError) {
      throw new MediaUploadError("ALBUM_FORBIDDEN", error.message);
    }
    throw error;
  }
}

export async function signMediaUploads(
  tribeId: string,
  userId: string,
  count: number,
  purpose: MediaUploadPurpose,
  target: { albumId?: string | null; addToAlbum?: boolean } = {},
): Promise<SignedUploadBatch> {
  if (!(await canUserUploadMedia(tribeId, userId))) {
    throw new MediaUploadError("FORBIDDEN", "User does not have permission to upload media");
  }

  const albumId = target.albumId ?? null;
  const addToAlbum = target.addToAlbum ?? true;
  await assertAlbumTarget(tribeId, userId, albumId, addToAlbum);

  const folder = tribeMediaFolder(tribeId, purpose);
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((timestamp + SIGNATURE_TTL_SECONDS) * 1000).toISOString();
  const secret = process.env.CLOUDINARY_API_SECRET!;

  // With a webhook configured, Cloudinary calls it after the upload and carries our context, so the
  // upload is confirmed even when the app never gets to run confirm (TRI-275). Both are signed.
  const notify = notificationUrl();
  const extra: Record<string, string> = notify
    ? {
        notification_url: notify,
        context: encodeUploadContext({ uploaderId: userId, albumId, addToAlbum, purpose }),
      }
    : {};

  const uploads: SignedUpload[] = [];
  for (let i = 0; i < count; i++) {
    const publicId = randomBytes(12).toString("base64url");
    const signed = { folder, public_id: publicId, timestamp, ...extra };
    const signature = cloudinary.utils.api_sign_request(signed, secret);
    uploads.push({
      publicId,
      folder,
      timestamp,
      signature,
      expiresAt,
      params: { folder, public_id: publicId, timestamp: String(timestamp), signature, ...extra },
    });
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

export interface ConfirmResult {
  /** One per requested asset, in `assets[]` order: newly created and already-confirmed alike. */
  media: ConfirmedMedia[];
  /** How many of them this call created (the route answers 201 when > 0, else 200). */
  createdCount: number;
}

/** Postgres unique violation on media.public_id: a concurrent confirm (app vs webhook) won the race. */
function isPublicIdConflict(error: unknown): boolean {
  const e = error as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
  const code = e?.code ?? e?.cause?.code;
  const constraint = e?.constraint ?? e?.cause?.constraint ?? "";
  return code === "23505" && (constraint === "" || constraint.includes("public_id"));
}

/**
 * Confirm assets uploaded straight to Cloudinary into the tribe's media (TRI-160). The one confirm for
 * the app route and the Cloudinary webhook (TRI-275). Idempotent per uploader: an asset this user already
 * confirmed in this tribe comes back as it is (nothing re-verified or re-filed); one confirmed by someone
 * else, or in another tribe, is `ALREADY_CONFIRMED`. New assets are verified and inserted all-or-nothing.
 */
export async function confirmMediaUploads(
  tribeId: string,
  userId: string,
  assets: ConfirmAssetInput[],
  albumId: string | null | undefined,
  addToAlbum: boolean,
): Promise<ConfirmResult> {
  try {
    return await confirmOnce(tribeId, userId, assets, albumId, addToAlbum);
  } catch (error) {
    // The app and the webhook confirmed the same asset at the same moment: the loser sees it as existing.
    if (isPublicIdConflict(error)) {
      return confirmOnce(tribeId, userId, assets, albumId, addToAlbum);
    }
    throw error;
  }
}

async function confirmOnce(
  tribeId: string,
  userId: string,
  assets: ConfirmAssetInput[],
  albumId: string | null | undefined,
  addToAlbum: boolean,
): Promise<ConfirmResult> {
  if (!(await canUserUploadMedia(tribeId, userId))) {
    throw new MediaUploadError("FORBIDDEN", "User does not have permission to upload media");
  }

  // Before anything is verified or written: the album must belong to this tribe (InvalidAlbumError, the
  // route's 400 INVALID_ALBUM) and the caller must be allowed to add to it (TRI-274, 403 ALBUM_FORBIDDEN).
  // Null = general album.
  await assertAlbumTarget(tribeId, userId, albumId, addToAlbum);

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

  const existing = await db
    .select({ publicId: media.publicId, uploadedBy: media.uploadedBy, tribeId: media.tribeId })
    .from(media)
    .where(inArray(media.publicId, publicIds));
  const existingIds = new Set<string>();
  for (const row of existing) {
    if (row.uploadedBy !== userId || row.tribeId !== tribeId) {
      const index = publicIds.indexOf(row.publicId!);
      throw new MediaUploadError("ALREADY_CONFIRMED", `Asset ${index}: already confirmed`, index);
    }
    existingIds.add(row.publicId!);
  }

  const fresh = assets
    .map((asset, index) => ({ asset, index }))
    .filter(({ asset }) => !existingIds.has(asset.publicId));

  if (fresh.length > 0) {
    await insertVerified(tribeId, userId, fresh, albumId, addToAlbum);
  }

  return { media: await loadConfirmed(publicIds, userId), createdCount: fresh.length };
}

/** Verify new assets against the Admin API and insert their media (+ album_media) rows in one transaction. */
async function insertVerified(
  tribeId: string,
  userId: string,
  fresh: { asset: ConfirmAssetInput; index: number }[],
  albumId: string | null | undefined,
  addToAlbum: boolean,
): Promise<void> {
  const settings = await getTribeSettings(tribeId);
  const maxBytes = Math.min(settings.maxMediaFileSize * 1024 * 1024, MAX_UPLOAD_BYTES_HARD_CAP);

  const resources = await fetchResources(fresh.map(({ asset }) => asset.publicId));

  type Verified = { asset: ConfirmAssetInput; resource: CloudinaryResource; mimeType: string };
  const verified: Verified[] = [];
  for (const { asset, index } of fresh) {
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

  await getDbTransaction().transaction(async (tx) => {
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

    // Exactly one row per photo: the named album, or the general library. An upload into an album never
    // also gets a general row, so a private album's photos stay private (TRI-273).
    if (addToAlbum) {
      await insertAlbumMediaRows(
        rows.map((row, i) => ({
          albumId: albumId ?? null,
          mediaId: row.id,
          addedBy: userId,
          addedAt: new Date(),
          displayOrder: i,
        })),
        tx,
      );
    }
  });
}

/** The `Media` shape for confirmed rows, in `publicIds` order, with the caller's like state. */
async function loadConfirmed(publicIds: string[], userId: string): Promise<ConfirmedMedia[]> {
  const rows = await db
    .select({
      media,
      uploader: { id: user.id, name: user.name, username: user.username, image: user.image },
    })
    .from(media)
    .innerJoin(user, eq(media.uploadedBy, user.id))
    .where(inArray(media.publicId, publicIds));
  const ids = rows.map((r) => r.media.id);
  const postIds = [...new Set(rows.map((r) => r.media.postId).filter((id): id is string => id !== null))];

  const [filed, likes, liked, comments] = await Promise.all([
    db
      .select({ mediaId: albumMedia.mediaId, albumId: albumMedia.albumId })
      .from(albumMedia)
      .where(and(inArray(albumMedia.mediaId, ids), isNotNull(albumMedia.albumId)))
      .orderBy(asc(albumMedia.addedAt), asc(albumMedia.id)),
    db
      .select({ mediaId: mediaLike.mediaId, n: count() })
      .from(mediaLike)
      .where(inArray(mediaLike.mediaId, ids))
      .groupBy(mediaLike.mediaId),
    db
      .select({ mediaId: mediaLike.mediaId })
      .from(mediaLike)
      .where(and(inArray(mediaLike.mediaId, ids), eq(mediaLike.userId, userId))),
    postIds.length > 0
      ? db
          .select({ postId: comment.postId, n: count() })
          .from(comment)
          .where(inArray(comment.postId, postIds))
          .groupBy(comment.postId)
      : Promise.resolve([] as { postId: string; n: number }[]),
  ]);

  const albumOf = new Map<string, string>();
  for (const f of filed) if (!albumOf.has(f.mediaId) && f.albumId) albumOf.set(f.mediaId, f.albumId);
  const likeCount = new Map(likes.map((l) => [l.mediaId, Number(l.n)]));
  const likedIds = new Set(liked.map((l) => l.mediaId));
  const commentCount = new Map(comments.map((c) => [c.postId, Number(c.n)]));
  const byPublicId = new Map(rows.map((r) => [r.media.publicId!, r]));

  return publicIds.map((publicId) => {
    const { media: row, uploader } = byPublicId.get(publicId)!;
    return {
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
      albumId: albumOf.get(row.id) ?? null,
      likeCount: likeCount.get(row.id) ?? 0,
      commentCount: row.postId ? commentCount.get(row.postId) ?? 0 : 0,
      isLiked: likedIds.has(row.id),
      uploader,
    };
  });
}

export type NotificationOutcome =
  | { status: "confirmed"; created: number }
  | { status: "ignored"; reason: string };

/**
 * Confirm an upload from a verified Cloudinary upload notification (TRI-275), as the uploader named in
 * our signed context, through the same `confirmMediaUploads` as the app (so idempotent with it). Anything
 * we deliberately do not act on (other notification types, foreign folders, no context, a caller that
 * may not upload or may not add to the album, a bad asset) is `ignored` with a reason for the log.
 * Unexpected failures (database, Admin API) throw, so the route answers 500 and Cloudinary retries.
 */
export async function confirmFromUploadNotification(payload: Record<string, unknown>): Promise<NotificationOutcome> {
  if (payload.notification_type !== "upload") return { status: "ignored", reason: "not an upload" };
  if (payload.resource_type !== undefined && payload.resource_type !== "image") {
    return { status: "ignored", reason: "not an image" };
  }
  const publicId = typeof payload.public_id === "string" ? payload.public_id : "";
  const match = /^tribes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i.exec(publicId);
  if (!match) return { status: "ignored", reason: "not a tribe upload" };
  const tribeId = match[1].toLowerCase();

  const context = parseUploadContext(payload.context);
  if (!context || !/^[0-9a-f-]{36}$/i.test(context.uploaderId)) {
    return { status: "ignored", reason: "no upload context" };
  }
  if (context.albumId !== null && !/^[0-9a-f-]{36}$/i.test(context.albumId)) {
    return { status: "ignored", reason: "bad album in context" };
  }

  const num = (value: unknown) => (typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null);
  const width = num(payload.width);
  const height = num(payload.height);
  const bytes = num(payload.bytes);
  const format = typeof payload.format === "string" ? payload.format : "";
  const url = typeof payload.secure_url === "string" ? payload.secure_url : "";
  if (!width || !height || !bytes || !format || !url) return { status: "ignored", reason: "incomplete asset" };

  try {
    const result = await confirmMediaUploads(
      tribeId,
      context.uploaderId,
      [{ publicId, url, width, height, bytes, format }],
      context.albumId,
      context.addToAlbum,
    );
    return { status: "confirmed", created: result.createdCount };
  } catch (error) {
    if (error instanceof MediaUploadError) return { status: "ignored", reason: error.code };
    if (error instanceof InvalidAlbumError) return { status: "ignored", reason: error.code };
    throw error;
  }
}

async function destroyQuietly(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.warn(`confirm: could not remove rejected asset ${publicId}`, error instanceof Error ? error.message : error);
  }
}
