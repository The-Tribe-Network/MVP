# Pricing & Monetization Strategy
## Tribe - Community Organization Platform

**Version:** 1.0
**Last Updated:** December 23, 2024
**Owner:** Product/Finance Team
**Review Cadence:** Quarterly

---

## Table of Contents

1. [Pricing Philosophy](#pricing-philosophy)
2. [Pricing Evolution](#pricing-evolution)
3. [Phase 1-2: Free (Months 1-4)](#phase-1-2-free-months-1-4)
4. [Phase 3: Freemium (Months 5-6)](#phase-3-freemium-months-5-6)
5. [Phase 4: Paid Tiers (Month 7+)](#phase-4-paid-tiers-month-7)
6. [Unit Economics](#unit-economics)
7. [Pricing Experiments](#pricing-experiments)
8. [Revenue Projections](#revenue-projections)
9. [Competitive Pricing Analysis](#competitive-pricing-analysis)

---

## Pricing Philosophy

### Core Principles

1. **Free to Gain Density:** Phase 1-2 completely free to prove value and achieve network effects
2. **Value-Based Pricing:** Charge based on value delivered (storage, features) not vanity metrics (users)
3. **Keep Communities Free:** 80%+ of tribes should stay on free tier forever
4. **Monetize Commercial Use:** Charge businesses (gyms, hospitality, coworking) more than social communities
5. **Simple, Transparent Pricing:** No hidden fees, clear upgrade path

### Willingness to Pay (WTP) Hypothesis

**By Segment:**
- **Diaspora Communities:** Low WTP ($0-5/month) - rely on donations, tight budgets
- **Fraternities/Sororities:** Medium WTP ($10-20/month) - have chapter budgets
- **Gyms/Fitness Studios:** High WTP ($30-50/month) - commercial entities with revenue
- **Hospitality (VIP Lists):** High WTP ($30-50/month) - ROI from customer loyalty
- **Country Clubs:** High WTP ($50-100/month) - premium pricing expected
- **Coworking Spaces:** High WTP ($30-50/month) - part of member experience budget

**Insight:** Social communities (diaspora, fraternities) have low WTP. Commercial communities (gyms, hospitality) have high WTP.

**Strategy:** Keep social free, monetize commercial.

---

## Pricing Evolution

### Phase 1-2: Free (Months 1-4)

**Pricing:** $0 for everyone

**Rationale:**
- Prove product-market fit first
- Gain density (60-80 tribes) before monetizing
- Validate value proposition (The Vault, RBAC, events)
- Build trust with communities

**Cost per Tribe (Estimated):**
- Cloudinary (storage): $2-5/month
- Neon (database): $1/month
- Resend (email): $0.50/month
- **Total:** $3.50-6.50/month per tribe

**Burn Rate (Phase 1-2):**
- 10 tribes: $35-65/month
- 30 tribes: $105-195/month
- 60 tribes: $210-390/month

**Phase 1-2 Total Cost:** $500-1,000 (acceptable for validation)

---

### Phase 3: Freemium (Months 5-6)

**Pricing:**

**Free Tier (Unlimited Tribes):**
- Up to 50 members
- 10GB storage (~2,000 photos)
- All core features (posts, events, RBAC, albums)
- Community support (help docs)

**Pro Tier ($19/month):**
- Unlimited members
- 50GB storage (~10,000 photos)
- Custom branding (tribe logo, colors)
- Priority email support

**Target Conversion:** 20% of tribes upgrade to Pro

**Rationale:**
- Most social communities (diaspora, fraternities) stay free (< 50 members)
- Large communities (country clubs, gyms, big mosques) upgrade for more members + storage
- $19/month is affordable for communities with budgets

---

### Phase 4: Paid Tiers (Month 7+)

**Pricing:**

**Free Tier:**
- Up to 50 members
- 10GB storage
- All core features

**Pro Tier ($19/month):**
- Unlimited members
- 50GB storage
- Custom branding
- Priority support

**Business Tier ($49/month):**
- For commercial use (gyms, hospitality, coworking)
- 100GB storage
- Event ticketing & payments (integration with Stripe)
- Advanced analytics (member engagement, photo uploads)
- White-label option (remove "Tribe" branding)
- Dedicated account manager (for large communities)

**Add-Ons (A La Carte):**
- Extra storage: $5/month per 10GB
- SMS notifications: $10/month (via Twilio)
- Custom domain: $5/month (tribe.yourclub.com)

---

## Tier Selection Logic

**Decision Tree:**

```
Is the tribe commercial (gym, restaurant, coworking)?
├─ Yes → Business Tier ($49/month)
└─ No (social community) → Does it have > 50 members?
   ├─ Yes → Pro Tier ($19/month)
   └─ No → Free Tier ($0)
```

**Examples:**

- **Mosque with 80 members:** Pro Tier ($19/month) - over 50 members, but social
- **CrossFit gym with 40 members:** Business Tier ($49/month) - commercial use
- **Fraternity with 30 members:** Free Tier ($0) - social, under 50 members
- **Country club with 150 members:** Pro or Business Tier - depends on if they want analytics

---

## Unit Economics

### Cost per Tribe (Estimated)

| Item | Free Tier | Pro Tier | Business Tier |
|------|-----------|----------|---------------|
| **Cloudinary (storage)** | $2/month (10GB) | $8/month (50GB) | $15/month (100GB) |
| **Neon (database)** | $1/month | $1/month | $2/month |
| **Resend (email)** | $0.50/month | $0.50/month | $1/month |
| **Support (prorated)** | $0 | $2/month | $5/month |
| **Total Cost** | **$3.50/month** | **$11.50/month** | **$23/month** |

### Contribution Margin

| Tier | Revenue | Cost | Profit | Margin |
|------|---------|------|--------|--------|
| **Free** | $0 | $3.50 | -$3.50 | - |
| **Pro** | $19 | $11.50 | $7.50 | 39% |
| **Business** | $49 | $23 | $26 | 53% |

**Insight:** Free tier is loss-making (subsidized by Pro/Business). Need 20-30% conversion to Pro/Business to break even.

---

### Break-Even Analysis

**Scenario 1: 100 Tribes (20% Pro, 5% Business, 75% Free)**

| Tier | Count | Revenue | Cost | Profit |
|------|-------|---------|------|--------|
| Free | 75 | $0 | $262.50 | -$262.50 |
| Pro | 20 | $380 | $230 | $150 |
| Business | 5 | $245 | $115 | $130 |
| **Total** | **100** | **$625** | **$607.50** | **$17.50** |

**Break-even:** ~100 tribes with 20% Pro + 5% Business conversion

---

**Scenario 2: 200 Tribes (Same Conversion)**

| Tier | Count | Revenue | Cost | Profit |
|------|-------|---------|------|--------|
| Free | 150 | $0 | $525 | -$525 |
| Pro | 40 | $760 | $460 | $300 |
| Business | 10 | $490 | $230 | $260 |
| **Total** | **200** | **$1,250** | **$1,215** | **$35** |

**Insight:** Profitability scales with tribe count, assuming 20%+ Pro conversion.

---

## Pricing Experiments

### Experiment 1: Free Tier Limits

**Hypothesis:** Lowering free tier to 30 members (instead of 50) will increase Pro conversions without hurting adoption.

**Test:**
- A/B test: 50% see 30-member limit, 50% see 50-member limit
- Measure: Conversion to Pro, churn rate

**Success Criteria:** Pro conversion increases by 10%+ without increasing churn

---

### Experiment 2: Pro Tier Pricing

**Hypothesis:** $19/month is optimal. $29/month is too high, $9/month leaves money on table.

**Test:**
- A/B test: $19 vs. $29 vs. $9
- Measure: Conversion rate, revenue per tribe

**Success Criteria:** $19 maximizes (conversion rate × price)

---

### Experiment 3: Annual Prepay Discount

**Hypothesis:** Offering annual prepay ($180/year vs. $228/year monthly) will increase retention and cash flow.

**Test:**
- Offer annual option: $180/year (20% discount)
- Measure: % who choose annual, retention at 12 months

**Success Criteria:** 30%+ choose annual, retention increases by 10%+

---

## Revenue Projections

### Conservative Case (First 12 Months)

| Month | Tribes | Free | Pro (20%) | Business (5%) | MRR |
|-------|--------|------|-----------|---------------|-----|
| 1-2 | 10 | 10 | 0 | 0 | $0 |
| 3-4 | 30 | 30 | 0 | 0 | $0 |
| 5-6 | 60 | 48 | 10 | 2 | $288 |
| 7-8 | 100 | 75 | 20 | 5 | $625 |
| 9-10 | 150 | 112 | 30 | 8 | $962 |
| 11-12 | 200 | 150 | 40 | 10 | $1,250 |

**Year 1 MRR:** $1,250/month

**Year 1 ARR:** ~$15,000

**Break-even:** Month 8 (100 tribes)

---

### Optimistic Case (Higher Conversion)

**Assumptions:**
- 30% Pro conversion (instead of 20%)
- 10% Business conversion (instead of 5%)

| Month | Tribes | Free | Pro (30%) | Business (10%) | MRR |
|-------|--------|------|-----------|----------------|-----|
| 7-8 | 100 | 60 | 30 | 10 | $1,060 |
| 11-12 | 200 | 120 | 60 | 20 | $2,120 |

**Year 1 MRR:** $2,120/month

**Year 1 ARR:** ~$25,000

---

## Competitive Pricing Analysis

### Competitor Pricing

| Competitor | Free Tier | Paid Tier | Notes |
|------------|-----------|-----------|-------|
| **Facebook Groups** | Unlimited free | N/A | No paid option |
| **WhatsApp** | Unlimited free | N/A | No paid option |
| **Discord** | Unlimited free | $9.99/month (Nitro - individual) | Server boosting ($4.99/month) |
| **Meetup** | N/A (organizer pays) | $14.99-44.99/month | No free tier for organizers |
| **Slack** | Free (10k messages) | $7.25-12.50/user/month | Gets expensive fast |
| **Mighty Networks** | N/A | $39-99+/month | No free tier |

**Insights:**
- Tribe's $0 free tier competes with Facebook, WhatsApp, Discord
- Tribe's $19 Pro tier is cheaper than Meetup ($15-45), Slack ($7/user), Mighty Networks ($39-99)
- Tribe's $49 Business tier is competitive with Meetup Unlimited ($45) and Mighty Networks Business ($99)

**Positioning:**
- **Free tier:** Competitive with Facebook/WhatsApp (but better features)
- **Pro tier:** Affordable for social communities (cheaper than Meetup)
- **Business tier:** Competitive with Mighty Networks (but simpler, better UX)

---

## Monetization Triggers

### When to Introduce Pro Tier (Phase 3)

**Triggers:**
- 30+ active tribes with 50+ members (storage costs climbing)
- Communities requesting more storage ("We hit 10GB limit")
- Community leader NPS 9-10 from 60%+ of leaders (high satisfaction)

**If triggers NOT met:** Delay Pro tier to Month 7+

---

### When to Introduce Business Tier (Phase 4)

**Triggers:**
- 5+ commercial tribes (gyms, hospitality, coworking) onboarded
- Commercial tribes requesting analytics, ticketing, white-label
- $1,000+ MRR from Pro tier (proven monetization)

**If triggers NOT met:** Delay Business tier to Month 9-12

---

## Pricing Communication

### How to Announce Pricing Changes

**Phase 3 (Introducing Pro Tier):**

**Email to Community Leaders:**
```
Subject: Introducing Tribe Pro - More Storage & Members

Hi [Leader Name],

Great news! We're introducing Tribe Pro for larger communities.

**Tribe Free (No Change):**
- Up to 50 members
- 10GB storage
- All features

**NEW: Tribe Pro ($19/month):**
- Unlimited members
- 50GB storage
- Custom branding
- Priority support

Your community currently has [X] members and is using [Y]GB of storage.

You're on the Free plan (no action needed). If you need more members or
storage, you can upgrade to Pro anytime.

Questions? Reply to this email.

Thanks for being an early supporter!

[Your Name]
```

**In-App Banner:**
```
🎉 Introducing Tribe Pro! Need more than 50 members or 10GB storage?
   Upgrade to Pro for $19/month. [Learn More]
```

---

**Document Status:** Active
**Last Updated:** December 23, 2024
**Next Review:** March 31, 2025 (or when MRR > $1,000)
**Owner:** Product/Finance Team
