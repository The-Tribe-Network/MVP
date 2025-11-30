# Product Requirements Document (PRD)
## Tribe - Community Social Platform

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Problem Statement](#problem-statement)
4. [Target Users](#target-users)
5. [Core Features](#core-features)
6. [Feature Specifications](#feature-specifications)
7. [User Stories](#user-stories)
8. [Technical Architecture](#technical-architecture)
9. [Success Metrics](#success-metrics)
10. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Tribe** is a modern social community platform designed exclusively for exclusive social groups such as fraternities, churches, adventure clubs, and small businesses (restaurants, bars, clubs) seeking to build deeper connections with their members. More than just a social network, Tribe serves as a central hub that helps cultivate connections and revitalize "third spaces"—the physical and virtual places where people naturally congregate, build relationships, and create community.

### Our Mission

Over the past decades, traditional third spaces—coffee shops, community centers, local hangouts—have been eroded by the rise of social media, increasing costs, and changing social dynamics. Today, it's harder than ever for people to find authentic connections and meaningful community. Tribe exists to reverse this trend by providing exclusive social groups with the digital infrastructure they need to stay connected, organize real-world meetups, and focus on what truly matters: genuine human connection.

### Key Value Propositions
- **Exclusive Communities**: Built specifically for private social groups that need more than public social media
- **Central Hub**: All-in-one platform for communication, events, media, and member management
- **Privacy-First**: Complete control over community access and visibility—start private, grow public when ready
- **Real-World Focus**: Tools designed to facilitate actual in-person gatherings and third space activities
- **Flexible Growth**: Private tribes can become public when communities are ready to expand
- **Member-Centric**: Granular permissions and role management to maintain community integrity

---

## Product Overview

Tribe is a purpose-built platform that empowers exclusive social groups to maintain strong connections, organize activities, and cultivate vibrant communities. The platform serves as a central hub where groups can:

1. **Create Private Communities**: Establish exclusive Tribes for fraternities, churches, adventure groups, or small businesses
2. **Manage Members Exclusively**: Invite-only access with role-based permissions to maintain community integrity
3. **Organize Real-World Events**: Plan gatherings, meetups, and activities that bring people together in person
4. **Share Memories & Media**: Preserve and organize photos, videos, and moments that strengthen bonds
5. **Communicate Seamlessly**: Real-time messaging and notifications to keep members engaged and informed
6. **Grow Strategically**: Transition from private to public when communities are ready to expand
7. **Focus on Connection**: Tools designed to reduce friction and increase meaningful engagement

### Platform Philosophy

Tribe operates on the principle that strong communities start with exclusivity and intention. Groups begin as private, invitation-only spaces where members can build trust and establish culture. As communities mature and seek growth, they can transition to public discovery, allowing like-minded individuals to find and join them. This model ensures that every Tribe maintains its unique identity while enabling organic expansion.

### Platform Type
- **Web Application**: Primary platform (Next.js 15 with App Router)
- **Real-time Communication**: Socket.io server for live messaging and notifications
- **Database**: PostgreSQL with Drizzle ORM

---

## Problem Statement

### The Third Space Crisis

Traditional "third spaces"—the places outside of home (first space) and work (second space) where people naturally gather, socialize, and build community—have been systematically eroded over the past decades. These once-vibrant spaces included:

- **Coffee shops and cafes** where neighbors would meet regularly
- **Community centers and churches** hosting weekly gatherings
- **Local bars and restaurants** serving as neighborhood hubs
- **Parks and recreational spaces** fostering casual interactions
- **Fraternity houses and club spaces** providing belonging and brotherhood/sisterhood

### Root Causes of Third Space Decline

1. **Social Media Fragmentation**: Platforms like Facebook, Instagram, and Twitter have replaced in-person interaction with digital "connection," leading to increased isolation despite being "connected" online
2. **Rising Costs**: The economic barriers to creating and maintaining third spaces have increased dramatically, making it difficult for small businesses and organizations to sustain community hubs
3. **Lost Gathering Places**: As costs rise, many traditional third spaces have closed or become too expensive for casual, regular attendance
4. **Digital Overload**: The sheer volume of digital platforms has fragmented communities across multiple apps and services, making it harder to coordinate and maintain real-world connections
5. **Decreased Local Engagement**: People increasingly rely on global digital networks rather than local, tangible communities

### The Consequence

Today, it's more difficult than ever for people to:
- Find authentic, in-person connections
- Build lasting relationships with neighbors and local communities
- Organize and maintain exclusive social groups (fraternities, churches, clubs)
- Create safe spaces for specific communities to gather
- Bridge the gap between digital communication and real-world meetups

### Our Solution

Tribe addresses the third space crisis by providing exclusive social groups with a dedicated digital hub that:

1. **Prioritizes Real-World Connection**: Event organization and RSVP tools that facilitate actual in-person gatherings
2. **Maintains Exclusivity**: Private, invite-only communities that preserve the intimacy and trust of traditional third spaces
3. **Reduces Fragmentation**: All-in-one platform eliminating the need to juggle multiple apps and services
4. **Enables Growth**: Flexible privacy settings allowing communities to start private and become public when ready
5. **Focuses on Intent**: Tools designed specifically for groups that want to maintain strong, meaningful relationships
6. **Supports Small Businesses**: Enables restaurants, bars, and clubs to create exclusive communities around their establishments

Tribe isn't trying to replace third spaces—it's providing the digital infrastructure needed to revitalize and maintain them in the modern world.

---

## Target Users

### Primary User Segments

#### 1. Fraternities & Sororities
- **Demographics**: Ages 18-25 (active members), 22-70 (alumni)
- **Pain Points**: 
  - Need private, exclusive space for brothers/sisters
  - Difficult to coordinate events and maintain traditions
  - Alumni engagement challenges
  - Fragmented communication across multiple platforms
- **Use Cases**: 
  - Maintain exclusive brotherhood/sisterhood connections
  - Organize chapter meetings, rituals, and social events
  - Share memories and maintain traditions
  - Engage alumni in ongoing community activities
  - Coordinate rush events and new member onboarding

#### 2. Churches & Religious Organizations
- **Demographics**: All ages, faith-based communities
- **Pain Points**:
  - Need private space for congregation members
  - Coordinate volunteer activities and service projects
  - Organize church events, retreats, and gatherings
  - Maintain connections beyond Sunday services
- **Use Cases**:
  - Create exclusive communities for congregation members
  - Organize Bible studies, youth groups, and ministry events
  - Coordinate volunteer sign-ups and service projects
  - Share worship photos and community memories
  - Facilitate small group communication

#### 3. Adventure & Outdoor Groups
- **Demographics**: Ages 25-55, outdoor enthusiasts
- **Pain Points**:
  - Coordinate trips and expeditions
  - Share gear information and trip photos
  - Maintain exclusive membership for safety and quality
  - Organize regular meetups and training sessions
- **Use Cases**:
  - Organize hiking, climbing, skiing, or adventure trips
  - Share photos and trip reports
  - Coordinate equipment sharing and logistics
  - Maintain exclusive membership for experienced adventurers
  - Plan training sessions and skill-building events

#### 4. Small Businesses (Restaurants, Bars, Clubs)
- **Demographics**: Business owners and their loyal customer base
- **Pain Points**:
  - Build exclusive community around their establishment
  - Reward and engage loyal customers
  - Organize special events and promotions
  - Create sense of belonging beyond just transactions
- **Use Cases**:
  - Create exclusive "VIP" or "regulars" community
  - Organize special events, tastings, and themed nights
  - Share menu updates and special offers
  - Build loyalty through exclusive access
  - Facilitate customer-to-customer connections

#### 5. Exclusive Clubs & Organizations
- **Demographics**: Ages 30-70, established organizations
- **Pain Points**:
  - Maintain exclusivity and membership standards
  - Coordinate events and meetings
  - Engage members across different life stages
  - Preserve organizational history and traditions
- **Use Cases**:
  - Private member-only communities
  - Organize formal events, meetings, and social gatherings
  - Share organizational news and updates
  - Maintain membership directories and connections
  - Coordinate volunteer and leadership activities

#### 6. Community Leaders & Administrators
- **Demographics**: Ages 25-65, leadership roles in organizations
- **Pain Points**: 
  - Need granular control over member access and permissions
  - Coordinate multiple activities and events simultaneously
  - Moderate content and maintain community standards
  - Track engagement and member participation
- **Use Cases**:
  - Manage member roles and permissions
  - Organize and promote events
  - Moderate discussions and content
  - Track member activity and engagement metrics
  - Onboard new members and set community guidelines

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
  - Privacy settings (private/public)
  - Category selection (social, gaming, family, work, hobbies, other)
  - Location setting
  - Initial member invitations

- **Tribe Management**:
  - Edit tribe settings (name, description, privacy)
  - Upload/change tribe avatar
  - Feature/trending flags (admin-controlled)
  - Tribe deletion and ownership transfer

#### Tribe Properties
- **Privacy Types**: 
  - Private: Invite-only, not discoverable
  - Public: Discoverable in browse/search

- **Categories**: social, gaming, family, work, hobbies, other

- **Roles**: owner, admin, moderator, member

---

### 3. Member Management & Permissions

#### Features
- **Member Roles**:
  - Owner: Full control, cannot be removed
  - Admin: Most management permissions
  - Moderator: Content moderation permissions
  - Member: Standard participation

- **Granular Permission System**:
  Each member can have custom permission overrides:
  
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
  
  **Messaging Permissions**:
  - `canSendMessages`: Send group/direct messages

- **Member Management**:
  - View all members with roles
  - Invite members by email
  - Change member roles
  - Remove members
  - Set custom permissions per member
  - View member activity

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
  9. Inviter receives notification email

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
  - Comment on posts
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
  - Event calendar view
  - Event list view
  - Event voting (for date/location options)
  - Past events archive

- **Event Permissions**:
  - Create events (requires `canCreateEvents`)
  - Edit events (requires `canEditEvents`)
  - Delete events (requires `canDeleteEvents`)

- **Event Display**:
  - Upcoming events list
  - Calendar integration
  - Event details page
  - Attendee list
  - RSVP status

---

### 7. Media & Albums

#### Features
- **Media Upload**:
  - Image upload
  - Video upload
  - Document upload (planned)
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

### 8. Real-Time Messaging

#### Features
- **Message Types**:
  - Group messages (tribe-wide)
  - Direct messages (one-on-one)

- **Messaging Features**:
  - Real-time message delivery via Socket.io
  - Typing indicators
  - Message read receipts
  - Message history
  - Online/offline status

- **Messaging Permissions**:
  - Send messages (requires `canSendMessages`)
  - Permission checked per tribe

- **Technical Implementation**:
  - Socket.io server for real-time communication
  - User-specific rooms
  - Tribe-specific rooms
  - Authentication middleware for socket connections

---

### 9. Discovery & Browse

#### Features
- **Tribe Discovery**:
  - Browse public tribes
  - Search tribes
  - Filter by category
  - Featured tribes section
  - Trending tribes section
  - All tribes listing

- **Tribe Cards**:
  - Tribe name and description
  - Tribe avatar
  - Category badge
  - Member count
  - Privacy indicator
  - Join/Request access button

---

### 10. Activity Feed & Notifications

#### Features
- **Activity Feed**:
  - User activity across all tribes
  - Activity types: post, photo, event, member, comment, like
  - Activity previews
  - Timestamp information
  - Activity filtering

- **Notification System**:
  - Real-time notifications via Socket.io
  - Notification types:
    - Post likes
    - Comments
    - New members
    - Event creation
    - Photo uploads
    - Announcements
  - Read/unread status
  - Notification drawer
  - Mark all as read

---

### 11. User Dashboard

#### Features
- **Home Dashboard**:
  - Activity feed aggregation
  - Upcoming events across tribes
  - Recent messages
  - Metrics grid (tribes count, posts count, etc.)
  - Quick actions

- **Profile Dashboard**:
  - User profile information
  - Avatar management
  - Account settings
  - Privacy settings
  - Notification preferences
  - Security settings

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

- **Security Settings**:
  - Two-factor authentication (future)
  - Active sessions
  - Security history

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

*Note: In the MVP, tribes can start as either private or public. In future phases, public tribes will become a premium/paid feature with significant marketing value. Tribes will be able to earn public status through leveling up (meeting certain engagement criteria) or by paying to upgrade.*

1. **Step 1: Basic Info**
   - Enter tribe name
   - Enter description (explain the community's purpose and values)
   - Upload avatar (optional) - helps establish community identity
   
2. **Step 2: Privacy Settings**
   - Select privacy type (private or public)
   - **Private**: Invite-only, exclusive access (free, recommended for starting communities)
   - **Public**: Discoverable in browse/search (free in MVP, will be paid/premium in future)
   - Choose category (fraternity/church/adventure group/business/etc.)
   - Privacy can be changed later (subject to future monetization rules)
   
3. **Step 3: Location** (optional but recommended)
   - Enter location (helps with event organization and local connections)
   - Location helps facilitate real-world third space gatherings
   
4. **Step 4: Invite Members**
   - Enter email addresses of initial members
   - Assign roles (owner, admin, moderator, member)
   - Invitations sent via email
   - Members must accept invitation to join
   
5. **Tribe Created**
   - Tribe appears in creator's tribe list
   - Creator becomes owner (cannot be removed)
   - Default permissions assigned based on roles
   - Private tribe remains exclusive (can become public later)
   - Public tribe is discoverable (future: requires premium/paid status or leveling up)

### Permission Check Flow

1. User attempts action (e.g., create post)
2. System checks if user is member
3. System retrieves member record
4. System checks for permission override
5. If override exists and is false → deny
6. If override exists and is true → allow
7. If no override → check default role permissions
8. Action allowed or denied

---

## User Stories

### As a Fraternity/Sorority Leader

- **US-001**: As a fraternity president, I want to create a private Tribe for my chapter so that only initiated brothers can access it
- **US-002**: As a chapter officer, I want to invite new members by email so that I can onboard pledges and alumni
- **US-003**: As a rush chair, I want to organize rush events so that potential members can RSVP and attend
- **US-004**: As a historian, I want to create photo albums for formal events so that we can preserve chapter memories
- **US-005**: As an alumni coordinator, I want to keep alumni engaged in our private Tribe so they stay connected to the chapter

### As a Church/Religious Leader

- **US-006**: As a pastor, I want to create a private Tribe for my congregation so that members can connect beyond Sunday services
- **US-007**: As a youth director, I want to organize youth group events so that parents and students can RSVP
- **US-008**: As a volunteer coordinator, I want to post service opportunities so that members can sign up to help
- **US-009**: As a small group leader, I want to create exclusive Tribes for each small group so that we can coordinate study sessions and gatherings
- **US-010**: As a church administrator, I want to send announcements to all members so that important updates reach everyone

### As an Adventure Group Organizer

- **US-011**: As a hiking group leader, I want to create a private Tribe so that only experienced hikers can join and coordinate trips
- **US-012**: As a climbing club organizer, I want to organize outdoor excursions so that members can RSVP and share gear information
- **US-013**: As a trip coordinator, I want to share trip photos in organized albums so that participants can relive adventures
- **US-014**: As a safety officer, I want to restrict event creation to experienced members so that we maintain safety standards
- **US-015**: As a club member, I want to see upcoming trips and events so that I can plan my participation

### As a Small Business Owner (Restaurant/Bar/Club)

- **US-016**: As a restaurant owner, I want to create a VIP Tribe for my regular customers so that I can offer exclusive perks and events
- **US-017**: As a bar manager, I want to organize themed nights and special events so that our Tribe members can RSVP
- **US-018**: As a club owner, I want to share photos from events so that our community can see the energy and culture we create
- **US-019**: As a business owner, I want to start with a private Tribe and later make it public so that our community can grow organically
- **US-020**: As a community manager, I want to post menu updates and specials so that our Tribe members are the first to know

### As a Tribe Member

- **US-021**: As a fraternity brother, I want to create posts about chapter events so that all brothers stay informed
- **US-022**: As a church member, I want to RSVP to volunteer events so that coordinators know who's participating
- **US-023**: As an adventure enthusiast, I want to upload photos from our latest trip so that the group can see what we accomplished
- **US-024**: As a restaurant regular, I want to receive notifications about special events so that I don't miss exclusive opportunities
- **US-025**: As a community member, I want to send messages in our group chat so that we can coordinate in real-time

### As a Tribe Administrator

- **US-026**: As an admin, I want to assign roles to members so that I can delegate responsibilities appropriately
- **US-027**: As a moderator, I want to remove inappropriate posts so that we maintain our community standards
- **US-028**: As an admin, I want to customize permissions for specific members so that I can control access levels
- **US-029**: As a content moderator, I want to delete inappropriate comments so that discussions remain respectful
- **US-030**: As an organizer, I want to view member activity so that I can understand engagement levels

### As a Potential Member (Discovery)

- **US-031**: As someone interested in joining an adventure group, I want to browse public Tribes so that I can find communities that match my interests
- **US-032**: As a new community member, I want to search Tribes by category so that I can discover relevant communities
- **US-033**: As a prospective member, I want to see featured Tribes so that I can discover popular and well-established communities
- **US-034**: As a person looking for connection, I want to request to join a public Tribe so that I can become part of a community

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
- **Real-time**: Socket.io client

### Backend Stack

- **API**: Next.js API Routes
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth
- **Real-time Server**: Socket.io server (Node.js)
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

#### Media Tables

- `album`: Photo albums
- `media`: Media files (photos, videos, documents)

#### Event Tables

- `event`: Events
- `event_attendee`: RSVPs

#### Communication Tables

- `message`: Messages (group/direct)
- `message_read`: Read receipts

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

### Real-time Events (Socket.io)

#### Client → Server
- `message:send` - Send message
- `message:read` - Mark message as read
- `message:typing` - Typing indicator

#### Server → Client
- `message:new` - New message received
- `message:read:confirmed` - Read receipt confirmed
- `message:typing` - User typing
- `notification:new` - New notification
- `invitation:new` - New invitation
- `announcement:new` - New announcement

---

## Success Metrics

### Core Mission Metrics (Third Space Revival)

- **Real-World Event Organization**: Events created per tribe per month
- **Event Attendance Rate**: % of RSVPs that actually attend events (self-reported)
- **In-Person Meetup Frequency**: Average number of real-world gatherings per tribe per month
- **Private Tribe Stability**: % of private tribes that remain active after 6 months
- **Community Growth Pattern**: Private-to-public transition rate (% of private tribes that go public)
- **Member Retention in Exclusive Groups**: % of members who remain active in private tribes after 90 days

### User Engagement Metrics

- **Daily Active Users (DAU)**: Users actively engaging with their tribes
- **Monthly Active Users (MAU)**: Users who visit at least once per month
- **Tribe Creation Rate**: Number of new tribes created per week (by category)
- **Member Invitation Rate**: Average invitations sent per tribe
- **Invitation Acceptance Rate**: % of invitations accepted
- **Post Engagement**: Posts per tribe, comments per post, likes per post
- **Event Participation**: Events created per tribe, RSVP rate (going/maybe/not going)
- **Media Upload**: Photos uploaded per user per month, especially event photos

### Feature Adoption Metrics

- **Permission Customization Rate**: % of tribes using custom permissions (indicates active community management)
- **Album Creation Rate**: Albums created per tribe (shows memory preservation culture)
- **Messaging Usage**: Messages sent per tribe per day (indicates active communication)
- **Discovery Usage**: Tribes browsed per user, join rate from discovery (for public tribes)
- **Location Usage**: % of tribes with location set (enables local third space activities)

### Community Health Metrics

- **Tribe Category Distribution**: Distribution of tribes across categories (fraternity, church, adventure, business, etc.)
- **Average Tribe Size**: Members per tribe by category
- **Active Event Organizers**: % of tribes creating events monthly
- **Content Moderation Activity**: Posts/comments moderated per tribe (shows active community standards)

### Technical Metrics

- **API Response Time**: Average response time for API calls
- **Real-time Latency**: Average message delivery time
- **Uptime**: System availability percentage
- **Error Rate**: API error rate

### Business Metrics (Future)

- **Retention Rate**: % of users active after 30/90 days
- **Viral Coefficient**: Average invitations per user
- **Tribe Size Distribution**: Average members per tribe
- **Category-Specific Growth**: Growth rates by tribe category (fraternity vs. church vs. business, etc.)
- **Public Tribe Discovery**: % of public tribes that gain members through discovery

---

## Future Roadmap

### Phase 2: Enhanced Features

#### Advanced Permissions
- Permission templates
- Bulk permission assignment
- Permission inheritance

#### Enhanced Media
- Video playback in app
- Document preview
- Media compression
- Bulk upload

#### Event Enhancements
- Recurring events
- Event reminders
- Event check-in
- Event polls

#### Public Tribe Monetization System
- **Leveling System**: Tribes can earn public status by meeting engagement criteria
  - Member count milestones
  - Activity levels (posts, events, engagement)
  - Event frequency and attendance
  - Media sharing and album creation
  - Community health metrics
- **Paid Upgrade Path**: Direct payment option to upgrade to public status
- **Public Tribe Benefits**: Enhanced discoverability, growth potential, marketing value
- **Monetization Dashboard**: Track progress toward public status eligibility

### Phase 3: Campfire Chat Rooms

#### Multi-Modal Communication
- **Voice Channels**: Real-time voice chat rooms within tribes
- **Video Channels**: Video conferencing and video chat rooms
- **Text Channels**: Multiple text chat rooms (similar to Discord)
- **Channel Management**: Create custom channels for different topics, events, or groups
- **Channel Permissions**: Control who can access which channels
- **Screen Sharing**: Share screens during video/voice calls
- **Recording**: Optional recording capabilities for important sessions

#### Features
- Persistent chat history
- Channel notifications and mentions
- Voice/video quality controls
- Moderator controls for channels
- Integration with tribe events (auto-create channels for events)

### Phase 4: Multiple Timelines & Filtered Views

#### Timeline Customization
- **Location-Based Timelines**: Filter posts by geographic location
  - Example: "Fraternity Members in Seattle" timeline
  - Example: "Adventure Group - Pacific Northwest" timeline
- **Role-Based Timelines**: View content filtered by member roles
  - Example: "Admin & Moderator Updates" timeline
  - Example: "Alumni Timeline" for fraternities
- **Member Segment Timelines**: Custom filtered views
  - Example: "All Members" vs. "Active Members Only"
  - Example: "Local Members" vs. "All Locations"
- **Public Timeline**: Public-facing content view (for public tribes)
- **Timeline Management**: Create, save, and share custom timeline views
- **Timeline Permissions**: Control who can see which timelines

### Phase 5: Custom Tags & Member Identification

#### Tribe-Specific Tags
- **Custom Tag System**: Tribes can create custom tags for their members
- **Tag Categories**: Organize tags by type (location, role, interests, achievements, etc.)
- **Tag Display**: Tags visible in member profiles and posts
- **External Identification**: Tags can be used for identification outside the app
  - Example: Physical badges or merchandise with tag identifiers
  - Example: Event check-in using tag recognition
  - Example: Networking and member recognition at in-person gatherings
- **Tag Permissions**: Control who can assign tags and who can see them
- **Tag Management**: Admins can create, edit, and remove tags
- **Member Tagging**: Assign multiple tags to members based on context

#### Use Cases
- Fraternity: Chapter location, year of initiation, leadership roles
- Church: Ministry involvement, small group membership, volunteer roles
- Adventure Group: Skill levels, preferred activities, certifications
- Business: VIP status, loyalty tier, special interests

### Phase 6: Business-Customer Hub

#### Business Tools for Customer Connection
- **Customer Tribes**: Businesses create exclusive communities for customers
  - VIP/loyalty programs
  - Regular customers and community building
  - Exclusive offers and events
- **Business Dashboard**: Analytics and engagement tools for businesses
- **Customer Segmentation**: Organize customers into different groups/tribes
- **Promotional Tools**: Announce special events, menu changes, promotions
- **Feedback & Reviews**: Gather customer feedback within the tribe
- **Event Marketing**: Promote business events to tribe members
- **Loyalty Integration**: Connect with loyalty programs and rewards
- **Multi-Location Support**: Businesses with multiple locations can manage location-specific tribes

#### Features for Small & Large Businesses
- **Small Businesses**: Simple tools for restaurants, bars, clubs to build regular customer communities
- **Large Businesses**: Enterprise features for larger organizations
- **Branded Experience**: Custom branding options for business tribes
- **Integration APIs**: Connect with POS systems, reservation systems, etc.

### Phase 7: Mobile Application

- Native iOS app
- Native Android app
- Push notifications
- Mobile-optimized UI
- Mobile-first Campfire experience
- Mobile event check-in

### Phase 8: Advanced Features

#### Analytics Dashboard
- Tribe analytics
- Engagement metrics
- Member activity reports
- Business customer insights
- Timeline performance metrics

#### Advanced Messaging
- File attachments in messages
- Message reactions
- Message search
- Group chat creation
- Integration with Campfire channels

#### Integration
- Calendar integration (Google Calendar, iCal)
- Social media integration
- Email notifications for events
- Payment processing integration (for businesses)
- POS system integration (for businesses)

### Phase 9: Enterprise Features

#### Platform Admin Features
- Platform-wide moderation
- Analytics dashboard
- User management
- Tribe management tools
- Public tribe approval system
- Monetization management

#### Premium Business Features
- Advanced analytics and reporting
- White-label options
- Custom integrations
- Priority support
- Dedicated account management

---

## Appendix

### Glossary

- **Tribe**: An exclusive community or group created by users. Tribes serve as digital hubs for maintaining connections and organizing real-world gatherings. They can start as private (invite-only) or public (discoverable), with public status becoming a premium feature in future phases.
- **Third Space**: A physical or virtual place outside of home (first space) and work (second space) where people naturally gather, socialize, and build community. Examples include coffee shops, community centers, local bars, fraternity houses, and churches. Tribe aims to help revitalize third spaces in the modern era.
- **Member**: A user who has joined a tribe through invitation and acceptance
- **Role**: A predefined set of permissions (owner, admin, moderator, member) that determines a member's capabilities within a tribe
- **Permission**: A specific capability or action a member can perform. Permissions can be customized per member to maintain community standards
- **Invitation**: An email-based request to join a tribe. Invitations can include role assignment and expire after 7 days
- **Activity**: An action performed by a user (post, comment, like, event creation, etc.) that appears in the activity feed
- **Notification**: A real-time alert about tribe activity, delivered via Socket.io for immediate visibility
- **Campfire**: (Future Feature) Multi-modal chat rooms within tribes supporting voice, video, and text communication. Similar to Discord channels, allowing tribes to create custom communication channels for different topics, events, or groups.
- **Tags**: (Future Feature) Custom identifiers that tribes can create for their members. Tags help organize members by location, role, interests, achievements, or other context-specific criteria. Can be used for identification both within and outside the app.
- **Timeline**: A filtered view of posts and content within a tribe. Future features will support multiple timelines filtered by location, role, member segments, or other criteria.

### User Roles Reference

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| Owner | Tribe creator | All permissions, cannot be removed |
| Admin | High-level manager | Most management permissions |
| Moderator | Content moderator | Moderation permissions only |
| Member | Standard user | Basic participation permissions |

### Privacy Types

- **Private**: Invite-only, not visible in discovery. Free to create and maintain. Recommended for exclusive communities starting out. Can transition to public when ready.

- **Public**: Visible in discovery, anyone can request to join. In MVP, public tribes are free to create. **Future**: Public tribes will become a premium/paid feature with significant marketing value. Tribes will be able to earn public status through:
  - **Leveling Up**: Meeting certain engagement criteria (member count, activity levels, event frequency, etc.)
  - **Paid Upgrade**: Direct payment to upgrade to public status
  - Public tribes benefit from increased discoverability and growth potential

### Tribe Categories

The platform supports various categories to help organize and discover communities:

- **Fraternity/Sorority**: Greek organizations and chapters
- **Religious/Church**: Churches, religious organizations, faith communities
- **Adventure/Outdoor**: Hiking, climbing, outdoor recreation groups
- **Business/Establishment**: Restaurants, bars, clubs, local businesses building community
- **Social Club**: Exclusive social organizations and clubs
- **Other**: Additional community types as needed

---

**Document Status**: Active  
**Next Review Date**: TBD  
**Owner**: Product Team  
**Stakeholders**: Engineering, Design, Product Management

