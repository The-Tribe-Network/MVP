# Email

Transactional email through [Resend](https://resend.com). One folder per email under `templates/`, each with a
`send-*.ts` sender, an HTML and a plain-text template, and its data type.

## Sending

Every sender calls `sendEmail()` from `client.ts`. It sets the sender (`RESEND_FROM_EMAIL`) and, when
`SUPPORT_EMAIL` is set, the reply-to address. Resend reports API errors in its result rather than by throwing;
`sendEmail()` throws on them and logs the recipient's domain only, never the address (TRI-341). So every caller
decides what a failed send means:

- **Codes** (verify email, reset password, change email) are awaited in the Better-Auth `emailOTP` plugin
  (`lib/clients/auth.ts`). In production a failed send answers **502 `EMAIL_NOT_SENT`** instead of Better-Auth's usual 200;
  elsewhere it is logged and still answers 200 (Development's `resend.dev` sender reaches only the Resend account owner).
- **Everything else** (invites, report emails, the email-changed notice) is awaited inside a `try`/`catch` and
  logged: a failed email never fails or undoes the action that triggered it.

## New emails: layout, opt-outs, skip rules (TRI-344)

- **Layout.** `renderEmail()` (`layout.ts`) returns `{ html, text }` for one shell: heading, paragraphs (plain text,
  escaped) or custom blocks, an optional button, and a footer with why the email came, the support address and, for
  opt-out categories, an unsubscribe link. Inline styles, Tribe colours. New emails use it; old templates can move
  over time.
- **Categories.** `EMAIL_CATEGORIES` (`unsubscribe.ts`): `eventUpdates` (event cancelled or moved, day-before
  reminder) and `digest`. Security and account emails have no category and no unsubscribe.
- **Unsubscribe.** `unsubscribeUrl(userId, category)` carries a signed token (HMAC of `BETTER_AUTH_SECRET`, never
  expires, switches only that category). Pass `unsubscribe: { userId, category }` to both `renderEmail()` and
  `sendEmail()`: the second adds `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058 one-click). The public
  route `/api/email/unsubscribe?token=` shows a confirm page on GET (mail scanners open links) and unsubscribes on
  POST, with a "Subscribe again" undo.
- **Once-only emails** claim a row in `email_log` (user + key) before sending (`tri350-email-log.sql`).
- **Opt-outs** live in `user_email_preference` (no row = everything on; `tri344-email-preferences.sql`).
- **Skip rules.** `emailRecipients(userIds, { category, actorId?, mutedTribeId? })`
  (`lib/services/email-preferences.ts`) keeps only live, verified, opted-in users, drops the actor and anyone
  blocked either way with them, and, when `mutedTribeId` is given, anyone who muted that tribe. One query.

## Links

Links in emails start from `appUrl`, which is `publicBaseUrl()` (`lib/constants/urls.ts`): `BETTER_AUTH_URL`, then
`NEXT_PUBLIC_APP_URL`. Production must set one; without it production logs an error and uses
`https://api.tribehq.io`, never localhost (TRI-339). Share links for invite codes use `INVITE_LINK_BASE_URL` first.

Code lifetime is `AUTH_CONSTANTS.OTP_EXPIRES_MINUTES` (`lib/constants/auth.ts`): the plugin's `expiresIn` and the
"expires in N minutes" copy both read it (TRI-342).

## Emails

| Folder | Sent when |
| --- | --- |
| `otp-email-verification` | a verification code is requested |
| `otp-forget-password` | a password reset code is requested |
| `email-change` | a code to the new address, and a notice to the old one once the change is done |
| `tribe-invitation`, `-accepted`, `-rejected` | an invite is sent, accepted or declined |
| `content-report` | content is reported (tribe owner + `PLATFORM_OWNER_EMAIL`) |
| `waitlist` | someone joins the web waitlist |
| `lib/services/event-change-emails.ts` (no template folder; built with `renderEmail()`) | an event someone is going to (or might go to, or hosts) is cancelled, deleted while upcoming, or gets a new time or place (TRI-349). Queued in the edit's transaction (`event_change_email`); a cancellation goes right after the request, a change after a 10-minute window that folds further edits; the cron route sends what is due. Category `eventUpdates` |
| `lib/services/event-reminder-emails.ts` | the day-before reminder (TRI-350) to people going who RSVP'd before the one-day mark, when the event's reminders are on; sent from the cron's reminder pass, once per event per person ever (`email_log`). Category `eventUpdates` |
| `lib/services/digest-emails.ts` | the daily digest (TRI-347): from the cron, in the 9 am hour of the user's timezone (else US Eastern), once per local day (`email_log` `digest:<date>`), only when unread notifications changed since the last digest (else the last 24 h). Up to 8 rows grouped by tribe, muted tribes and blocked people left out. Category `digest` |
| `account-emails.ts` (no template folder; `renderEmail()`) | security and account notices, no unsubscribe (TRI-348): password changed (after `/change-password` and `/email-otp/reset-password`, from `hooks.after`), account deleted (to the address the account had before the scrub), account deactivated, and a welcome once per user (`email_log` key `welcome`) after the first email verification or on a social sign-up |

## Environment

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | required; the client throws at import without it |
| `RESEND_FROM_EMAIL` | sender; must be on a domain verified in Resend (`tribehq.io`). `resend.dev` only reaches the Resend account owner |
| `SUPPORT_EMAIL` | reply-to and the "contact support" address |
| `BETTER_AUTH_URL` | public base URL for links |
| `INVITE_LINK_BASE_URL` | host that serves `/join/:code` |
