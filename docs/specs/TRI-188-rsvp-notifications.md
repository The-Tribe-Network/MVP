# TRI-188 · Emit: RSVP changes, to hosts and co-hosts

Status: in review as MVP #55 (2026-09-24); verified on Neon `Development`
Linear: https://linear.app/tribenetwork/issue/TRI-188

## Behaviour

`addEventAttendee` and `removeEventAttendee` (`lib/services/event.ts`) run in a transaction; the previous answer is
read `FOR UPDATE` and `notifyHostsOfRsvp` decides.

| previous → next | first line (after the attendee's name) |
|---|---|
| any → going | "is going to {event}" |
| any → maybe | "might go to {event}" |
| going / maybe → not going | "can't go to {event}" |
| going / maybe → removed (DELETE) | "is no longer going to {event}" |
| same answer (guest count / note edit), none → not going, not going → removed | nothing |

- Second line: "+N guests" when going with guests (after the event's guest allowance), else empty.
- Recipients: the creator and co-hosts; a host's own RSVP notifies nobody else about themselves (`notify()` drops the
  actor). Host removals (`removeMultipleEventAttendees`) notify nobody.
- One collapsing row per host per event (`collapse: true`, key `rsvp:event:<id>`): the latest answer and actor show.
- **Off when the event's "RSVP changes" setting is off** (EVT-11 `notifyOnRsvpChanges`; the event's row, else the
  tribe default, else on). Per the owner's two-level rule (2026-09-24) this setting means "don't notify the hosts",
  so no row is written.
- Cancelled events send nothing.

## Copy and links for every emit point (fixed in this branch)

The app renders a row as **actor** + `title` on the first line and `message` below (mobile `NotificationRow`, mock
world: "**Emma** is going to Family Dinner / Sunday at 6:00 PM"), and resolves `tribe://tribe/<id>/…` links. So
`title` is the verb phrase and links use `appLink` (`lib/services/notifications.ts`). Changed with it: TRI-191
("cancelled / changed the time of / changed the location of {event}"), EVT-09 announce ("sent an update about
{event}" + the text), co-host request ("asked to co-host {event}", opens EVT-04 manage).

## Verification (2026-09-24, local tribe-v2 + curl, event "TRI-188 RSVP Check", home17 creator, home15 co-host)

1. home16 going → home15 and home17 get "is going to …".
2. home16 same answer + note → unchanged.
3. home1 maybe → the rows collapse to "might go to …" with home1 as actor.
4. home1 can't go → "can't go to …".
5. home15 (co-host) going → home17's row updates; home15's own row does not.
6. home16 removes the RSVP → "is no longer going to …".
7. home16's first answer "can't go" → nothing.
8. home17 turns "RSVP changes" off (PATCH settings) → 9. home16 going → nothing.

Known: `actor_count` counts actor switches, not distinct people (3 people gave 4). The app doesn't show it yet;
exact counts come with the TRI-7 feed ("and N others").

`npx tsc --noEmit`: 9 errors, same as main.
