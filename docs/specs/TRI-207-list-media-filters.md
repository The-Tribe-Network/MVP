# TRI-207 · API · `listMedia` filters and sort for All Photos (`uploadedBy`, `from`/`to`, `sort`, `total`)

Status: implemented on the branch (with the owner-approved dedupe), verified against Neon `Development`, uncommitted · 2026-09-23
Linear: https://linear.app/tribenetwork/issue/TRI-207
Branch: `anthonygayflor6/tri-207-api-listmedia-filters-and-sort-for-all-photos-uploadedby`
For the mobile All Photos screen (MEDIA-14) and its filter sheet (MEDIA-15). Related: TRI-197 / TRI-205 (album
binding), TRI-160 (signed upload), TRI-201 (album `isNew`).

---

## 1. Before

`GET /tribes/{tribeId}/media` (`app/api/tribes/[tribe_id]/media/route.ts` → `getMediaByTribe` in
`lib/services/media.ts`) took `albumId` (uuid, or the literal `null` for the general library), `type`, `limit`
(default 50) and `offset` (default 0), all read with `searchParams.get` / `parseInt` and no validation, and
returned `{ media: Media[] }`:

- Rows were **`album_media` rows** joined to `media` (one per media per album, or one for the general library):
  `id` was `album_media.id` and `mediaId` the media, so a photo filed in two albums was listed twice when no
  `albumId` was given. Media never filed (avatars, banners) is not listed; that part is unchanged.
- Order was `album_media.added_at desc` with no tie-break, so offset paging could skip or repeat rows that
  share a timestamp.
- `likeCount` / `commentCount` came from `LEFT JOIN media_like` and `LEFT JOIN comment` (on `media.post_id`),
  `GROUP BY` and `count(DISTINCT …)`: the join fans out likes × comments before grouping.
- A malformed `albumId`, an unknown `type` or `limit=abc` reached Postgres/drizzle unvalidated (a 500 or a
  `NaN` limit).
- `media` had no index on `tribe_id` at all, and `comment` none on `post_id`.

There is only one query path: the general library (`albumId=null`) and album-scoped listings are the same
query with a different `album_media.album_id` condition, so every filter applies to all of them.

## 2. The change

### Parameters (all optional)

| Param | Format | Semantics |
|---|---|---|
| `albumId` | uuid, or `null` | unchanged: one album / the general library (`album_media.album_id is null`) |
| `type` | `image` \| `video` \| `document` | unchanged |
| `uploadedBy` | comma-separated user uuids; the param may also be repeated (values are joined) | `media.uploaded_by IN (…)`. Case-insensitive, deduplicated, 1–100 ids. Ids of users not in the tribe (or not existing) simply match nothing |
| `from` | ISO date `YYYY-MM-DD` or date-time with `Z` / offset | **inclusive** lower bound on `media.created_at`. A date means 00:00 UTC that day |
| `to` | same | **exclusive** upper bound on `media.created_at` for a date-time; a date means **through the end of that day** (UTC), i.e. `< next day 00:00 UTC` |
| `sort` | `newest` (default) \| `oldest` \| `popular` | see below |
| `limit` | integer 1–200, default 50 | page size |
| `offset` | integer ≥ 0, default 0 | rows to skip |

Empty values (`?albumId=`, `?sort=`) count as absent, as `albumId=` did before.

### Validation

zod schema `mediaListQuerySchema` in `lib/validations/media.ts` (+ `mediaListQueryInput(searchParams)`), run by
the route **after** auth (401) and membership (403). Any failure →
**400 `{ error, code: "INVALID_QUERY", details }`**, where `error` names the first bad param
(e.g. ``Invalid query parameter `sort`: Invalid enum value…``) and `details` is zod's `flatten()` (the same
`details` the members/agenda routes return). 400 cases:

- `sort` not one of the three values; `type` not an enum value (was a 500).
- `albumId` neither `null` nor a uuid (was a Postgres 500).
- any `uploadedBy` item not a uuid, including an empty item (`a,`), or more than 100 ids.
- `from` / `to` not a real ISO date (`2026-13-45`, `yesterday`), or a date-time **without** a zone
  (`2026-09-05T12:00:00` is ambiguous, rejected).
- the window is empty or inverted: `from` must be strictly before the effective `to` bound. So
  `from=2026-09-10&to=2026-09-01` is a 400, `from=2026-09-05&to=2026-09-05` is that one day (200), and equal
  date-times (`from=X&to=X`, an empty window) are a 400.
- `limit` outside 1–200 or not an integer (`abc` was a `NaN` before); `offset` < 0.

### One row per photo (dedupe, owner-approved)

The listing is now **one row per photo** (`media.id`), whatever the album filter:

- no `albumId`: every photo of the tribe that has at least one `album_media` row (general library or any album),
  once. A photo in the general library and two albums appears once.
- `albumId=<uuid>` / `albumId=null`: the photos with a row in that album / in the general library. Unchanged in
  practice (`unique(album_id, media_id)` already made a photo appear once per album; the general library has no
  such constraint since `album_id` is null, so a stray duplicate general row would now also collapse to one).

Each row reports **one** `album_media` row, deterministically: the earliest by `(added_at, id)` among the rows
the album filter allows. With `albumId` set that is the row in that album; with no `albumId` it is usually the
general-library row the upload created.

What a row's fields hold now:

| Field | Value |
|---|---|
| `id` | **the media id** (`media.id`). Was `album_media.id`. |
| `mediaId` | the media id (unchanged; now always equal to `id`, kept for the web client, which reads `mediaId`) |
| `albumId` | `album_id` of the reported row: `null` = general library |
| `addedAt` | `added_at` of the reported row |

**Why `id` changed.** The contract's `Media.id` is the photo id, and tribe-mobile uses it that way.
`src/api/media.ts` passes `item.id` straight into `like` / `unlike` / `liked` / `delete` (`/tribes/{tid}/media/{mediaId}…`).
The mock and its tests key tiles and the viewer on `item.id`, and `getAlbum` items already return
`id = media.id` (`lib/services/album.ts`). So with `id = album_media.id`, a like or delete from the All Photos
grid would have hit a 404. On the web, `select-post-media.tsx` also sent `selectedMedia.id` as a media id, so it
had the same bug. The one web caller that needs the media id (`media-select-dialog.tsx`) reads `mediaId`, which
is unchanged. Nothing reads the `album_media` row id. The `MediaWithAlbumInfo.mediaId` comment in
`lib/database/types.ts` wrongly said "junction table ID"; it is corrected.

### Sort semantics and tie-breaks

`media.id` is unique per row, so every order ends in it and is total: offset paging over an unchanged dataset
has no duplicates or gaps.

| `sort` | ORDER BY |
|---|---|
| `newest` | `media.created_at desc, media.id desc` |
| `oldest` | `media.created_at asc, media.id asc` |
| `popular` | `likeCount desc, media.created_at desc, media.id desc` |

`likeCount` = rows in `media_like` for the media (same value the response returns).

**Decision (owner-approved): `newest` orders by `media.created_at`, not `album_media.added_at`.** The date
filters are on `media.created_at`, and the issue describes `popular` with a `created_at` tie-break. Sorting and
filtering on the same column keeps the All Photos grid consistent: a photo's position matches its date bucket.
In practice the order barely changes. Upload paths insert the `album_media` row together with the media, and
moving a photo between albums (`addMediaToAlbumJunction`) updates `album_id` but keeps `added_at`.
`getAlbum` (album detail, `isNew`) is a different query and is untouched.

### Response

```json
{ "media": [Media, …], "total": 30, "hasMore": true }
```

- `media`: same shape and fields (`id`, `mediaId`, `albumId`, `addedAt`, `uploader`, `likeCount`,
  `commentCount`, …). The values of `id` / `albumId` / `addedAt` are as described above.
- `total`: **distinct photos** matching the same filters, ignoring `sort` / `limit` / `offset`. It is one
  `COUNT(*)` over `media` with the same conditions plus the same `EXISTS` (`countMediaByTribe`), run in parallel
  with the page query. With no `albumId`, a photo filed in several albums counts once.
- `hasMore`: `offset + media.length < total`.

Existing callers that send no new params get the same photos plus the two new keys. The only differences:
photos filed in several albums now appear once, and `id` is the media id.

### Service changes (`lib/services/media.ts`)

- `MediaFilters` gains `uploadedBy`, `createdFrom` (inclusive), `createdBefore` (exclusive), `sort`.
- `mediaListConditions(tribeId, filters)`: the `media` conditions shared by the page and the count.
- `albumMediaOfMedia(albumId)` / `isFiled(albumId)`: the correlated `album_media` condition (all rows, one
  album, or general) and the `EXISTS` built on it, shared by the page and the count.
- `getMediaByTribe`: `FROM media LEFT JOIN user WHERE <conditions> AND EXISTS(album_media …)`.
  - `albumId` / `addedAt` are scalar subqueries picking the earliest allowed row (`ORDER BY added_at, id LIMIT 1`).
  - `likeCount` / `commentCount` are correlated `count(*)` subqueries, replacing the fan-out join + `GROUP BY`.
    They return the same values.
- `countMediaByTribe(tribeId, filters)`: new.

A `DISTINCT ON` subquery or a `LATERAL` join would also have worked. The lateral version was measured and
rejected: see §4.

### `/media/public`

`GET /tribes/{tribeId}/media/public` calls `getMediaByTribe(tid, { limit, offset })`, so it gets the same dedupe
(one row per photo, `id` = media id), the `newest` order with the tie-break and the cheaper counts. Its params
and `{ media }` response are unchanged (no `total`; it is not the All Photos endpoint). Verified in the matrix
(rows D4, 22).

## 3. Index / migration

`lib/database/migrations/tri207-media-list-indexes.sql` (hand-written, re-runnable, indexes only, safe before
or after the code), mirrored in the drizzle schemas:

- `idx_media_tribe_created` on `media (tribe_id, created_at, id)`: `schemas/media.ts`. This is exactly the
  sort key of `newest` / `oldest` within a tribe, now that the listing is driven from `media`.
- `idx_comment_post_id` on `comment (post_id)`: `schemas/post.ts`. Needed because `commentCount` is a
  per-row lookup; without it each listed row with a `post_id` would scan `comment`.

The dedupe needs no new index: the `EXISTS` and the row pick use the existing `idx_album_media_media_id`.

**Applied to Development only** (`ep-divine-term-ahpw8jvi`, run twice to confirm re-runnability). Production
(`ep-sweet-smoke-ah2qfclb`) is not touched: run it there at merge time:

```
node lib/database/migrations/run-sql.mjs lib/database/migrations/tri207-media-list-indexes.sql --endpoint ep-sweet-smoke-ah2qfclb
```

## 4. Performance (EXPLAIN ANALYZE on Development)

Scratch load: 20,000 media in College Friends + 30,000 in Family Squad, all removed afterwards. For the dedupe
runs, 4,997 of the College Friends photos were also filed in a scratch album (55,016 `album_media`, ~150k
`media_like`). Page of 50, no filters unless noted, 3 runs each.

Before the dedupe (album_media-driven listing), before vs after the indexes:

| Query | Before indexes | After |
|---|---|---|
| `newest`, offset 0 | 17 ms: parallel seq scan of all `media` + sort | 1.2 ms: backward scan of `idx_media_tribe_created` |
| `newest`, offset 5000 | 105 ms | 87 ms (deep offsets are linear) |
| `popular` | 122 ms | ~112 ms |
| `total` (COUNT) | 21 ms | 19 ms |
| combined (image, general, 2 uploaders, one month) | 8 ms | 3.8 ms: bitmap scan on `idx_media_tribe_created` |

Dedupe (indexes in place), the two shapes tried:

| Query | `LATERAL` pick (rejected) | Shipped: `EXISTS` + scalar-subquery pick |
|---|---|---|
| `newest` | 1.1–1.2 ms | **1.2–1.4 ms**: backward scan of `idx_media_tribe_created`, nested-loop semi join into `idx_album_media_media_id`, stops after 50 photos; row pick and counts run 50 times |
| `popular` | 186–207 ms: lateral pick ran for all 20,000 photos before the sort | **~110 ms**: hash semi join, like count for 20,000 photos (index-only scan of `media_like_media_id_user_id_unique`), top-N heapsort; row pick runs only for the 50 returned |
| `total` (COUNT … EXISTS) | 21 ms | 21 ms: hash semi join `media` ⋈ `album_media` |

End to end through `next dev` (sign-in cookie, membership check, page + count over the Neon HTTP driver),
20k-photo tribe: `newest` ~170 ms, `popular` ~270 ms, warm. Both responses held 50 unique ids with
`id == mediaId`, and `total` was 20,000 (not the 25,000 `album_media` rows).

- For `newest` / `oldest`, Postgres evaluates the select-list subqueries (row pick, like and comment counts)
  only for the returned rows.
- `popular` has to count likes for every filtered photo before it can sort. The correlated count beat a
  pre-aggregated join (`LEFT JOIN (SELECT media_id, count(*) … GROUP BY media_id)`) 5 runs out of 5
  (~112 ms vs ~164 ms). Realistic tribes (hundreds to a few thousand photos) take a few ms. If a tribe ever
  reaches tens of thousands, the next step is a denormalised `media.like_count`.
- `uploadedBy` and `type` are applied as filters on the index range; they don't need their own index at tribe scale.

## 5. Verification (2026-09-23)

- **Typecheck**: `npx next typegen && npx tsc --noEmit` gives 9 errors on main (via `git stash`) and the same 9
  on the branch, in the same files with the same codes and messages. The only difference is the order a union
  prints in; none of the errors are in the changed code.
- **Request matrix** against `next dev` on :3000 + Development, as caller `home16` (member of College Friends,
  CF) unless noted. Scratch data, inserted by SQL in CF:
  - albums `A` (by home15) and `B` (by home16);
  - 30 media `M01…M30`: the uploader cycles home15/16/17, every 5th is a video, and
    `created_at = 2026-09-01 12:00 + floor(g/2) days`, so pairs share a timestamp to exercise ties;
  - every 4th media is in `A` and the rest are general;
  - `M01` is also filed in `A` **and** `B`, so it has a general row plus two album rows;
  - `g % 4` likes each, to create like-count ties.

  The script computes the expected results independently from that recipe (`matrix.mjs` in the session
  scratchpad). The final run is after the dedupe.

| # | Request (`GET /tribes/CF/media…`) | Expect | Result |
|---|---|---|---|
| 1 | no params (existing caller) | 30 photos newest-first, `total: 30`, `hasMore: false`; every row `id == mediaId`, ids unique | pass |
| 1b | response keys | exactly `media,total,hasMore`; `likeCount`/`commentCount` numbers; `uploader` present | pass |
| 2 | `albumId=null` | 23 general photos | pass |
| 3 | `albumId=A` | 8 photos | pass |
| 4 | `type=video` | 6 | pass |
| 5 | `uploadedBy=home15` | 10 | pass |
| 6 | `uploadedBy=home15,home17` | 20 | pass |
| 6b | `uploadedBy=home15&uploadedBy=home17` | 20 | pass |
| 6c | `uploadedBy=HOME15-UPPER,home15` | 10 (case-insensitive, deduped) | pass |
| 7 | `uploadedBy=home2` (not in tribe) | 200, `[]`, `total: 0` | pass |
| 8 | `from=2026-09-05` | 23 (inclusive from midnight UTC) | pass |
| 9 | `to=2026-09-05` | 9 (through the end of 09-05; M01 once) | pass |
| 10 | `from=…05T12:00Z&to=…07T12:00Z` | 4 (from inclusive, to exclusive) | pass |
| 11 | `from=…05T08:00:00-04:00&to=…05T08:00:01-04:00` | 2 (offsets honoured) | pass |
| 12 | `from=2026-09-05&to=2026-09-05` | 2 (that day) | pass |
| 13 | `sort=oldest` | 30, ascending, exact order | pass |
| 14 | `sort=popular` | likes desc, ties by `created_at` desc then `media.id` desc, exact order | pass |
| 14b | popular `likeCount` | non-increasing and equal to the seeded counts | pass |
| 15 | `type=image&albumId=null&uploadedBy=h15,h16&from=2026-09-03&to=2026-09-12&sort=popular` | 8, exact order | pass |
| 15b | `type=image&albumId=A&uploadedBy=h15,h16,h17&from=2026-09-01&sort=oldest` | 7, exact order | pass |
| 16 | pages of 7 joined together, for `newest`, `oldest`, `popular` | 30 rows, 30 unique ids, exact order, `hasMore` right on every page | pass ×3 |
| 16f | pages of 3 over `uploadedBy=h16&type=image&sort=popular` | exact order, `hasMore` right | pass |
| 17 | `limit=5&offset=100` | `[]`, `total: 30`, `hasMore: false` | pass |
| D1 | no `albumId` (limit 200) | `M01` (general + A + B) appears **once**, reporting its earliest row (`albumId: null`); `total: 30` distinct photos (32 `album_media` rows) | pass |
| D2 | `albumId=A`, `albumId=B` | `M01` once in each, with `albumId` = A / B respectively; B `total: 1` | pass |
| D3 | `albumId=null` | `M01` once; `total: 23` | pass |
| D4 | `GET …/media/public?limit=100` | deduped too: `M01` once, 30 rows | pass |
| 18a–n | `sort=random`; `uploadedBy=<uuid>,nope`; `uploadedBy=<uuid>,`; `from=09-10&to=09-01`; `from=X&to=X` (date-times); `from=2026-13-45`; `to=yesterday`; `from=2026-09-05T12:00:00` (no zone); `albumId=abc`; `type=gif`; `limit=0`; `limit=abc`; `offset=-1`; `limit=201` | 400 `INVALID_QUERY` naming the param | pass ×14 |
| 19 | `albumId=&sort=&type=` | 200, treated as absent (30) | pass |
| 20 | as `home2` (not a member) | 403 `You are not a member of this tribe` | pass |
| 20b | as `home2` with `sort=bogus` | 403 (membership checked before params) | pass |
| 21 | no cookie | 401 | pass |
| 22 | `GET …/media/public?limit=100` | 200, keys `media` only, newest order, exact | pass |

Cleanup: every scratch media deleted by its `file_url` prefix `https://scratch.tri207.test/`: 50,000 bulk rows
(deleted twice, once per load) and the 30 controlled rows. The deletes cascaded to `album_media` and
`media_like`. The scratch albums (`20700000-…a001/a002/a003`) were deleted too. Development is back to its
pre-run counts: 44 `media`, 19 `album_media`, 0 `media_like`, 0 albums in CF, 0 orphan `album_media`. The two
new indexes stay on Development. The dev server is stopped and port 3000 is free.

## 6. Mobile contract

Edits for tribe-mobile `docs/api/openapi.yaml`, operation `listMedia` (`GET /tribes/{tribeId}/media`), to apply
once the owner OKs touching that repo:

Parameters, add after `type`:

```yaml
        - { name: uploadedBy, in: query, schema: { type: string }, description: "Comma-separated user uuids (1–100; the param may also be repeated). Matches media uploaded by any of them; ids not in the tribe match nothing. Non-uuid → 400 INVALID_QUERY" }
        - { name: from, in: query, schema: { type: string }, description: "Inclusive lower bound on the media's createdAt. ISO date (YYYY-MM-DD = 00:00 UTC) or date-time with Z/offset; a date-time without a zone → 400. For a local-day filter send local midnight with its offset" }
        - { name: to, in: query, schema: { type: string }, description: "Upper bound on createdAt: a date-time is exclusive; a date (YYYY-MM-DD) includes that whole day (UTC). from must be before to, else 400" }
        - { name: sort, in: query, schema: { type: string, enum: [newest, oldest, popular], default: newest }, description: "newest/oldest = createdAt desc/asc; popular = likeCount desc, then createdAt desc. Every order ends in the media id, so offset paging is stable" }
```

`limit` on this operation: 1–200, default 50. The shared `limit` parameter says max 100 / default 20; either
keep the shared one, which is a valid subset, or give `listMedia` its own.

Response `200`, replace the schema with:

```yaml
{ type: object, required: [media, total, hasMore], properties: {
    media: { type: array, items: { $ref: '#/components/schemas/Media' }, description: "One row per photo (TRI-207): a photo filed in several albums appears once; id is the media id" },
    total: { type: integer, description: "Distinct photos matching the filters, ignoring sort/limit/offset. Without albumId, a photo filed in several albums counts once (TRI-207)" },
    hasMore: { type: boolean, description: "offset + media.length < total" } } }
```

Add a `'400'` response: `{ error: string, code: "INVALID_QUERY", details: object }` with
`description: bad sort/type/albumId/uploadedBy/from/to/limit/offset, or from not before to`.

`Media.albumId` description: "present on album-gallery listings" can become
"`listMedia`: the album of the photo's earliest album_media row the filter allows (`null` = general library)".

Notes for the app:

- `id` on `listMedia` / `listPublicMedia` rows is now the media id, matching `getAlbum` and what the app
  already assumes (like/delete/viewer key on `item.id`). Before this change the real API returned
  `album_media.id` there, so the app needs no code change; this fixes a latent 404 on like/delete from those
  lists. `mediaId` (not in the contract schema) equals `id`.
- `summary` / `description` can now mention MEDIA-14 All Photos and MEDIA-15 filters.
- "Popular photos" on MEDIA-01 (`listPublicMedia`, ranked client-side today, see `popularMedia` in
  `src/query/media.ts`) can move to `listMedia?sort=popular&limit=N`.
- `contract/known-gaps.json`: no entry covers these params today (checked), so nothing to close.
