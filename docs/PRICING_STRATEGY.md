# Pricing & Monetization Strategy
## Tribe - Community Organization Platform

**Version:** 2.1
**Last Updated:** January 3, 2026
**Owner:** Product/Finance Team
**Review Cadence:** Quarterly

---

## Table of Contents

1. [Pricing Philosophy](#pricing-philosophy)
2. [Four Monetization Levers](#four-monetization-levers)
3. [Tier Structure](#tier-structure)
4. [Feature Comparison](#feature-comparison)
5. [Unit Economics](#unit-economics)
6. [Break-Even Analysis](#break-even-analysis)
7. [Upgrade Triggers](#upgrade-triggers)
8. [Pricing Evolution Timeline](#pricing-evolution-timeline)
9. [Competitive Analysis](#competitive-analysis)
10. [Implementation Status](#implementation-status)

---

## Pricing Philosophy

### Core Principles

1. **Free to Gain Density:** Phase 1-2 completely free to prove value and achieve lock-in
2. **Value-Based Pricing:** Charge based on Tribe's unique value, not generic SaaS metrics
3. **Keep Social Free:** 80%+ of social communities (fraternities, religious groups, hobby clubs) stay free
4. **Monetize Commercial Use:** Businesses (gyms, hospitality, coworking) pay for advanced features
5. **Natural Upgrade Triggers:** Limits that create organic upgrade moments, not frustration

### Willingness to Pay (WTP) by Segment

| Segment | WTP Range | Primary Upgrade Trigger |
|---------|-----------|------------------------|
| Hobby Groups | $0-5/month | Storage limits |
| Faith Communities | $0-10/month | Multiple events, member management |
| Fraternities/Sororities | $10-20/month | RBAC complexity, event coordination |
| Gyms/Fitness Studios | $30-50/month | Integrations, advanced events |
| Hospitality (VIP Lists) | $30-50/month | Integrations, analytics |
| Country Clubs | $50-100/month | Full feature suite |
| Coworking Spaces | $30-50/month | Integrations, white-label |

**Strategy:** Social communities hit natural limits (storage, events). Commercial communities need advanced features (integrations, analytics).

---

## Four Monetization Levers

Unlike generic SaaS pricing (member counts + storage), Tribe monetizes **four unique value dimensions** that align with our core differentiators:

### 1. Storage (The Vault)

The Vault is Tribe's sticky feature. Once a community has 2-3 years of organized event photos and videos, they cannot leave. Storage limits create natural upgrade moments.

| Tier | Storage | Approx. Content | Video Quality |
|------|---------|-----------------|---------------|
| Free | 10GB | ~2,000 photos or ~70 videos (1min) | Max 1080p |
| Pro | 100GB | ~20,000 photos or ~700 videos | Unlimited |
| Business | Unlimited | Unlimited | Unlimited |

**Video sizing reference:**
- 1-minute 1080p video: ~130-150MB
- 1-minute 4K video: ~350-400MB
- 10-second phone clip: ~15-50MB

**Upgrade trigger:** "We hit our storage limit" or "We need to upload 4K video."

### 2. RBAC Complexity

Tribe's 21 granular permissions is our core differentiator vs. Facebook Groups, WhatsApp, and Discord. We gate the advanced RBAC features, not the basic roles.

| Tier | RBAC Features |
|------|---------------|
| Free | All 4 roles (owner, admin, moderator, member) |
| Pro | + Per-member permission overrides |
| Pro | + Role customization (modify role defaults) |
| Business | + Audit logs for permission changes |
| Business | + Permission templates |

**Upgrade trigger:** "We need to restrict a specific member without changing their role."

### 3. Event Coordination

Events drive real-world connection—Tribe's core thesis. We gate concurrent events and advanced event features.

| Tier | Event Features |
|------|----------------|
| Free | 3 active events at a time |
| Free | Recurring events |
| Free | Basic RSVPs (going, maybe, not going) |
| Free | 1 poll per event (at creation only) |
| Pro | Unlimited active events |
| Pro | Unlimited polls per event |
| Pro | Capacity limits, waitlists, RSVP deadlines |
| Pro | **Private events with invite-only access** |
| Business | Event templates |
| Business | Co-hosts, event links |
| Business | Check-in system |

**Upgrade trigger:** "We need private events, unlimited events, waitlists, or advanced coordination features."

### 4. Integrations

Integrations are a natural Pro/Business feature. They require engineering investment and serve power users.

| Tier | Integrations |
|------|--------------|
| Free | None |
| Pro | Discord + Google Calendar |
| Business | + Slack, Gmail, and all future integrations |

**Upgrade trigger:** "We want our events to sync with our Discord server."

---

## Tier Structure

### Free Tier ($0/month)

**Target:** Small communities, trial users, hobby groups

| Category | Limit |
|----------|-------|
| **Members** | 50 |
| **Storage** | 10GB (~2,000 photos or ~70 videos) |
| **Video quality** | Max 1080p |
| **Roles** | All 4 (owner, admin, moderator, member) |
| **Per-member overrides** | No |
| **Role customization** | No |
| **Active events** | 3 concurrent |
| **Recurring events** | Yes |
| **Polls** | 1 per event (at creation only) |
| **Event features** | Basic RSVPs |
| **Integrations** | None |
| **Support** | Community docs |

### Pro Tier ($19/month)

**Target:** Growing communities with structure (fraternities, religious groups, clubs)

| Category | Limit |
|----------|-------|
| **Members** | Unlimited |
| **Storage** | 100GB (~20,000 photos or ~700 videos) |
| **Video quality** | Unlimited (4K+) |
| **Roles** | All 4 |
| **Per-member overrides** | Yes |
| **Role customization** | Yes (customize role defaults) |
| **Active events** | Unlimited |
| **Polls** | Unlimited per event |
| **Private events** | Yes (invite-only events) |
| **Event features** | + Capacity limits, waitlists, RSVP deadlines |
| **Integrations** | Discord + Google Calendar |
| **Support** | Priority email |

### Business Tier ($49/month)

**Target:** Commercial communities (gyms, hospitality, coworking)

| Category | Limit |
|----------|-------|
| **Members** | Unlimited |
| **Storage** | Unlimited |
| **Video quality** | Unlimited (4K+) |
| **Roles** | All 4 + custom role builder (future) |
| **Per-member overrides** | Yes + audit logs |
| **Role customization** | Yes + permission templates |
| **Active events** | Unlimited |
| **Polls** | Unlimited + anonymous restrictions removed |
| **Private events** | Yes (invite-only events) |
| **Event features** | + Event templates, co-hosts, event links, check-in |
| **Integrations** | All (Discord, Slack, Gmail, Google Calendar, etc.) |
| **Support** | Priority + white-label option |
| **Extras** | Analytics, custom branding |

### Add-Ons (A La Carte)

| Add-On | Price | Notes |
|--------|-------|-------|
| Extra storage | $5/month per 5GB | For photo-heavy communities |
| Additional integration | $5/month | For Pro tier (access individual Business integrations) |
| SMS notifications | $10/month | Via Twilio |
| Custom domain | $5/month | tribe.yourclub.com |

---

## Feature Comparison

| Feature | Free | Pro | Business |
|---------|:----:|:---:|:--------:|
| **Members** | 50 | Unlimited | Unlimited |
| **Storage** | 10GB | 100GB | Unlimited |
| **Video quality** | 1080p max | 4K+ | 4K+ |
| **Basic roles (4)** | ✓ | ✓ | ✓ |
| **Per-member overrides** | - | ✓ | ✓ |
| **Role customization** | - | ✓ | ✓ |
| **Audit logs** | - | - | ✓ |
| **Active events** | 3 | Unlimited | Unlimited |
| **Recurring events** | ✓ | ✓ | ✓ |
| **Basic RSVPs** | ✓ | ✓ | ✓ |
| **Multiple polls** | - | ✓ | ✓ |
| **Capacity & waitlists** | - | ✓ | ✓ |
| **Private events (invite-only)** | - | ✓ | ✓ |
| **Event templates** | - | - | ✓ |
| **Co-hosts** | - | - | ✓ |
| **Check-in** | - | - | ✓ |
| **Discord integration** | - | ✓ | ✓ |
| **Google Calendar sync** | - | ✓ | ✓ |
| **Slack integration** | - | - | ✓ |
| **Gmail integration** | - | - | ✓ |
| **Analytics** | - | - | ✓ |
| **White-label** | - | - | ✓ |
| **Priority support** | - | ✓ | ✓ |

---

## Unit Economics

### Cost per Tribe (Estimated)

| Item | Free Tier | Pro Tier | Business Tier |
|------|-----------|----------|---------------|
| **Cloudinary (storage)** | $2/month (10GB) | $20/month (100GB) | ~$40/month (unlimited, avg ~200GB) |
| **Neon (database)** | $0.50/month | $0.50/month | $1/month |
| **Resend (email)** | $0.25/month | $0.50/month | $1/month |
| **Integration APIs** | $0 | $1/month | $3/month |
| **Support (prorated)** | $0 | $1/month | $3/month |
| **Total Cost** | **$2.75/month** | **$23/month** | **$48/month** |

### Contribution Margin

| Tier | Revenue | Cost | Profit | Margin |
|------|---------|------|--------|--------|
| **Free** | $0 | $2.75 | -$2.75 | - |
| **Pro** | $19 | $23 | -$4 | -21% |
| **Business** | $49 | $48 | $1 | 2% |

**Key Insight:** With generous storage limits (10GB/100GB/Unlimited), unit economics are tighter. However, most tribes won't fully use their storage allocation. Real-world average usage is typically 20-40% of quota, making actual margins significantly better. The generous limits prioritize user experience and reduce churn over short-term profitability.

---

## Break-Even Analysis

**Note:** These calculations assume 100% storage utilization, which is unrealistic. Real-world usage is typically 20-40% of quota.

### Scenario 1: 100 Tribes (20% Pro, 5% Business, 75% Free) - Worst Case (100% usage)

| Tier | Count | Revenue | Cost | Profit |
|------|-------|---------|------|--------|
| Free | 75 | $0 | $206.25 | -$206.25 |
| Pro | 20 | $380 | $460 | -$80 |
| Business | 5 | $245 | $240 | $5 |
| **Total** | **100** | **$625** | **$906.25** | **-$281.25** |

### Scenario 1b: 100 Tribes - Realistic (30% avg storage usage)

| Tier | Count | Revenue | Cost (30% storage) | Profit |
|------|-------|---------|---------------------|--------|
| Free | 75 | $0 | $93.75 | -$93.75 |
| Pro | 20 | $380 | $160 | $220 |
| Business | 5 | $245 | $84 | $161 |
| **Total** | **100** | **$625** | **$337.75** | **$287.25** |

**Break-even:** ~55 tribes with 20% Pro + 5% Business conversion (at realistic 30% storage usage)

**Insight:** Generous storage limits prioritize user experience. Actual margins depend on usage patterns. Early tribes with lower storage usage subsidize the generous limits, and most communities won't approach quota limits.

---

## Upgrade Triggers

### Natural Upgrade Moments

These are the real-world situations that drive upgrades:

| Trigger | Free → Pro | Pro → Business |
|---------|------------|----------------|
| **Storage** | "We hit 10GB" or "We need 4K video uploads" | "We need unlimited storage" |
| **Events** | "We need more than 3 active events" | "We want event templates and check-in" |
| **RBAC** | "We need to restrict a specific pledge" | "We need audit logs for compliance" |
| **Integrations** | "We want Discord sync" | "We need Slack for work" |
| **Scale** | "We grew past 50 members" | N/A |

### Tier Selection Logic

```
Is the tribe commercial (gym, hospitality, coworking)?
├─ Yes → Business Tier ($49/month)
└─ No (social community)
   ├─ > 50 members OR needs advanced RBAC OR needs integrations?
   │  └─ Yes → Pro Tier ($19/month)
   └─ No → Free Tier ($0)
```

---

## Pricing Evolution Timeline

### Phase 1-2: Free (Months 1-4)

**Pricing:** $0 for everyone

**Goal:** Prove product-market fit, gain 60-80 tribes, validate The Vault and RBAC value.

**Burn Rate:**
- 60 tribes × $2.75/month = ~$165/month (manageable, assuming ~30% storage usage: ~$75/month)

### Phase 3: Introduce Pro Tier (Months 5-6)

**Triggers to introduce Pro:**
- 30+ active tribes
- Communities hitting 10GB storage limit or requesting 4K video
- Communities requesting multiple concurrent events
- NPS 9-10 from 60%+ of community leaders

**Pricing:**
- Free: 50 members, 10GB storage (1080p max), 3 events + recurring, no RBAC overrides
- Pro: $19/month - unlimited members/events, 100GB (4K+), full RBAC, integrations

### Phase 4: Introduce Business Tier (Month 7+)

**Triggers to introduce Business:**
- 5+ commercial tribes onboarded
- Pro tier at $1,000+ MRR
- Requests for unlimited storage, analytics, Slack integration

**Pricing:**
- Business: $49/month - Unlimited storage, advanced events, all integrations, analytics

---

## Competitive Analysis

### Competitor Pricing

| Competitor | Free Tier | Paid Tier | Tribe Advantage |
|------------|-----------|-----------|-----------------|
| **Facebook Groups** | Unlimited free | N/A | RBAC, organized albums, no ads |
| **WhatsApp** | Unlimited free | N/A | Events, albums, permissions |
| **Discord** | Unlimited free | $9.99/month (Nitro) | Purpose-built for IRL communities |
| **Meetup** | N/A | $14.99-44.99/month | Free tier, better RBAC |
| **Slack** | 10k messages | $7.25-12.50/user | Per-tribe pricing (not per-user) |
| **Mighty Networks** | N/A | $39-99+/month | Free tier, simpler UX |

### Tribe's Positioning

- **vs. Free tools (FB, WhatsApp, Discord):** Better organization, RBAC, photo archiving
- **vs. Meetup:** Free tier exists, granular permissions, photo-first
- **vs. Slack:** Per-tribe pricing (not per-user), built for communities not work
- **vs. Mighty Networks:** Free tier, simpler, focused on utility not content

---

## Implementation Status

### Current State (What Exists)

| Feature | Database | Service | API | UI | Tier Enforcement |
|---------|:--------:|:-------:|:---:|:--:|:----------------:|
| Storage tracking | ✓ | ✓ | - | - | - |
| RBAC (21 permissions) | ✓ | ✓ | ✓ | ✓ | - |
| Per-member overrides | ✓ | ✓ | ✓ | ✓ | - |
| Role customization | ✓ | ✓ | ✓ | ✓ | - |
| Basic events/RSVPs | ✓ | ✓ | ✓ | ✓ | - |
| Advanced events | ✓ (schema) | - | - | - | - |
| Integrations | - | - | - | - | - |

### Implementation Priority

1. **Storage limits** - Highest ROI, `getTribeStorageUsed()` already exists
2. **Event count limits** - Simple to implement, clear upgrade trigger
3. **RBAC feature gates** - Per-member overrides, role customization
4. **Integrations** - Requires building the integrations first

### Technical Requirements

**To enforce tiers, we need:**

1. `tribeTier` field on tribe table (enum: 'free', 'pro', 'business')
2. Tier check middleware for API routes
3. Storage quota enforcement in upload routes
4. Event count validation on event creation
5. RBAC feature checks before permission UI access
6. Integration access control

---

## Annual Prepay Option

**Pro Annual:** $180/year (save $48, ~20% discount)

**Business Annual:** $480/year (save $108, ~18% discount)

**Benefits:**
- Improved cash flow
- Higher retention (12-month commitment)
- Clear value for budget-conscious communities

---

## Pricing Communication

### Email Template (Introducing Pro)

```
Subject: Introducing Tribe Pro - More Power for Your Community

Hi [Leader Name],

Your community is growing! We're introducing Tribe Pro for communities that need more.

**Tribe Free (You're here - no change):**
- 50 members, 10GB storage (1080p video max), 3 active events + recurring
- Perfect for getting started

**NEW: Tribe Pro ($19/month):**
- Unlimited members & events
- 100GB storage + 4K video uploads
- Per-member permission overrides
- Discord + Google Calendar sync
- Priority support

Your community: [X] members, [Y]GB used, [Z] events created.

[Upgrade to Pro] or keep using Free - totally up to you!

Questions? Just reply.

[Your Name]
```

---

**Document Status:** Active
**Last Updated:** January 3, 2026
**Version:** 2.1 - Generous Storage Limits
**Next Review:** April 3, 2026 (or when MRR > $1,000)
**Owner:** Product/Finance Team
