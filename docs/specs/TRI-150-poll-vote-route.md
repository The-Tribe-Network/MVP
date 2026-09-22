# TRI-150 · API · Event-agnostic poll vote route

Status: implemented on the branch, verified against Neon `Development`, uncommitted · 2026-09-22
Linear: https://linear.app/tribenetwork/issue/TRI-150
Branch: `anthonygayflor6/tri-150-api-event-agnostic-poll-vote-route-so-post-polls-can-be`
Sources: TRI-9 spec §7 decision D2, tribe-mobile `docs/api/openapi.yaml` (`vote`, `removeVote`).
Unblocks: TRI-45 (EVT-03) and POST-02-poll voting. Related: TRI-151 (inline poll on create post).

---

## 1. What landed

| Route | Notes |
|---|---|
| `POST /tribes/{tid}/polls/{pid}/votes` `{ optionIds }` | new; event polls and post polls alike |
| `DELETE /tribes/{tid}/polls/{pid}/votes[?optionId]` | new |
| `POST/DELETE /tribes/{tid}/events/{eid}/polls/{pid}/votes` | kept as thin aliases over the same code path; the poll must belong to `{eid}` |

`lib/services/poll-votes.ts` is the one code path: signed in → member of `{tid}` → `resolvePollOwner(pid)`
walks `poll.event_id → event.tribe_id` or `poll.post_id → post.tribe_id`; the owner tribe must be `{tid}`
(and the alias's `{eid}` must be the poll's event), otherwise **404 "Poll not found"** so ids cannot be
probed across tribes. Then `votePoll` / `removeVote` from `lib/services/poll.ts`, unchanged.

Fixed on the way: the old event route never checked that the poll belonged to the tribe or event in the
URL, so any member of any tribe could vote on any poll id.

## 2. Decisions

- Cross-tribe or wrong-event → 404 (not 403): the caller learns nothing about a poll outside their tribe.
- `pollResultsVisibility` / `allowAnonymousPolls` are read-side settings (the poll list honours them);
  the vote routes did not consult them before and still do not. A post poll has no event settings; if a
  tribe-level default is wanted later it belongs in the list payload, not here.
- Request/response bodies are the event route's: `{ optionIds: uuid[] }` (min 1) → `{ success: true }`.

## 3. Verification (2026-09-22)

- **Typecheck**: `npx next typegen && npx tsc --noEmit` — 9 errors before and after, none in touched files.
- **Request matrix: 16 of 16** against `next dev` + Development as the College Friends owner (`home15`),
  a member (`home16`) and a non-member (`home5`), on a scratch event with a poll deleted afterwards
  (`tri150-verify.sh` in the session scratchpad): vote via `/polls` 200 and recorded; empty body 400;
  non-member 403; member of another tribe using that tribe's id 404; unknown poll 404; vote via the event
  alias 200 and replaces; alias with the wrong event 404; remove via `/polls` 200 and gone; remove as a
  non-member 403; remove via the alias 200; signed out 401; cleanup.
- Not covered: a **post-owned** poll end to end — nothing creates one yet (TRI-151); the owner walk is
  exercised through the event side and the left join on `post` typechecks against the schema.

## 4. On merge

In tribe-mobile `openapi.yaml`, add `POST`/`DELETE /tribes/{tribeId}/polls/{pollId}/votes`
(`votePoll`, `removePollVote`, `x-status: existing`) and regenerate; EVT-03 and POST-02-poll can then
call the poll-id route. No SQL.
