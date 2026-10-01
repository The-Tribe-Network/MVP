// GET /privacy (TRI-103 draft, checked against both repos on 2026-09-29; owner approval pending). Keep it in step with
// the App Store privacy labels: Contact Info, User Content, Identifiers, Usage Data, Diagnostics, all linked to the
// user, none used for tracking.
export const PRIVACY = {
  title: "Privacy Policy",
  updated: "October 1, 2026",
  markdown: `
Tribe ("we", "us") is an app for small groups of friends and family to plan events, share photos and keep in touch. This policy explains what we collect, why, who helps us run the service, and the choices you have. Contact: [support@tribehq.io](mailto:support@tribehq.io).

## What we collect

**Account information.** Your name, email address, password (stored hashed), username, and your birthday. We ask for your birthday to confirm you are at least 13; we do not show it to other people.

**Profile information you choose to add.** Display name, profile photo, bio, location, social links, and your privacy choices for your profile.

**What you create and share.** Tribes you create or join, posts, comments, chat messages and reactions, events, RSVPs (including any guest count and note), poll votes, photos and albums, likes, and reports you file. People in the same tribe can see this content, following the tribe's settings.

**Invitations.** When you invite someone by email, we store that email address to send the invitation and to match it when they join.

**Notifications and email preferences.** Which notifications you have read, the tribes you muted, and which emails you want. You can turn off digests and other non-essential emails, and every such email has a one-click unsubscribe.

**Usage and diagnostic information.** From our apps: which screens you open and actions such as creating a post or RSVPing, linked to your account ID only (not your name or email), the app version, and your device type and OS version. We do not record your screen, and we discard your IP address for analytics. If the app crashes or hits an error, we collect a crash report with your account ID, device and app details; we remove sign-in credentials from these reports. If you send feedback in the app, we receive your message and, if you leave "Include app details" on, your app version, build, OS and device class.

**What we do not collect.** We do not collect your contacts, precise location, or advertising identifiers, and we do not sell your personal information or use it for advertising.

## How we use it

To run Tribe (accounts, tribes, sharing, chat, notifications and reminders); to send you service emails (sign-in and reset codes, invitations, event changes and reminders, security notices, and a daily digest if you keep it on); to keep Tribe safe (reports, blocks, and enforcing our [Community Guidelines](https://api.tribehq.io/guidelines)); to fix problems and improve the app; and to comply with the law.

## Who we share it with

**Other people on Tribe**, according to your tribes' settings and your privacy choices. People you block can't see your content, and you won't see theirs.

**Service providers** that process data for us under contract, only to provide Tribe:

* Vercel (hosting our servers), Neon (our database), Cloudinary (photo storage and processing)
* Resend (sending email), Ably (delivering chat messages in real time)
* PostHog (product analytics and in-app feedback), Sentry (crash and error reports)
* Apple (TestFlight and App Store distribution)

**When required by law**, or to protect the safety of people using Tribe.

## How long we keep it

We keep your information while your account exists. **Deleting your account** (Settings → Account) immediately signs you out everywhere and removes your sign-in details, memberships, RSVPs, drafts, notifications, blocks, social links and privacy settings. Your name, email, username, photo, bio, location and birthday are erased; posts, comments and events you created stay in their tribes as "Deleted user". Photos you uploaded are removed from Tribe right away and permanently destroyed within 30 days. **Deactivating** your account signs you out and hides you until you sign in again; nothing is deleted.

Photos deleted from a tribe are permanently destroyed within 30 days. Database backups are kept for a limited period and then overwritten.

## Your choices and rights

You can edit your profile, change your email and password, control notifications and emails, leave tribes, block people, and delete or deactivate your account in the app. To request a copy of your data or ask a question, email [support@tribehq.io](mailto:support@tribehq.io). Depending on where you live, you may have additional rights (for example, to access, correct or delete your data, or to object to processing); we will honour them as the law requires.

## Children

Tribe is not for children under 13, and we do not knowingly collect information from them. We ask every new account for a birthday and refuse sign-ups under 13. If you believe a child under 13 has an account, email [support@tribehq.io](mailto:support@tribehq.io) and we will delete it.

## Security

Data is encrypted in transit, passwords are hashed, and access to production systems is limited. No service is perfectly secure; if we learn of a breach affecting you, we will tell you as the law requires.

## Changes

If we change this policy in a meaningful way, we will tell you in the app or by email before the change takes effect.
`,
};
