# SEO Content Guidelines

This guide documents the keyword and content strategy for Tribe's marketing pages. It ensures consistent messaging across all SEO touchpoints.

**Last Updated:** January 2025

---

## Core Principle: Content Placement Strategy

**Short-form SEO content** should use **general, broad terms** that appeal to all community types.

**Long-form content** can include **specific niche examples** for SEO value and relatability.

| Content Type | Approach | Reasoning |
|--------------|----------|-----------|
| Meta descriptions | General only | Character-limited, first impression |
| OG descriptions | General only | Social sharing preview |
| Twitter descriptions | General only | Social sharing preview |
| Hero subheadings | General only | Above-the-fold, sets tone |
| JSON-LD descriptions | General only | Structured data for search engines |
| **Keyword arrays** | **Keep specifics** | SEO value, not directly user-facing |
| **FAQ answers** | **Keep specifics** | Detailed content, appropriate for examples |
| **Body copy** | **Keep specifics** | In-depth content, good for niches |

---

## General vs Specific Terms

### General Terms (Use in Short-Form Content)
These should appear in meta descriptions, OG/Twitter tags, hero subheadings, and JSON-LD:

- "groups and communities that gather in person"
- "clubs, teams, congregations"
- "community platform"
- "social groups"
- "group management"
- "real people", "real communities"

### Specific/Niche Terms (Use in Long-Form Content Only)
These belong in keyword arrays, FAQ answers, and detailed body copy:

- Diaspora communities
- Greek life / fraternities / sororities
- VIP lists / hospitality
- CrossFit boxes / fitness studios
- Religious congregations (churches, mosques, etc.)
- Alumni networks
- Coworking spaces
- Sports leagues / rec teams

### Keyword Array Strategy

When building keyword arrays, follow this order:
1. **General terms first** (community platform, social group, club, group management)
2. **Feature terms** (photo sharing, event management, privacy-first)
3. **Niche terms last** (diaspora community, Greek life, VIP list management)

Example:
```typescript
keywords: [
  // General (front)
  "community platform",
  "social group",
  "club",
  "group management",
  // Features (middle)
  "photo sharing",
  "event management",
  "privacy-first",
  "no ads",
  // Niche (end)
  "diaspora community",
  "Greek life",
],
```

---

## SEO Content Locations

### Global Metadata
- **File:** `app/layout.tsx`
- **Contains:** Default title, description, keywords, OG/Twitter defaults
- **Rule:** Description should be general; keywords can include niche terms at end

### Page-Level Metadata
- **Location:** `app/(public)/[page]/page.tsx`
- **Pages:** `/about`, `/features`, `/use-cases`, `/pricing`, `/waitlist`
- **Rule:** Each page has its own metadata export with description and keywords

### JSON-LD Structured Data
- **File:** `components/seo/json-ld.tsx`
- **Contains:** Organization, SoftwareApplication, WebSite, FAQ schemas
- **Rule:** All descriptions should use general terms only

### Marketing Page Components
- **Location:** `app-pages/marketing/[page]/components/`
- **Rule:** Hero subheadings = general; body copy and feature descriptions = can include examples

---

## Examples

### Meta Description

**Bad** (too niche-specific):
```
"Built for diaspora communities, Greek life, gyms, and more."
```

**Good** (general, inclusive):
```
"Built for groups and communities that gather in person."
```

### Hero Subheading

**Bad** (leads with niche examples):
```
"From diaspora communities to Greek life, fitness studios to VIP lists"
```

**Good** (general categories):
```
"Whether you're a club, team, congregation, or any group that gathers in person"
```

### FAQ Answer (Specific Examples OK)

**Good** (detailed content with examples):
```
"Any existing community that gathers in person: churches, sports teams,
clubs, alumni groups, hobby communities, coworking spaces, and more."
```

### Feature Card Description (Specific Examples OK)

**Good** (body copy with examples):
```
"Clubs, teams, churches, gyms, VIP lists, and more. Made for real people."
```

---

## Target Audience Hierarchy

Reference `lib/docs/GTM_STRATEGY.md` for the full target audience breakdown:

| Type | Examples |
|------|----------|
| Cultural/Religious | Mosque congregations, church groups, cultural associations |
| Athletic | CrossFit boxes, rec leagues, sports clubs |
| Social | Greek orgs, alumni networks, VIP groups |
| Professional | Coworking communities, industry associations |
| Hobbyist | Photography clubs, maker spaces, outdoor groups |

**Key insight:** These are all equal priority. No single type should dominate short-form SEO content. Use general terms that encompass all types.

---

## Checklist for New Marketing Pages

When creating new marketing pages:

- [ ] Meta description uses general terms only
- [ ] OG description uses general terms only
- [ ] Twitter description uses general terms only
- [ ] Hero subheading uses general terms only
- [ ] Keyword array has general terms first, niche terms last
- [ ] FAQ answers can include specific examples
- [ ] Body copy can include specific examples
- [ ] No single community type dominates the messaging

---

## Related Documentation

- **Target Audience:** `lib/docs/GTM_STRATEGY.md` → Target Audience section
- **Pricing Tiers:** `lib/docs/PRICING_STRATEGY.md`
- **Product Features:** `lib/docs/MVP_PRD_2025.md`
