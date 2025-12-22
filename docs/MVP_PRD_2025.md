# Product Requirements Document (PRD) - MVP
## Tribe - Community Organization Platform

**Version:** MVP 2.0 - Expanded Target Segments
**Last Updated:** December 21, 2024
**Status:** Production-Ready MVP

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Target Users](#target-users)
4. [MVP Strategy](#mvp-strategy)
5. [Core Features](#core-features)
6. [Technical Architecture](#technical-architecture)
7. [Success Metrics](#success-metrics)
8. [What's NOT in MVP](#whats-not-in-mvp)
9. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Tribe** is a utility-first community organization platform designed for existing, high-density groups that need better tools than what GroupMe and Instagram provide. We're launching as an **organizational utility**, not a social network, bypassing the "Empty Bar Problem" by targeting groups that already exist.

### The Wedge

**Primary Targets:** High-density exclusive communities with urgent organizational needs

**Core Segments:**
1. **Fraternities/Sororities** - "The digital chapter house"
2. **Hospitality VIP Lists** - "The digital VIP room" (restaurants, bars, clubs)
3. **Gyms & Fitness Studios** - "Your gym's private community hub"
4. **Sports Leagues & Rec Teams** - "The digital team locker room"
5. **Country Clubs & Private Clubs** - "The members-only digital clubhouse"
6. **Coworking Spaces** - "Your workspace community platform"

**What They All Share:**
- Existing, high-density groups already meeting in person
- Desperate for better organization than GroupMe
- Need photo archiving better than Instagram
- Require hierarchical permission structures (RBAC)
- Value privacy and exclusivity

### Core Value Propositions

1. **Granular RBAC**: Role-based access control that mirrors real-world hierarchies (e.g., pledges can view but not post)
2. **Superior Photo Archiving**: Organized albums and media management beyond Instagram's capabilities - **The Sticky Feature**
3. **Structured Events**: Dedicated RSVP system with polls for coordinating real-world gatherings
4. **Privacy-First**: Private, invite-only communities with complete access control
5. **Clean, Fast Architecture**: Optimized database queries, responsive UI, production-ready performance

---

## Product Vision

### The Third Space Problem

Traditional "third spaces" (places outside home and work where people gather) have been eroded by:
- Social media fragmentation replacing in-person interaction
- Rising costs making it harder to maintain community hubs
- Digital overload across multiple platforms

### Our Solution

Tribe provides exclusive groups with a **single digital hub** that facilitates real-world connection:
- **Organize better than GroupMe**: Structured events, announcements, role management
- **Archive better than Instagram**: Permanent, organized photo vault with albums
- **Privacy unlike Facebook**: Invite-only, no public discovery, complete control

**We're not building a social network - we're building organizational infrastructure for groups that already exist.**

---

## Target Users

### Primary User Segments (MVP Focus)

#### 1. Fraternities & Sororities
- **Demographics**: Ages 18-25 (active members), 22-70 (alumni)
- **Pain Points**:
  - Event photos scattered across Instagram, lost in feeds
  - Event coordination in GroupMe is chaotic
  - No way to reflect hierarchy (pledges, actives, alumni, officers)
  - Can't restrict who can post or create events

- **Use Cases**:
  - Organize chapter events with RSVP and polls
  - Archive formal photos in organized albums (the sticky feature)
  - Control permissions (e.g., pledges view-only, officers can create events)
  - Send announcements to all members
  - Manage member roles that reflect chapter structure

- **The Hook**: "The digital chapter house"

#### 2. Hospitality VIP Lists (Restaurants, Bars, Clubs)
- **Demographics**: Business owners/managers and their loyal customer base
- **Pain Points**:
  - Need exclusive space for VIP customers
  - Event photos from special nights get lost
  - Can't organize customers by loyalty tier
  - Event coordination through DMs is inefficient

- **Use Cases**:
  - Create exclusive VIP tribe for regular customers
  - Organize special events with RSVP
  - Archive photos from events in organized albums
  - Control visibility (VIP-only content)
  - Send announcements about special offers or events

- **The Hook**: "The digital VIP room"

#### 3. Gyms & Fitness Studios
- **Demographics**: Ages 18-65, gym owners/trainers and their member communities
- **Pain Points**:
  - Member community exists in person but no digital home
  - Challenge/competition coordination scattered across social media
  - Transformation photos and progress tracking lost in feeds
  - No way to organize members by tier (trial, regular, VIP)
  - Event RSVPs (workshops, competitions) managed via spreadsheets

- **Use Cases**:
  - Organize fitness challenges with leaderboards and photo check-ins
  - Archive transformation photos and PR celebrations (the sticky feature)
  - Coordinate workshops, seminars, and competition RSVPs
  - Control permissions (trial members view-only, full members can post)
  - Send announcements about class schedule changes, special events
  - Manage member tiers (trial, regular, VIP, coaches)

- **The Hook**: "Your gym's private community hub"
- **Examples**: CrossFit boxes, boutique fitness studios, yoga studios, cycling studios, martial arts dojos, Pilates studios, boxing gyms

#### 4. Sports Leagues & Recreational Teams
- **Demographics**: Ages 21-55, league organizers and recreational athletes
- **Pain Points**:
  - Game schedules scattered across group texts
  - Post-game photos lost in Instagram
  - RSVP for games is chaotic (no-shows common)
  - Need team roster management with injury tracking
  - Season stats and achievements not preserved

- **Use Cases**:
  - Organize games and tournaments with RSVP tracking
  - Archive season photos and championship memories (the sticky feature)
  - Coordinate practice schedules and game attendance
  - Control permissions (team captain, active roster, injured reserve, alumni)
  - Send announcements about schedule changes, playoff brackets
  - Track season stats and team achievements

- **The Hook**: "The digital team locker room"
- **Examples**: Adult kickball leagues, softball teams, basketball leagues, ultimate frisbee, soccer leagues, flag football

#### 5. Country Clubs & Private Clubs
- **Demographics**: Ages 30-75, club management and exclusive members
- **Pain Points**:
  - Need digital exclusive space that matches physical exclusivity
  - Event coordination (tournaments, galas, member events) across multiple channels
  - Photos from club events not properly archived
  - Tiered membership structure not reflected digitally
  - Member directory and networking difficult

- **Use Cases**:
  - Organize tournaments, galas, and member-only events with RSVP
  - Archive event photos in organized albums (the sticky feature)
  - Control visibility by membership tier (social members vs. full members)
  - Coordinate tee times, court reservations, dining events
  - Send announcements about club updates and exclusive opportunities
  - Manage member directory with tiered access

- **The Hook**: "The members-only digital clubhouse"
- **Examples**: Country clubs, golf clubs, yacht clubs, sailing clubs, tennis clubs, polo clubs

#### 6. Coworking Spaces & Entrepreneurship Hubs
- **Demographics**: Ages 25-50, coworking operators and entrepreneur/startup communities
- **Pain Points**:
  - Community exists in person but no digital hub for connection
  - Event coordination (workshops, demo days, networking) fragmented
  - Member directory and networking opportunities missed
  - Workspace photos and community moments not preserved
  - No way to organize members by membership tier or startup stage

- **Use Cases**:
  - Organize workshops, demo days, and networking events with RSVP
  - Archive photos from pitch competitions, demo days, team events (the sticky feature)
  - Coordinate desk bookings, conference room schedules, social events
  - Control permissions (hot-desk members, dedicated desk, private office, organizers)
  - Send announcements about exclusive member perks, investor events
  - Manage member directory for networking and collaboration

- **The Hook**: "Your workspace community platform"
- **Examples**: WeWork-style coworking, startup incubators, accelerator programs, makerspaces, innovation hubs, tech community spaces

### Secondary Opportunities (Post-MVP Expansion)

The following segments fit the Tribe model but are lower priority for initial launch:

- **Music Venues & Concert Halls**: Season ticket holders, fan communities, VIP experiences
- **Arts & Creative Communities**: Pottery studios, painting classes, photography clubs
- **Outdoor & Adventure Groups**: Hiking clubs, climbing gyms, skiing/snowboarding communities
- **Neighborhood & Community Groups**: HOAs, neighborhood associations, community gardens
- **Volunteer Organizations**: Service organizations, charity groups, community service teams
- **Alumni Networks**: University alumni chapters, professional associations, chambers of commerce

---

## MVP Strategy

### Bypassing the "Empty Bar Problem"

**Traditional social networks fail because nobody wants to be first at an empty bar.**

Our strategy: **Launch as a utility tool, not a social network.**

#### Why This Works

1. **Target Existing Groups**: Groups already coordinating actively
2. **Immediate Value**: Better organization from day one
3. **No Network Effect Required**: Each tribe is valuable independently
4. **Urgent Need**: Groups are frustrated with current tools
5. **High Density**: Fraternities and VIP lists are naturally high-density

#### Launch Strategy

**Phase 1 - Initial Beachhead (Months 1-2):**
- Target 5-10 fraternity/sorority chapters
- Target 2-3 hospitality businesses with VIP lists
- Target 2-3 fitness studios/gyms (CrossFit boxes ideal)
- **Goal**: Validate utility value and photo archiving as sticky feature

**Phase 2 - Horizontal Expansion (Months 3-4):**
- Expand to sports leagues (2-3 teams/leagues)
- Expand to country clubs (1-2 clubs)
- Expand to coworking spaces (1-2 spaces)
- **Goal**: Prove product-market fit across all 6 core segments

**Phase 3 - Word-of-Mouth & Scale (Months 5-6):**
- Organic growth within each vertical
- Referral programs for each segment
- Case studies and testimonials
- **Goal**: Achieve 50+ active tribes across all segments

---

## Core Features

### 1. Authentication & User Management

**Implemented:**
- Email/password authentication with email verification
- OAuth (Google, GitHub)
- Password reset flow
- User profiles with avatars
- Username validation
- Session management with secure HTTP-only cookies

**User Experience:**
- Multi-step onboarding wizard for first-time users
- Profile completion tracking
- Avatar upload to Cloudinary

---

### 2. Tribe Creation & Management

**Implemented:**
- Multi-step tribe creation wizard (5 steps)
- Basic info: name, description, avatar
- Privacy settings: **private only** (invite-only, not discoverable)
- Category selection (social, gaming, family, work, hobbies, other)
- Location setting (optional)
- Initial member invitations

**Tribe Properties:**
- **Privacy**: Private only in MVP (invite-only, not discoverable)
- **Roles**: owner, admin, moderator, member
- **Categories**: social, gaming, family, work, hobbies, other

**Management:**
- Edit tribe settings
- Upload/change tribe avatar
- Leave tribe (non-owners)
- View member list with roles

---

### 3. Granular Role-Based Access Control (RBAC)

**This is Tribe's core differentiator.**

**Implemented:**
- Four default roles: Owner, Admin, Moderator, Member
- Per-member permission overrides (20+ granular permissions)

**Permission Categories:**

**Posting Permissions:**
- `canPost` - Create posts
- `canComment` - Comment on posts
- `canEditOwnPosts` - Edit own posts
- `canDeleteOwnPosts` - Delete own posts

**Media Permissions:**
- `canUploadMedia` - Upload photos/videos
- `canCreateAlbums` - Create photo albums
- `canDeleteOwnMedia` - Delete own media

**Event Permissions:**
- `canCreateEvents` - Create events
- `canEditEvents` - Edit any event
- `canDeleteEvents` - Delete any event

**Member Management:**
- `canInviteMembers` - Invite new members
- `canRemoveMembers` - Remove members
- `canChangeMemberRoles` - Change member roles
- `canManagePermissions` - Modify permissions

**Content Moderation:**
- `canModeratePosts` - Moderate posts
- `canModerateComments` - Moderate comments
- `canDeleteAnyPost` - Delete any post
- `canDeleteAnyComment` - Delete any comment

**Tribe Management:**
- `canEditTribeSettings` - Edit tribe settings
- `canDeleteTribe` - Delete the tribe
- `canTransferOwnership` - Transfer ownership

**Real-World Examples:**

**Fraternity:**
- **Pledges**: Can view, cannot post or comment (view-only)
- **Actives**: Can post, comment, upload media, RSVP
- **Officers**: Can create events, manage members, send announcements
- **Alumni**: Can view, cannot post (view-only)

**VIP List:**
- **Regular Customers**: Can view, RSVP to events
- **VIP Members**: Can post, comment, upload media
- **Managers**: Can create events, send announcements, manage members

---

### 4. Invitation System

**Implemented:**
- Email-based invitations
- Role assignment on invitation
- 7-day expiration window
- Invitation status tracking (pending, accepted, rejected, expired)
- Batch invitation creation (optimized for performance)

**Invitation Flow:**
1. Admin/owner invites users by email
2. System checks if user exists and if already a member
3. Invitation created with assigned role
4. Email sent via Resend (non-blocking)
5. User receives email with invitation link
6. User accepts/rejects invitation
7. On acceptance, user added as member with assigned role

**Features:**
- View pending invitations
- Resend invitations
- Cancel invitations
- Bulk invite multiple emails at once

---

### 5. Posts & Timeline

**Implemented:**
- Text posts with rich text support
- Posts with image attachments
- Permission-based posting (requires `canPost`)
- Like/unlike posts
- Comment on posts (requires `canComment`)
- Nested comment replies
- Like/unlike comments
- Edit own posts/comments (with permission)
- Delete own posts/comments (with permission)
- Moderator deletion (requires moderation permissions)

**Timeline Features:**
- Chronological post feed
- Author information with avatars
- Like counts and comment counts
- Media attachments (images)
- Post timestamps
- Edit/delete indicators
- Optimistic updates for instant UI feedback

---

### 6. Events Management

**Implemented:**
- Event creation wizard (5 steps)
- Event title, description, location
- Start date/time (required), end date/time (optional)
- Event status (upcoming, ongoing, completed, cancelled)
- RSVP system (going, interested, not_going)
- Attendee list with RSVP status
- Event-specific polls

**Event Polls:**
- Multiple poll types: single_choice, multiple_choice, open_ended
- Anonymous and non-anonymous polls
- Custom poll options
- Vote tracking and vote counts
- Poll results visualization

**Event Permissions:**
- Create events (requires `canCreateEvents`)
- Edit events (requires `canEditEvents`)
- Delete events (requires `canDeleteEvents`)

**Event Display:**
- Upcoming events list
- Event calendar view
- Event details page
- Attendee list with RSVP counts
- Poll results

---

### 7. Media & Albums - "The Vault" (The Sticky Feature)

**This is critical for retention.**

**Implemented:**
- Image upload to Cloudinary (optimized)
- Album creation wizard (5 steps)
- Album cover images
- Album descriptions
- Album privacy (public, private, admin_only)
- Media attached to posts
- Media like/unlike
- Media grid view
- Media carousel/gallery
- Delete own media (with permission)

**Album Features:**
- Organize photos by event, date, or theme
- Album-media associations
- Album cover auto-selection
- Media count per album
- Featured albums section

**Media Metadata:**
- Dimensions, file size
- Upload timestamp
- Uploader information
- Associated album

**Member Preferences:**
- `autoAddPostMediaToTribe` - Automatically add post images to tribe albums

---

### 8. Activity Feed & Milestones

**Implemented:**
- Activity tracking across all tribes
- Activity types: post, photo, event, member, comment, like
- Milestone tracking (automatic):
  - Post likes: 5, 10, 15, 20+ likes
  - Comment likes: milestones
  - Media likes: milestones
  - Member joins: milestones

**Activity Feed:**
- Aggregated activity across user's tribes
- Activity previews
- Timestamp information
- Activity filtering by type
- Recent activity on dashboard

---

### 9. User Dashboard

**Implemented:**
- Home dashboard with:
  - Tribes grid (user's tribes)
  - Activity feed aggregation
  - Upcoming events across tribes
  - Metrics grid (tribes count, members count)
  - Quick actions

- Profile dashboard:
  - User profile information
  - Avatar management
  - Account settings
  - Security settings (password change, active sessions)
  - Notification preferences
  - Privacy settings

---

### 10. Settings & Preferences

**Implemented:**

**Account Settings:**
- Profile information (name, username, email)
- Avatar upload
- Email management
- Username uniqueness validation

**Security Settings:**
- Password change
- Active sessions management
- Session revocation

**Notification Preferences:**
- Email notifications toggle
- In-app notifications toggle
- Notification types configuration

**Privacy Settings:**
- Profile visibility
- Privacy controls

---

## Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query v4 (server state)
- **Forms**: react-hook-form with Zod validation
- **Real-time**: Socket.io client (infrastructure ready)

### Backend Stack

- **API**: Next.js API Routes (RESTful)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth
- **File Storage**: Cloudinary
- **Email Service**: Resend
- **Real-time**: Socket.io server (separate Node.js server)

### Database Schema

**Core Tables:**
- `user`, `session`, `account`, `verification` (Better-Auth)
- `tribe`, `tribeMember`, `tribeMemberPermission`, `tribeMemberPreference`
- `tribeInvitation`

**Content Tables:**
- `post`, `postLike`, `comment`, `commentLike`

**Media Tables:**
- `album`, `media`, `albumMedia`, `mediaLike`

**Event Tables:**
- `event`, `eventAttendee`, `poll`, `pollOption`, `pollVote`

**Activity Tables:**
- `activity`, `notification`

**Communication Tables:**
- `message`, `messageRead` (schema only, not implemented)

**Tagging Tables:**
- `hashtag`, `postHashtag` (schema only, minimal implementation)

### Performance Optimizations

**Implemented optimizations that make the app production-ready:**

1. **Permission Queries**: 80% reduction (5 calls → 1 call via `getMemberWithPermissions()`)
2. **Comment Operations**: 57% reduction (7 calls → 3 calls)
3. **Post Operations**: 60% reduction (5 calls → 2 calls)
4. **Bulk Invitations**: 87.5% reduction (40 calls → 5 calls for 10 invitations)
5. **Tribe Queries**: 33% reduction (3 calls → 2 calls)
6. **Parallel Data Fetching**: Using Promise.all() for independent queries
7. **Join Queries**: Eliminating N+1 queries with JOINs
8. **Optimistic Updates**: Instant UI feedback with TanStack Query

**Result**: 50-87% faster response times across all operations

### API Architecture

**40+ RESTful endpoints organized by domain:**
- Authentication (7 endpoints)
- Tribes (6 endpoints)
- Posts & Comments (5 endpoints)
- Media & Albums (6 endpoints)
- Events & Polls (5 endpoints)
- Invitations (3 endpoints)
- User Profile & Settings (8 endpoints)

**Key patterns:**
- All routes require authentication via `getServerUser()`
- Zod schema validation on all inputs
- Permission checks before data access
- Proper HTTP status codes and error handling
- Type-safe responses using Drizzle-inferred types

---

## Success Metrics

### MVP Launch Metrics (First 30 Days)

**Tribe Creation Targets by Segment:**
- Fraternities/Sororities: 5-10 chapters
- Hospitality VIP Lists: 2-3 businesses
- Gyms & Fitness Studios: 2-3 studios
- Sports Leagues: 2-3 teams/leagues
- Country Clubs: 1-2 clubs
- Coworking Spaces: 1-2 spaces
- **Total Goal**: 15-25 active tribes across all segments

**Member Onboarding by Segment:**
- Fraternities/Sororities: 20-50 members per tribe
- Hospitality: 10-30 members per VIP list
- Gyms/Fitness: 15-40 members per studio
- Sports Leagues: 10-25 members per team
- Country Clubs: 30-100 members per club
- Coworking: 20-60 members per space
- **Activation**: % of invitees who accept and upload a profile picture

### The "Sticky Feature" Metrics

**Photo Organization (Critical):**
- Target: Average 10+ photos uploaded per tribe in first 30 days
- Target: 70%+ of photos organized in albums vs. standalone
- Target: 1-2 albums created per tribe per month

**Why this matters:** If groups build a photo archive in Tribe, they're locked in. They won't leave because their memories are here.

### Utility Metrics

**Event Coordination:**
- Target: 2-4 events created per tribe per month
- Target: 40-60% RSVP rate (going/interested)
- Target: 90%+ of events have at least 3 RSVPs

**Permission Customization:**
- Target: 80%+ of tribes customize at least one member's permissions
- Shows active community management and validates RBAC differentiator

**Engagement:**
- Target: 5-10 posts per tribe per week
- Target: 70%+ Week 1 retention
- Target: 50%+ Week 4 retention
- Target: 80%+ tribes with activity after 30 days

### Technical Metrics

- API response time: < 200ms average
- Uptime: 99.5%+
- Error rate: < 1%
- Media upload success rate: > 95%

---

## What's NOT in MVP

**To ensure speed to market, these features are explicitly excluded from V1:**

### ❌ Messaging/Chat
- No direct messages (DMs)
- No group chat channels
- No real-time typing indicators
- **Rationale**: Users will continue using text/WhatsApp for chatter. Tribe is for **Official Business & Media**.

### ❌ Discovery & Public Tribes
- No "Explore" page
- No public search or browse
- No tribe discovery features
- **Rationale**: MVP is strictly private, invite-only. Public discovery comes in Phase 2 after proving utility.

### ❌ Advanced Real-time Features
- No live notifications (infrastructure ready, but not integrated)
- No real-time feed updates
- **Rationale**: Reduces technical complexity. Notifications can be async for MVP.

### ❌ Video & Streaming
- No video playback in app
- No video channels or voice chat
- No "Campfire" features
- **Rationale**: Photos are the sticky feature. Video comes later.

### ❌ Monetization
- All features free for V1
- No paid tiers
- No premium features
- **Rationale**: Gain density first, monetize later.

### ❌ Advanced Features
- No hashtag system (schema exists, not implemented)
- No public user profiles
- No cross-tribe functionality
- No analytics dashboard
- No calendar integrations

---

## Future Roadmap

### Phase 2: The "Chat" Update
**Context**: Once users are locked in for Events/Photos, replace their group chat.

**Features:**
- Real-time group messaging
- Direct messages (DMs)
- Typing indicators
- Read receipts
- "Campfire" voice channels (Discord competitor)

### Phase 3: The "Network" Update
**Context**: Once we have enough private tribes, open doors for cross-pollination.

**Features:**
- Public tribe discovery
- Search and browse functionality
- "Open" tribes (public join)
- Featured tribes section
- Hashtags and topics
- Cross-tribe connections

### Phase 4: The "Business" Update
**Context**: Monetization.

**Features:**
- Paid subscriptions for tribes (storage limits, custom branding)
- Premium public tribe status (can be earned by leveling up or paid)
- Event ticketing and payments
- "Business Hub" for restaurants to manage customers
- Advanced analytics and reporting
- White-label options
- Priority support

### Phase 5: Mobile Apps
- Native iOS app
- Native Android app
- Push notifications
- Mobile-optimized UI
- Mobile event check-in

---

## Appendix

### Glossary

- **Tribe**: A private, invite-only community created by users. Serves as an organizational hub for existing groups.
- **Third Space**: A physical or virtual place outside home and work where people gather and build community.
- **Member**: A user who has joined a tribe through invitation acceptance.
- **Role**: A predefined set of permissions (owner, admin, moderator, member).
- **Permission**: A specific capability or action a member can perform. Can be customized per member.
- **RBAC**: Role-Based Access Control - the granular permission system that mirrors real-world hierarchies.
- **Invitation**: An email-based request to join a tribe with role assignment (7-day expiration).
- **Activity**: An action performed by a user that appears in the activity feed.
- **The Vault**: The media and album archiving system - the sticky feature that locks users in.

### User Roles Reference

| Role      | Description          | Default Permissions                    |
|-----------|----------------------|----------------------------------------|
| Owner     | Tribe creator        | All permissions, cannot be removed     |
| Admin     | High-level manager   | Most management permissions            |
| Moderator | Content moderator    | Moderation permissions only            |
| Member    | Standard user        | Basic participation permissions        |

### Privacy Types (MVP)

- **Private**: Invite-only, not visible in discovery. All tribes in MVP are private.
  - Complete control over community access
  - Maintains exclusivity
  - Can transition to public in future phases

### Tribe Categories

- **Social**: General social groups, fraternities/sororities
- **Gaming**: Gaming communities
- **Family**: Family groups
- **Work**: Work teams and organizations
- **Hobbies**: Hobby and interest groups
- **Other**: Additional community types

### Target Segment Examples

**How Each Segment Uses Tribe:**

**1. Fraternities/Sororities**
- **Roles**: Pledges (view-only), Actives (full access), Officers (admin), Alumni (view-only)
- **The Vault**: Formal photos, rush events, initiation ceremonies, brotherhood/sisterhood moments
- **Events**: Rush events, formals, philanthropy events, chapter meetings
- **RBAC Use Case**: Pledges can see content but can't post until initiated

**2. Hospitality VIP Lists**
- **Roles**: Regular customers (view), VIP members (post), Managers (admin)
- **The Vault**: Special event nights, tasting events, exclusive gatherings
- **Events**: Wine tastings, exclusive menu launches, member-only events
- **RBAC Use Case**: Only VIPs can post photos, regulars can view and RSVP

**3. Gyms & Fitness Studios**
- **Roles**: Trial members (view), Full members (post), Coaches (admin)
- **The Vault**: Transformation photos, PR celebrations, competition results, workshop photos
- **Events**: Fitness challenges, workshops, competitions, seminars
- **RBAC Use Case**: Trial members view-only during trial period, full access after signup

**4. Sports Leagues**
- **Roles**: Active roster (full access), Injured reserve (view), Captain (admin), Alumni (view)
- **The Vault**: Game photos, championship memories, season highlights, team celebrations
- **Events**: Games, tournaments, practices, playoff events
- **RBAC Use Case**: Captain controls who can create events, injured players stay connected

**5. Country Clubs**
- **Roles**: Social members (limited), Full members (standard), Board members (admin)
- **The Vault**: Tournament photos, gala events, member milestones, club celebrations
- **Events**: Golf tournaments, tennis matches, dining events, member galas
- **RBAC Use Case**: Social members have restricted posting, full members full access

**6. Coworking Spaces**
- **Roles**: Hot-desk (limited), Dedicated desk (standard), Private office (full), Organizers (admin)
- **The Vault**: Demo day photos, pitch competitions, networking events, team celebrations
- **Events**: Workshops, demo days, networking events, skill shares
- **RBAC Use Case**: Membership tier determines who can post and create events

---

## Implementation Status

**Database**: ✅ Fully implemented and optimized
**Services**: ✅ All 14 services implemented with performance optimizations
**API Routes**: ✅ 40+ RESTful endpoints implemented
**Frontend Pages**: ✅ 20+ pages implemented
**Authentication**: ✅ Full Better-Auth integration
**Media Upload**: ✅ Cloudinary integration complete
**Email**: ✅ Resend integration for invitations
**Permissions**: ✅ Granular RBAC fully implemented
**Events**: ✅ Full event system with polls
**Albums**: ✅ Full album and media management
**Optimizations**: ✅ 50-87% performance improvements

**MVP Status**: **Production-Ready**

---

**Document Status**: Active
**Last Updated**: December 21, 2024
**Version**: 2.0 - Expanded Target Segments
**Next Review**: Post-Launch (after first 15-25 tribes across all segments)
**Owner**: Product Team
**Stakeholders**: Engineering, Design, Product Management
