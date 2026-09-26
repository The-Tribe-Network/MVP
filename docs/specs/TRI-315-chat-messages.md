# TRI-315 · Chat messages in chat timelines

PRD §5.13 R13.6 (tribe-mobile). Builds on TRI-313/314. Live delivery is TRI-316 (Ably); @mention and reply
notifications and per-timeline mute are TRI-317. Owner 2026-09-25: link previews yes; threads, GIFs, presence no.

## Schema (`lib/database/schemas/chat.ts`, migration `tri315-chat-messages.sql`)

- Drops the never-built `message` / `message_read` tables and `message_type` (0 rows on Development and Production;
  owner decision). Direct messages (post-MVP) get their own design.
- `chat_message`: `timeline_id` (cascade), `tribe_id`, `author_id`, `body`, `reply_to_id` (set null),
  `mention_user_ids uuid[]`, `link_preview jsonb`, `edited_at`, `deleted_at`, timestamps. Index
  `(timeline_id, created_at desc, id desc)`.
- `chat_message_media` (ordered photos; a photo belongs to one message) and `chat_message_reaction`
  (one row per member per emoji).
- `report_target_type` gains `message`.
- Unread counts reuse `timeline_read` (TRI-314): messages by others since the last `/read`, not deleted, no blocked pair.

## Routes (under `/tribes/:id/timelines/:tid/messages`; a posts timeline is 404 here)

| Route | Who | Notes |
|---|---|---|
| `GET ?before=&limit=` | member | `{ messages, hasMore }` newest first, 30 default / 100 max; `before` = a message id (cursor compared in SQL) |
| `POST { body?, mediaIds?, replyToId?, mentionUserIds? }` | `canSendMessages` + the timeline's `postPermission` | 201 `{ message }`. Text or ≥1 photo (`EMPTY_MESSAGE`); photos = own, this tribe, images, on no post or message (`INVALID_MEDIA`, max 10); reply parent visible in this timeline (`INVALID_REPLY`); mentions filtered to members (max 20) |
| `PATCH /:mid { body, mentionUserIds? }` | the author | `editedAt` set; a changed URL re-unfurls |
| `DELETE /:mid` | the author, or `canDeleteAnyPost` | Placeholder: body, preview, mentions cleared, `deletedAt` set; its photos (media rows) and reactions deleted |
| `POST /:mid/reactions { emoji }` / `DELETE /:mid/reactions?emoji=` | member | idempotent; returns `{ reactions }`. Deleted message → 400 `MESSAGE_DELETED` |

Errors are `{ error, code }`: `NOT_A_MEMBER` 403, `NOT_FOUND` 404, `FORBIDDEN` 403, and the 400s above.

`ChatMessage`: `id, timelineId, author (UserPreview), body, media[] (ImageRef), replyTo { id, author, excerpt,
isDeleted } | null, mentionUserIds, reactions [{ emoji, count, reactedByMe }], linkPreview { url, title, description,
imageUrl, siteName } | null, editedAt, deletedAt, createdAt`.

**Blocking (TRI-238):** a blocked pair's messages, reactions and reply parents are hidden both ways; acting on
one is 404. **Reports:** `POST /reports { targetType: "message" }` (not deleted, not a blocked pair's).
**Mentions:** stored as user ids next to the plain "@Name" text, so a rename never breaks one (precedent for TRI-287).
**Timeline delete** (TRI-314) now also deletes the chat photos, then cascades messages.

## Link previews (`lib/services/link-preview.ts`)

After the response (`after()`), the first http(s) URL is fetched and its Open Graph tags stored, only if the
message is unchanged and not deleted. SSRF guard on every hop: http(s), ports 80/443, no credentials, no
`localhost`/`.local`/`.internal`, every resolved address public (private, loopback, link-local incl. metadata, CGNAT,
ULA, multicast, IPv4-mapped refused); redirects followed by hand (max 3); 4 s timeout; 512 KB cap; HTML only.
Residual risk: DNS rebinding between check and connect.

## Verified (local, Development, 2026-09-25): 41/41

home15 owner / home17 admin / home16 member of College Friends: empty history; send with mentions filtered to members;
empty 400; two photos; reused photo 400; reply; bad reply 400; admins-only chat 403 member / 201 admin; posts timeline 404;
post into a chat 400; newest-first order; two pages via `before`; chat unread 3 and 1, 0 after `/read`; `canPost` per chat;
reactions idempotent, remove, `reactedByMe` per viewer; edit own, others 403; link preview for example.com; no preview
for 169.254.169.254 or localhost; block → hidden both ways incl. reactions, react 404; report 201, own 400; member can't
delete admin's (403), admin deletes any → placeholder, reply shows `isDeleted`; react on deleted 400; delete own;
deleted not unread; non-member 403; deleting the chat timeline removed its photos, messages and reactions. Test rows
removed. `tsc` baseline unchanged (9).

Migration: Development (run twice) and Production 2026-09-26.
