# TRI-197 · API · Media upload and reassignment accept an `albumId` from any tribe

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-23
Linear: https://linear.app/tribenetwork/issue/TRI-197
Branch: `anthonygayflor6/tri-197-api-media-upload-and-reassignment-accept-an-albumid-from`
Found while fixing TRI-152. Related: TRI-160 (`confirm` already checked the album), TRI-205 (album routes
already bind the album to the route's tribe), `createPost` (already checked `albumId` / `linkedAlbumId`).

---

## 1. The holes

A member of tribe A could file photos into an album of tribe B (any tribe, member or not) by supplying
B's album uuid, because three write paths took `albumId` from the request and inserted it into
`album_media` with no check that the album belongs to the tribe being written to:

| Route | Service | Before |
|---|---|---|
| `POST /tribes/{tid}/media` (multipart) | `uploadTribeMedia` | `albumId` inserted as given |
| `POST /tribes/{tid}/media/batch` (multipart) | `uploadTribeMediaBatch` | same, once per file |
| `PATCH /tribes/{tid}/media/{mid}` | `updateMediaAlbumAssignment` → `addMediaToAlbumJunction` | `albumId` inserted/updated as given; the media itself was not bound to `tid` either |

Note: the issue also names `PATCH /media/{media_id}`; `app/api/media/[media_id]/route.ts` only has
`DELETE`, so the reassignment route is the tribe-scoped `PATCH` above. `updateMedia` (alt text) does not
touch albums.

Audit of `lib/services/media.ts`, `album.ts` and `permissions.ts` for other request ids used without a
tribe check found one more hole of the same kind, fixed here:

- **`DELETE /tribes/{tid}/media/{mid}`** → `deleteMediaWithPermissions` → `canUserDeleteMedia(tid, user, mid)`
  loaded the media by id and resolved the caller's role/permissions in `tid`, but never compared
  `media.tribe_id` to `tid`. An owner/admin (or `canDeleteAnyMedia` holder) of tribe A could delete any
  media in tribe B (row and Cloudinary asset) through tribe A's URL.

Not holes (checked, unchanged): `POST …/albums/{aid}/media` (route binds the album to `tid`;
`addMultipleMediaToAlbum` requires every media id to be in the album's tribe), `DELETE …/albums/{aid}/media`
(only deletes the `(album, media)` junction row, so a foreign media id is a no-op), album `coverId` on
create and update (TRI-205 `assertCoverInTribe`), `POST …/media/confirm` (TRI-160), `createPost`.

Listed, not fixed (read-only or out of the album/media-write scope):

- `POST`/`DELETE /tribes/{tid}/media/{mid}/like`: membership is checked on `tid` but the media is not
  bound to it, so a member of A can like/unlike media in B by id. No data crosses tribes, but it is the
  same shape of gap.
- `GET /tribes/{tid}/albums/{aid}` and `GET /tribes/{tid}/media?albumId=` are already tribe-bound
  (TRI-201/TRI-205); nothing to do.

## 2. The fix

No schema change.

### One helper: `assertAlbumInTribe(albumId, tribeId)` in `lib/services/album.ts`

```ts
export class InvalidAlbumError extends Error { readonly code = "INVALID_ALBUM" as const; … }
export async function assertAlbumInTribe(albumId: unknown, tribeId: string): Promise<void>
```

- `null` / `undefined` → returns (the general library, as before).
- non-string or not a uuid → throws (checked first, so a malformed id is a 400 instead of a Postgres
  `invalid input syntax for type uuid` 500).
- otherwise one `select id from album where id = $1 and tribe_id = $2 limit 1`; no row → throws.

It replaces the two existing inline copies and is the only album-in-tribe check now:

| Caller | Tribe compared against | Notes |
|---|---|---|
| `uploadTribeMedia` | route `tid` | runs after the permission check and **before** the Cloudinary upload, so a bad album never creates an asset |
| `uploadTribeMediaBatch` | route `tid` | once, up front, before any file is uploaded (see decision below) |
| `updateMediaAlbumAssignment` | **the media's own `tribe_id`** | only when `addToAlbum` is true and `albumId` is set; media with no tribe (avatars) cannot be filed into any album |
| `confirmMediaUploads` (TRI-160) | route `tid` | was an inline query throwing `MediaUploadError("INVALID_ALBUM")`; now the helper. `"INVALID_ALBUM"` removed from `MediaUploadErrorCode` since nothing throws it there any more; the wire code is unchanged |
| `createPost` | route `tid` | was an inline `inArray` query throwing `PostInputError("INVALID_ALBUM")`; now two helper calls (`linkedAlbumId`, `albumId`). `"INVALID_ALBUM"` removed from `PostInputError`'s code union likewise |

Routes map `InvalidAlbumError` → **400 `{ error: "Album not found in this tribe", code: "INVALID_ALBUM" }`**:
`media/route.ts`, `media/batch/route.ts`, `media/[media_id]/route.ts`, `media/confirm/route.ts`,
`posts/route.ts`. That is the `{ error, code }` shape TRI-160 gave the multipart routes
(`FILE_TOO_LARGE`, `PAYLOAD_TOO_LARGE`) and the shape `confirm` and `createPost` already used for
`INVALID_ALBUM`, so the code and message are identical across all five routes.

### `PATCH /tribes/{tid}/media/{mid}` binds the media to the route tribe

Before touching anything the route loads the media: unknown → 404 `Media not found`; `media.tribe_id !== tid`
→ 403 `Media does not belong to this tribe` (the TRI-205 wording). The uploader-only rule in the
services is unchanged; the route check is what makes the membership check on `tid` meaningful.

### `canUserDeleteMedia` (the extra hole)

`lib/services/permissions.ts`: after loading member and media, `if (media.tribeId !== tribeId) return false`,
so the route answers its existing 403 `User does not have permission to delete this media` and nothing is
destroyed.

### Decisions

- **Batch fails the whole request up front.** The batch takes one `albumId` for every file, so an
  invalid album is a request error, not a per-file one: 400 `INVALID_ALBUM`, nothing uploaded, nothing
  in `failed[]`. Reporting it per file would mean uploading N assets to Cloudinary and then failing each
  insert, or duplicating the check per file; neither buys the client anything.
- **Check only when it would be used.** All three paths already ignore `albumId` when `addToAlbum` is
  false (no junction row is written), and `confirm` only checked when `addToAlbum && albumId`; the fix
  keeps that: `addToAlbum:false` + a foreign `albumId` on the multipart routes still succeeds into no
  album, and on `PATCH` still removes the media from all albums (matrix row 18d).
- **`PATCH` compares against the media's tribe, not the URL's.** The route now guarantees they are
  equal, but the service is called with the media id only, so it uses the row it already loaded.
- **Malformed ids are `INVALID_ALBUM`, not a separate validation error.** The multipart routes and the
  `PATCH` body have no zod schema for `albumId` (confirm and posts do, and there a malformed id is still
  their 400 `Validation failed`). Rather than add three schemas, the helper's uuid test makes a malformed
  id the same 400 as an unknown one; the caller cannot tell the difference and does not need to.
- **Cost.** One extra `select … limit 1` per upload/batch/reassign that names an album; `PATCH` adds one
  media read the route already did at the end (now done first).

## 3. Verification (2026-09-23)

- **Typecheck**: `npx next typegen && npx tsc --noEmit`: 9 errors on main (via `git stash`) and 9 on the
  branch, identical file/message set ignoring line numbers (`lib/services/album.ts` has one pre-existing
  error, TRI-201 spec §3, untouched).
- **Request matrix** against `next dev` on :3000 + Development. Caller `home16` (member of "College
  Friends" CF). Scratch rows by SQL: `home16` temporarily added as member of "Neighbors" (NB); albums
  `A_CF` (CF, created by `home15`), `A_NB` (NB), `A_FS` ("Family Squad" FS, which `home16` is not in);
  media `M_FS` (FS, uploaded by `home2`, no Cloudinary asset). `M1` is the media from row 2. Uploads are a
  1×1 PNG. Scripts: `matrix.sh`, `matrix2.sh`, `matrix3.sh` in the session scratchpad.

| # | Request (as home16 unless noted) | Expect | Result |
|---|---|---|---|
| 1 | `POST /tribes/CF/media` `addToAlbum=true albumId=A_CF` | 200; `album_media.album_id = A_CF` | pass |
| 2 | same, no `albumId` | 200; `album_media.album_id = null` (general) | pass |
| 3 | same, `albumId=A_NB` (other tribe, member) | 400 `INVALID_ALBUM`; no media row, no asset | pass |
| 4 | same, `albumId=A_FS` (other tribe, not member) | 400 `INVALID_ALBUM` | pass |
| 5 | same, unknown uuid | 400 `INVALID_ALBUM` | pass |
| 6 | same, `albumId=not-a-uuid` | 400 `INVALID_ALBUM` | pass |
| 7 | `POST /tribes/CF/media/batch` 2 files `albumId=A_CF` | 200, `totalUploaded: 2`, both in `A_CF` | pass |
| 8 | same, no `albumId` | 200, both general | pass |
| 9 | same, `albumId=A_NB` | 400 `INVALID_ALBUM`; no rows, no assets | pass |
| 10 | same, `albumId=A_FS` | 400 `INVALID_ALBUM` | pass |
| 11 | same, unknown uuid | 400 `INVALID_ALBUM` | pass |
| 12 | same, malformed | 400 `INVALID_ALBUM` | pass |
| 13 | `PATCH /tribes/CF/media/M1` `{albumId: A_CF}` | 200; junction → `A_CF` | pass |
| 14 | `{albumId: null}` | 200; junction → null (general) | pass |
| 15 | `{albumId: A_NB}` | 400 `INVALID_ALBUM`; junction unchanged | pass |
| 16 | `{albumId: A_FS}` | 400 `INVALID_ALBUM` | pass |
| 17 | unknown uuid | 400 `INVALID_ALBUM` | pass |
| 18 | `{albumId: "not-a-uuid"}` | 400 `INVALID_ALBUM` | pass |
| 18b | `{albumId: 123}` | 400 `INVALID_ALBUM` | pass |
| 18c | `{addToAlbum: true, albumId: A_NB}` | 400 `INVALID_ALBUM` | pass |
| 18d | `{addToAlbum: false, albumId: A_NB}` | 200; removed from all albums (albumId ignored, as before) | pass |
| 19 | `PATCH /tribes/CF/media/M_FS` (media in FS) | 403 `Media does not belong to this tribe` | pass |
| 20 | `PATCH /tribes/NB/media/M1` (media in CF via NB URL) | 403 `Media does not belong to this tribe` | pass |
| 20b | `PATCH /tribes/CF/media/<unknown>` | 404 `Media not found` | pass |
| 21 | `home15` (CF owner) `DELETE /tribes/CF/media/M_FS` | 403; `M_FS` still present | pass |
| 22 | `POST /tribes/CF/media/confirm` `albumId=A_FS` | 400 `INVALID_ALBUM` (before any asset check) | pass |
| 23 | same with `albumId=A_CF` and a bogus asset | 400 `ASSET_NOT_FOUND` (album passed, TRI-160 unchanged) | pass |
| 24 | `POST /tribes/CF/posts` `{albumId: A_FS}` | 400 `INVALID_ALBUM` | pass |
| 25 | `{linkedAlbumId: A_NB}` | 400 `INVALID_ALBUM` | pass |
| 26 | `{linkedAlbumId: A_CF}` | 201 | pass |
| DB | after rows 1–18d: exactly 6 media uploaded by home16 in CF this hour (rows 1, 2, 7×2, 8×2); junction rows on scratch albums = 3 (rows 1, 7×2), all on `A_CF`; `M_FS` present | as expected | pass |

Cleanup after the run: the 6 uploaded media deleted through `DELETE /tribes/CF/media/{id}` as home16
(200 each; `deleteMedia` destroys by `public_id`), then Cloudinary Admin API `resources_by_ids` on the 6
public ids → 0 remaining. SQL on Development: scratch post, 3 scratch albums, `M_FS`, and home16's
Neighbors membership deleted; verified 0 scratch albums/media/posts, 0 orphan `album_media`, home16 back
to 1 membership (CF), Family Squad back to its 3 pre-existing albums. Dev server stopped, port 3000 free.

## 4. Mobile contract

New documented 400 on three operations, same shape the mobile contract already has for `confirmMediaUpload`
and `createPost`. Suggested edits to tribe-mobile `docs/api/openapi.yaml` (to apply once the owner OKs
touching that repo):

- `uploadMedia` (`POST /tribes/{tribeId}/media`) and `uploadMediaBatch` (`POST /tribes/{tribeId}/media/batch`):
  add to `responses` a `'400'` whose schema is `{ error: string, code: "INVALID_ALBUM" }` with
  `description: albumId is not an album of tribeId (unknown, malformed, or another tribe's). null/absent = the general library. On batch this fails the whole request before any file is uploaded; it is not reported per file in failed[].`
  (alongside the existing `FILE_TOO_LARGE` 413 / `PAYLOAD_TOO_LARGE` from TRI-160).
- `updateMedia` (`PATCH /tribes/{tribeId}/media/{mediaId}`): add `'400'` `{ error, code: "INVALID_ALBUM" }`
  (`albumId` not an album of the media's tribe), `'403'` `Media does not belong to this tribe`, and `'404'`
  `Media not found`.
- `confirmMediaUpload` / `createPost`: no change; `INVALID_ALBUM` was already documented there and the
  message and shape are unchanged.
- MEDIA-12 upload sheet / M3 queue: the app only ever sends the current tribe's own album id, so no app
  code change; if it surfaces `code`, `INVALID_ALBUM` can map to "This album no longer exists" and fall
  back to the general library.
- `contract/known-gaps.json`: nothing to close (no proposed fields involved).
