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
| `welcome` | not sent yet (the alpha emails project wires it up) |

## Environment

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | required; the client throws at import without it |
| `RESEND_FROM_EMAIL` | sender; must be on a domain verified in Resend (`tribehq.io`). `resend.dev` only reaches the Resend account owner |
| `SUPPORT_EMAIL` | reply-to and the "contact support" address |
| `BETTER_AUTH_URL` | public base URL for links |
| `INVITE_LINK_BASE_URL` | host that serves `/join/:code` |
