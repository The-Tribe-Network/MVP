# TRI-294 · API · Change email with a code

Status: in review · 2026-09-25
Linear: https://linear.app/tribenetwork/issue/TRI-294
Powers: USET-03 "Change email" row (mobile). Follows `docs/specs/TRI-16-account-fields.md` §5 (email change was off).

## 1. Flow

The app verifies emails with 6-digit codes, so this uses Better-Auth 1.7.5's built-in **emailOTP change-email**
(`emailOTP({ changeEmail: { enabled: true } })`), not the link-based `user.changeEmail`. No new routes, no migration.

1. `POST /api/auth/email-otp/request-email-change` `{ newEmail }` (signed in) → a 6-digit code is emailed to the
   **new** address (subject "Confirm your new email", same look as the verification code email). Stored in
   `verification` as `change-email-otp-<oldEmail>-<newEmail>` → `<code>:<attempts>`, expires in 5 minutes.
2. `POST /api/auth/email-otp/change-email` `{ newEmail, otp }` (signed in) → `user.email = newEmail`,
   `emailVerified = true`, the session cookie is refreshed. The **old** address gets a notice ("Your email address
   was changed to ne•••@domain"; fire-and-forget, a send failure never fails the change).

Decisions:
- **The current address does not confirm with a second code** (`verifyCurrentEmail` off): the signed-in session is
  the proof; the notice to the old address is the safety net.
- **Other sessions are kept** (the bearer that made the change and every other device stay signed in). Password
  and sign-in credentials are unchanged; the user signs in with the new address from now on; the old one fails.
- **Taken address is a 409 on request** (Better-Auth itself answers a silent 200 to avoid account enumeration).
  The owner asked for `EMAIL_TAKEN`; the leak is limited to signed-in users and rate-limited.
- **Rate limit per account**, counted from the pending code rows: 1 send per minute and 5 per hour (Better-Auth's
  own limiter is per IP, in memory and production-only: 3 per 60 s on both endpoints, which still applies on top).

Implementation (`lib/clients/auth.ts`): `changeEmail.enabled`; the `change-email` branch of `sendVerificationOTP`;
`hooks.before` → `checkEmailChange()` on both endpoints (specific error codes, rate limit); `hooks.after` sends
the notice. Emails: `lib/email/templates/email-change/send-email-change-emails.ts`.

## 2. Mobile contract on merge

Both routes need the session (bearer or cookie) and `origin` like every Better-Auth call. Errors are
`{ code, message }`.

`POST /api/auth/email-otp/request-email-change` — body `{ newEmail: string }`

| Case | Response |
|---|---|
| sent | 200 `{ success: true }` |
| no session | 401 `UNAUTHORIZED` |
| not an email | 400 `INVALID_EMAIL` |
| same as the current email (case-insensitive) | 400 `EMAIL_SAME` |
| another account uses it | 409 `EMAIL_TAKEN` |
| more than 1 send a minute / 5 an hour for this account | 429 `RATE_LIMITED` |

`POST /api/auth/email-otp/change-email` — body `{ newEmail: string, otp: string }`

| Case | Response |
|---|---|
| changed | 200 `{ success: true }`; refetch `GET /user/profile` (email, `emailVerified: true`) |
| no session | 401 `UNAUTHORIZED` |
| wrong code / no pending code for that address | 400 `INVALID_OTP` |
| code older than 5 minutes | 400 `OTP_EXPIRED` |
| 3 wrong tries on one code | 403 `TOO_MANY_ATTEMPTS` (request a new code) |
| `INVALID_EMAIL` / `EMAIL_SAME` / `EMAIL_TAKEN` | as above (taken is checked again before the code is used) |

Mobile: USET-03 "Change email" row → new-address screen (request) → 6-digit code screen (verify, "Resend" after
60 s) → refresh the profile/session user. The Better-Auth client methods are `authClient.emailOtp.requestEmailChange`
and `authClient.emailOtp.changeEmail`. In `docs/api/openapi.yaml` add the two operations (or document them in
`AUTH.md` beside the other emailOTP calls) with the codes above.

## 3. Verification (2026-09-25, `next dev` + Neon Development)

Throwaway `tri294-<run>@tribe-seed.test` user, two bearer sessions; codes read from `verification`:
- request: no session 401; `nope` 400 `INVALID_EMAIL`; own email upper-cased 400 `EMAIL_SAME`;
  `home15@tribe-seed.test` 409 `EMAIL_TAKEN`; new address 200 (one `change-email-otp-…` row, `code:0`);
  immediate resend 429 `RATE_LIMITED`.
- verify: `000000` 400 `INVALID_OTP`; taken address 409 `EMAIL_TAKEN`; right code 200; the same call again 400
  `EMAIL_SAME` (the email already changed; the code row is gone); `GET /user/profile` shows the new email with
  `emailVerified: true`; the second session still 200; sign-in with the old email 401, with the new 200.
- a second change (new → new2) fired the old-address notice to the right address (Resend's sandbox refuses
  non-owner recipients in dev, so no mail was delivered; same as every other dev email).
- throwaway users and their code rows deleted afterwards. `npx tsc --noEmit`: the 9 baseline errors.
