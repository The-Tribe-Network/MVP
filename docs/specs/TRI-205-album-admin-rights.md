# TRI-205 · API · Let tribe admins delete (and manage) any album, not only its creator

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-23
Linear: https://linear.app/tribenetwork/issue/TRI-205
Branch: `anthonygayflor6/tri-205-api-let-tribe-admins-delete-any-album-not-only-its-creator`
Sources: tribe-mobile `docs/SCREEN-BEHAVIOR.md` MEDIA-02 ("⋯ → Manage (if creator/admin)"), `docs/PROGRESS.md`
("Menu gating = creator or `canDeleteAnyMedia`"), `src/screens/media/album-screen.tsx` (line 106),
`docs/api/openapi.yaml` (`updateAlbum`, `deleteAlbum`, `addMediaToAlbum`, `removeMediaFromAlbum`).
Unblocks: MEDIA-04 Manage and MEDIA-13 Delete album for an owner/admin who did not create the album
(they got 403 from `deleteAlbum` / `updateAlbum`, which were creator-only with a TODO for admins).

---

## 1. What landed

No schema change. No new permission key.

| Route | Change |
|---|---|
| `DELETE /tribes/{tid}/albums/{aid}` | creator **or** a member whose effective `canDeleteAnyMedia` is true. The album must be in `{tid}` (new guard, 403 `Album does not belong to this tribe`, checked before any permission). |
| `PUT /tribes/{tid}/albums/{aid}` | same rule and same tribe guard. Body is now validated with the existing `updateAlbumSchema` (400 `Validation failed`), and **`coverId` is accepted** (MEDIA-07): it must be a media row in the album's tribe, else 400 `Cover image not found or not accessible`. The route used to read a `coverImageUrl` that has no column and silently dropped `coverId`, so the web client's `UpdateAlbumInput` and the mobile contract were both broken for cover changes. |
| `POST /tribes/{tid}/albums/{aid}/media` | creator, `canDeleteAnyMedia`, **or** `canCreateAlbums` (the pre-existing broader rule, kept). Tribe guard already existed in the route. |
| `DELETE /tribes/{tid}/albums/{aid}/media` | same as POST media. |
| `POST /upload/album-cover` | untouched: it only checks `canUploadMedia` on `tribeId` and never looks at an album, so there was no creator rule to align. |

Code: `lib/services/album.ts` (`ALBUM_MANAGE_PERMISSION`, `getAlbumForWrite`, `canUserManageAlbum`,
`canUserEditAlbumContents`, `assertCoverInTribe`; `updateAlbum` / `deleteAlbum` take `{ tribeId }`;
`UpdateAlbumData.coverImageUrl` removed), `app/api/tribes/[tribe_id]/albums/[album_id]/route.ts`.

### Permission key: `canDeleteAnyMedia`

`lib/services/role-permissions.ts` has one album key, `canCreateAlbums`, and it is a creation right
(system default: owner/admin/moderator true, member false). There is no `canManageAlbums` /
`canDeleteAnyAlbum`, so the closest moderation key is `canDeleteAnyMedia` (owner/admin true,
moderator/member false), which is what the mobile MEDIA-02 menu already gates Manage and Delete album
on. Adding an album-specific key would mean a column on `tribe_role_permission` and
`tribe_member_permission` plus a mobile contract change, which the issue did not ask for. It is exported
as `ALBUM_MANAGE_PERMISSION` so the key lives in one place if that changes.

Resolution reuses `checkPermission(tribeId, userId, key)` (per-member override → tribe role override →
system default), the same helper `canUserCreateAlbums`, `canUserDeleteMedia` and `changeMemberRole`
use. Nothing is hand-rolled; a non-member resolves false.

### Final permission matrix

"manage" = creator **or** effective `canDeleteAnyMedia`. "contents" = manage **or** effective `canCreateAlbums`.

| Route | Creator | Owner / admin (default) | Moderator (default) | Member (default) | Admin with override `canDeleteAnyMedia=false` | Non-member | Signed out |
|---|---|---|---|---|---|---|---|
| `PUT …/albums/{aid}` (manage) | 200 | 200 | 403 | 403 | 403 | 403 | 401 |
| `DELETE …/albums/{aid}` (manage) | 200 | 200 | 403 | 403 | 403 | 403 | 401 |
| `POST …/albums/{aid}/media` (contents) | 200 | 200 | 200 (`canCreateAlbums`) | 403 | 200 (`canCreateAlbums` still true) | 403 | 401 |
| `DELETE …/albums/{aid}/media` (contents) | 200 | 200 | 200 (`canCreateAlbums`) | 403 | 200 (`canCreateAlbums` still true) | 403 | 401 |
| `POST /upload/album-cover` | n/a: `canUploadMedia` on the tribe, no album | | | | | | |

Moderator rows are from the system defaults, not exercised in the matrix below. Any of these flips with
a tribe role override or a per-member override, since both go through `checkPermission`.

### Error shapes (unchanged style)

All routes keep `{ "error": string }`. Order of checks on the album routes: 401 `Unauthorized` →
403 `You are not a member of this tribe` (route's `tribe_id`) → 404 `Album not found` →
403 `Album does not belong to this tribe` → 403 `User does not have permission to update|delete|modify this album`
→ 400 (PUT only: `Validation failed` + `details`, or `Cover image not found or not accessible`).

## 2. Decisions

- **Tribe guard before permission.** `PUT`/`DELETE …/albums/{aid}` never compared the album's tribe to
  the route's `tribe_id` (the media sub-routes and GET did). With admin rights now reaching past the
  creator, an admin of tribe A would otherwise have been able to delete any album by id under tribe A's
  URL. `getAlbumForWrite(albumId, tribeId)` throws the mismatch before `checkPermission` runs, so the
  caller's rights in the route's tribe never apply to another tribe's album.
- **Media routes keep the broader rule.** `addMultipleMediaToAlbum` / `removeMediaFromAlbum` already let
  any `canCreateAlbums` holder edit an album's contents; that is kept and `canDeleteAnyMedia` added on top,
  so managing implies editing contents but not the reverse. An admin whose `canDeleteAnyMedia` is
  overridden off can still add/remove photos (matrix rows 17 and 24) because their `canCreateAlbums`
  is still on; that is the pre-existing rule, not a new one.
- **`PUT` validates with `updateAlbumSchema`.** Same schema the web client types its body with, same 400
  shape `POST /albums` returns. `coverId` is checked against the tribe the way `createAlbumWithMedia`
  checks it. Clearing a cover (`coverId: null`) is not in the schema and was not before; out of scope.
- **Cost.** A manage check by a non-creator is 1 album read + `checkPermission` (member+override join,
  role row) = 3 statements; a contents check by a member with neither key adds one more `checkPermission`.
  `DELETE …/media` still loops per media id (unchanged).

## 3. Verification (2026-09-23)

- **Typecheck**: `npx next typegen && npx tsc --noEmit` — 9 errors before (main, via `git stash`) and
  after, identical file/message set ignoring line numbers. The one in `lib/services/album.ts` is the
  pre-existing `getAlbumById` return vs `AlbumWithMedia` mismatch (TRI-201 spec §3), untouched.
- **Request matrix** against `next dev` on :3000 + Development. Actors in "College Friends": creator
  `home16` (role member; scratch albums inserted by SQL as `created_by = home16` since members cannot
  create albums), admin non-creator `home17` (promoted by SQL for the test), owner non-creator `home15`,
  plain member `home19`, `home18` promoted to admin **with** a `tribe_member_permission` row
  `can_delete_any_media = false`, non-member `home2` (member of "Family Squad" only), and signed out.
  Scratch rows: 4 `media` (uploaded by home16), albums A, D1, D2, D3 in College Friends and F in Family
  Squad (created by home2). Script: `matrix.sh` in the session scratchpad.

| # | Request | Expect | Result |
|---|---|---|---|
| 1 | creator `PUT` A `{name, coverId: M1}` | 200 | pass |
| 2 | admin non-creator `PUT` A | 200 | pass |
| 3 | owner non-creator `PUT` A | 200 | pass |
| 4 | plain member `PUT` A | 403 `User does not have permission to update this album` | pass |
| 5 | non-member `PUT` A | 403 `You are not a member of this tribe` | pass |
| 6 | signed out `PUT` A | 401 | pass |
| 7 | override admin (`canDeleteAnyMedia=false`) `PUT` A | 403 | pass |
| 8 | creator `PUT` A unknown `coverId` | 400 `Cover image not found or not accessible` | pass |
| 9 | creator `PUT` A `{name: ""}` | 400 `Validation failed` | pass |
| 10 | admin `PUT /tribes/CF/albums/F` (F is in Family Squad) | 403 `Album does not belong to this tribe` | pass |
| 11–13 | creator / admin / owner `POST …/media` (M1 / M2 / M3) | 200 | pass |
| 14 | plain member `POST …/media` | 403 `User does not have permission to modify this album` | pass |
| 15 | non-member `POST …/media` | 403 | pass |
| 16 | signed out `POST …/media` | 401 | pass |
| 17 | override admin `POST …/media` (M4) | 200 (via `canCreateAlbums`) | pass |
| 18–20 | creator / admin / owner `DELETE …/media` (M1 / M2 / M3) | 200 | pass |
| 21 | plain member `DELETE …/media` | 403 | pass |
| 22 | non-member `DELETE …/media` | 403 | pass |
| 23 | signed out `DELETE …/media` | 401 | pass |
| 24 | override admin `DELETE …/media` (M4) | 200 (via `canCreateAlbums`) | pass |
| 25 | plain member `DELETE` A | 403 `User does not have permission to delete this album` | pass |
| 26 | non-member `DELETE` A | 403 | pass |
| 27 | signed out `DELETE` A | 401 | pass |
| 28 | override admin `DELETE` A | 403 | pass |
| 29 | admin `DELETE /tribes/CF/albums/F` | 403 `Album does not belong to this tribe`; F still present | pass |
| 30 | admin `DELETE /tribes/FamilySquad/albums/A` | 403 `You are not a member of this tribe`; A still present | pass |
| 31 | admin `DELETE` unknown album id | 404 `Album not found` | pass |
| 32 | creator `DELETE` D1 | 200 | pass |
| 33 | admin non-creator `DELETE` D2 | 200 | pass |
| 34 | owner non-creator `DELETE` D3 | 200 | pass |
| DB | after the run: A renamed with `cover_id = M1`, 0 items; F intact; D1–D3 gone | as expected | pass |

Cleanup after the run (SQL on Development): 2 remaining albums, 4 media, 1 permission override deleted;
home17 and home18 back to `member`; verified 0 scratch albums/media/overrides, 0 orphan `album_media`,
College Friends non-member roles back to the owner plus the one pre-existing admin. Dev server stopped.

## 4. Mobile contract

No shape or status change: the four operations already return `{ error }` with 403 and the mobile
`deleteAlbum` already declares `'403': Forbidden`. Suggested edits to tribe-mobile `docs/api/openapi.yaml`
(descriptions only, `x-status` stays `existing`), to apply once the owner OKs touching that repo:

- `updateAlbum` (`PUT /tribes/{tribeId}/albums/{albumId}`): add
  `description: Album creator, or a member whose effective canDeleteAnyMedia is true. 403 otherwise; 403 when the album is not in tribeId; 400 when coverId is not a media id in this tribe.`
  and add `'400'`, `'403'` and `'404'` to `responses`.
- `deleteAlbum`: add `description: Album creator, or a member whose effective canDeleteAnyMedia is true (the MEDIA-02 menu rule). 403 when the album is not in tribeId.` and `'404'`.
- `addMediaToAlbum` / `removeMediaFromAlbum`: add
  `description: Album creator, or a member with effective canDeleteAnyMedia or canCreateAlbums. 403 otherwise; 403 when the album is not in tribeId.`
  and `'403'`, `'404'`.
- MEDIA-02 `album-screen.tsx` line 106 already gates on `createdBy === me || can('canDeleteAnyMedia')`; it
  now matches the server, so no app code change. MEDIA-06 add/remove could additionally show for
  `canCreateAlbums` holders if the design wants it (server allows it); not required.
- `contract/known-gaps.json`: nothing to close (no proposed fields involved).
