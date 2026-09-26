# TRI-317 · Chat @mentions and replies, per-timeline mute

Owner 2026-09-25: chat messages don't notify by default; only @mentions and replies to your message do, and each
timeline can be muted. In-app only for the alpha (push is the notification service, Closed Beta).

## Emits (`lib/services/chat.ts` → `notify()`, TRI-183)

- **Send**: in the message's own transaction (ADR-17). The author of the message being replied to (unless it was
  deleted, or is the sender) gets `reply`; every other mentioned member gets `mention`, so nobody gets both for
  one message.
- **Edit**: only members the edit newly mentions get `mention`.
- Both use `entityType: "timeline"`, `entityId` = the chat timeline, `collapse: true`: **one unread row per type per
  timeline per recipient**; a busy chat grows `actorCount` and updates the text instead of flooding the feed.
- Title "mentioned you in 💬 Chat room" / "replied to you in 💬 Chat room"; message = the excerpt (or "Sent a photo");
  link `tribe://tribe/{tribeId}/timelines/{timelineId}` (`appLink.timeline`; the app resolves it from TL-1).
- `notify()` still drops the actor, blocked pairs and deactivated accounts; muted members are dropped before it.
- Deleting a timeline also deletes its `entityType = timeline` rows (they quote its messages).

## Mute

- Table `timeline_mute (timeline_id, user_id)` (migration `tri317-timeline-mute.sql`, Development + Production 2026-09-26).
- `PUT /tribes/:id/timelines/:tid/mute { muted }` → `{ isMuted }` (idempotent; 404 unknown timeline, 400 bad body).
- `GET /tribes/:id/timelines` rows carry `isMuted`.
- **A muted timeline sends no mention or reply rows at all** — stricter than a tribe mute (NOTIF-04), which keeps the
  rows and only drops badges. Unread counts in the switcher are unaffected (they come from read state).

## Verified (local, Development, 2026-09-26): 17/17

Plain message → no rows; mention rows for the mentioned (not the sender); reply beats mention; collapsing per
timeline; mute / `isMuted` / muted mention and reply produce nothing / unmute idempotent; an edit's new mention;
400 / 404; timeline delete removes its rows. TRI-314 (37/37) and TRI-316 live (18/18) re-run green. `tsc` unchanged (9).
