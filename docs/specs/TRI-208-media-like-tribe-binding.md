# TRI-208 · API · Media like routes don't bind the media to the route's tribe

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-23
Linear: https://linear.app/tribenetwork/issue/TRI-208
Branch: `anthonygayflor6/tri-208-api-media-like-routes-dont-bind-the-media-to-the-routes`
Found by the TRI-197 audit (`docs/specs/TRI-197-album-tribe-check.md` §1, "Listed, not fixed").
Scope widened by the owner: every media-id route follows one rule, and all the sweep findings are fixed.

---

## 1. The hole

`GET`/`POST`/`DELETE /tribes/{tid}/media/{mid}/like` checked that the caller is a member of `tid`, then
called `hasUserLikedMedia` / `likeMedia` / `unlikeMedia` with `mid` alone. Nothing compared the media's
`tribe_id` to `tid`, so a member of tribe A could like, unlike, or check a like on any media in tribe B
(member of B or not) by id, through A's URL.

Severity is low: no content crosses tribes, only a `media_like` row and the like count B's members see.
But it is the same class of bug TRI-197 fixed for upload, `PATCH` and `DELETE`, and it let a caller probe
whether a media id exists (by inspection of main: a foreign id gave `201` on `POST`, an unknown one a
`500` FK error). A malformed id reached Postgres as a bad uuid cast, so every method answered `500`.

### Sweep (every route that takes a media id)

| Route | Before | Now |
|---|---|---|
| `GET/POST/DELETE /tribes/{tid}/media/{mid}/like` | media not bound to `tid`; malformed → 500 | **fixed**: 404 when not in `tid` / unknown / malformed |
| `POST …/like` on an already-liked media | 400 `Media already liked` | **fixed**: idempotent 201 with the current state |
| `DELETE …/like` | `{ message }`; not-liked was already a silent success | **fixed**: `{ success: true }`, idempotent |
| `PATCH /tribes/{tid}/media/{mid}` | TRI-197: 403 for another tribe's media; malformed → 500 | **fixed**: 404 |
| `DELETE /tribes/{tid}/media/{mid}` | TRI-197: 403 for another tribe's media (revealed existence); malformed → 500; no separate membership check | **fixed**: 403 non-member → 404 not in tribe → 403 not permitted; body gains `success: true` |
| `DELETE /media/{mid}` (uploader only, not tribe-scoped) | unknown → 404, malformed → 500 | **fixed**: malformed → 404; ownership rule unchanged |
| `POST /tribes/{tid}/albums/{aid}/media` `{ mediaIds }` | unknown or other-tribe id → 500 (`Some media items not found…` unmapped); malformed → 500 | **fixed**: 404 `Media not found` |
| `DELETE /tribes/{tid}/albums/{aid}/media` `{ mediaIds }` | malformed → 500; unknown → no-op 200 | **fixed**: malformed → 404; unknown stays a no-op 200 (it only deletes `(album, media)` junction rows, TRI-197 decision) |
| `PUT /tribes/{tid}/featured-media` `{ mediaId }` | zod: malformed → 400 `Validation failed`; `setFeaturedMedia` already binds to `tid` | unchanged (body field with existing zod validation) |
| `POST /tribes/{tid}/albums` `coverId`/`mediaIds`, `POST …/posts` `mediaIds`, `…/media/confirm` | zod-validated and tribe-bound (TRI-205, `createPost`, TRI-160) | unchanged |
| media comments | none exist (no table or route) | n/a |

Not changed, noted: a malformed **album** id in `/tribes/{tid}/albums/{aid}/media` still reaches Postgres
(album ids are outside this issue). The web app's `fetchMediaById` (`lib/api/media.ts`) calls
`GET /tribes/{tid}/media/{mid}`, which has no `GET` handler; pre-existing, not touched.

## 2. The fix

No schema change.

### Rule for every media-id route

| Step | Response |
|---|---|
| signed out | 401 `Unauthorized` |
| not a member of `{tid}` (tribe-scoped routes) | 403 `You are not a member of this tribe` |
| media id malformed, unknown, or not in `{tid}` | 404 `{ error: "Media not found" }` |
| media in `{tid}` but the caller may not do this (PATCH non-uploader, DELETE without delete rights, `/media/{mid}` non-uploader) | 403 (existing messages) |
| otherwise | the route's success |

A non-member gets 403 before any media lookup, so a 404 only ever tells a member of `tid` that the id
is not a media of `tid`, never whether it exists elsewhere.

### Helpers (`lib/services/media.ts`)

- **`getMediaInTribe(mediaId, tribeId): Promise<Media | null>`** (new): null when the id is not a uuid,
  else one `select … where id = $1 and tribe_id = $2 limit 1`. TRI-197 left no media-in-tribe helper
  (its `PATCH` check was inline and `canUserDeleteMedia` compares inside the permission check), so this
  is the one helper. Used by the three like methods, `PATCH` and `DELETE /tribes/{tid}/media/{mid}`.
  `canUserDeleteMedia`'s own tribe comparison stays as defence in depth.
- **`getMediaById`** now returns null for a non-uuid, so every caller (`DELETE /media/{mid}`, `PATCH`'s
  re-read, `deleteMedia`, `updateMediaAlbumAssignment`) treats a malformed id as not found.
- `UUID_PATTERN` is exported from `lib/services/album.ts` (TRI-197's `assertAlbumInTribe` regex) and shared,
  so there is one regex. The album-media route uses it to reject malformed `mediaIds` up front.
- **`likeMedia`** is idempotent: `insert … on conflict do nothing returning` on the existing
  `(media_id, user_id)` unique constraint, falling back to the existing row; returns
  `{ like, liked: true, likeCount }`. New helper `getMediaLikeCount`.
- **`unlikeMedia`** was already a plain delete (no error when not liked); only the route's body changed.

### Responses

| Route | Success body |
|---|---|
| `POST …/like` (new or already liked) | 201 `{ like: MediaLike, liked: true, likeCount: number }` (`like` kept for compatibility; on a repeat it is the existing row) |
| `DELETE …/like` (liked or not) | 200 `{ success: true }` |
| `GET …/like` | 200 `{ liked: boolean }` (unchanged) |
| `DELETE /tribes/{tid}/media/{mid}` | 200 `{ success: true, message: "Media deleted successfully" }` (`message` kept, `success` added) |
| `DELETE /media/{mid}` | 200 `{ success: true }` (unchanged) |

### Decisions

- **404, not 403, for another tribe's media**, on every route, so the answer never confirms the id exists
  elsewhere. TRI-197's `PATCH` 403 and `DELETE` 403 for a foreign media become 404. 403 is kept for "you
  are not a member" and for "in this tribe but not yours to change/delete".
- **Malformed ids are 404** (not 400) on path params, matching "unknown": these routes have no zod
  schema for the path, and a malformed id names no media any more than an unknown one does.
- **Idempotent like keeps 201** for both a new and a repeated like, so a client retry is indistinguishable
  from the first call. `likeCount` is the media's total after the call.
- **Web compatibility**: the web app has no caller of the media like routes (grep of `components`,
  `lib/api`, `lib/hooks`, `lib/query-options`, `app` outside `app/api`: only post/comment like calls), so
  no web code reads `message` from `DELETE …/like`; it returns `{ success: true }` only. The web media
  delete (`lib/api/upload.ts` `deleteMedia` → `DELETE /media/{mid}`) reads only `error` on failure, so the
  new 404 for a malformed id is compatible.

## 3. Verification (2026-09-23)

- **Typecheck**: `npx next typegen && npx tsc --noEmit`: 9 errors on main (via `git stash`) and 9 on the
  branch, identical file/message set ignoring line numbers. No new errors.
- **Request matrix** against `next dev` on :3000 + Development. Callers: `home16` (member of "College
  Friends" CF), `home15` (CF owner), `home2` (not in CF). Scratch rows by SQL: `home16` temporarily added
  to "Neighbors" (NB); media `M15` (CF, by home15), `M16A`/`M16B` (CF, by home16), `NBA`/`NBB` (NB, by
  home16), dummy `https://example.invalid/tri208/…` URLs, no Cloudinary asset; album `ALB` in CF created by
  home16. `MFS` is an existing "Family Squad" media (home16 not a member). Script: `full208.sh` in the
  session scratchpad.

**Likes** (`/tribes/CF/media/{id}/like`, as home16 unless noted)

| # | Case | GET | POST | DELETE |
|---|---|---|---|---|
| L1 | own-tribe media `M15` | 200 `{liked:false}` / after POST `{liked:true}` | 201 `{like, liked:true, likeCount:1}` | 200 `{success:true}` |
| L1b | repeat | – | 201, same `like.id`, `likeCount:1` (idempotent) | 200 `{success:true}` (idempotent), then GET `{liked:false}` |
| L1c | home15 also likes | – | 201 `likeCount:2` | – |
| L2 | `NBA` (other tribe, member) via CF URL | 404 | 404, no row written | 404 |
| L3 | `MFS` (tribe not in) | 404 | 404 | 404 |
| L4 | unknown uuid | 404 | 404 | 404 |
| L5 | `not-a-uuid` | 404 | 404 | 404 |
| L6 | non-member home2 | 403 | 403 | 403 |
| L7 | signed out | 401 | 401 | 401 |
| L8 | like `NBA` via NB URL, `DELETE` via CF URL, `GET` via NB URL | – | 201 | 404, then GET `{liked:true}`: the like survived |

**`PATCH /tribes/{tid}/media/{mid}`** `{ altText }`: P1 `NBA` via NB (uploader) 200, alt text saved ·
P2 `NBA` via CF 404 (was 403) · P3 `MFS` 404 (was 403) · P4 unknown 404 · P5 malformed 404 (was 500) ·
P6 non-member 403 · P7 signed out 401 · P8 `M15` as home16 (in tribe, not uploader) 403
`User does not have permission to update this media`, alt text unchanged. All pass.

**`DELETE /tribes/{tid}/media/{mid}`**: D1 non-member home2 403 `You are not a member of this tribe` ·
D2 signed out 401 · D3 `NBB` via CF 404, row kept · D4 `MFS` 404 · D5 `MFS` as CF owner home15 404 (was
403) · D6 unknown 404 · D7 malformed 404 (was 500) · D8 `M15` as home16 (in tribe, no delete right) 403
`User does not have permission to delete this media` · D9 own `M16A` 200 · D10 `NBB` via NB 200; a later
run confirmed the body `{ success: true, message: "Media deleted successfully" }`. All pass.

**`DELETE /media/{mid}`**: O1 signed out 401 · O2 unknown 404 · O3 malformed 404 (was 500) · O4 `M15`
as home16 (not uploader) 403 · O5 own `M16B` 200 `{success:true}` · O6 repeat 404. All pass.

**`/tribes/CF/albums/ALB/media`**: A1 add `[M15]` 200 · A2 add `[NBA]` 404 (was 500) · A3 add `[MFS]`
404 (was 500) · A4 add `[unknown]` 404 (was 500) · A5 add `[M15, "not-a-uuid"]` 404 (was 500), nothing
added · A6 non-member 403 · A7 signed out 401 · A8 remove `["not-a-uuid"]` 404 (was 500) · A9 remove
`[unknown]` 200 no-op · A10 remove `[M15]` 200. All pass.

Cleanup after the run: SQL on Development deleted the scratch album and its `album_media` rows, every
`example.invalid/tri208` media, and home16's Neighbors membership (likes had already been removed through
the API). Verified back at baseline: 44 media, 19 `album_media` rows, 0 `media_like` rows, 0 scratch
albums, `home16` in 1 tribe (CF), `MFS` still present. Dev server stopped, port 3000 free.

## 4. Mobile contract

tribe-mobile `docs/api/openapi.yaml` today documents only the success response for the like operations
(**no 404**, and no 401/403 either), and `Forbidden`-only errors for the two deletes. Exact edits (to
apply once the owner OKs touching that repo; `Error`, `Success`, `Unauthorized`, `Forbidden`, `NotFound`
are existing components):

- **`getMediaLiked`** (`GET /tribes/{tribeId}/media/{mediaId}/like`): keep `'200'` `{ liked: boolean }`; add
  `'401': { $ref: Unauthorized }`, `'403': { $ref: Forbidden }` (not a member of `tribeId`),
  `'404': { description: "Media not found: mediaId is not a media of tribeId (unknown, malformed, or another tribe's)", content: Error }`.
- **`likeMedia`** (`POST …/like`): replace `'201': { description: Created }` with
  `'201': { description: "Liked. Idempotent: liking an already-liked media returns 201 with the existing like and the current count", content: { application/json: { schema: { type: object, required: [like, liked, likeCount], properties: { like: { type: object, properties: { id: uuid, mediaId: uuid, userId: string, createdAt: date-time } }, liked: { type: boolean, enum: [true] }, likeCount: { type: integer } } } } } }`;
  add `'401'`, `'403'`, `'404'` as above. (The old `400 Media already liked` is gone.)
- **`unlikeMedia`** (`DELETE …/like`): keep `'200': { $ref: Success }` and set its description to
  "Unliked. Idempotent: unliking a media that isn't liked also returns 200 `{ success: true }`"; add
  `'401'`, `'403'`, `'404'` as above.
- **`updateMedia`** (`PATCH /tribes/{tribeId}/media/{mediaId}`): change `'403'` description to
  "Not a member of tribeId, or not the uploader"; change `'404'` description to "Media not found: mediaId
  is not a media of tribeId (unknown, malformed, or another tribe's)". Keep `'200'` and `'400' InvalidAlbum`.
  This replaces the queued TRI-197 note that proposed a 403 for another tribe's media.
- **`deleteMedia`** (`DELETE /tribes/{tribeId}/media/{mediaId}`): keep `'200': { $ref: Success }` (body is
  now `{ success: true, message }`); set `'403'` description to "Not a member of tribeId, or no permission
  to delete this media"; add `'401': { $ref: Unauthorized }` and `'404'` with the same "Media not found"
  description as above.
- **`deleteOwnMedia`** (`DELETE /media/{mediaId}`): keep `'200': { $ref: Success }`; set `'403'` description
  to "Not the uploader"; add `'401': { $ref: Unauthorized }` and
  `'404': { description: "Media not found (unknown or malformed id)", content: Error }`.
- Optional, same rule: `addMediaToAlbum` add `'404'` "Media not found: a mediaIds entry is malformed, unknown
  or another tribe's" and `removeMediaFromAlbum` add `'404'` "a mediaIds entry is malformed" (unknown ids are
  a no-op 200).
- App impact: none expected. The mobile adapters ignore these success bodies and only like media they
  listed from the same tribe; a 404 means the media was deleted meanwhile (drop the like state and
  refresh). A double-tap like no longer errors.
- `contract/known-gaps.json`: nothing to close.
