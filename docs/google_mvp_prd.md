Product Requirements Document (PRD)
Tribe - Community Social Platform
Version: 2.0 (MVP Focused) Date: November 2024 Status: MVP Development

1. Executive Summary
Tribe is a private-first community platform designed to restore the "Third Space" for exclusive groups. Unlike broad social networks, Tribe focuses on high-trust, structured communities that need tools to organize real-world interaction and preserve shared history.

The MVP Strategy: We are bypassing the "Empty Bar Problem" by launching as a utility tool rather than a social network. We will target existing, high-density groups (Fraternities/Sororities and Hospitality VIP lists) that urgently need better organization and photo archiving than what GroupMe/Instagram provides.

Core Value Proposition (MVP)
Structure: Granular Role-Based Access Control (RBAC) that mirrors real-world hierarchies (e.g., Officers vs. Members).

Utility: Robust Event management with strict RSVP tracking.

Legacy: A permanent, organized "Vault" for community photos and media (The Sticky Feature).

2. Go-To-Market Focus (The Wedge)
To validate the MVP, development will prioritize User Stories for two specific verticals:

A. Greek Life (Fraternities & Sororities)
The Pain: Current tools are fragmented. GroupMe is chaotic; Instagram is too public; Google Drive is clunky for photos.

The Hook: "The digital chapter house." A place to manage Rush events, archive initiation photos securely, and manage permissions for Pledges vs. Actives.

B. Hospitality (Metro Food & Bev)
The Pain: Restaurants/Bars have no way to reach "Regulars" without fighting algorithms on Instagram.

The Hook: A "Digital VIP Room." A private feed for menu drops, exclusive tasting event RSVPs, and community building for loyal patrons.

3. MVP Scope: The "Must Haves"
Hard Constraint: The following features are the only items included in the V1 build.

3.1 Authentication & Onboarding
Tech: Better-Auth.

Methods: Email/Password, Google OAuth.

Flow:

Sign up/Login.

Profile Creation: Name, Avatar.

Tribe Entry: Users must either Create a Tribe or Accept an Invite. There is no "browsing."

3.2 Tribe Management (Private Only)
Creation: User sets Name, Description, Location, and Avatar.

Privacy: Hardcoded to Private. No public visibility. No search indexing.

Discovery: None. Access is strictly via Email Invitation Link.

3.3 Role-Based Access Control (RBAC)
This is a core differentiator. It must be robust.

Default Roles: Owner, Admin, Member.

Customization: Owners can create custom permission sets.

Key Permissions Flags:

canPost (e.g., allow Pledges to read but not post).

canCreateEvent (e.g., only Social Chairs can make events).

canUploadMedia (e.g., prevent spam uploads).

canInvite (Control growth).

3.4 The Feed (Posts)
Structure: Chronological timeline.

Content: Text, Rich Text, Image attachments.

Interaction: Likes, Comments (Nested comments are OOS for MVP; single level only).

Announcements: Admins can pin a post or mark it as an "Announcement" which triggers a notification.

3.5 Events Engine
Details: Title, Description, Location (Map integration optional for V1), Start/End Time.

RSVP Logic: Going, Maybe, Not Going.

Attendees: Viewable list of who is going (Social Proof).

Notifications: Auto-notify tribe members when an event is created.

3.6 Media & "The Vault"
Critical Feature for Retention.

Albums: Users can create named Albums (e.g., "Spring Formal 2024").

Grid View: Visual-first gallery view of the Tribe.

Quality: Support high-res photo uploads (Cloudinary/UploadThing).

Logic: Photos can be uploaded directly to an Album or attached to a Post (which auto-adds to a "Timeline Photos" album).

3.7 Real-Time Services (Socket.io)
Scope: Strictly one-to-many notifications. No Chat/DM.

Triggers:

"New Event Created"

"New Announcement Posted"

"You were invited to a Tribe"

UI: A "Notification Bell" dropdown and in-app toast popups.

4. Explicitly Excluded from MVP (The "Not Now" List)
To ensure speed to market, the following features are cut from V1:

❌ Messaging: No Direct Messages (DMs) or Group Chat channels. (Users will continue to use text/WhatsApp for chatter; Tribe is for Official Business & Media).

❌ Discovery: No "Explore" page. No Public Search.

❌ Public Profiles: User profiles are only visible to fellow Tribe members.

❌ Video/Campfire: No streaming or voice channels.

❌ Paid Tiers: All features free for V1 to gain density.

5. Technical Architecture (MVP)
Framework: Next.js 15 (App Router).

Language: TypeScript.

Database: PostgreSQL (Neon Serverless).

ORM: Drizzle.

Auth: Better-Auth.

Real-time: Socket.io (Node.js custom server or integrated via Next.js instrumentation).

Storage: Cloudinary or UploadThing (for Media optimization).

Email: Resend (for Invites).

6. Product Vision (Future Roadmap)
Features listed here are acknowledged as part of the long-term vision but are blocked until MVP achieves traction.

Phase 2: The "Chat" Update
Context: Once users are locked in for Events/Photos, we replace their group chat.

Features: Real-time group messaging, DMs, "Campfire" voice channels (Discord competitor).

Phase 3: The "Network" Update
Context: Once we have enough private tribes, we open the doors for cross-pollination.

Features: Public Discovery, Search, "Open" Tribes, Hashtags/Topics.

Phase 4: The "Business" Update
Context: Monetization.

Features: Paid Subscriptions for Tribes (storage limits, custom branding), Ticketing for Events, "Business Hub" for restaurants to manage customers.

7. Success Metrics (MVP)
Activation: % of Invitees who accept and upload a Profile Picture.

The "Memory" Hook: Average # of Photos uploaded per Tribe in the first 30 days.

The "Utility" Hook: % of Active Users who RSVP to an Event.

Retention: WAU (Weekly Active Users) returning to check the Feed/Events.

Analysis of this MVP Strategy
Why this works: By cutting Chat and Discovery, you significantly reduce technical complexity and moderation overhead. You are forcing the product to be "The Place for Official Plans and Photos," which is a distinct gap in the market.

Likelihood of Success:

Higher. You are building a focused tool rather than a generic social network.

Risk: Users might find it annoying to use Tribe for events/photos but switch back to GroupMe for chatting.

Mitigation: Ensure the Notification system is perfect. If I miss an event announcement because the notification didn't fire, I will stop using the app. The "Real-time services" component is your most critical infrastructure piece.