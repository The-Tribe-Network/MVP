# Tribe Settings - Product Requirements Document
## Comprehensive Settings & Permissions System

**Version:** 1.0
**Last Updated:** December 22, 2024
**Status:** Planning
**Related:** MVP_PRD_2025.md

---

## Table of Contents

1. [Overview](#overview)
2. [Settings Tab Structure](#settings-tab-structure)
3. [Tab Specifications](#tab-specifications)
4. [Permission System Architecture](#permission-system-architecture)
5. [Database Schema](#database-schema)
6. [Route Structure](#route-structure)
7. [Implementation Checklist](#implementation-checklist)

---

## Overview

Tribe Settings provides a comprehensive interface for owners, admins, and authorized members to customize and manage their tribe experience. The settings system is built around the **three pillars** of a tribe (Timeline, Media, Events) while providing granular control over members, roles, and permissions.

### Design Principles

1. **Role-Based Access**: Different settings tabs visible based on user's role and permissions
2. **Layered Permissions**: Feature settings → Role defaults → Individual overrides
3. **Pillar-Centric**: Dedicated configuration for Timeline, Media, and Events
4. **Audit Trail**: Track all significant changes for accountability

---

## Settings Tab Structure

### Tab Overview

| Tab | Who Can Access | Purpose |
|-----|----------------|---------|
| **General** | Owner, Admins with `canEditTribeSettings` | Basic tribe configuration |
| **Members** | All members (view), Admins+ (manage) | Member list & management |
| **Roles** | Owner, Admins with `canManagePermissions` | Role-based default permissions |
| **Permissions** | Owner, Admins with `canManagePermissions` | Per-member permission overrides |
| **Timeline** | Owner, Admins with `canEditTribeSettings` | Posts, comments, engagement settings |
| **Media** | Owner, Admins with `canEditTribeSettings` | Photos, albums, upload settings |
| **Events** | Owner, Admins with `canEditTribeSettings` | Events, RSVPs, polls settings |
| **Invitations** | Users with `canInviteMembers` | Invitation management |
| **Moderation** | Users with moderation permissions | Restricted users & mod settings |
| **Activity** | Owner, Admins | Audit log & history |

### Visual Tab Grouping

```
┌─────────────────────────────────────────────────────────┐
│ Tribe Settings                                          │
├─────────────────────────────────────────────────────────┤
│ GENERAL                                                 │
│  └─ General          ← Tribe info, danger zone          │
│                                                         │
│ MEMBERS                                                 │
│  ├─ Members          ← Member list & management         │
│  ├─ Roles            ← Role-based permissions           │
│  └─ Permissions      ← Individual overrides             │
│                                                         │
│ FEATURES (Three Pillars)                                │
│  ├─ Timeline         ← Posts, comments, engagement      │
│  ├─ Media            ← Photos, albums, uploads          │
│  └─ Events           ← Events, RSVPs, polls             │
│                                                         │
│ MANAGEMENT                                              │
│  ├─ Invitations      ← Invite management                │
│  ├─ Moderation       ← Restricted users, mod tools      │
│  └─ Activity         ← Audit log                        │
└─────────────────────────────────────────────────────────┘
```

---

## Tab Specifications

### 1. General Settings

**Access:** Owner, Admins with `canEditTribeSettings`

**Purpose:** Basic tribe configuration and danger zone operations.

```
┌─────────────────────────────────────────────────────────┐
│ Tribe Profile                                           │
│ ├─ Name                                                 │
│ ├─ Description                                          │
│ ├─ Avatar (upload)                                      │
│ ├─ Banner image (future)                                │
│ ├─ Location                                             │
│ └─ Category                                             │
├─────────────────────────────────────────────────────────┤
│ Privacy & Visibility                                    │
│ ├─ Privacy type (private/public - future)               │
│ └─ Discovery settings (future)                          │
├─────────────────────────────────────────────────────────┤
│ Features (toggles)                                      │
│ ├─ Enable Events                                        │
│ ├─ Enable Media/Albums                                  │
│ └─ Enable Polls                                         │
├─────────────────────────────────────────────────────────┤
│ ⚠️ Danger Zone (Owner only)                              │
│ ├─ Transfer Ownership                                   │
│ └─ Delete Tribe                                         │
└─────────────────────────────────────────────────────────┘
```

**Fields:**
- `name` - Tribe display name (required)
- `description` - Tribe description (optional)
- `avatar` - Tribe avatar image
- `location` - Geographic location (optional)
- `category` - social, gaming, family, work, hobbies, other

**Danger Zone Actions:**
- **Transfer Ownership**: Owner can transfer to another admin (requires confirmation)
- **Delete Tribe**: Permanently deletes tribe and all content (requires typed confirmation)

---

### 2. Members

**Access:** All members can view, Admins+ can manage

**Purpose:** View, search, and manage tribe members.

```
┌─────────────────────────────────────────────────────────┐
│ [Search...] [Filter by Role ▾] [Sort ▾]                 │
├─────────────────────────────────────────────────────────┤
│ Member List                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 John Smith          Admin    Joined Dec 2024    │ │
│ │    @johnsmith          🔧 Custom permissions        │ │
│ │                        [Change Role] [Edit] [Remove]│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 👤 Jane Doe            Member   Joined Dec 2024    │ │
│ │    @janedoe            ⚠️ Restricted (reason)       │ │
│ │                        [Change Role] [Edit] [Remove]│ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Bulk Actions: [Select All] [Change Role] [Remove]       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Search by name or username
- Filter by role (owner, admin, moderator, member)
- Sort by join date, name, role
- Visual indicators:
  - 🔧 Custom permissions applied
  - ⚠️ Restricted/limited permissions
- Quick actions per member:
  - View profile
  - Change role (requires `canChangeMemberRoles`)
  - Edit permissions (requires `canManagePermissions`)
  - Remove from tribe (requires `canRemoveMembers`)
- Bulk actions for selected members

**Member Card Information:**
- Avatar
- Display name
- Username
- Role badge
- Join date
- Permission status indicator
- Action buttons (based on viewer's permissions)

---

### 3. Roles (Role-Based Permissions)

**Access:** Owner, Admins with `canManagePermissions`

**Purpose:** Configure default permissions for each role.

```
┌─────────────────────────────────────────────────────────┐
│ Role Permission Matrix                                  │
├──────────────────┬────────┬───────┬────────┬──────────┤
│ Permission       │ Owner  │ Admin │ Mod    │ Member   │
├──────────────────┼────────┼───────┼────────┼──────────┤
│ POSTING                                                │
│ ├─ Create posts  │   ✓    │   ✓   │   ✓    │    ✓     │
│ ├─ Comment       │   ✓    │   ✓   │   ✓    │    ✓     │
│ ├─ Edit own      │   ✓    │   ✓   │   ✓    │    ✓     │
│ └─ Delete own    │   ✓    │   ✓   │   ✓    │    ✓     │
├──────────────────┼────────┼───────┼────────┼──────────┤
│ MEDIA                                                  │
│ ├─ Upload media  │   ✓    │   ✓   │   ✓    │    ✓     │
│ ├─ Create albums │   ✓    │   ✓   │   ✓    │    ○     │
│ └─ Delete own    │   ✓    │   ✓   │   ✓    │    ✓     │
├──────────────────┼────────┼───────┼────────┼──────────┤
│ EVENTS                                                 │
│ ├─ Create events │   ✓    │   ✓   │   ✓    │    ○     │
│ ├─ Edit events   │   ✓    │   ✓   │   ○    │    ○     │
│ └─ Delete events │   ✓    │   ✓   │   ○    │    ○     │
├──────────────────┼────────┼───────┼────────┼──────────┤
│ MEMBERS                                                │
│ ├─ Invite        │   ✓    │   ✓   │   ✓    │    ○     │
│ ├─ Remove        │   ✓    │   ✓   │   ○    │    ✗     │
│ ├─ Change roles  │   ✓    │   ✓   │   ✗    │    ✗     │
│ └─ Manage perms  │   ✓    │   ✓   │   ✗    │    ✗     │
├──────────────────┼────────┼───────┼────────┼──────────┤
│ MODERATION                                             │
│ ├─ Delete any    │   ✓    │   ✓   │   ✓    │    ✗     │
│ └─ Moderate      │   ✓    │   ✓   │   ✓    │    ✗     │
├──────────────────┼────────┼───────┼────────┼──────────┤
│ TRIBE SETTINGS                                         │
│ ├─ Edit settings │   ✓    │   ✓   │   ✗    │    ✗     │
│ ├─ Delete tribe  │   ✓    │   ✗   │   ✗    │    ✗     │
│ └─ Transfer      │   ✓    │   ✗   │   ✗    │    ✗     │
└──────────────────┴────────┴───────┴────────┴──────────┘

Legend: ✓ = enabled (locked), ✗ = disabled (locked), ○ = configurable
```

**Key Concepts:**
- **Owner permissions**: Immutable, always all permissions
- **Locked permissions (✓/✗)**: Cannot be changed for security
- **Configurable permissions (○)**: Can be toggled per role
- Changes apply to all members with that role (unless individually overridden)

**Permission Categories:**

| Category | Permissions |
|----------|-------------|
| **Posting** | `canPost`, `canComment`, `canEditOwnPosts`, `canDeleteOwnPosts` |
| **Media** | `canUploadMedia`, `canCreateAlbums`, `canDeleteOwnMedia` |
| **Events** | `canCreateEvents`, `canEditEvents`, `canDeleteEvents` |
| **Members** | `canInviteMembers`, `canRemoveMembers`, `canChangeMemberRoles`, `canManagePermissions` |
| **Moderation** | `canModeratePosts`, `canModerateComments`, `canDeleteAnyPost`, `canDeleteAnyComment`, `canDeleteAnyMedia` |
| **Tribe** | `canEditTribeSettings`, `canDeleteTribe`, `canTransferOwnership` |
| **Messaging** | `canSendMessages` |

---

### 4. Permissions (Individual Overrides)

**Access:** Owner, Admins with `canManagePermissions`

**Purpose:** Apply custom permissions to specific members, overriding role defaults.

```
┌─────────────────────────────────────────────────────────┐
│ Members with Custom Permissions (3)                     │
├─────────────────────────────────────────────────────────┤
│ 👤 Jane Doe - Member                                   │
│    Restrictions: Cannot create events, Cannot post      │
│    Reason: "Probation period"                          │
│    Set by: @admin on Dec 15                            │
│    [Edit Permissions] [Reset to Default]               │
├─────────────────────────────────────────────────────────┤
│ 👤 Bob Smith - Member                                  │
│    Elevated: Can create events, Can invite members      │
│    Set by: @owner on Dec 10                            │
│    [Edit Permissions] [Reset to Default]               │
└─────────────────────────────────────────────────────────┘

[+ Add Permission Override for Member]
```

**Edit Permissions Modal:**

```
┌─────────────────────────────────────────────────────────┐
│ Edit Permissions: Jane Doe (@janedoe)                   │
│ Role: Member | Joined: Dec 2024                         │
├─────────────────────────────────────────────────────────┤
│ Override permissions (leave unchecked for role default) │
│                                                         │
│ POSTING                                                 │
│ □ Can post                    [✓ Allow] [✗ Deny]       │
│ □ Can comment                 [✓ Allow] [✗ Deny]       │
│                                                         │
│ EVENTS                                                  │
│ ☑ Can create events          [✗ Deny]                  │
│                                                         │
│ MEDIA                                                   │
│ □ Can upload media            [✓ Allow] [✗ Deny]       │
│ ...                                                     │
├─────────────────────────────────────────────────────────┤
│ Restriction Reason (optional):                          │
│ [Probation period - under review          ]            │
├─────────────────────────────────────────────────────────┤
│ [Cancel]                              [Save Changes]    │
└─────────────────────────────────────────────────────────┘
```

**Use Cases:**
- **Restrict a member**: Probation, temporary restriction, limited access
- **Elevate a member**: Give special privileges without changing role
- **View-only mode**: Restrict all posting for specific members (e.g., pledges, alumni)

---

### 5. Timeline Settings

**Access:** Owner, Admins with `canEditTribeSettings`

**Purpose:** Configure how posts, comments, and engagement work.

```
┌─────────────────────────────────────────────────────────┐
│ 📝 TIMELINE SETTINGS                                    │
├─────────────────────────────────────────────────────────┤
│ Posting                                                 │
│ ├─ Who can create posts                                │
│ │   ○ All members                                      │
│ │   ○ Moderators and above                             │
│ │   ○ Admins and above                                 │
│ │   ○ Owner only (announcements mode)                  │
│ │                                                       │
│ ├─ Who can comment                                     │
│ │   ○ All members                                      │
│ │   ○ Moderators and above                             │
│ │   ○ Admins and above                                 │
│ │   ○ No one (comments disabled)                       │
│ │                                                       │
│ ├─ Post editing                      [Toggle]          │
│ │   Allow members to edit their own posts              │
│ │                                                       │
│ └─ Post deletion                     [Toggle]          │
│     Allow members to delete their own posts            │
├─────────────────────────────────────────────────────────┤
│ Content                                                 │
│ ├─ Allow media attachments           [Toggle]          │
│ ├─ Max images per post               [Dropdown: 1-10]  │
│ ├─ Allow links in posts              [Toggle]          │
│ └─ Link preview generation           [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Engagement                                              │
│ ├─ Enable likes                      [Toggle]          │
│ ├─ Enable comment likes              [Toggle]          │
│ └─ Enable nested replies             [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Feed Display                                            │
│ ├─ Default sort order                                  │
│ │   ○ Newest first (chronological)                     │
│ │   ○ Most engaging (likes + comments)                 │
│ └─ Pin posts                         [Toggle]          │
└─────────────────────────────────────────────────────────┘
```

---

### 6. Media Settings

**Access:** Owner, Admins with `canEditTribeSettings`

**Purpose:** Configure photos, albums, and upload behavior.

```
┌─────────────────────────────────────────────────────────┐
│ 📷 MEDIA SETTINGS                                       │
├─────────────────────────────────────────────────────────┤
│ Uploads                                                 │
│ ├─ Who can upload media                                │
│ │   ○ All members                                      │
│ │   ○ Moderators and above                             │
│ │   ○ Admins and above                                 │
│ │                                                       │
│ ├─ Max file size                     [Dropdown]        │
│ │   5MB / 10MB / 25MB / 50MB                           │
│ │                                                       │
│ ├─ Allowed file types                                  │
│ │   ☑ Images (jpg, png, gif, webp)                    │
│ │   ☑ Videos (mp4, mov) [future]                      │
│ │   □ Documents (pdf) [future]                        │
│ │                                                       │
│ └─ Auto-add post media to gallery    [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Albums                                                  │
│ ├─ Who can create albums                               │
│ │   ○ All members                                      │
│ │   ○ Moderators and above                             │
│ │   ○ Admins and above                                 │
│ │                                                       │
│ ├─ Default album privacy             [Dropdown]        │
│ ├─ Allow collaborative albums        [Toggle]          │
│ └─ Auto-create event albums          [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Gallery Display                                         │
│ ├─ Default view                      [Grid/Masonry]    │
│ ├─ Show uploader info                [Toggle]          │
│ └─ Enable photo likes                [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Moderation                                              │
│ ├─ Review uploads before visible     [Toggle]          │
│ └─ Who can delete any media          [Dropdown]        │
└─────────────────────────────────────────────────────────┘
```

---

### 7. Events Settings

**Access:** Owner, Admins with `canEditTribeSettings`

**Purpose:** Configure events, RSVPs, polls, and reminders.

```
┌─────────────────────────────────────────────────────────┐
│ 📅 EVENTS SETTINGS                                      │
├─────────────────────────────────────────────────────────┤
│ Event Creation                                          │
│ ├─ Who can create events             [Dropdown]        │
│ ├─ Who can edit events               [Dropdown]        │
│ ├─ Require end date/time             [Toggle]          │
│ └─ Require location                  [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ RSVPs                                                   │
│ ├─ Enable RSVPs                      [Toggle]          │
│ ├─ RSVP options available                              │
│ │   ☑ Going                                           │
│ │   ☑ Interested / Maybe                              │
│ │   ☑ Not Going                                       │
│ ├─ Show attendee list                [Dropdown]        │
│ │   All members / Count only / Hidden                  │
│ ├─ RSVP deadline                     [Toggle]          │
│ ├─ Capacity limit                    [Toggle]          │
│ └─ Waitlist when full                [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Polls                                                   │
│ ├─ Enable event polls                [Toggle]          │
│ ├─ Who can create polls              [Dropdown]        │
│ ├─ Allow anonymous polls             [Toggle]          │
│ └─ Poll results visibility           [Dropdown]        │
├─────────────────────────────────────────────────────────┤
│ Reminders & Notifications                               │
│ ├─ Send event reminders              [Toggle]          │
│ ├─ Reminder timing                   [Multi-select]    │
│ └─ Notify on RSVP changes            [Toggle]          │
├─────────────────────────────────────────────────────────┤
│ Calendar & Media                                        │
│ ├─ Default calendar view             [List/Grid]       │
│ ├─ Enable calendar export            [Toggle]          │
│ ├─ Auto-create album for events      [Toggle]          │
│ └─ Who can upload to event album     [Dropdown]        │
└─────────────────────────────────────────────────────────┘
```

---

### 8. Invitations

**Access:** Users with `canInviteMembers`

**Purpose:** Manage pending and sent invitations.

```
┌─────────────────────────────────────────────────────────┐
│ [+ Invite Members]                                      │
├─────────────────────────────────────────────────────────┤
│ Pending Invitations (5)                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 john@example.com      Member   Sent Dec 20      │ │
│ │    Expires: Dec 27       Invited by @owner         │ │
│ │                          [Resend] [Cancel]          │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Recent History                                          │
│ ├─ jane@example.com - Accepted Dec 18                  │
│ ├─ bob@example.com - Expired Dec 15                    │
│ └─ alice@example.com - Rejected Dec 12                 │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Send new invitations (single or bulk)
- View pending invitations
- Resend expired/pending invitations
- Cancel pending invitations
- View invitation history (accepted, rejected, expired)
- Invitation link generation (future)

---

### 9. Moderation

**Access:** Users with moderation permissions

**Purpose:** View restricted members and moderation settings.

```
┌─────────────────────────────────────────────────────────┐
│ Restricted Members (2)                                  │
├─────────────────────────────────────────────────────────┤
│ 👤 Jane Doe - Member                                   │
│    Cannot post, Cannot comment                          │
│    Reason: "Inappropriate content"                      │
│    Restricted by: @moderator on Dec 15                 │
│    [Lift Restrictions] [View History]                  │
├─────────────────────────────────────────────────────────┤
│ Moderation Settings                                     │
│ ├─ Auto-hold posts with links        [Toggle]          │
│ ├─ Review first post by new members  [Toggle]          │
│ └─ Notification for flagged content  [Toggle]          │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- View all members with restrictions
- Lift restrictions
- View moderation history per member
- Configure auto-moderation rules (future)
- Reported content queue (future)

---

### 10. Activity Log

**Access:** Owner, Admins

**Purpose:** Audit trail of significant actions in the tribe.

```
┌─────────────────────────────────────────────────────────┐
│ [Filter by Type ▾] [Date Range ▾]                       │
├─────────────────────────────────────────────────────────┤
│ Recent Activity                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔐 @owner changed @jane's role to Admin             │ │
│ │    Dec 22, 2024 at 3:45 PM                         │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ⚠️ @moderator restricted @bob's posting             │ │
│ │    Reason: "Spam content"                           │ │
│ │    Dec 22, 2024 at 2:30 PM                         │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 👤 @newuser joined the tribe                        │ │
│ │    Invited by @admin                               │ │
│ │    Dec 22, 2024 at 1:15 PM                         │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ⚙️ @admin updated Timeline settings                  │ │
│ │    Changed: Enable nested replies → OFF             │ │
│ │    Dec 22, 2024 at 11:00 AM                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Tracked Actions:**
- Member joins/leaves
- Role changes
- Permission changes
- Settings changes
- Moderation actions (restrictions, content removal)
- Invitation actions
- Ownership transfer

---

## Permission System Architecture

### Three-Layer Permission Model

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Feature Settings (Tribe-wide)                  │
│ "Is this feature enabled for the entire tribe?"         │
│ Example: Events disabled entirely                       │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Role Permissions (Role defaults)               │
│ "Who can do this by default based on their role?"       │
│ Example: Only mods+ can create events                   │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Member Overrides (Individual)                  │
│ "Does this specific user have different access?"        │
│ Example: Jane (member) CAN create events                │
└─────────────────────────────────────────────────────────┘
```

### Permission Check Flow

```
checkPermission(userId, tribeId, 'canCreateEvents'):

1. Is feature enabled? (tribeSettings.eventsEnabled)
   └─ No → Feature unavailable for everyone
   └─ Yes → Continue ↓

2. Check individual override (tribeMemberPermission.canCreateEvents)
   └─ If explicitly TRUE → Allowed
   └─ If explicitly FALSE → Denied
   └─ If NULL → Continue ↓

3. Check tribe's role-based default (tribeRolePermission)
   └─ If defined for user's role → Use that value
   └─ If NULL → Continue ↓

4. Fall back to system default for that role
   └─ Return hardcoded default
```

### Default Role Permissions (System Defaults)

| Permission | Owner | Admin | Mod | Member |
|------------|-------|-------|-----|--------|
| `canPost` | ✓ | ✓ | ✓ | ✓ |
| `canComment` | ✓ | ✓ | ✓ | ✓ |
| `canEditOwnPosts` | ✓ | ✓ | ✓ | ✓ |
| `canDeleteOwnPosts` | ✓ | ✓ | ✓ | ✓ |
| `canUploadMedia` | ✓ | ✓ | ✓ | ✓ |
| `canCreateAlbums` | ✓ | ✓ | ✓ | ✗ |
| `canDeleteOwnMedia` | ✓ | ✓ | ✓ | ✓ |
| `canCreateEvents` | ✓ | ✓ | ✓ | ✗ |
| `canEditEvents` | ✓ | ✓ | ✗ | ✗ |
| `canDeleteEvents` | ✓ | ✓ | ✗ | ✗ |
| `canInviteMembers` | ✓ | ✓ | ✓ | ✗ |
| `canRemoveMembers` | ✓ | ✓ | ✗ | ✗ |
| `canChangeMemberRoles` | ✓ | ✓ | ✗ | ✗ |
| `canManagePermissions` | ✓ | ✓ | ✗ | ✗ |
| `canModeratePosts` | ✓ | ✓ | ✓ | ✗ |
| `canModerateComments` | ✓ | ✓ | ✓ | ✗ |
| `canDeleteAnyPost` | ✓ | ✓ | ✓ | ✗ |
| `canDeleteAnyComment` | ✓ | ✓ | ✓ | ✗ |
| `canDeleteAnyMedia` | ✓ | ✓ | ✗ | ✗ |
| `canEditTribeSettings` | ✓ | ✓ | ✗ | ✗ |
| `canDeleteTribe` | ✓ | ✗ | ✗ | ✗ |
| `canTransferOwnership` | ✓ | ✗ | ✗ | ✗ |
| `canSendMessages` | ✓ | ✓ | ✓ | ✓ |

---

## Database Schema

### New Tables Required

#### 1. Tribe Role Permissions (Role-based defaults per tribe)

```typescript
export const tribeRolePermission = pgTable("tribe_role_permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  role: tribeRole("role").notNull(),
  
  // Posting permissions
  canPost: boolean("can_post"),
  canComment: boolean("can_comment"),
  canEditOwnPosts: boolean("can_edit_own_posts"),
  canDeleteOwnPosts: boolean("can_delete_own_posts"),
  
  // Media permissions
  canUploadMedia: boolean("can_upload_media"),
  canCreateAlbums: boolean("can_create_albums"),
  canDeleteOwnMedia: boolean("can_delete_own_media"),
  
  // Event permissions
  canCreateEvents: boolean("can_create_events"),
  canEditEvents: boolean("can_edit_events"),
  canDeleteEvents: boolean("can_delete_events"),
  
  // Member management
  canInviteMembers: boolean("can_invite_members"),
  canRemoveMembers: boolean("can_remove_members"),
  canChangeMemberRoles: boolean("can_change_member_roles"),
  canManagePermissions: boolean("can_manage_permissions"),
  
  // Moderation
  canModeratePosts: boolean("can_moderate_posts"),
  canModerateComments: boolean("can_moderate_comments"),
  canDeleteAnyPost: boolean("can_delete_any_post"),
  canDeleteAnyComment: boolean("can_delete_any_comment"),
  canDeleteAnyMedia: boolean("can_delete_any_media"),
  
  // Tribe management
  canEditTribeSettings: boolean("can_edit_tribe_settings"),
  
  // Messaging
  canSendMessages: boolean("can_send_messages"),
  
  // Metadata
  updatedBy: uuid("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueTribeRole: unique().on(table.tribeId, table.role),
}));
```

#### 2. Tribe Settings (Feature configuration)

```typescript
export const tribeSettings = pgTable("tribe_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .unique()
    .references(() => tribe.id, { onDelete: "cascade" }),

  // === FEATURE TOGGLES ===
  eventsEnabled: boolean("events_enabled").default(true),
  albumsEnabled: boolean("albums_enabled").default(true),
  pollsEnabled: boolean("polls_enabled").default(true),

  // === TIMELINE SETTINGS ===
  postingPermissionLevel: text("posting_permission_level").default("all_members"),
  commentingPermissionLevel: text("commenting_permission_level").default("all_members"),
  allowPostEditing: boolean("allow_post_editing").default(true),
  allowPostDeletion: boolean("allow_post_deletion").default(true),
  allowMediaInPosts: boolean("allow_media_in_posts").default(true),
  maxImagesPerPost: integer("max_images_per_post").default(10),
  allowLinksInPosts: boolean("allow_links_in_posts").default(true),
  enableLinkPreviews: boolean("enable_link_previews").default(true),
  enablePostLikes: boolean("enable_post_likes").default(true),
  enableCommentLikes: boolean("enable_comment_likes").default(true),
  enableNestedReplies: boolean("enable_nested_replies").default(true),
  enablePinnedPosts: boolean("enable_pinned_posts").default(true),
  defaultFeedSort: text("default_feed_sort").default("newest"),

  // === MEDIA SETTINGS ===
  mediaUploadPermissionLevel: text("media_upload_permission_level").default("all_members"),
  maxMediaFileSize: integer("max_media_file_size").default(10),
  autoAddPostMediaToGallery: boolean("auto_add_post_media_to_gallery").default(true),
  albumCreationPermissionLevel: text("album_creation_permission_level").default("all_members"),
  defaultAlbumPrivacy: albumPrivacy("default_album_privacy").default("public"),
  allowCollaborativeAlbums: boolean("allow_collaborative_albums").default(true),
  autoCreateEventAlbums: boolean("auto_create_event_albums").default(false),
  enableMediaLikes: boolean("enable_media_likes").default(true),
  requireMediaApproval: boolean("require_media_approval").default(false),

  // === EVENTS SETTINGS ===
  eventCreationPermissionLevel: text("event_creation_permission_level").default("moderators"),
  eventEditPermissionLevel: text("event_edit_permission_level").default("creator_and_admins"),
  requireEventEndDate: boolean("require_event_end_date").default(false),
  requireEventLocation: boolean("require_event_location").default(false),
  enableRsvps: boolean("enable_rsvps").default(true),
  showAttendeeList: text("show_attendee_list").default("all_members"),
  enableRsvpDeadline: boolean("enable_rsvp_deadline").default(true),
  enableCapacityLimit: boolean("enable_capacity_limit").default(true),
  enableWaitlist: boolean("enable_waitlist").default(true),
  enableEventPolls: boolean("enable_event_polls").default(true),
  pollCreationPermissionLevel: text("poll_creation_permission_level").default("event_creator"),
  allowAnonymousPolls: boolean("allow_anonymous_polls").default(true),
  pollResultsVisibility: text("poll_results_visibility").default("after_voting"),
  enableEventReminders: boolean("enable_event_reminders").default(true),
  reminderTimings: text("reminder_timings").default("1d,1h"),
  notifyOnRsvpChanges: boolean("notify_on_rsvp_changes").default(true),
  enableCalendarExport: boolean("enable_calendar_export").default(true),

  // === MODERATION SETTINGS ===
  autoHoldPostsWithLinks: boolean("auto_hold_posts_with_links").default(false),
  reviewFirstPost: boolean("review_first_post").default(false),

  // Metadata
  updatedBy: uuid("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
```

#### 3. Tribe Activity Log (Audit trail)

```typescript
export const tribeActivityLog = pgTable("tribe_activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => user.id),
  targetUserId: uuid("target_user_id")
    .references(() => user.id),
  
  action: text("action").notNull(),
  // Actions: 'member_joined', 'member_left', 'member_removed', 'role_changed',
  //          'permission_changed', 'settings_changed', 'restriction_added',
  //          'restriction_removed', 'invitation_sent', 'invitation_cancelled',
  //          'ownership_transferred'
  
  details: text("details"), // JSON string with before/after values
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Existing Tables (Already Implemented)

- `tribe` - Core tribe data
- `tribeMember` - Member associations with roles
- `tribeMemberPermission` - Individual permission overrides
- `tribeMemberPreference` - Per-member preferences
- `tribeInvitation` - Pending invitations

---

## Route Structure

### Option A: Nested Routes (Recommended)

```
app/(protected)/tribe/[tribe_id]/
├── settings/
│   ├── page.tsx              # Redirects to /settings/general
│   ├── layout.tsx            # Settings shell with tab navigation
│   ├── general/
│   │   └── page.tsx
│   ├── members/
│   │   └── page.tsx
│   ├── roles/
│   │   └── page.tsx
│   ├── permissions/
│   │   └── page.tsx
│   ├── timeline/
│   │   └── page.tsx
│   ├── media/
│   │   └── page.tsx
│   ├── events/
│   │   └── page.tsx
│   ├── invitations/
│   │   └── page.tsx
│   ├── moderation/
│   │   └── page.tsx
│   └── activity/
│       └── page.tsx
```

### Option B: Query Params (Like User Settings)

```
/tribe/[tribe_id]/settings?tab=general
/tribe/[tribe_id]/settings?tab=members
/tribe/[tribe_id]/settings?tab=roles
...
```

### Client Components Structure

```
app-pages/
└── tribe-settings/
    ├── index.tsx                    # Main settings page
    ├── components/
    │   ├── settings-header.tsx
    │   ├── settings-tabs.tsx
    │   └── settings-shell.tsx
    ├── tabs/
    │   ├── general-tab.tsx
    │   ├── members-tab.tsx
    │   ├── roles-tab.tsx
    │   ├── permissions-tab.tsx
    │   ├── timeline-tab.tsx
    │   ├── media-tab.tsx
    │   ├── events-tab.tsx
    │   ├── invitations-tab.tsx
    │   ├── moderation-tab.tsx
    │   └── activity-tab.tsx
    └── lib/
        ├── types.ts
        └── utils.ts
```

---

## Implementation Checklist

### Phase 1: Core Settings Infrastructure
- [ ] Create `tribeSettings` database table
- [ ] Create `tribeRolePermission` database table
- [ ] Create `tribeActivityLog` database table
- [ ] Add query keys to `query-keys.ts`
- [ ] Create API routes for settings CRUD
- [ ] Create service functions in `lib/services/tribe-settings.ts`
- [ ] Create query options in `lib/query-options/tribe-settings.ts`
- [ ] Create hooks in `lib/hooks/use-tribe-settings.ts`

### Phase 2: Settings UI Shell
- [ ] Create settings layout with tab navigation
- [ ] Create settings header component
- [ ] Implement permission-based tab visibility
- [ ] Create route structure

### Phase 3: Individual Tabs
- [ ] **General Tab** - Basic info, danger zone
- [ ] **Members Tab** - Member list, search, filters, actions
- [ ] **Roles Tab** - Role permission matrix
- [ ] **Permissions Tab** - Individual override management
- [ ] **Timeline Tab** - Post/comment settings
- [ ] **Media Tab** - Upload/album settings
- [ ] **Events Tab** - Event/RSVP/poll settings
- [ ] **Invitations Tab** - Invitation management
- [ ] **Moderation Tab** - Restricted users, mod settings
- [ ] **Activity Tab** - Audit log

### Phase 4: Integration
- [ ] Update permission checks to use new three-layer system
- [ ] Add activity logging to relevant actions
- [ ] Update existing features to respect new settings
- [ ] Add settings access to tribe sidebar/navigation

---

## API Endpoints

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tribes/[tribe_id]/settings` | Get tribe settings |
| PATCH | `/api/tribes/[tribe_id]/settings` | Update tribe settings |
| GET | `/api/tribes/[tribe_id]/settings/roles` | Get role permissions |
| PATCH | `/api/tribes/[tribe_id]/settings/roles/[role]` | Update role permissions |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tribes/[tribe_id]/members` | List members (with filters) |
| PATCH | `/api/tribes/[tribe_id]/members/[user_id]/role` | Change member role |
| DELETE | `/api/tribes/[tribe_id]/members/[user_id]` | Remove member |

### Permissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tribes/[tribe_id]/permissions` | List member overrides |
| GET | `/api/tribes/[tribe_id]/permissions/[user_id]` | Get member permissions |
| PUT | `/api/tribes/[tribe_id]/permissions/[user_id]` | Set member permissions |
| DELETE | `/api/tribes/[tribe_id]/permissions/[user_id]` | Reset to role default |

### Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tribes/[tribe_id]/activity` | Get activity log |

---

**Document Status**: Planning
**Created**: December 22, 2024
**Version**: 1.0
**Owner**: Product Team

