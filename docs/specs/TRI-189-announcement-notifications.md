# TRI-189 · Emit: announcements (posts, pins, event announce)

Status: in review as MVP #55 (2026-09-24); verified on Neon `Development`
Linear: https://linear.app/tribenetwork/issue/TRI-189 · owner answer on TRI-257: announcements **and** pins notify.

Until TRI-257 splits them, a pin *is* the announcement (`post.isPinned`), so:

| trigger | recipients | first line (after the actor) | second line | link |
|---|---|---|---|---|
| `createPost` with `isPinned` | every member but the author | "posted an announcement" | the post, one line, ≤ 140 chars | the post |
| `togglePostPin` → pinned | every member but the pinner (the post's author included) | "pinned a post" | same | the post |
| `togglePostPin` → unpinned | nobody | | | |
| EVT-09 `POST …/events/:id/announce` | going + maybe attendees | "sent an update about {event}" | the text | the event |

- Type `announcement` for all three (the event announce was `event_update` before).
- Post rows collapse per post (`collapse: true`): pin, unpin, pin again while unread stays one row. Every event
  announce is its own row.
- Both post paths notify inside the post's transaction (`togglePostPin` now runs in one).
- Fan-out: one multi-row insert of (members − 1) rows in the author's transaction; fine for alpha tribes (hundreds).
  With tribes in the thousands, switch to a broadcast row the worker expands, same call site.
- When TRI-257 lands: "posted an announcement" follows `isAnnouncement`, and pins keep "pinned a post".

## Verification (2026-09-24, local tribe-v2 + curl, College Friends, 9 members)

1. home17 creates an announcement → 8 rows (not home17), text flattened.
2. home16 plain post → none.
3. home17 pins it → 8 rows incl. home16 (the author), actor home17.
4. Unpin → unchanged. 5. Pin again → still 8 rows.
6. Event announce → `announcement`, "sent an update about Alpha M2 Fix Check", app link.

`npx tsc --noEmit`: 9 errors, same as main.
