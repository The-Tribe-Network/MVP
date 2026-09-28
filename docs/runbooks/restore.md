# Restoring data (TRI-120)

What protects Tribe's data, and how to get it back. Rehearsed once on 2026-09-28 (below).

## What we have today

| Data | Where | Protection | How far back |
| --- | --- | --- | --- |
| Database (users, tribes, posts, events, chat, notifications…) | Neon project `plain-dawn-73831435`, branch **Production** `br-small-wind-ahbxmjc9` (Development `br-sweet-frog-ah0nrlva`) | Neon history window: any second inside it can be branched or restored | **6 hours** (Neon Free plan; the maximum on Free). No snapshot schedule. One manual snapshot slot, taken (Development, 2025-12-31) |
| Photos (originals + derived sizes) | Cloudinary, one account for Development **and** Production (`CLOUDINARY_CLOUD_NAME` is shared) | **None.** Cloudinary Free, no backup add-on. Deleting a photo (or an account, which destroys its photos) removes the asset for good | — |

The recovery point for the database is therefore "a mistake noticed within 6 hours"; for photos there is none.

## Restore the database to a point in time

A restore never touches Production directly: branch from the moment before the mistake, check it, then copy what's needed back (or promote the branch).

1. **Pick the moment.** Find the last good second: `created_at` / `updated_at` of the rows involved, `event_change_email` / `notification` rows written by the same action, or Vercel logs. It must be inside the history window (6 h today).
2. **Create a branch from that moment** (API; the Neon MCP `create_branch` only branches from now):
   ```bash
   curl -X POST https://console.neon.tech/api/v2/projects/plain-dawn-73831435/branches \
     -H "Authorization: Bearer $NEON_API_KEY" -H 'Content-Type: application/json' \
     -d '{"branch":{"parent_id":"br-small-wind-ahbxmjc9","parent_timestamp":"2026-09-28T02:37:00Z","name":"restore-<what>-<date>"},
          "endpoints":[{"type":"read_write","autoscaling_limit_min_cu":0.25,"autoscaling_limit_max_cu":0.25}]}'
   ```
   (CLI: `neonctl branches create --parent <timestamp>` branches the **default** branch, Production, at that time.)
3. **Check it** with SQL on the new branch (Neon MCP `run_sql` with its branch id, or its connection string).
4. **Bring the data back**, smallest step first:
   - a few rows → `INSERT … SELECT` from the restore branch into Production (connect to both, or export the rows as SQL);
   - a whole table → `pg_dump -t <table>` from the branch, restore into Production;
   - everything → Neon Console **Restore** (instant restore of the root branch to that time; Production's current state is kept as a backup branch).
5. **Delete the restore branch** when done (Free allows 10 branches per project).

## Rehearsal, 2026-09-28

Goal: bring back an event deleted about 30 minutes earlier (the TRI-349 test event `03d536a0-…`, on Development, which has the real test data; Production had no users yet).

| Step | Time |
| --- | --- |
| Confirm the event is gone from Development | 03:08 UTC |
| First branch at 02:45 → wrong moment: the event was already deleted (its delete wrote rows at 02:38–02:44; I had the timeline wrong) | branch ready in ~1 s |
| Second branch `tri120-restore-drill-0237` (`br-muddy-truth-ahqb3yg8`) at **02:37:00** | ready in **1.7 s** |
| Checked: the event is back as it was at 02:37 ("TRI-349 email check (renamed)", upcoming, New Bar) with its 2 RSVPs; 58 users, 8 tribes, 66 posts, 216 photos, 10 chat messages | 03:09:54 UTC |

**About 2 minutes from start to verified data**, most of it choosing the moment. Lessons: the restore itself is instant; the hard part is the timestamp, so read it off the rows the mistake wrote (step 1). The snapshot route failed ("snapshots limit exceeded": Free has one slot, already used), so point-in-time branching is the only restore path on Free.

## What should change before real groups (owner decisions)

1. **Neon: move to Launch and set the history window to 7 days** (Neon's own production recommendation). History storage is $0.20/GB-month; the database is ~100 MB. Then add a daily snapshot schedule on Production.
2. **Photos: some copy that outlives a delete.** Either Cloudinary's backup (a paid Cloudinary plan), or our own nightly copy of new originals to cheap object storage (R2/S3). Cheaper still for the alpha: stop destroying assets immediately on delete (keep them 30 days, then purge), which covers "I deleted it by mistake".
3. **Separate Cloudinary accounts (or folders) for Development and Production**, so test clean-up can never touch real photos.
