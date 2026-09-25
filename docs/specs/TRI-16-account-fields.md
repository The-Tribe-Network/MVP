# TRI-16 · API · Account fields and delete account

Status: in review; migrated on Neon Development and Production · 2026-09-25
Linear: https://linear.app/tribenetwork/issue/TRI-16
Branch: `anthonygayflor6/tri-16-api-account-fields-and-deactivatedelete` (stacked on TRI-15, MVP #58)
Sources: tribe-mobile `docs/DATA-MODEL-DELTA.md` §7, `docs/api/openapi.yaml` (`updateMe`, `UpdateProfileInput`,
`User`, `deleteAccount`), `docs/PRD.md` R8.2, `docs/SCOPE.md` §2 P1 item 12, USET-02 / USET-03.
Decisions: owner, 2026-09-25 — minimum age stays 13 and the server enforces it at email sign-up (TRI-106);
delete **anonymizes** (content stays as "Deleted user"); deactivate is out of the alpha (TRI-293).
Powers: USET-03 (account settings, danger zone), USET-02 (birthday on the profile).

The mobile contract is the source of truth for names and shapes. This spec records how tribe-v2 gets there,
where the sources were silent or disagreed, and what the contract has to change on merge.

---

## 1. Scope

In:
- `user.phone`, `user.language` (default `'en'`), `user.timezone`, `user.birthday` (`date`), plus `user.deleted_at`.
- Birthday saved at email sign-up (Better-Auth `additionalFields`), required there and 13+ (server-enforced).
- `PATCH /user/profile` accepts the four fields; `GET` / `PATCH /user/profile` return them.
- `DELETE /me/account` with typed confirmation, blocked while the caller owns a tribe, anonymizing the account.
- `GET /users/{id}/profile|posts|events|media` answer 404 for a deleted account.

Out:
- Deactivate (TRI-293). `mode: "deactivate"` is a 400.
- Email change: Better-Auth's `/change-email` exists but `user.changeEmail.enabled` is **not** set in
  `lib/clients/auth.ts`, so it answers 400 today. Turning it on needs a verification-email sender and a mobile
  flow; not built here (owner call, see §5).

## 2. Schema and migration

`lib/database/schemas/auth.ts` → `user`:

```ts
phone: text("phone"),                      // free text, lightly validated
language: text("language").default("en"),  // BCP-47 tag, stored canonical
timezone: text("timezone"),                // IANA zone name
birthday: date("birthday"),                // 'YYYY-MM-DD'; null for social sign-ups
deletedAt: timestamp("deleted_at"),        // tombstone marker (DELETE /me/account)
```

`lib/database/migrations/tri16-account-fields.sql`: hand-written, re-runnable (`ADD COLUMN IF NOT EXISTS`), one
transaction, purely additive, plus a partial index `idx_user_deleted_at` (`WHERE deleted_at IS NOT NULL`).

```
node lib/database/migrations/run-sql.mjs lib/database/migrations/tri16-account-fields.sql --endpoint ep-divine-term-ahpw8jvi
```

Applied to **Development** (`ep-divine-term-ahpw8jvi`) twice (second run a no-op). Applied to **Production**
(branch `br-small-wind-ahbxmjc9`) on 2026-09-25 with the owner's go-ahead, via Neon MCP; columns and index
verified. It had to run before this code deploys: Better-Auth reads and writes the new columns on every sign-up
and session.

## 3. Rules and shapes

### 3.1 Sign-up (`POST /api/auth/sign-up/email`)

Body gains `birthday: 'YYYY-MM-DD'` (the web and mobile forms already send it). A Better-Auth `hooks.before` on
`/sign-up/email` checks it before anything is written:

| Case | Response |
|---|---|
| missing / empty | 400 `{ code: "BIRTHDAY_REQUIRED", message }` |
| not `YYYY-MM-DD`, not a real date (`2001-02-30`), in the future, or > 130 years ago | 400 `{ code: "BIRTHDAY_INVALID", message }` |
| age < 13 (`AUTH_CONSTANTS.MIN_AGE`) | 400 `{ code: "UNDER_MIN_AGE", message }` |

Age is whole years on today's UTC date. The field is `required: false` in `additionalFields` so social sign-ups
(Google, paused) may leave it null; the hook is what makes it required for email sign-up. The field also has a
`validator.input` (the same zod rule), so Better-Auth's `/update-user` cannot set an under-13 or malformed
birthday. `phone`, `language` and `timezone` are `input: false` in Better-Auth: sign-up and `/update-user`
reject them, so `PATCH /user/profile` is the only way in. The sign-up response `user` carries all four.

### 3.2 `PATCH /api/user/profile` (`updateMe`) and `GET /api/user/profile` (`getMe`)

New optional input fields (`lib/validations/account.ts`, used by `updateProfileSchema`):

| Field | Rule | Clear |
|---|---|---|
| `phone` | trimmed, inner whitespace collapsed; only digits, spaces and `+ ( ) - .`; 5–20 digits; ≤ 32 chars | `null` or `""` |
| `language` | `^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$`, then `Intl.getCanonicalLocales` (`pt-br` → `pt-BR`) | not clearable |
| `timezone` | any name `Intl.DateTimeFormat` accepts (`America/New_York`, `UTC`) | `null` |
| `birthday` | same rule as sign-up | not clearable |

Invalid → 400 `{ error: "Validation failed", details }`; a birthday failure also carries
`code: "UNDER_MIN_AGE" | "BIRTHDAY_INVALID"`. Both routes return the user with `phone`, `language`, `timezone`,
`birthday` (`'YYYY-MM-DD'` string or null) alongside the existing fields and `socialLinks`.

### 3.3 `DELETE /api/me/account` (`deleteAccount`)

Body `{ confirmation: "DELETE" }` — the same field name as `DELETE /tribes/{id}` and the contract; `confirm` is
accepted as an alias. `mode`, if present, must be `"delete"`.

| Case | Response |
|---|---|
| no session | 401 |
| missing / wrong confirmation (case-sensitive) | 400 `{ code: "CONFIRMATION_REQUIRED" }` |
| `mode` other than `"delete"` | 400 `{ code: "MODE_NOT_SUPPORTED" }` |
| caller owns any tribe | 409 `{ error, code: "OWNS_TRIBES", tribes: [{ id, name }] }` — nothing changes |
| success | 200 `{ success: true }`; every session is gone, so the bearer is 401 on the next call |

A second call with the same bearer is a 401 (the session no longer exists). The service itself is idempotent on a
tombstone (`deleted_at` keeps its first value).

### 3.4 Deleted accounts elsewhere

- `GET /users/{id}/profile`, `/posts`, `/events`, `/media` → 404 `User not found`.
- Content the user wrote renders through the existing author joins: `author: { id, name: "Deleted user",
  image: null, username: null }` (posts; verified for comments too — event hosts join the same columns, not
  exercised in the run). Clients that show
  `displayName ?? name` get "Deleted user"; the avatar falls back to initials/placeholder. No `isDeleted` flag was
  added (the contract is silent); a client that wants to suppress tapping through to the profile can rely on the
  404 or we add a flag later.
- Member lists and member search read `tribe_member`, whose rows are gone. There is no global user search.

## 4. The anonymization design

Every content FK to `user.id` cascades (`post.author_id`, `comment.author_id`, `event.created_by`, `poll`,
`album`, …) and several restrict (`tribe.created_by`, `tribe_invitation.invited_by`,
`tribe_member_permission.set_by`, `tribe_role_permission.updated_by`, `event_co_host.added_by`,
`event_link.created_by`). Deleting the row would therefore either delete the user's contributions or fail, so the
`user` row stays as a **tombstone**. All of it runs in one `getDbTransaction()` transaction
(`lib/services/account.ts`, `deleteAccount`):

**Removed**
- `session` (bearer dies at commit), `account` (password and OAuth links), `verification` rows for their email
  (OTP identifiers `<type>-otp-<email>`).
- `user_social_link`, `user_privacy`.
- `tribe_member` (every tribe), `tribe_member_permission` and `tribe_member_preference` for the user.
- `event_attendee` (RSVPs), `event_co_host` slots, `draft`s, `notification`s addressed to them (deliveries cascade).
- Their `media` rows — post photos, gallery/album uploads, their avatar — with the cascades that follow
  (`post_media`, `album_media`, `media_like`, `activity.media_id`; `album.cover_id` → null). After commit the
  Cloudinary assets are destroyed with `destroyMediaAsset`, the Cloudinary half of the existing `deleteMedia` path
  (refactored out of it, behaviour unchanged). A Cloudinary failure only orphans an asset.
- **Exception:** media the user uploaded that a tribe wears (`tribe.avatar`, `tribe.banner`,
  `tribe.featured_media_id`) or that is an event's `cover_image_url` stays: it belongs to the tribe / the kept event.

**Scrubbed on the `user` row**
- `name` → `"Deleted user"`; `email` → `deleted+<id>@deleted.invalid` (unique, RFC 2606 unroutable);
  `display_name`, `username` (freed), `image`, `bio`, `location`, `phone`, `timezone`, `birthday` → null;
  `email_verified`, `profile_completed` → false; `deleted_at` → now (first time only). `language` keeps its value
  (not personal).

**Kept, attributed to the tombstone**
- Posts (text; their photos are gone), comments, events, polls and albums they created, their likes and poll
  votes (so counts and results don't shift), activity rows, notifications they caused for others
  (`notification.actor_id`), invitations they sent, `created_by` on tribes they created but no longer own.

**Can never sign in again**
- No credential or OAuth account remains; the email is unroutable, so no reset or OTP can reach anyone.
- A Better-Auth `databaseHooks.session.create.before` refuses a session for any user with `deleted_at` set
  (one indexed lookup per sign-in), whatever path tries.
- Signing up again with the old email creates a brand-new user (the old address is free).

## 5. Judgment calls

- **Tombstone over row delete** — the only design that keeps content given the cascading FKs; no FK changes needed.
- **Birthday required at email sign-up** via a `hooks.before` (specific error codes), not `required: true`
  (which would also bind social sign-ups through `parseUserInput(..., "create")`).
- **Body field `confirmation`** (contract + tribe delete) with `confirm` as an alias, since the ticket text said
  `confirm`. The contract's `mode` is optional and only `"delete"` is accepted.
- **Likes and poll votes are kept** (anonymous in effect); RSVPs and co-host slots are removed (a deleted user
  isn't coming).
- **Tribe-worn media and event covers are kept**; everything else they uploaded, including post photos, is deleted
  (owner decision: "their photos/media" go).
- **Birthday and language are not clearable** (null → 400); phone and timezone are.
- **Language canonicalized** with `Intl.getCanonicalLocales`; timezone stored as sent once `Intl` accepts it.
- **Age computed on the UTC date** — at most a one-day difference around a 13th birthday for far-east/west zones.
- **Email change not enabled** (`changeEmail` off in the auth config). Enabling it is a config change plus an
  email template (`sendChangeEmailVerification`) and a USET-03 flow. Owner (2026-09-25): post-alpha, **TRI-294**;
  USET-03 shows the email read-only.
- **Email-OTP sign-in** (`/sign-in/email-otp`) could create a user without a birthday, but our
  `sendVerificationOTP` never sends `sign-in` codes. Owner (2026-09-25): closed for good with
  `emailOTP({ disableSignUp: true })`; OTP verification and password reset are unaffected (re-checked).
- **No `isDeleted` flag on authors** (owner, 2026-09-25): `name: "Deleted user"` + `username: null` is enough.
- **The contract has no `draftId` parameter on `/me/account`** in either `docs/api/openapi.yaml` or
  `contract/openapi.yaml` (checked 2026-09-25); nothing to remove there.

## 6. Code

| File | Change |
|---|---|
| `lib/database/migrations/tri16-account-fields.sql` | new migration (§2) |
| `lib/database/schemas/auth.ts` | five `user` columns |
| `lib/validations/account.ts` | new: `ageOn`, `birthdayProblem`, `birthdaySchema`, `phoneSchema`, `languageSchema`, `timezoneSchema`, `deleteAccountSchema` |
| `lib/validations/profile.ts` | `updateProfileSchema` gains the four fields |
| `lib/clients/auth.ts` | `additionalFields` (birthday input + validator; phone/language/timezone `input: false`), `hooks.before` age gate, `databaseHooks.session.create.before` tombstone guard |
| `lib/services/user.ts`, `lib/services/profile.ts` | `UpdateProfileInput` fields and their write; deleted users 404 on the member-profile routes |
| `lib/services/account.ts` | new: `getOwnedTribes`, `deleteAccount` (§4) |
| `lib/services/media.ts` | `destroyMediaAsset` extracted from `deleteMedia` (same behaviour) |
| `app/api/user/profile/route.ts` | birthday error `code` on 400 |
| `app/api/me/account/route.ts` | new `DELETE` |

`npx tsc --noEmit`: the same 9 baseline errors, file by file (one line number in `lib/services/media.ts` moved
from 1011 to 1017 because of the refactor above; same error). `npx next typegen` run.

## 7. Verification (2026-09-25, `next dev` + Neon Development)

Scripted end-to-end run (`tri16-e2e.sh`, throwaway `tri16-*@tribe-seed.test` users only): **76 / 76 passed.**

- Sign-up: with birthday → 200, stored as `2000-05-17`, `language: "en"`; under 13 → 400 `UNDER_MIN_AGE`; missing
  → 400 `BIRTHDAY_REQUIRED`; `2001-02-30` → 400 `BIRTHDAY_INVALID`; no user row for any rejected sign-up.
  `/auth/update-user` rejects an under-13 birthday and any `timezone` (400).
- PATCH / GET: phone (trimmed), `pt-br` → `pt-BR`, `America/New_York`, birthday round-trip; invalid timezone,
  under-13 birthday (with `code`), `birthday: null`, bad language, bad phone → 400; `phone`/`timezone: null` clear.
- Delete: no body / `{}` / `"delete"` / `confirm: "yes"` → 400 `CONFIRMATION_REQUIRED`; `mode: "deactivate"` → 400
  `MODE_NOT_SUPPORTED`; the account still works after those. An owner → 409 `OWNS_TRIBES` listing the tribe, still
  signed in; after deleting that tribe, `{ confirm: "DELETE" }` → 200.
- Success (a member of College Friends with a photo post, a comment, an avatar, social link, privacy row):
  200; same bearer → 401 at once; a second DELETE → 401; sign-in with the old and the tombstone email fails; no
  session/account rows; the tombstone row is exactly as in §4; links, privacy, memberships, member
  preferences/permissions, drafts, notifications all 0; both media rows gone and the post photo's Cloudinary asset
  returns 404 from the Admin API; `/users/{id}/profile` and `/posts` → 404; the post is still in the tribe feed with
  `author: { name: "Deleted user", image: null, username: null }` and no photos; the comment shows "Deleted user";
  not in the members list or its search; the old email can sign up again as a new user.
- Seed users (`home*@tribe-seed.test`) byte-identical before/after (hash of id, email, name, username, image).
- TRI-15 regression: home15 `GET /user/profile` (now with the four fields and `socialLinks`), home17 → home15
  member profile with shared tribes, `GET /me/privacy`, empty PATCH → 200, language unchanged.

Left on Development: three tombstones (`tri16-del-<run>-1`, `-2`, and the re-sign-up of `-1`, all now
`deleted+<id>@deleted.invalid`) and the throwaway's post + comment in College Friends shown as "Deleted user"
(the point of the design).

## 8. Mobile contract flip on merge

In tribe-mobile `docs/api/openapi.yaml` (and `contract/openapi.yaml`), then regenerate the client and re-run `contract:gaps`:

| Where | Change |
|---|---|
| `/user/profile` `patch` (`updateMe`) | `x-delta`: remove `phone, language, timezone, birthday` (and `socialLinks` per TRI-15; `privacy` is `/me/privacy`) → `x-status: existing` once nothing is left |
| `UpdateProfileInput.phone / language / timezone / birthday` | drop `x-status: proposed`; `phone` and `timezone` are `[string, 'null']` (null clears); `birthday` `format: date`, 13+; `language` BCP-47 |
| `User.phone / language / timezone / birthday` | drop `x-status: proposed` (served by `getMe`, `updateMe`, sign-up) |
| `/me/account` `delete` (`deleteAccount`) | `proposed` → `existing`; body `{ confirmation: "DELETE" }` required, `mode` optional `enum: [delete]` (drop `deactivate` → TRI-293; drop `mode` from `required`); summary without deactivate; add `'401'`, `'409'` (`code: OWNS_TRIBES`, `tribes: [{ id, name }]`); 400 codes `CONFIRMATION_REQUIRED`, `MODE_NOT_SUPPORTED` |
| `/me/account` `draftId` parameter | not present in the contract today — nothing to remove |
| `getMemberProfile` / `getMemberPosts` | note 404 also for a deleted account |
| Sign-up (auth docs / `AUTH.md`) | `birthday` required for email sign-up; 400 codes `BIRTHDAY_REQUIRED`, `BIRTHDAY_INVALID`, `UNDER_MIN_AGE` |
| Author objects (`UserPreview` etc.) | document that a deleted author is `{ name: "Deleted user", image: null, username: null }` |

`contract/known-gaps.json`: remove `User.birthday` and `UpdateProfileInput.birthday` (both `TRI-16`).
