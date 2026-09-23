# TRI-160 · API · Signed direct upload, confirm flow, blurhash (+ TRI-11 size limits)

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-22
Linear: https://linear.app/tribenetwork/issue/TRI-160 · https://linear.app/tribenetwork/issue/TRI-11
Branch: `anthonygayflor6/tri-160-api-signed-direct-media-upload-confirm-flow-and-blurhash`
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §8, `docs/api/openapi.yaml` (`signMediaUpload`,
`confirmMediaUpload`, `SignedUploadBatch`, `ConfirmAsset`, `Media.blurhash`, `ImageRef.blurhash`),
`docs/ARCHITECTURE.md` §11, `docs/api/API.md` §7 "path 2".
Unblocks: MEDIA-12 (camera-roll batch upload), MEDIA-02/03 placeholders, POST-02-photos.

---

## 1. What landed

| Route | Notes |
|---|---|
| `POST /tribes/{tid}/media/sign` `{ count, purpose? }` → `SignedUploadBatch` | new; `canUploadMedia`; 1–20 slots |
| `POST /tribes/{tid}/media/confirm` `{ assets[], albumId?, addToAlbum? }` → `201 { media: Media[] }` | new; verifies each asset with the Cloudinary Admin API, inserts `media` (+ `album_media`) in one transaction |
| `media.public_id` (text, unique, nullable), `media.blurhash` (text, nullable) | new columns; `public_id` backfilled from `file_url` |
| `blurhash` on every `Media` and `ImageRef` the API builds | media lists, album detail, `/media/public`, featured media, post `media[]`/`image` |
| multipart `POST /tribes/{tid}/media` and `/media/batch` | 413 `PAYLOAD_TOO_LARGE` when the body is over 4.5 MB; 413 `FILE_TOO_LARGE` when a file is over the tribe's `maxMediaFileSize` |
| `deleteMedia` | destroys by stored `public_id`; falls back to URL parsing only for rows without one |

Files: `lib/services/media-upload.ts` (sign/confirm), `lib/validations/media-upload.ts`,
`lib/utils/blurhash.ts` (encoder + BMP decoder), `lib/services/multipart-limits.ts`,
`app/api/tribes/[tribe_id]/media/{sign,confirm}/route.ts`, `lib/database/schemas/media.ts`,
`lib/database/migrations/tri160-media-public-id-blurhash.sql`; edits in `lib/services/{media,album,post,tribe}.ts`,
`lib/utils/image.ts`, `app/api/tribes/[tribe_id]/media/{route,batch/route}.ts`.

### sign

```http
POST /api/tribes/91178263-…/media/sign
{ "count": 3, "purpose": "media" }

200
{
  "cloudName": "dj5mhx8h0",
  "apiKey": "…",
  "uploads": [
    { "publicId": "6EQ0MQydsN-cTDq6", "folder": "tribes/91178263-…/media",
      "timestamp": 1790135464, "signature": "83d3…", "expiresAt": "2026-09-23T04:01:04.000Z" },
    …
  ]
}
```

The app POSTs each file to `https://api.cloudinary.com/v1_1/{cloudName}/image/upload` as multipart with
exactly `file`, `api_key`, `folder`, `public_id`, `timestamp`, `signature`. Cloudinary rejects the form
("Invalid Signature") if any signed param differs, so the app cannot pick another folder or id. The
resulting asset's `public_id` is `<folder>/<publicId>`. `expiresAt` is `timestamp + 10 min`; Cloudinary
itself honours a signature for 60 min, the shorter window is what the queue should refresh on.

`purpose` → folder: `media` → `tribes/<id>/media`, `post-image` → `…/posts`, `album-cover` → `…/albums`,
`event-cover` → `…/events`, `tribe-avatar` → `…/avatar`, `tribe-banner` → `…/banner`, `avatar` →
`…/members`. Every purpose needs `canUploadMedia`; confirm accepts any `public_id` under `tribes/<id>/`.

### confirm

```http
POST /api/tribes/91178263-…/media/confirm
{
  "assets": [
    { "publicId": "tribes/91178263-…/media/6EQ0MQydsN-cTDq6",
      "url": "https://res.cloudinary.com/dj5mhx8h0/image/upload/v1790135464/tribes/91178263-…/media/6EQ0MQydsN-cTDq6.png",
      "width": 64, "height": 48, "bytes": 6297, "format": "png", "altText": "optional" }
  ],
  "albumId": "8ac6b9b4-…",      // optional; null/absent = general album
  "addToAlbum": true            // default true
}

201
{ "media": [ { "id": "fb0fa9e1-…", "postId": null, "uploadedBy": "46c5…", "tribeId": "9117…",
    "fileUrl": "https://res.cloudinary.com/…/6EQ0MQydsN-cTDq6.png", "fileType": "image",
    "fileSize": 6297, "mimeType": "image/png", "width": 64, "height": 48, "duration": null,
    "thumbnailUrl": null, "altText": "optional", "blurhash": "LyHHdy2ZwxW=oBWnjtfOfUfRfQfR",
    "createdAt": "…", "albumId": "8ac6b9b4-…", "likeCount": 0, "commentCount": 0, "isLiked": false,
    "uploader": { "id": "46c5…", "name": "…", "username": "…", "image": null } } ] }
```

Order of checks (first failure wins, nothing is inserted): signed in (401) → member (403) → body shape
(400) → `canUploadMedia` (403 `FORBIDDEN`) → `albumId` belongs to this tribe (400 `INVALID_ALBUM`, same
rule as createPost) → every `publicId` starts with `tribes/<id>/` and has no `..` (400
`INVALID_PUBLIC_ID`) → no duplicates, none already confirmed (400 `ALREADY_CONFIRMED`) → one Admin API
call `resources_by_ids` → asset exists (400 `ASSET_NOT_FOUND`) → format in jpg/png/webp/gif/heic/heif/avif
(400 `UNSUPPORTED_FORMAT`, asset destroyed) → reported `bytes`/`format`/`width`/`height` equal
Cloudinary's (400 `ASSET_MISMATCH`) → `bytes ≤ min(maxMediaFileSize MB, 25 MB)` (413 `FILE_TOO_LARGE`,
asset destroyed since it was signed into our folder). Errors about one asset carry `index`.

Then blurhashes are computed (§3), and `media` + `album_media` rows are written in one
`getDbTransaction()` transaction. `Media[]` comes back in the list-endpoint shape.

## 2. TRI-11 conclusion: size limits and multi-file

- **Vercel Functions cap request and response bodies at 4.5 MB** and return `413
  FUNCTION_PAYLOAD_TOO_LARGE` before the handler runs (vercel.com/docs/functions/limitations, "Request
  body size", verified 2026-09-22). A full-size phone photo is 3–12 MB, so the multipart route
  (`POST /tribes/{id}/media`) **cannot take full-size photos in production** whatever we set in code.
- **The signed direct-upload flow (§1) is the path for anything large**: bytes go app → Cloudinary,
  tribe-v2 only signs and confirms. MEDIA-12's "up to 25 MB each" is enforced there via
  `maxMediaFileSize` (default 10 MB per tribe, editable 1–100 in settings) capped by a 25 MB hard
  ceiling (`MAX_UPLOAD_BYTES_HARD_CAP`).
- **The multipart routes now say so**: `Content-Length` over 4.5 MB → `413 { code: "PAYLOAD_TOO_LARGE",
  limitBytes }` (so `next dev` behaves like production and the app can fall back to path 2), and a file
  over `min(maxMediaFileSize, 25 MB, 4.5 MB)` → `413 { code: "FILE_TOO_LARGE" }` (batch: per-file entry
  in `failed[]` with `code`). `validateImageFile` gained a `maxBytes` argument and a `code`; the six
  `/upload/*` avatar/cover routes are unchanged (they still use the 50 MB ceiling, which the platform
  limit makes moot).
- **Multi-file**: `POST /tribes/{id}/media/batch` (`uploadMediaBatch`) already takes up to 20 `files`
  in one multipart body with per-file `failed[]` entries, so multipart multi-file exists — but the
  whole batch shares the 4.5 MB body, so it only fits thumbnails. For the app: keep multipart for
  avatars/covers (small, resized client-side); use sign → direct upload → confirm for albums and post
  photos, with the ARCHITECTURE §11 queue doing per-item retry. Client-side resize to 2048 px / JPEG
  0.85 stays worthwhile (fewer bytes, faster), it is just no longer what keeps uploads under a limit.
- Not enforced by Cloudinary `upload_preset` limits as DATA-MODEL-DELTA §8 suggested: unsigned presets
  are not needed for signed uploads and a per-tribe limit cannot live in one preset, so the app enforces
  it at confirm from the bytes Cloudinary reports (and removes the oversized asset).

## 3. Blurhash

Computed server-side, no new dependency. `sharp` is only a transitive optional dep of `next` (not
resolvable from app code, and `pnpm` is broken on this machine), so `lib/utils/blurhash.ts` fetches a
`w_32,h_32,c_limit,f_bmp` rendition from Cloudinary (~2 KB, uncompressed 24-bit BMP), decodes it, and
runs the reference blurhash encoder (4x3 components, 28 chars). Failures log and store `null`; an upload
never fails for want of a placeholder. Cost per asset: one 2 KB GET, ~1 ms of arithmetic.

Stored on confirm and on the multipart paths (`uploadTribeMedia`, `uploadTribeMediaBatch`,
`uploadPostImage`, `uploadTribeBanner`, `uploadEventCover`; avatars store only `public_id`). Returned as
`Media.blurhash` (`string | null`) from `GET /media`, `/media?albumId`, `/media/public`, `GET /albums/{id}`
`.media[]`, `/featured-media`, and as `ImageRef.blurhash` (`string`, omitted when null) on
`Post.media[]` / `Post.image`. Existing rows stay `null` until re-uploaded (no bulk backfill: 44 rows on
Development, a one-off script could fetch each thumbnail if wanted).

## 4. Migration and backfill

`lib/database/migrations/tri160-media-public-id-blurhash.sql` — re-runnable (`ADD COLUMN IF NOT EXISTS`,
`CREATE UNIQUE INDEX IF NOT EXISTS`); the backfill sets `public_id` from
`file_url ~ '/upload/v<ver>/<public_id>.<ext>'` for rows where it is null, taking the oldest row per
URL so a duplicate URL cannot trip the unique index. Applied to **Development only**
(`ep-divine-term-ahpw8jvi`), twice, second run a no-op: 44/44 rows backfilled, index present.
**Production (`ep-sweet-smoke-ah2qfclb`) not touched** — run it there before deploying this code, since
every media select now reads the two columns.

## 5. Decisions

- `SignedUploadBatch.uploads[].publicId` is the **short id the app sends as `public_id`**; the asset's
  full public id (`<folder>/<publicId>`) is what Cloudinary returns and what `ConfirmAsset.publicId`
  carries. `eager` is not issued: the app already resizes to 2048 px and the multipart path's incoming
  transformation is not needed for direct uploads.
- Confirm is all-or-nothing per request (one transaction); the app's queue confirms per item anyway.
- Any purpose signs under `tribes/<tribeId>/…` and confirm accepts any prefix under the tribe, so a
  cover uploaded with `purpose: album-cover` can be confirmed into the tribe's media too. Avatars and
  covers still go through the existing multipart `/upload/*` routes per API.md §7.
- `Media` responses do not expose `publicId` (not in the contract); the DB has it for delete/confirm.
- Multipart rejections use 413 (not 400) so the app can key on the status as well as the code.
- Under `--webpack` (needed here because Turbopack refuses the worktree's symlinked `node_modules`),
  the `ws` package breaks when bundled (`bufferUtil.mask is not a function`) and every
  `getDbTransaction()` fails; verification ran with a temporary `serverExternalPackages: ['ws']` in
  `next.config.mjs`, reverted afterwards. Production builds use Turbopack and are unaffected, but it is
  worth knowing if anyone builds with webpack.

## 6. Verification (2026-09-22)

- **Typecheck**: `npx next typegen && npx tsc --noEmit` — 9 errors before and after, same files and
  codes; the pre-existing `lib/services/album.ts` `AlbumWithMedia` mismatch now mentions `blurhash`
  in its message (same root cause, `displayOrder`/`likeCount` extras).
- **Request matrix: 45 of 45** against `next dev` + Development as College Friends owner (`home15`),
  member (`home16`), non-member (`home5`), with real Cloudinary uploads (`verify.mjs` in the session
  scratchpad). All scratch assets, rows, the scratch album/post, the permission override and the
  temporary `max_media_file_size = 1` were removed/restored; Cloudinary folder `tribes/<tribeId>/` is
  empty afterwards.

| Case | Result |
|---|---|
| sign owner count=1 (purpose media) → 200, folder `tribes/<id>/media`, cloudName/apiKey/expiresAt | pass |
| sign owner count=3 for each of the 7 purposes → 200, 3 distinct publicIds, tribe folder | pass (×7) |
| sign count=0 / count=21 / purpose=video → 400 | pass (×3) |
| sign member with default perms → 200 | pass |
| sign / confirm member with `canUploadMedia=false` override → 403 `FORBIDDEN` | pass (×2) |
| sign / confirm non-member → 403; sign signed-out → 401 | pass (×3) |
| direct upload to Cloudinary with signed params → 200, `public_id` = folder/publicId | pass |
| same signature with a tampered folder → Cloudinary 401 Invalid Signature | pass |
| confirm 1 asset, `addToAlbum:false` → 201 Media with 28-char blurhash, no album_media row; DB row has public_id, blurhash, size, mime, dims | pass (×3) |
| confirm the same asset again → 400 `ALREADY_CONFIRMED` | pass |
| confirm 3 assets with altText into a new album → 201 ×3 with `albumId`, 3 album_media rows | pass (×2) |
| `GET /albums/{id}`, `GET /media?albumId`, `GET /media/public` carry `blurhash` | pass (×3) |
| create post with the confirmed media → `media[0].blurhash` and `image.blurhash`; `GET /posts` list too | pass (×2) |
| confirm public_id outside the tribe folder / with `..` → 400 `INVALID_PUBLIC_ID` index 0 | pass (×2) |
| confirm with bytes+1 / wrong format → 400 `ASSET_MISMATCH`; never-uploaded id → 400 `ASSET_NOT_FOUND` | pass (×3) |
| one good + one bad asset → 400 index=1, media count unchanged | pass |
| confirm into another tribe's album / unknown album → 400 `INVALID_ALBUM` | pass (×2) |
| tribe limit 1 MB, 1.3 MB asset → 413 `FILE_TOO_LARGE`, asset destroyed on Cloudinary | pass |
| multipart 1.3 MB file over 1 MB tribe limit → 413 `FILE_TOO_LARGE` | pass |
| multipart 5 MB body (`/media` and `/media/batch`) → 413 `PAYLOAD_TOO_LARGE` | pass (×2) |
| multipart small upload → 200; row has public_id + blurhash | pass |
| `DELETE /media/{id}` → 200, Cloudinary asset destroyed via public_id, row gone | pass |

Not covered: HEIC/AVIF confirm end to end (format allow-list only), the `/upload/*` avatar routes
(unchanged), and the Vercel 413 itself (documented behaviour, mirrored locally by the Content-Length gate).

## 7. Mobile contract flip (on merge)

In tribe-mobile:

- `openapi.yaml`: `signMediaUpload` and `confirmMediaUpload` → `x-status: existing`;
  `Media.blurhash`, `ImageRef.blurhash` → existing. Regenerate the client.
- `SignedUploadBatch.uploads[]`: `publicId` is the short id to send as `public_id`; the asset's full
  id is `${folder}/${publicId}`. Drop `eager` (never issued) or leave it optional. Add
  `description` that `expiresAt` = timestamp + 10 min.
- `confirmMediaUpload`: document `albumId` nullable/optional (null or absent = general album) and
  `addToAlbum` default `true`; add the 400 body `{ error, code, index? }` with codes `INVALID_ALBUM`,
  `INVALID_PUBLIC_ID`, `ALREADY_CONFIRMED`, `ASSET_NOT_FOUND`, `ASSET_MISMATCH`, `UNSUPPORTED_FORMAT`;
  413 `FILE_TOO_LARGE`; 403 `{ error, code: "FORBIDDEN" }`. Response is `201 { media: Media[] }` where
  each item also carries `likeCount: 0`, `commentCount: 0`, `isLiked: false`, `uploader`, `albumId`.
- `uploadMedia` / `uploadMediaBatch` (multipart): add `413 { error, code: "PAYLOAD_TOO_LARGE" | "FILE_TOO_LARGE", limitBytes? }`;
  `BatchUploadResult.failed[].code` optional. `UploadResult` unchanged.
- `ImageRef.blurhash` is `string` and omitted when unknown; `Media.blurhash` is `string | null`
  (already so).
- `contract/known-gaps.json`: close `signMediaUpload`, `ImageRef.blurhash`, `Media.blurhash`.
- `docs/api/API.md` §7: path 2 is no longer "proposed"; add the 4.5 MB multipart rule and "use path 2
  for anything that may exceed it". `DATA-MODEL-DELTA.md` §8: limit is enforced at confirm from
  Cloudinary-reported bytes (not by an upload preset). `ARCHITECTURE.md` §11 step 3/5: the routes are
  `POST /tribes/:id/media/sign` and `POST /tribes/:id/media/confirm`, and the confirm body is
  `ConfirmAsset[]` (publicId, url, width, height, bytes, format from Cloudinary's upload response).
