# TRI-187, 190, 192, 193, 219 · Emit: invites, reminders, new posts/events, likes, poll results

Status: in review as MVP #55 (2026-09-24); verified on Neon `Development`
Builds on `notify()` (TRI-183). Copy convention: `title` is read after the actor's name; with no actor it stands alone.

## Changes to `notify()` (TRI-183)

- **Distinct actors:** new column `notification.actor_ids uuid[]`; a collapse adds the actor only if absent, and
  `actor_count` follows it (like, unlike, like again counts once; TRI-193). Migration
  `tri179c-notification-actor-ids.sql` (additive): run on Development and Production (2026-09-24).
- **`once`:** with a collapse key, skip recipients who *ever* had that key, read or not. Scheduled emits use it so a
  later tick never re-sends a row the recipient already read.
- New types (not yet in the app's contract; TRI-7 / TRI-223 add them): `new_post`, `new_event`, `poll_closed`.

## Emitters

| issue | trigger | recipients | first line | second line | collapse |
|---|---|---|---|---|---|
| TRI-193 | like on a post | post author | "liked your post" | the post | per post |
| TRI-193 | like on a comment | comment author | "liked your comment" | the comment | per comment |
| TRI-192 | post (not an announcement) | members | "shared a new post" | the post | per tribe |
| TRI-192 | event created | members | "created an event" | event title | per tribe |
| TRI-187 | invitation to an existing user (also on resend) | invitee | "invited you to {tribe}" | | per invitation |
| TRI-187 | invitation accepted | inviter | "accepted your invite to {tribe}" | | none |
| TRI-190 | cron: a reminder window opens | going + maybe attendees | "{event} starts in 1 hour" (no actor) | | per window + start, `once` |
| TRI-219 | cron: an event poll's `endsAt` passed | creator, voters, hosts, going + maybe | "Poll closed: {question}" (no actor) | "{option} won" / "Tied: A and B" / "No votes" / nothing if `hidden` | per poll, `once` |

- Unlikes leave the row alone. Likes on your own post/comment say nothing (the actor is dropped).
- Invites use `tribe://invite/<id>`; email-only invitees still get only the email.
- **Reminders:** schedule from the event's settings, else the tribe's, else `1d,1h`; off when reminders are off or the
  event is cancelled. A window is due from `start − w` for half the window, at most 30 min; a later tick skips it
  (no "starts in 1 hour" 20 minutes before). A fresh event inside two windows gets only the nearer one. Rescheduling
  gives new keys, so attendees are reminded for the new time. No time in the text (no reader time zone).
- **Poll results:** event polls only (post polls have no setting; left out of v1); off when the event's "Poll
  results" is off; results named unless visibility is `hidden`; anonymous polls name nobody. Going + maybe attendees
  who didn't vote are included (the issue's recommendation). Polls closed in the last 7 days are picked up, so a
  missed tick is caught up.
- Cron route `GET /api/cron/notifications`, `vercel.json` every 15 min. Needs `CRON_SECRET` on Vercel (sent as a
  bearer by Vercel Cron) and **Vercel Pro** (Hobby allows daily crons only, and rejects the deploy otherwise). In
  development the secret is optional and `?now=<ISO>` fakes the clock.

## Verification (2026-09-24, local tribe-v2 + curl, College Friends)

- Likes: home1 + home15 like home16's post → one row x2; home1 unlike + like again → still x2; home17 likes home1's
  comment → "liked your comment"; home16 likes own post → nothing.
- New posts: home16 then home1 post → one row per member (x2), each author only sees the other's.
  New events: two by home17 → one row per member, x1 (same actor).
- Invites: home17 invites home10 → one row; resend → still one; home10 accepts → home17 "accepted your invite".
- Cron: events starting in 55 min and in 23 h 50 → "starts in 1 hour" / "starts in 1 day" to the going attendees;
  a second tick and a tick after marking them read → 0 sent; a tick 50 min later (1 h window missed) → 0.
  Anonymous poll with votes 2–1 → "Oct 4 won" to creator + 3 voters; a second tick → 0.
- `npx tsc --noEmit`: 9 errors, same as main.
