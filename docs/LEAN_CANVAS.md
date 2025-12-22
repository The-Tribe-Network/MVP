# Tribe: Lean Canvas (MVP 2.0)

---

## 1. Problem

| Problem | Description |
|---------|-------------|
| **Erosion of Third Spaces** | In-person gathering spots lack a dedicated digital hub to facilitate real-world connection. |
| **Chaos in Fragments** | High-density groups suffer from "GroupMe noise" (unstructured chat) and "Instagram loss" (photos buried in feeds). |
| **Organizational Misalignment** | Existing apps cannot mirror real-world hierarchies, such as distinguishing between active members and "pledges" or "trial members". |

---

## 2. Customer Segments

| Segment | Nickname | Target Audience |
|---------|----------|-----------------|
| **Primary** | The "Digital Chapter House" | Fraternities and Sororities (Ages 18–25) |
| **Hospitality** | The "Digital VIP Room" | Restaurants, bars, and clubs managing loyal patron lists |
| **Fitness** | The "Gym Hub" | CrossFit boxes and boutique studios tracking "PRs" and transformations |
| **Recreational** | The "Locker Room" | Sports leagues and rec teams needing schedule and roster management |
| **Private Clubs** | The "Digital Clubhouse" | Country clubs and yacht clubs with tiered memberships |
| **Coworking** | The "Workspace Hub" | Incubators and hubs managing member networking |

---

## 3. Unique Value Proposition

> **The Digital Infrastructure for Real-World Communities.**
>
> A utility-first platform that replaces fragmented social tools with structured organization and permanent media archiving.

**High-Level Concept:** *"Discord for the Real World"* or *"The Digital Chapter House"*

---

## 4. Solution

| Feature | Description |
|---------|-------------|
| **Granular RBAC** | A sophisticated permission system with 20+ granular controls (e.g., `canPost`, `canCreateEvents`) to match real-world roles. |
| **The Vault** | An organized, permanent photo and media archive—designed to be the "sticky feature" for long-term retention. |
| **Structured Events & Polls** | A dedicated system for RSVPs and decision-making (single, multiple-choice, or open-ended polls). |
| **Optimized Architecture** | Production-ready performance with an 80% reduction in permission query latency. |

---

## 5. Channels

- **Direct Beachhead Outreach** — Initial targeting of 5–10 fraternity chapters and 2–3 hospitality businesses
- **Vertical Expansion** — Targeted marketing to gym owners (CrossFit boxes) and sports league organizers
- **Referral & Case Studies** — Leveraging initial "Tribe" success stories to trigger organic word-of-mouth

---

## 6. Revenue Streams

### Current (Phase 1–3)
Free-to-use to gain density and validate the "sticky" photo feature.

### Future (Phase 4)
- **SaaS Subscriptions** — Storage limits, custom branding
- **Transaction Fees** — Event ticketing
- **B2B "Business Hub"** — Hospitality analytics

---

## 7. Cost Structure

| Category | Technology |
|----------|------------|
| **Infrastructure** | Next.js 15, Neon (PostgreSQL), Cloudinary (Media storage) |
| **Communication** | Resend for transactional email/invitations |
| **Maintenance** | Managing 40+ RESTful endpoints and real-time Socket.io infrastructure |

---

## 8. Key Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **The "Lock-In" Metric** | 70%+ | Photos organized into albums (rather than standalone) |
| **Utility Rate** | 40–60% | RSVP rate for created events |
| **RBAC Validation** | 80%+ | Tribes customizing at least one member's permissions |
| **Activation** | — | Percentage of invitees who accept and upload a profile picture |

---

## 9. Unfair Advantage

| Advantage | Description |
|-----------|-------------|
| **Zero Network Effect Required** | Traditional social networks face the "Empty Bar" problem—they need massive user counts to be valuable. Tribe serves *existing* groups, so it's useful for just five people from day one. |
| **Hierarchical Superiority** | Granular RBAC permissions that mirror real-world complexities (e.g., Pledges vs. Actives) that GroupMe and WhatsApp cannot handle. |
