# TRI-201 · API · Album detail: `media.isNew` and album contributors

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-22
Linear: https://linear.app/tribenetwork/issue/TRI-201
Branch: `anthonygayflor6/tri-201-api-album-detail-mediaisnew-and-albumcontributors`
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §4 (`lastAlbumVisitAt`) and §8 last bullet, `docs/api/openapi.yaml`
(`Media.isNew`, `Album.contributors`, `Album.contributorCount`, `getAlbum` `x-status: changed`, `listAlbums`).
Unblocks: MEDIA-02 album detail ("NEW TODAY" group, contributor avatars) and the MEDIA-01 albums strip.

---

## 1. What landed

| Route | Change |
|---|---|
| `GET /tribes/{tid}/albums/{aid}` | every `media[]` item carries `isNew` and `uploader` (UserPreview); the album carries `contributors` (≤ 3 UserPreview, most recent contribution first) and `contributorCount` (distinct uploaders). The caller's visit is stamped. |
| `GET /tribes/{tid}/albums` | every album carries `contributorCount` and `contributors` (same shape). No `isNew` (no media in the list). |
| `POST /tribes/{tid}/albums` (201) | same album shape as GET, `isNew` false throughout, no visit stamp. |

Schema: `tribe_member_preference.last_album_visit_at jsonb` (nullable), `{ [albumId]: ISO-8601 }` per member,
as DATA-MODEL-DELTA §4 specifies. Migration `lib/database/migrations/tri201-album-visits.sql`
(re-runnable, `ADD COLUMN IF NOT EXISTS`). **Applied to Development only**; run on Production at merge time.

Code: `lib/services/album.ts` (`getAlbumById(albumId, { viewerId, tribeId })`, `getAlbumsByTribe`),
`lib/database/schemas/tribe.ts`, `lib/database/types.ts` (`AlbumMediaItem`, `AlbumContributors`),
`app/api/tribes/[tribe_id]/albums/[album_id]/route.ts` (passes the caller and tribe id).

### Response examples

`GET /tribes/{tid}/albums/{aid}` (a member's second visit after another member added one photo):

```json
{
  "album": {
    "id": "355941fd-…", "tribeId": "91178263-…", "name": "Spring trip", "privacy": "public",
    "createdBy": "46c521b7-…", "creator": { "id": "46c521b7-…", "name": "Emma Davis", "image": null },
    "coverId": null, "coverUrl": null, "photoCount": 4,
    "contributorCount": 2,
    "contributors": [
      { "id": "474e7ddf-…", "name": "Lisa Park", "image": null },
      { "id": "46c521b7-…", "name": "Emma Davis", "image": null }
    ],
    "media": [
      { "id": "8d64ece4-…", "uploadedBy": "46c521b7-…", "uploader": { "id": "46c521b7-…", "name": "Emma Davis", "image": null },
        "fileUrl": "https://…/1.jpg", "fileType": "image", "likeCount": 0, "displayOrder": 0, "isNew": false, "…": "…" },
      { "id": "499fab1c-…", "uploadedBy": "474e7ddf-…", "uploader": { "id": "474e7ddf-…", "name": "Lisa Park", "image": null },
        "fileUrl": "https://…/2.jpg", "fileType": "image", "likeCount": 0, "displayOrder": 0, "isNew": true, "…": "…" }
    ],
    "tribe": { "…": "…" }, "createdAt": "…", "updatedAt": "…"
  }
}
```

Empty album: `"media": [], "photoCount": 0, "contributors": [], "contributorCount": 0`.

`GET /tribes/{tid}/albums` item: the `Album` fields above with `"media": []`, `photoCount`, `contributorCount`
and `contributors`; no `isNew`.

## 2. Decisions

- **What "added" means.** `isNew` compares `album_media.added_at` (when the item entered *this album*),
  not `media.created_at`: an old upload added to the album yesterday is new to the album. Contributors are
  ordered by each uploader's latest `added_at` too, and `uploader`/`contributors` are `media.uploaded_by`
  (who took the photo), not `album_media.added_by` (who filed it).
- **First visit = the last 24 hours.** With no stamp for this album (or an unreadable one) the cut-off is
  `now − 24 h`, so "NEW TODAY" on a first open means what it says instead of flagging the whole album.
- **Compute, then stamp.** `isNew` is computed against the *previous* stamp and the visit is stamped after,
  so the response that carries the new items is the one that clears them: the next GET shows them as seen.
  A client that refetches on pull-to-refresh will lose the "NEW TODAY" group on that refetch; if MEDIA-02
  wants it to persist for the screen's lifetime it should keep the first response's flags in state rather
  than re-derive from a refetch. The stamp is `new Date().toISOString()` written server side.
- **One write, merged.** The stamp is one `UPDATE … SET last_album_visit_at = COALESCE(col, '{}') || {aid: ts}`
  on the member's preference row (jsonb concat, so two albums opened at once in the same tribe do not
  clobber each other), or one `INSERT` when the member has no preference row yet. No transaction needed on
  the neon-http driver.
- **Who gets stamped.** Only when the caller is a member of the album's tribe *and* the route's `tribe_id` is
  the album's tribe (`GetAlbumOptions.tribeId`); a mismatch is the existing 403 and nothing is marked or
  written. Internal callers of `getAlbumById` (create, add/remove media) pass no viewer: `isNew` false, no stamp.
- **List contributors in one query.** `listAlbums` adds `count(distinct media.uploaded_by)` to the existing
  per-album count subquery and fetches the top 3 uploaders for the page's album ids with one grouped
  window query (`ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY MAX(added_at) DESC)`, keep rank ≤ 3).
  Both counts are cast `::int` so they arrive as numbers.
- Album GET is 4 statements for a viewer (album, media, membership+preference, stamp), 2 otherwise.

## 3. Verification (2026-09-22)

- **Migration**: `node lib/database/migrations/run-sql.mjs lib/database/migrations/tri201-album-visits.sql
  --endpoint ep-divine-term-ahpw8jvi` → Done; `information_schema` shows `last_album_visit_at jsonb`.
  Not run on Production.
- **Typecheck**: `npx next typegen && npx tsc --noEmit` — 9 errors before and after, same files and counts.
  The one in `lib/services/album.ts` (`getAlbumById` return vs `AlbumWithMedia`: the `tribe` sub-select lacks
  `banner`/`color`/`inviteCode`/`inviteCodeExpiresAt`) predates this branch and is untouched.
- **Request matrix** against `next dev` + Development as the College Friends owner (`home15`, "Emma Davis"),
  a member (`home16`, "Lisa Park") and a non-member (`home2`), on scratch media rows and two scratch albums
  deleted afterwards, visit stamps reset to null (`tri201-verify.sh`, `tri201-verify2.sh` in the session
  scratchpad):

| # | Request | Expect | Result |
|---|---|---|---|
| 1 | owner `POST /albums` with 2 photos by home15 + 1 by home16 | 201; `contributors` [Emma, Lisa], `contributorCount` 2, `isNew` false ×3 | pass |
| 2 | owner `POST /albums` with no media | 201; `contributors` [], `contributorCount` 0, `photoCount` 0 | pass |
| 3 | owner `GET` album, first visit | 200; all 3 `isNew` true (added within 24 h), contributors as above, each item has `uploader` | pass |
| 4 | owner `GET` again | all `isNew` false | pass |
| 5 | member `GET`, member's first visit | all `isNew` true (own stamp, independent of the owner's) | pass |
| 6 | member `GET` again | all `isNew` false | pass |
| 7 | owner `POST …/media` adds a 4th photo (uploaded by home16) between visits | 200 | pass |
| 8 | owner `GET` | only the 4th item `isNew` true; `contributors` now [Lisa, Emma] (most recent first); count 2 | pass |
| 9 | member `GET` | 4th item `isNew` true for the member too (their stamp predates the add) | pass |
| 10 | owner `GET` again | 4th item `isNew` false | pass |
| 11 | non-member `GET` album under College Friends | 403 | pass |
| 12 | signed out `GET` | 401 | pass |
| 13 | owner `GET` empty album | `media` [], `contributors` [], `contributorCount` 0, `photoCount` 0 | pass |
| 14 | owner `GET /albums` | both albums carry `contributorCount` (2 / 0) and `contributors` ([Lisa, Emma] / []), numbers not strings | pass |
| 15 | DB: `last_album_visit_at` after the above | home15 `{scratch: ts, empty: ts}`, home16 `{scratch: ts}` | pass |
| 16 | member of another tribe, that tribe's id + this album's id | 403 "Album does not belong to this tribe", no stamp written | pass |
| 17 | owner `GET` unknown album id | 404 | pass |
| 18 | re-run after the tribe-mismatch guard: first/second visit true→false, both 403 cases | as above | pass |

Observed on the way, not changed: `POST …/albums/{aid}/media` as a plain member returns 403 unless the
member created the album or holds `canUserCreateAlbums` (existing rule in `addMultipleMediaToAlbum`), so
step 7 was done by the owner adding a photo the member had uploaded.

## 4. On merge · mobile contract flip

Run `tri201-album-visits.sql` on Production before deploying. Then in tribe-mobile `docs/api/openapi.yaml`:

- `Media.isNew`: `x-status: proposed` → `existing` (album GET only; other media listings do not send it).
- `Album.contributors` and `Album.contributorCount`: `proposed` → `existing`, returned by `getAlbum`,
  `listAlbums` and `createAlbum`.
- `getAlbum`: `x-status: changed` → `existing`, drop the `x-delta`.
- `Media.uploader` is now populated on album GET items (already declared).
- `contract/known-gaps.json`: close the MEDIA-02 "new today" / contributors entries if present.
- Note for MEDIA-02: the first visit rule (24 h) and that the GET that returns `isNew: true` also clears it.
