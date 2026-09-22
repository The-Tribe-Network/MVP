# TRI-168 · API 16 · Server-side drafts for posts and events

Status: implemented on the branch, migrated on Neon `Development`, uncommitted (2026-09-22)
Linear: https://linear.app/tribenetwork/issue/TRI-168
Branch: `anthonygayflor6/tri-168-api-16-server-side-drafts-for-posts-and-events`
Sources: tribe-mobile `docs/api/openapi.yaml` (`listDrafts`, `createDraft`, `updateDraft`, `deleteDraft`, `Draft`),
`docs/DATA-MODEL-DELTA.md` §9a, decision TRI-99.
Unblocks: TRI-170 (mobile sync). Related: TRI-177 (composer drafts list, builds on the device store first).

The mobile contract is the source of truth for field names and shapes; this spec says how tribe-v2 gets there.

---

## 1. Decision (TRI-99, owner, 2026-09-22)

Drafts live on the server so they survive a reinstall and follow the user across devices. The device store
(encrypted MMKV in tribe-mobile) becomes the offline cache. **Many drafts per user per tribe per kind**: the
composer gets a drafts list, not a single slot.

## 2. Schema

`lib/database/schemas/draft.ts` + `draftKind` in `enums.ts`:

| column | type | note |
|---|---|---|
| `id` | uuid pk | |
| `user_id` | uuid → `user.id` cascade | owner of the draft |
| `tribe_id` | uuid → `tribe.id` cascade | |
| `kind` | `draft_kind` (`post` \| `event`) | |
| `payload` | jsonb | the create input in progress plus client-owned UI fields; **opaque to the server**, ≤ 64 KB |
| `created_at`, `updated_at` | timestamp | `updated_at` is set on every PATCH |

Index `idx_draft_user_tribe_kind_updated (user_id, tribe_id, kind, updated_at desc)` — exactly the list query.

Migration `lib/database/migrations/tri168-drafts.sql`: hand-written, one transaction, re-runnable, additive only
(same path as TRI-9, D3 there). Applied to `Development` (`ep-divine-term-ahpw8jvi`) twice with identical results.

## 3. Routes (`app/api/me/drafts/`)

| route | op | behaviour |
|---|---|---|
| `GET /api/me/drafts?tribeId&kind` | `listDrafts` | caller's drafts, newest first; both filters optional; bad filter 400 |
| `POST /api/me/drafts` | `createDraft` | body `{ tribeId, kind, payload }`; caller must be a member (403); 201 `Draft` |
| `PATCH /api/me/drafts/{draft_id}` | `updateDraft` | body `{ payload }`; replaces the payload wholesale, bumps `updatedAt`; 200 `Draft` |
| `DELETE /api/me/drafts/{draft_id}` | `deleteDraft` | 200 `{ success: true }` |

Rules:
- **Scoped to the caller everywhere.** `updateDraft` / `deleteDraft` filter on `user_id` in the same statement, so
  a draft that is not the caller's — or a malformed id — reads as **404, never 403**. Ids do not leak.
- `payload` is validated only for shape (JSON object) and size (≤ 64 KB serialized). Merging is the client's job.
- `DELETE` returns `200 { success }` like every other delete in the contract (the ticket said 204; the contract convention won).
- Leaving a tribe (`leaveTribe`) or being removed (`removeMember`) deletes that member's drafts for the tribe.
  Deleting a tribe or a user cascades.

Files: `lib/validations/draft.ts`, `lib/services/draft.ts`, `app/api/me/drafts/route.ts`,
`app/api/me/drafts/[draft_id]/route.ts`, hooks in `lib/services/tribe.ts` and `lib/services/members.ts`.

## 4. Verification (2026-09-22)

- **Typecheck:** `npx next typegen && npx tsc --noEmit` — 11 errors before and after, none in touched files.
- **Migration:** run twice on `Development`; 7 columns, 2 indexes present.
- **Request matrix:** 30 of 30 passed against `next dev` + `Development`, signed in as the College Friends owner
  (`home15`), a member (`home16`) and a non-member (`home2`). Covered: 401; empty list; create ×3 (two posts, one
  event, same tribe); bad kind / bad tribeId / missing / non-object / 65 KB payload (400); non-member (403);
  ordering newest-first; `kind` and `tribeId` filters; other member sees nothing; PATCH replaces and bumps
  `updatedAt` and re-sorts; PATCH and DELETE on someone else's / unknown / malformed id (404); PATCH bad
  payload (400); DELETE twice; test rows removed afterwards (table empty).

Not done: the leave / remove hooks were not exercised live (they would alter seed memberships); `pnpm build`;
a run from the mobile app (TRI-170).

## 5. On merge

In tribe-mobile `openapi.yaml`, drop `x-status: proposed` from the four operations and the `Draft` schemas,
regenerate the client, and build TRI-170 against them.
