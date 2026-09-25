# TRI-186 · Emit: comments on your post/event and replies to your comment

Status: in review as MVP #55 (2026-09-24); verified on Neon `Development`
Linear: https://linear.app/tribenetwork/issue/TRI-186 · **mentions are not in this change** (no format agreed; see §3).

## 1. Behaviour

`createComment` and `createEventComment` (`lib/services/comment.ts`) insert the comment and its notifications in one
`getDbTransaction()` transaction.

| trigger | recipient | type | first line (after the actor) | second line | link |
|---|---|---|---|---|---|
| comment on a post | the post's author | `comment` | "commented on your post" | the comment, ≤ 140 chars | the post, `?commentId=<new comment>` |
| comment on an event | creator + co-hosts, if the event's "Comments" setting is on (default on) | `comment` | "commented on {event}" | same | the event |
| a reply (`parentCommentId`) | the parent comment's author, unless they already got the comment row or wrote the reply | `reply` | "replied to your comment" | same | as above |

- Nobody hears about their own comment (`notify()` drops the actor).
- Collapse: one unread `comment` row per post / event per recipient, one `reply` row per parent comment.
- EVT-11 "Comments" off means the hosts don't want these at all, so no row (owner's two-level rule, 2026-09-24).
  Replies to a host's own comment still reach them.

## 2. Verification (2026-09-24, local tribe-v2 + curl)

home16's post and the "TRI-188 RSVP Check" event (home17 creator, home15 co-host):
1. home17 comments → home16 "commented on your post". 2. home1 comments → the same row, actor home1.
3. home16 (author) comments → no change. 4. home15 replies to home1 → home16's row updates; home1 gets "replied to
your comment". 5. home16 replies to home17 → home17 gets the reply row; home16 nothing. 6. home16 comments on the
event → home17 and home15 "commented on TRI-188 RSVP Check". 7–8. Comments setting off, home1 comments → no new rows.

`npx tsc --noEmit`: 9 errors, same as main.

## 3. Mentions (not built)

Neither the app nor the API encodes a mention today. Options: `@username` parsed server-side from the text, or a
structured `mentions: userId[]` sent with the comment (the composer knows whom it picked). Owner decision; the emit
itself is small once the format exists (type `mention`, collapse per comment).
