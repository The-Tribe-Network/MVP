# Product Requirements Document (PRD) - MVP
## Tribe - Community Organization Platform

**Version:** MVP 1.0  
**Last Updated:** December 2024  
**Status:** MVP Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Problem Statement](#problem-statement)
4. [Target Users](#target-users)
5. [MVP Strategy](#mvp-strategy)
6. [Core Features](#core-features)
7. [Feature Specifications](#feature-specifications)
8. [User Stories](#user-stories)
9. [Technical Architecture](#technical-architecture)
10. [Success Metrics](#success-metrics)
11. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Tribe** is a utility-first community organization platform designed for existing, high-density groups that need better organization and photo archiving than what GroupMe and Instagram provide. Unlike traditional social networks, Tribe launches as a **utility tool** rather than a social platform, bypassing the "Empty Bar Problem" by targeting groups that already exist and have urgent organizational needs.

### MVP Mission

The MVP focuses on providing essential organizational tools for exclusive groups: **Fraternities/Sororities** and **Hospitality VIP Lists** (restaurants, bars, clubs). These groups need:
- Better photo archiving and organization than Instagram
- More structured communication than GroupMe
- Granular role-based access control that mirrors real-world hierarchies
- Event organization with RSVP capabilities
- Announcement system for important updates

### Key Value Propositions (MVP)

- **Utility-First Approach**: Launch as an organizational tool, not a social network
- **Granular RBAC**: Role-Based Access Control that mirrors real-world organizational hierarchies
- **Superior Photo Archiving**: Organized albums and media management beyond Instagram's capabilities
- **Structured Organization**: Better than GroupMe for coordinating events and managing members
- **Privacy-First**: Private, invite-only communities with complete access control
- **Target Existing Groups**: Focus on high-density groups that already exist and need better tools

---

## Product Overview

Tribe MVP is a purpose-built organizational utility that empowers exclusive groups to:
1. **Organize Members**: Granular role-based permissions that reflect real-world hierarchies
2. **Archive Memories**: Superior photo and media organization with albums
3. **Coordinate Events**: Event creation and RSVP system for real-world gatherings
4. **Share Updates**: Posts and announcements to keep members informed
5. **Control Access**: Invite-only system with customizable permissions per member

### Platform Philosophy (MVP)

Tribe MVP operates on the principle that **existing groups need better tools, not a new social network**. We're not trying to build a community from scratch—we're providing superior organizational infrastructure for groups that already exist and are actively coordinating.

**Key Differentiator**: Granular Role-Based Access Control (RBAC) that allows groups to mirror their real-world organizational structures. Unlike simple role systems, Tribe enables custom permission overrides per member, allowing for nuanced control that matches how fraternities, sororities, and businesses actually operate.

### Platform Type
- **Web Application**: Primary platform (Next.js 15 with App Router)
- **Real-time Notifications**: Socket.io server for live notifications
- **Database**: PostgreSQL with Drizzle ORM

---

## Problem Statement

### The Organizational Tool Gap

Existing high-density groups (fraternities, sororities, hospitality VIP lists) are stuck using tools that weren't designed for their needs:

#### Current Tool Limitations

**Instagram**:
- Photos get lost in feeds
- No album organization for events
- No permission controls
- No event coordination
- Public by default (privacy concerns)

**GroupMe**:
- Unstructured communication
- No photo archiving
- No role-based permissions
- No event RSVP system
- Messages get buried
- No announcement system

**Facebook Groups**:
- Too public and discoverable
- Limited permission granularity
- Poor photo organization
- Overwhelming for small exclusive groups

### The Consequence

Groups struggle with:
- **Photo Organization**: Event photos scattered across Instagram, lost in feeds
- **Member Management**: No way to reflect real-world hierarchies (e.g., pledges vs. active members vs. alumni)
- **Event Coordination**: RSVPs scattered across GroupMe messages
- **Access Control**: Can't restrict who can post, create events, or manage members
- **Announcements**: Important updates get lost in chat noise

### Our Solution (MVP)

Tribe MVP addresses these pain points by providing:
1. **Organized Photo Archiving**: Albums organized by event, date, or theme—better than Instagram
2. **Granular RBAC**: Permission system that mirrors real-world organizational structures
3. **Event Coordination**: Dedicated event system with RSVP capabilities
4. **Structured Posts**: Timeline-based updates that don't get lost
5. **Announcement System**: Important updates that members can't miss
6. **Invite-Only Privacy**: Complete control over who has access

---

## Target Users

### Primary User Segments (MVP Focus)

#### 1. Fraternities & Sororities
- **Demographics**: Ages 18-25 (active members), 22-70 (alumni)
- **Pain Points**: 
  - Need to reflect real-world hierarchy (pledges, actives, alumni, officers)
  - Event photos scattered across Instagram
  - Event coordination in GroupMe is chaotic
  - No way to restrict who can create events or post
  - Alumni engagement challenges
- **Use Cases**: 
  - Organize chapter events with RSVP
  - Archive formal photos in organized albums
  - Control who can post (e.g., only actives can post, pledges can view)
  - Send announcements to all members
  - Manage member roles that reflect chapter structure

#### 2. Hospitality VIP Lists (Restaurants, Bars, Clubs)
- **Demographics**: Business owners/managers and their loyal customer base
- **Pain Points**:
  - Need exclusive space for VIP customers
  - Event photos from special nights get lost
  - Can't organize customers by loyalty tier
  - Event coordination through DMs is inefficient
  - No way to send announcements to VIP list
- **Use Cases**:
  - Create exclusive VIP Tribe for regular customers
  - Organize special events with RSVP
  - Archive photos from events in organized albums
  - Control who can see/post (e.g., VIP-only content)
  - Send announcements about special offers or events

---

## MVP Strategy

### Bypassing the "Empty Bar Problem"

Traditional social networks face the "Empty Bar Problem": nobody wants to be the first person at an empty bar. New social platforms struggle because they need critical mass to be valuable, creating a chicken-and-egg problem.

**Tribe's MVP Strategy**: Launch as a **utility tool** rather than a social network.

#### Why This Works

1. **Existing Groups**: Target groups that already exist and are actively coordinating
2. **Immediate Value**: Groups get value from day one—better organization, better photo archiving
3. **No Network Effect Required**: Each tribe is valuable independently
4. **Urgent Need**: Groups are actively frustrated with current tools (GroupMe, Instagram)
5. **High Density**: Fraternities and VIP lists are naturally high-density groups

#### Target Launch Strategy

- **Phase 1**: Target 5-10 fraternity/sorority chapters at launch
- **Phase 2**: Expand to hospitality businesses with existing VIP lists
- **Phase 3**: Word-of-mouth growth within these communities

### Key Differentiator: Granular RBAC

**Granular Role-Based Access Control (RBAC)** is Tribe's core differentiator. Unlike simple role systems, Tribe allows:

- **Default Role Permissions**: Owner, Admin, Moderator, Member roles with default permissions
- **Custom Permission Overrides**: Per-member permission customization
- **Real-World Hierarchy Mirroring**: Reflect actual organizational structures

**Example Use Cases**:
- Fraternity: Pledges can view but not post; Actives can post; Officers can create events; Alumni can view but not comment
- VIP List: Regular customers can view and RSVP; VIP members can post; Managers can create events and send announcements

---

## Core Features

### 1. Authentication & User Management

#### Features
- **Multiple Authentication Methods**:
  - Email/password authentication
  - OAuth integration (Google, GitHub)
  - Magic link (passwordless) authentication
  - OTP (One-Time Password) verification
  
- **User Account Management**:
  - User profiles with avatars
  - Email verification
  - Password reset flow
  - Username support
  - Account settings and preferences

#### Technical Details
- Better-Auth for authentication
- Session management with secure HTTP-only cookies
- CSRF protection
- Rate limiting for security

---

### 2. Tribe Creation & Management

#### Features
- **Tribe Creation**:
  - Multi-step creation wizard
  - Basic information (name, description, avatar)
  - Privacy settings (private only in MVP)
  - Category selection (fraternity/sorority, hospitality/business, other)
  - Location setting (optional)
  - Initial member invitations

- **Tribe Management**:
  - Edit tribe settings (name, description)
  - Upload/change tribe avatar
  - Tribe deletion and ownership transfer

#### Tribe Properties
- **Privacy Types**: 
  - Private: Invite-only, not discoverable (MVP only)

- **Categories**: fraternity/sorority, hospitality/business, other

- **Roles**: owner, admin, moderator, member

---

### 3. Granular Role-Based Access Control (RBAC)

**This is Tribe's core differentiator and key feature.**

#### Features
- **Member Roles**:
  - Owner: Full control, cannot be removed
  - Admin: Most management permissions
  - Moderator: Content moderation permissions
  - Member: Standard participation

- **Granular Permission System**:
  Each member can have custom permission overrides that mirror real-world hierarchies:
  
  **Posting Permissions**:
  - `canPost`: Create posts
  - `canComment`: Comment on posts
  - `canEditOwnPosts`: Edit own posts
  - `canDeleteOwnPosts`: Delete own posts
  
  **Media Permissions**:
  - `canUploadMedia`: Upload photos/videos
  - `canCreateAlbums`: Create photo albums
  - `canDeleteOwnMedia`: Delete own media
  
  **Event Permissions**:
  - `canCreateEvents`: Create events
  - `canEditEvents`: Edit any event
  - `canDeleteEvents`: Delete any event
  
  **Member Management Permissions**:
  - `canInviteMembers`: Invite new members
  - `canRemoveMembers`: Remove members
  - `canChangeMemberRoles`: Change member roles
  - `canManagePermissions`: Modify permissions
  
  **Content Moderation Permissions**:
  - `canModeratePosts`: Moderate posts
  - `canModerateComments`: Moderate comments
  - `canDeleteAnyPost`: Delete any post
  - `canDeleteAnyComment`: Delete any comment
  
  **Tribe Management Permissions**:
  - `canEditTribeSettings`: Edit tribe settings
  - `canDeleteTribe`: Delete the tribe
  - `canTransferOwnership`: Transfer ownership
  
  **Announcement Permissions**:
  - `canCreateAnnouncements`: Create tribe-wide announcements

- **Member Management**:
  - View all members with roles
  - Invite members by email
  - Change member roles
  - Remove members
  - Set custom permissions per member
  - View member activity

#### RBAC Use Cases

**Fraternity Example**:
- **Pledges**: Can view posts and media, cannot post or comment (view-only)
- **Active Members**: Can post, comment, upload media, RSVP to events
- **Officers**: Can create events, manage members, send announcements
- **Alumni**: Can view content, cannot post or comment (view-only)

**VIP List Example**:
- **Regular Customers**: Can view posts, RSVP to events, view media
- **VIP Members**: Can post, comment, upload media, RSVP to events
- **Managers**: Can create events, send announcements, manage members

---

### 4. Invitation System

#### Features
- **Invitation Types**:
  - Email-based invitations
  - Role assignment on invitation
  - 7-day expiration window
  - Invitation status tracking (pending, accepted, rejected, expired)

- **Invitation Flow**:
  1. Admin/owner invites user by email
  2. System checks if user exists
  3. If user exists, check if already a member
  4. Create invitation record
  5. Send invitation email (non-blocking)
  6. User receives email with invitation link
  7. User accepts/rejects invitation
  8. On acceptance, user is added as member with assigned role
  9. Inviter receives notification

- **Invitation Management**:
  - View pending invitations
  - Resend invitations
  - Cancel invitations
  - Track invitation status

---

### 5. Posts & Timeline

#### Features
- **Post Creation**:
  - Text posts
  - Posts with images
  - Rich text content
  - Permission-based posting (requires `canPost` permission)

- **Post Interactions**:
  - Like posts
  - Comment on posts (requires `canComment` permission)
  - Edit own posts (with permission)
  - Delete own posts (with permission)
  - Delete any post (moderator/admin permission)

- **Timeline Features**:
  - Chronological post feed
  - Author information
  - Like counts
  - Comment counts
  - Media attachments
  - Post timestamps
  - Edit/delete indicators

- **Comments**:
  - Text comments
  - Like comments
  - Edit own comments
  - Delete own comments
  - Delete any comment (moderator/admin)

---

### 6. Events Management

#### Features
- **Event Creation**:
  - Event title and description
  - Location
  - Start date/time (required)
  - End date/time (optional)
  - Event status (upcoming, ongoing, completed, cancelled)

- **Event Features**:
  - RSVP system (going, not going, maybe)
  - Event list view
  - Past events archive
  - Attendee list

- **Event Permissions**:
  - Create events (requires `canCreateEvents`)
  - Edit events (requires `canEditEvents`)
  - Delete events (requires `canDeleteEvents`)

- **Event Display**:
  - Upcoming events list
  - Event details page
  - Attendee list
  - RSVP status

---

### 7. Media & Albums

#### Features
- **Media Upload**:
  - Image upload
  - Video upload
  - Support for various file types
  - File size validation
  - Media metadata (dimensions, duration, file size)

- **Media Organization**:
  - Photo albums
  - Album creation (requires `canCreateAlbums`)
  - Album cover images
  - Album descriptions
  - Multiple photos per album
  - Media attached to posts

- **Media Display**:
  - Photo grid view
  - Photo carousel/gallery
  - Trending photos section
  - Trending albums section
  - All albums view
  - Individual photo view

- **Media Permissions**:
  - Upload media (requires `canUploadMedia`)
  - Create albums (requires `canCreateAlbums`)
  - Delete own media (requires `canDeleteOwnMedia`)

---

### 8. Announcements

#### Features
- **Announcement Creation**:
  - Tribe-wide announcements
  - Rich text content
  - Priority/importance levels
  - Permission-based (requires `canCreateAnnouncements`)

- **Announcement Display**:
  - Prominent display in tribe dashboard
  - Notification when new announcement is created
  - Announcement history
  - Mark as read/unread

- **Announcement Permissions**:
  - Create announcements (requires `canCreateAnnouncements`)
  - Typically restricted to owners, admins, and designated roles

---

### 9. Notifications

#### Features
- **Notification System**:
  - Real-time notifications via Socket.io
  - Notification types:
    - Post likes
    - Comments
    - New members
    - Event creation
    - Photo uploads
    - Announcements
    - Invitations
  - Read/unread status
  - Notification drawer
  - Mark all as read

---

### 10. Trends

#### Features
- **Trending Content**:
  - Trending photos (based on engagement)
  - Trending albums (based on views and engagement)
  - Trending posts (based on likes and comments)
  - Algorithm considers:
    - Engagement metrics (likes, comments, views)
    - Recency
    - Member activity

---

### 11. User Dashboard

#### Features
- **Home Dashboard**:
  - Activity feed aggregation across tribes
  - Upcoming events across tribes
  - Recent notifications
  - Metrics grid (tribes count, posts count, etc.)
  - Quick actions

- **Profile Dashboard**:
  - User profile information
  - Avatar management
  - Account settings
  - Privacy settings
  - Notification preferences

---

### 12. Settings & Preferences

#### Features
- **Account Settings**:
  - Profile information
  - Avatar upload
  - Email management
  - Password change

- **Privacy Settings**:
  - Privacy controls
  - Visibility settings

- **Notification Preferences**:
  - Email notifications
  - In-app notifications
  - Notification types toggle

---

## Feature Specifications

### Authentication System

#### Sign-Up Flow
1. User enters email, password, optional username
2. System validates input
3. User account created (unverified)
4. Verification email sent
5. User clicks verification link
6. Account activated
7. Welcome email sent
8. Redirect to dashboard

#### Sign-In Flow
1. User enters email and password (or uses OAuth)
2. System validates credentials
3. Session created
4. Redirect to dashboard or requested page

#### Password Reset Flow
1. User requests password reset
2. Reset email sent with secure token
3. User clicks reset link
4. User enters new password
5. Password updated
6. User redirected to sign-in

### Tribe Creation Flow

1. **Step 1: Basic Info**
   - Enter tribe name
   - Enter description (explain the community's purpose and values)
   - Upload avatar (optional)
   
2. **Step 2: Category & Privacy**
   - Select category (fraternity/sorority, hospitality/business, other)
   - Privacy is private-only in MVP (invite-only, not discoverable)
   - Location setting (optional but recommended)
   
3. **Step 3: Invite Members**
   - Enter email addresses of initial members
   - Assign roles (owner, admin, moderator, member)
   - Invitations sent via email
   - Members must accept invitation to join
   
4. **Tribe Created**
   - Tribe appears in creator's tribe list
   - Creator becomes owner (cannot be removed)
   - Default permissions assigned based on roles
   - Private tribe remains exclusive

### Permission Check Flow

1. User attempts action (e.g., create post)
2. System checks if user is member
3. System retrieves member record
4. System checks for permission override
5. If override exists and is false → deny
6. If override exists and is true → allow
7. If no override → check default role permissions
8. Action allowed or denied

### Announcement Flow

1. User with `canCreateAnnouncements` permission creates announcement
2. Announcement is created and stored
3. Real-time notification sent to all tribe members via Socket.io
4. Announcement appears prominently in tribe dashboard
5. Members can mark announcement as read
6. Announcement history maintained  

---

## User Stories

### As a Fraternity/Sorority Leader

- **US-001**: As a fraternity president, I want to create a private Tribe for my chapter so that only initiated brothers can access it
- **US-002**: As a chapter officer, I want to invite new members by email with specific roles so that pledges have view-only access while actives can post
- **US-003**: As a rush chair, I want to organize rush events with RSVP so that potential members can RSVP and attend
- **US-004**: As a historian, I want to create photo albums for formal events so that we can preserve chapter memories in an organized way
- **US-005**: As an alumni coordinator, I want to set alumni permissions to view-only so they stay connected but can't post
- **US-006**: As a chapter officer, I want to send announcements to all members so that important updates reach everyone

### As a Hospitality Business Owner/Manager

- **US-007**: As a restaurant owner, I want to create a VIP Tribe for my regular customers so that I can offer exclusive perks and events
- **US-008**: As a bar manager, I want to organize themed nights and special events with RSVP so that our Tribe members can RSVP
- **US-009**: As a club owner, I want to share photos from events in organized albums so that our community can see the energy and culture we create
- **US-010**: As a business owner, I want to control who can post so that only VIP members can create content
- **US-011**: As a community manager, I want to send announcements about special offers so that our Tribe members are the first to know

### As a Tribe Member

- **US-012**: As a fraternity brother, I want to create posts about chapter events so that all brothers stay informed
- **US-013**: As a VIP customer, I want to RSVP to special events so that the business knows I'm attending
- **US-014**: As a member, I want to upload photos from our latest event so that the group can see what we accomplished
- **US-015**: As a member, I want to receive notifications about announcements so that I don't miss important updates
- **US-016**: As a member, I want to browse trending photos and albums so that I can see the most engaging content

### As a Tribe Administrator

- **US-017**: As an admin, I want to assign roles to members so that I can delegate responsibilities appropriately
- **US-018**: As a moderator, I want to remove inappropriate posts so that we maintain our community standards
- **US-019**: As an admin, I want to customize permissions for specific members so that I can control access levels (e.g., pledges view-only)
- **US-020**: As a content moderator, I want to delete inappropriate comments so that discussions remain respectful
- **US-021**: As an organizer, I want to view member activity so that I can understand engagement levels

---

## Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (built on Radix UI)
- **State Management**: 
  - TanStack Query for server state
  - Zustand for client state
- **Forms**: react-hook-form with Zod validation
- **Real-time**: Socket.io client (for notifications)

### Backend Stack

- **API**: Next.js API Routes
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth
- **Real-time Server**: Socket.io server (Node.js) for notifications
- **File Storage**: Cloudinary (for media uploads)
- **Email Service**: Resend

### Database Schema

#### Core Tables

- `user`: User accounts
- `tribe`: Community groups
- `tribe_member`: Membership relationships
- `tribe_member_permission`: Granular permissions
- `tribe_invitation`: Invitation records

#### Content Tables

- `post`: User posts
- `post_like`: Post likes
- `comment`: Post comments
- `comment_like`: Comment likes
- `announcement`: Tribe announcements

#### Media Tables

- `album`: Photo albums
- `media`: Media files (photos, videos)

#### Event Tables

- `event`: Events
- `event_attendee`: RSVPs

#### Activity Tables

- `activity`: Activity feed entries
- `notification`: User notifications

### API Endpoints

#### Authentication
- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### Tribes
- `GET /api/tribes` - List user's tribes
- `POST /api/tribes` - Create tribe
- `GET /api/tribes/[tribe_id]` - Get tribe details
- `PUT /api/tribes/[tribe_id]` - Update tribe
- `DELETE /api/tribes/[tribe_id]` - Delete tribe
- `GET /api/tribes/[tribe_id]/members` - List members
- `POST /api/tribes/[tribe_id]/invitations` - Invite members
- `GET /api/tribes/[tribe_id]/posts` - Get posts
- `POST /api/tribes/[tribe_id]/posts` - Create post

#### Invitations
- `GET /api/invitations` - Get user's invitations
- `POST /api/invitations/[invitation_id]/accept` - Accept invitation
- `POST /api/invitations/[invitation_id]/reject` - Reject invitation

#### Media
- `POST /api/upload/post-image` - Upload image for post
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/media` - Upload media
- `GET /api/tribes/[tribe_id]/albums` - Get albums
- `POST /api/tribes/[tribe_id]/albums` - Create album

#### Events
- `GET /api/tribes/[tribe_id]/events` - Get events
- `POST /api/tribes/[tribe_id]/events` - Create event
- `POST /api/events/[event_id]/rsvp` - RSVP to event

#### Announcements
- `GET /api/tribes/[tribe_id]/announcements` - Get announcements
- `POST /api/tribes/[tribe_id]/announcements` - Create announcement

#### Trends
- `GET /api/tribes/[tribe_id]/trending/photos` - Get trending photos
- `GET /api/tribes/[tribe_id]/trending/albums` - Get trending albums
- `GET /api/tribes/[tribe_id]/trending/posts` - Get trending posts

### Real-time Events (Socket.io)

#### Server → Client
- `notification:new` - New notification
- `invitation:new` - New invitation
- `announcement:new` - New announcement
- `post:new` - New post
- `event:new` - New event
- `media:new` - New media upload

---

## Success Metrics

### MVP Launch Metrics

- **Tribe Creation**: Number of tribes created in first 30 days
- **Target**: 5-10 fraternity/sorority chapters, 3-5 hospitality businesses
- **Member Onboarding**: Average members per tribe
- **Target**: 20-50 members per fraternity, 10-30 per VIP list

### User Engagement Metrics

- **Daily Active Users (DAU)**: Users actively engaging with their tribes
- **Weekly Active Users (WAU)**: Users who visit at least once per week
- **Post Engagement**: Posts per tribe per week
- **Target**: 5-10 posts per tribe per week
- **Event Participation**: Events created per tribe per month
- **Target**: 2-4 events per tribe per month
- **RSVP Rate**: % of members who RSVP to events
- **Target**: 40-60% RSVP rate

### Feature Adoption Metrics

- **Permission Customization Rate**: % of tribes using custom permissions
- **Target**: 80%+ of tribes customize at least one member's permissions
- **Album Creation Rate**: Albums created per tribe
- **Target**: 1-2 albums per tribe per month
- **Media Upload**: Photos uploaded per user per month
- **Target**: 5-10 photos per user per month
- **Announcement Usage**: Announcements sent per tribe per month
- **Target**: 2-4 announcements per tribe per month

### Utility Value Metrics

- **Photo Organization**: % of photos organized in albums vs. standalone
- **Target**: 70%+ of photos in albums
- **Event Coordination**: % of events with RSVPs
- **Target**: 90%+ of events have at least 3 RSVPs
- **Permission Granularity**: Average custom permissions per tribe
- **Target**: 3-5 custom permission overrides per tribe

### Retention Metrics

- **Week 1 Retention**: % of users active after 7 days
- **Target**: 70%+
- **Week 4 Retention**: % of users active after 30 days
- **Target**: 50%+
- **Tribe Stability**: % of tribes with activity after 30 days
- **Target**: 80%+

### Technical Metrics

- **API Response Time**: Average response time for API calls
- **Target**: < 200ms for most endpoints
- **Real-time Latency**: Average notification delivery time
- **Target**: < 100ms
- **Uptime**: System availability percentage
- **Target**: 99.5%+

---

## Future Roadmap

### Phase 2: Enhanced Features

#### Discovery & Public Tribes
- Public tribe discovery
- Search and browse functionality
- Public tribe monetization

#### Messaging
- Real-time messaging (group and direct)
- Typing indicators
- Message history

#### Enhanced Media
- Video playback in app
- Media compression
- Bulk upload

#### Event Enhancements
- Recurring events
- Event reminders
- Event check-in
- Event polls

### Phase 3: Campfire Chat Rooms

#### Multi-Modal Communication
- Voice channels
- Video channels
- Text channels
- Channel management

### Phase 4: Mobile Application

- Native iOS app
- Native Android app
- Push notifications
- Mobile-optimized UI

### Phase 5: Advanced Features

#### Analytics Dashboard
- Tribe analytics
- Engagement metrics
- Member activity reports

#### Integration
- Calendar integration (Google Calendar, iCal)
- Social media integration
- Email notifications for events

---

## Appendix

### Glossary

- **Tribe**: An exclusive community or group created by users. Tribes serve as organizational hubs for existing groups. In MVP, all tribes are private and invite-only.
- **Member**: A user who has joined a tribe through invitation and acceptance
- **Role**: A predefined set of permissions (owner, admin, moderator, member) that determines a member's default capabilities within a tribe
- **Permission**: A specific capability or action a member can perform. Permissions can be customized per member to maintain community standards and mirror real-world hierarchies
- **RBAC (Role-Based Access Control)**: The granular permission system that allows custom permission overrides per member, enabling groups to mirror their real-world organizational structures
- **Invitation**: An email-based request to join a tribe. Invitations can include role assignment and expire after 7 days
- **Activity**: An action performed by a user (post, comment, like, event creation, etc.) that appears in the activity feed
- **Notification**: A real-time alert about tribe activity, delivered via Socket.io for immediate visibility
- **Announcement**: A tribe-wide message created by users with `canCreateAnnouncements` permission, displayed prominently to all members
- **Trending**: Content (photos, albums, posts) that is currently popular based on engagement metrics

### User Roles Reference

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| Owner | Tribe creator | All permissions, cannot be removed |
| Admin | High-level manager | Most management permissions |
| Moderator | Content moderator | Moderation permissions only |
| Member | Standard user | Basic participation permissions |

### Privacy Types

- **Private**: Invite-only, not visible in discovery. All tribes in MVP are private. This ensures complete control over community access and maintains exclusivity.

### Tribe Categories (MVP)

The MVP platform supports these categories:

- **Fraternity/Sorority**: Greek organizations and chapters
- **Hospitality/Business**: Restaurants, bars, clubs, local businesses building VIP communities
- **Other**: Additional community types as needed

---

**Document Status**: MVP Active  
**Next Review Date**: TBD  
**Owner**: Product Team  
**Stakeholders**: Engineering, Design, Product Management

