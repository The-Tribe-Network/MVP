# TRI-293 · API · Deactivate account

Status: in review; migrated on Neon Development and Production · 2026-09-25
Linear: https://linear.app/tribenetwork/issue/TRI-293
Powers: USET-03 danger zone "Deactivate" row (mobile). Sibling of delete: `docs/specs/TRI-16-account-fields.md` §3.3.

## 1. Shape

`POST /api/me/account/deactivate` with `{ confirmation: "DEACTIVATE" }` (`confirm` accepted as an alias).

A separate route, not `DELETE /me/account` with `mode: "deactivate"`: a reversible action shouldn't ride a
`DELETE`, and it gets its own confirmation word, so a client can't deactivate by sending the delete body with the
wrong mode (or the other way round). `DELETE /me/account` is unchanged (`mode: "deactivate"` stays 400
`MODE_NOT_SUPPORTED`).

| Case | Response |
|---|---|
| no session | 401 |
| missing / wrong confirmation (case-sensitive) | 400 `{ code: "CONFIRMATION_REQUIRED" }` |
| caller owns any tribe | 409 `{ error, code: "OWNS_TRIBES", tribes: [{ id, name }] }`; nothing changes |
| success | 200 `{ success: true }`; every session is gone, so the bearer is 401 on the next call |

## 2. What deactivated means

`user.deactivated_at` (timestamp, null when active). Set with every session deleted, in one transaction
(`deactivateAccount` in `lib/services/account.ts`). Nothing else is removed or changed.

While it is set:
- **Member lists and their search** (`GET /tribes/{id}/members/list`, `search=`, and `total`) leave them out.
  Their `tribe_member` rows stay, so the tribe's own member count and their roles are unchanged.
- **Profile routes** `GET /users/{id}/profile | posts | events | media` → 404, as for an unknown or deleted user.
- **Notifications**: `notify()` drops them from every recipient list (nothing queued for them while away).
- **Invitations**: inviting their email is skipped (like an existing member; the 201 lists 0 invitations).
  Nobody can add a member directly; join and accept both need the user's own session.
- **Kept and visible**: their posts, comments, events, polls, albums, likes, votes and RSVPs, under their normal
  name and avatar (no "Deleted user"). Tapping through to the profile gets the 404.

**Signing back in reactivates.** The Better-Auth `databaseHooks.session.create.before` (one indexed lookup per
sign-in) still refuses any session for a deleted tombstone (`deleted_at`), and now clears `deactivated_at` for a
deactivated user before the session is created: password sign-in, email OTP, social, any path. Everything above
is back at once.

## 3. Migration

`lib/database/migrations/tri293-deactivate.sql`: hand-written, re-runnable (`ADD COLUMN IF NOT EXISTS`), additive:
`user.deactivated_at timestamp` + partial index `idx_user_deactivated_at` (`WHERE deactivated_at IS NOT NULL`).

- Development (`ep-divine-term-ahpw8jvi`): applied twice with `run-sql.mjs` (second run a no-op).
- Production (branch `br-small-wind-ahbxmjc9`): applied 2026-09-25 with the owner's go-ahead (Neon MCP, same
  statements in one transaction); column and index verified, 0 rows set.

It has to be on a database before this code deploys there: the session-create hook reads the column on every sign-in.

## 4. Mobile contract on merge

Add to `docs/api/openapi.yaml` (and `contract/openapi.yaml`):

```yaml
/me/account/deactivate:
  post:
    x-status: existing
    tags: [me]
    operationId: deactivateAccount
    summary: "USET-03 danger zone: deactivate the caller's account (signing in again reactivates it)"
    requestBody:
      required: true
      content: { application/json: { schema: { type: object, required: [confirmation],
        properties: { confirmation: { type: string, const: DEACTIVATE, description: Case-sensitive } } } } }
    responses:
      '200': Success            # every session revoked
      '400': CONFIRMATION_REQUIRED
      '401': Unauthorized
      '409': OwnsTribesError    # code OWNS_TRIBES, tribes [{ id, name }]
```

- `deleteAccount`: keep `mode: [delete]` (deactivate is its own operation); its description's "Deactivate is TRI-293"
  note points here.
- `getMemberProfile` / `getMemberPosts` / events / media: 404 also for a deactivated account.
- Member list (`members/list`): deactivated members are omitted from `members` and `total`.
- Mobile: after 200, clear the stored session and go to sign-in (same as delete); copy should say "Sign in again
  any time to reactivate."

## 5. Verification (2026-09-25, `next dev` + Neon Development)

Throwaway `tri293-<run>-t@tribe-seed.test` joined College Friends by its invite code and posted; a second
throwaway (`-t2`, no tribe) for the invite check. All pass:
- before: in `members/list?search=` (total 1); `/users/{id}/profile` 200.
- no body / `"deactivate"` → 400 `CONFIRMATION_REQUIRED`; home15 (owner) → 409 `OWNS_TRIBES` [College Friends],
  still signed in; no session → 401; the throwaway → 200.
- after: its bearer 401; 0 sessions; `deactivated_at` set; membership row kept; hidden from the list search (total 0)
  and the full list; `/users/{id}/profile` and `/posts` 404; its post still readable with its name; home15
  commenting on its post → 201 and **0 notification rows** for it; inviting the deactivated `-t2` → 201 with
  0 invitations.
- sign in again → 200, `deactivated_at` null, new bearer works, listed again (total 1), profile 200; home15
  commenting again → 1 notification row.
- throwaways, their post, comments, activity, membership and notifications deleted afterwards; 0 users left with
  `deactivated_at` set on Development.

`npx tsc --noEmit`: the 9 baseline errors.
