# TRI-15 · API · Member profile, social links, privacy preferences

Status: implemented on the branch, migrated on Neon `Development` only, uncommitted · 2026-09-25
Linear: https://linear.app/tribenetwork/issue/TRI-15
Branch: `anthonygayflor6/tri-15-api-member-profile-social-links-privacy-preferences` (stacked on TRI-17)
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §7, `docs/api/openapi.yaml` (`updateMe`, `UpdateProfileInput`,
`SocialLink`, `PrivacyPreferences`, `getMemberProfile`, `MemberProfile`, `getMemberPosts`), `docs/PRD.md` R9 and
§10 decisions 3–4, `docs/SCOPE.md` PROF-02 / PROF-02-photos / PROF-02-no-shared / PROF-03 / USET-06.
Decision: owner, TRI-81 (2026-09-24): social links are a table, one link per network.
Powers: PROF-02 (+ photos, no-shared), PROF-03, USET-06.

The mobile contract is the source of truth for names and shapes. This spec records how tribe-v2 gets
there, where the sources were silent or disagreed, and what the contract has to change on merge.

---

## 1. Scope

In:
- `user_social_link` and `user_privacy` tables (DATA-MODEL-DELTA §7) and their migration.
- `PATCH /user/profile` accepts `socialLinks` (replace-all); `GET` and `PATCH /user/profile` return `socialLinks`.
- `GET` / `PATCH /me/privacy`.
- `GET /users/{id}/profile`, `GET /users/{id}/posts`, and two routes the contract lacks but PROF-02 draws:
  `GET /users/{id}/events` (Events tab) and `GET /users/{id}/media` (Photos tab, PROF-02-photos).

Out: `phone`, `language`, `timezone`, `birthday` on the user and `DELETE /me/account` (TRI-16); blocking
(TRI-238); presence (online status, last seen) — the toggles are stored, there is nothing to filter yet.

---

## 2. Schema and migration

`lib/database/schemas/enums.ts`: `socialNetwork = pgEnum("social_network", ["youtube","instagram","tiktok","x","website"])`.

`lib/database/schemas/profile.ts` (new, exported from `index.ts`), exactly as DATA-MODEL-DELTA §7:
- `user_social_link (id, user_id → user cascade, network social_network, value text, order int default 0, created_at)`,
  `unique(user_id, network)`.
- `user_privacy (id, user_id unique → user cascade, profile_visibility text default 'everyone', show_online_status,
  show_last_seen, show_email (default false), show_location, show_join_date, show_shared_tribes (default true), updated_at)`.
  No row = the defaults (`DEFAULT_PRIVACY` in `lib/services/profile.ts`); the first `PATCH /me/privacy` creates it.

Migration `lib/database/migrations/tri15-member-profile.sql`: hand-written, one transaction, re-runnable (enum and
constraints guarded, `CREATE TABLE IF NOT EXISTS`), purely additive, no backfill. Run it before deploying the code:
`GET /user/profile` reads `user_social_link`.

```
node lib/database/migrations/run-sql.mjs lib/database/migrations/tri15-member-profile.sql --endpoint <neon-endpoint-id>
```

Applied to **Development** (`ep-divine-term-ahpw8jvi`) twice on 2026-09-25 (second run a no-op); the 6 constraints
(2 pkeys, 2 FKs, `user_social_link_user_id_network_unique`, `user_privacy_user_id_unique`) are present.
**Not applied to Production** — needs the owner's go-ahead.

---

## 3. Routes and shapes

All routes: `getServerUser()` → 401 `{ error: "Unauthorized" }`. Validation errors → 400 `{ error, details }`.

### 3.1 `PATCH /api/user/profile` (`updateMe`) and `GET /api/user/profile` (`getMe`)

`UpdateProfileInput.socialLinks?: SocialLink[]`, replace-all: present → the caller's links become exactly this list
(`[]` clears); absent → links untouched. The user update and the delete + insert run in one transaction
(`getDbTransaction()`). Both GET and PATCH return the user plus `socialLinks: SocialLink[]` sorted by `order`, then network.

`SocialLink = { network, value, order }`. Rules (`normalizeSocialLink` in `lib/validations/profile.ts`):

| network | accepts | stored `value` |
|---|---|---|
| `instagram` | `name`, `@name`, `instagram.com/name`, `https://www.instagram.com/name/?hl=en` | `name` (`[A-Za-z0-9._]{1,30}`) |
| `x` | same, hosts `x.com` or `twitter.com` | `name` (`[A-Za-z0-9_]{1,15}`) |
| `tiktok` | `name`, `@name`, `tiktok.com/@name` | `name` (`[A-Za-z0-9._]{2,24}`) |
| `youtube` | `name`, `@name`, `youtube.com/@name` | `name` (`[A-Za-z0-9._-]{3,30}`) |
| `youtube` | `youtube.com/channel/<id>`, `/c/<name>`, `/user/<name>` | `https://www.youtube.com/<kind>/<id>` |
| `website` | any http(s) URL with a dotted host; scheme optional | the URL, `https://` added, host lowercased, bare trailing `/` dropped |

`www.`, `m.`, `mobile.` host prefixes are accepted. A URL on the wrong site, a bad handle, a non-http(s) website
(e.g. `javascript:`), an unknown network or a duplicate network → 400, and nothing is written.
`order` defaults to the item's array index. At most 5 items (one per network).

PATCH with only `socialLinks` (or `{}`) is valid; the user row is always touched (`updatedAt`). Before this change
an empty PATCH was a 500 (`set({})`).

### 3.2 `GET` / `PATCH /api/me/privacy` (`getPrivacyPreferences`, `updatePrivacyPreferences`)

`PrivacyPreferences` exactly as the contract: `profileVisibility: 'everyone' | 'tribe_members'`, `showOnlineStatus`,
`showLastSeen`, `showEmail`, `showLocation`, `showJoinDate`, `showSharedTribes`. GET returns the row or the defaults.
PATCH takes any subset (unknown keys and wrong types → 400), upserts in one statement, returns the full object.
`{}` returns the current preferences.

### 3.3 `GET /api/users/{id}/profile?tribeId` (`getMemberProfile`)

Unknown or malformed id → 404 `{ error: "User not found" }`. Malformed `tribeId` → 400.

```ts
MemberProfile = {
  id, name, displayName, username, image,         // always
  bio, location, joinedAt,                         // per privacy (below); joinedAt = account createdAt
  email: string | null,                            // NEW: only with showEmail (PROF-02-no-shared "Invite … with email prefilled if visible")
  socialLinks: SocialLink[],
  sharedTribes: (TribeRef & { role: TribeRole })[],// the member's role; ordered by when the member joined
  privateTribeCount: number,                       // the member's tribes minus shared
  canViewContent: boolean,                         // sharedTribes (before privacy) is non-empty
  counts: { posts, events, photos },               // scoped to the shared tribes, or to ?tribeId
}
```

Shared tribes are the member's `tribe_member` rows where the viewer also has a row, in one query; unshared rows
leave that function only as a count. Nothing else in the response names a tribe.

Counts: `posts` = the member's posts, `events` = events the member created or co-hosts, `photos` = the member's
image uploads the viewer may see under the tribe gallery rules (TRI-273: general library, visible albums, post
images) — each equal to the `total` the matching tab lists.

`?tribeId`: a shared tribe → counts for that tribe only; any other id (unshared, the member isn't in it, or it
doesn't exist) → counts all 0. The three cases answer the same, so the parameter can't probe memberships.
`sharedTribes` / `privateTribeCount` ignore `tribeId` (the strip always shows all).

Privacy of the member, never applied when viewing yourself:

| Setting | Effect for other viewers |
|---|---|
| `profileVisibility = 'tribe_members'` (opt-in; default is `everyone`) and no shared tribe | header only: `bio`, `location`, `joinedAt`, `email` null, `socialLinks` [], `privateTribeCount` 0 |
| `profileVisibility = 'everyone'` | public fields go to anyone (subject to the rows below); content still needs a shared tribe |
| `showLocation` false | `location` null |
| `showJoinDate` false | `joinedAt` null |
| `showEmail` false (default) | `email` null |
| `showSharedTribes` false | `sharedTribes` [], `privateTribeCount` 0; `canViewContent` and the tabs still follow real sharing |
| `showOnlineStatus`, `showLastSeen` | stored only (no presence data exists) |

### 3.4 Content tabs: `GET /api/users/{id}/posts|events|media?tribeId&limit&offset`

Common: 404 for an unknown user; `limit` 1–50 (default 20), `offset` ≥ 0, `tribeId` uuid, else 400. Scope = the
shared tribes, or `tribeId` if shared, or nothing (same response for any unshared / unknown `tribeId`).

- **posts** (`getMemberPosts`): bare array of the feed `Post` (same `attachPostMetadata` as the tribe feed:
  counts, `isLiked`, `media`, `event`, `poll`, `topComment`, `likers`) **plus `tribe: TribeRef`** because the list
  spans tribes and PROF-02 labels each card with its tribe. Newest first, no pin boost.
- **events** (`getMemberEvents`, not in the contract): bare array in the `listEvents` (`Event`) shape — the same
  `listEvents` query `getTribeEvents` now wraps. Events the member created or co-hosts, `startDate` desc.
- **media** (`getMemberMedia`, not in the contract): `{ media: Media[], total, hasMore }`, the `listMedia` shape.
  `type=image`, `uploadedBy=member` and the viewer's album rights, run per shared tribe with the tribe gallery
  query and merged newest first (`createdAt desc, id desc`). Members share few tribes; each tribe reads at most
  `offset + limit` rows.

---

## 4. Code

| File | Change |
|---|---|
| `lib/database/schemas/enums.ts`, `schemas/profile.ts`, `schemas/index.ts` | enum + two tables |
| `lib/database/migrations/tri15-member-profile.sql` | migration |
| `lib/validations/profile.ts` | `normalizeSocialLink`, `socialLinksSchema`, `updateProfileSchema.socialLinks`, `updatePrivacySchema`, `memberProfileQuerySchema`, `memberContentQuerySchema`; `validateApiRequest` accepts schemas whose input differs from output |
| `lib/services/profile.ts` (new) | privacy get/upsert, links read, `updateProfileWithSocialLinks`, `getMemberProfile`, `getMemberPosts/Events/Media` |
| `lib/services/post.ts` | `getPostsByAuthor`, `countPostsByAuthor` |
| `lib/services/event.ts` | `getTribeEvents` body moved to `listEvents(scope)`; `getEventsHostedBy`, `countEventsHostedBy` |
| `app/api/user/profile/route.ts` | PATCH through `updateProfileWithSocialLinks`; GET adds `socialLinks` |
| `app/api/me/privacy/route.ts`, `app/api/users/[user_id]/{profile,posts,events,media}/route.ts` | new |

`updateUserProfile` in `lib/services/user.ts` is now unused and has been left as it is.

---

## 5. Judgment calls

1. **Default `everyone` (owner, 2026-09-25).** DATA-MODEL-DELTA defaulted `profileVisibility` to `tribe_members`, but
   PRD R9.1 and the PROF-02-no-shared frame show the full public header (bio, location, join date, links) to a viewer
   who shares nothing. The owner chose `everyone` as the default; `tribe_members` is an opt-in in USET-06 that limits a
   no-shared viewer to name, username and avatar. Content tabs are always limited to shared tribes.
2. **`email` on `MemberProfile`**: not in the contract, needed by "Invite to {tribe} with email prefilled if visible".
   Added as nullable and governed by `showEmail`.
3. **`Post.tribe` on `getMemberPosts`**: the contract has it as proposed (TRI-155, cross-tribe feeds). It's served
   here only, since the member list spans tribes and every tribe on it is shared.
4. **Events tab = hosted** (creator or co-host), not RSVP'd. The frames don't define it; "their events" reads as
   hosted, and RSVPs are not public elsewhere.
5. **Photos = image uploads** only (the tab is "Photos"), under the tribe gallery visibility rules.
6. **Unshared `tribeId`** → empty (200), same as an unknown tribe. No 403, so it can't be used to probe memberships.
7. **`showSharedTribes` false** hides the strip and the private count but not the content (the viewer is in those
   tribes and already sees the posts there).
8. **Handles stored bare** (no `@`); `website` and non-handle YouTube channels stored as URLs, as the contract says
   ("handle or URL"). The client builds the link from `network` + `value`.
9. **`joinedAt` = account creation** ("Joined Feb 2024" in the frame), not a tribe join date.
10. **Online status and last seen**: stored and returned by `/me/privacy`, but not used anywhere, because presence
    doesn't exist yet.

---

## 6. Verification (2026-09-25, `next dev` + Neon Development)

- **Typecheck:** `npx next typegen` then `npx tsc --noEmit`: the same 9 errors before and after, file by file
  (event-attachments, event mock-data, settings/events route, activity.ts ×3, album.ts, media.ts); none are in
  files this change touches.
- **Migration:** applied twice on Development, constraints listed in §2. Production untouched.
- **Request matrix:** 53/53 checks passed. The script is a curl + jq script and is kept outside the repo (TRI-15 scratch):
  - auth: 401 unauthenticated (profile, posts, privacy); 404 unknown and malformed user; 400 bad `tribeId` / `limit`.
  - privacy defaults with no row; own profile (3 tribes, 0 private, email visible, 5 posts / 2 events).
  - shared: home15→home1 = College Friends only, role member, +2 private, counts 2 posts / 0 events, and the
    response body contains no unshared tribe name or id; home19→home1 = 2 shared (owner role in Alpha Pass), +1
    private; `?tribeId` narrows counts; home2→home1 sees Family Squad events.
  - tabs: posts carry `tribe` + feed fields; unshared and nonexistent `tribeId` both `[]` for posts / events and
    zero counts on the profile; paging; home16's photos `total` equals the tribe gallery's `uploadedBy` total
    (89) and `counts.photos`, newest first.
  - no shared tribe (home22→home1): locked, header only, `privateTribeCount` 0, empty tabs.
  - social links: replace-all with normalization of all five networks; a second write drops the rest; explicit
    `order`; YouTube channel URL; `twitter.com` → handle; duplicate network, unknown network, wrong-site URL,
    bad handle, bad website and a `javascript:` website all 400, and nothing is written; tribe-mate sees links;
    PATCH without `socialLinks` keeps them; `[]` clears.
  - privacy: partial PATCH round-trip; invalid enum, wrong type and unknown key 400; `showEmail` / `showLocation` /
    `showJoinDate` applied for others but not self; `showSharedTribes` false hides the strip, and the content can
    still be viewed; `everyone` exposes the header to a no-shared viewer (with +3 private) but no content; `{}`.
  - regression: tribe events list (with and without `status`) and tribe feed unchanged.
- **Data:** home1's links were cleared by the run and its `user_privacy` row deleted afterwards (0 rows in both
  tables). home1's `user.updated_at` moved.

Not done: web UI pass (out of scope), mobile app run, `pnpm build`.

---

## 7. Mobile contract flip on merge

In tribe-mobile `docs/api/openapi.yaml` (and `contract/openapi.yaml`), then regenerate the client and re-run `contract:gaps`:

| Where | Change |
|---|---|
| `/me/privacy` `get` (`getPrivacyPreferences`) | `x-status: proposed` → `existing` |
| `/me/privacy` `patch` (`updatePrivacyPreferences`) | `proposed` → `existing`; request is a partial `PrivacyPreferences` (all optional, unknown keys 400); add `'400': ValidationError`, `'401'` |
| `/users/{userId}/profile` (`getMemberProfile`) | `proposed` → `existing`; add `'400'` (bad `tribeId`), `'401'` |
| `/users/{userId}/posts` (`getMemberPosts`) | `proposed` → `existing`; add `'400'`, `'401'`, `'404'`; note items carry `tribe` |
| `/user/profile` `patch` (`updateMe`) | `x-delta`: remove `socialLinks` (keeps `phone, language, timezone, birthday` for TRI-16; also drop `privacy`, which is `/me/privacy`); 400 on bad/duplicate links |
| `UpdateProfileInput.socialLinks` | drop `x-status: proposed`; describe replace-all, `[]` clears, one per network, `order` defaults to the index |
| `SocialLink` | document normalization: bare handle for youtube/instagram/tiktok/x, URL for website (and YouTube channel URLs); `order` always present in responses |
| `User` | **add** `socialLinks: SocialLink[]` (returned by `getMe` and `updateMe`) |
| `MemberProfile` | **add** `email: string \| null` (only when the member enabled `showEmail`, or self); document the privacy table in §3.3 and `joinedAt` = account creation |
| `Post.tribe` | leave `proposed` for the tribe feed (TRI-155), but note it is served on `getMemberPosts`. If `contract:gaps` detects the member-posts use, point the `Post.tribe` known-gap note at this |
| **new** `GET /users/{userId}/events` `getMemberEvents` | `existing`; params `tribeId`, `limit` (1–50, 20), `offset`; `200: Event[]` (same items as `listEvents`); 400/401/404. Events the member created or co-hosts in shared tribes |
| **new** `GET /users/{userId}/media` `getMemberMedia` | `existing`; same params; `200: { media: Media[], total, hasMore }` (the `listMedia` body); 400/401/404. The member's image uploads in shared tribes that the caller may see |

`contract/known-gaps.json`: there are no entries for these operations today. Nothing to remove for TRI-15 unless
the mobile work adds `Post.tribe` / `MemberProfile.email` consumers before merge, in which case those entries
close with this ticket.
