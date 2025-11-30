# Events Management System - Implementation Plan

## My Understanding of the Events Feature

### Overview
The Events Management system is a **critical MVP feature** that enables tribes to organize real-world gatherings with RSVP tracking and optional voting. This feature is central to Tribe's mission of revitalizing "Third Spaces" by facilitating actual in-person meetups.

### Target User Needs
Based on the PRD, this feature serves two primary user segments:

**Fraternities/Sororities:**
- Rush events with strict RSVP tracking
- Formal events requiring head counts
- Chapter meetings and social gatherings
- Alumni engagement events

**Hospitality Businesses (Restaurants/Bars/Clubs):**
- VIP tasting events
- Special themed nights
- Exclusive customer gatherings
- Menu preview events

### Core Feature Components

#### 1. Event Creation & Management (CRUD)
**What Users Can Do:**
- Create events with title, description, location, date/time
- Set event as "confirmed" (standard event) or "voting" (needs member input)
- Edit their own events (or any event if admin/moderator)
- Delete their own events (or any event if admin/moderator)
- Cancel events by changing status

**Permission Model:**
- `canCreateEvents` - Who can create events (default: all members)
- `canEditEvents` - Who can edit ANY event (default: admin, moderator, owner)
- `canDeleteEvents` - Who can delete ANY event (default: admin, moderator, owner)
- Event creators can always edit/delete their own events

**Event Lifecycle:**
- `upcoming` - Future event (default when created)
- `ongoing` - Currently happening
- `completed` - Past event (moved to "Past Events")
- `cancelled` - Cancelled event

#### 2. RSVP System
**What Users Can Do:**
- RSVP to events with three statuses:
  - "Going" - Confirmed attendance
  - "Maybe" - Tentative attendance
  - "Not Going" - Not attending
- Change RSVP status at any time
- Remove RSVP by clicking same status again (toggle pattern)
- View attendee counts and list of who's going

**Implementation Pattern:**
- Similar to post "likes" but with three states instead of binary
- `eventAttendee` table with unique constraint (one RSVP per user per event)
- Toggle logic: clicking same status = remove RSVP, clicking different = update

**Display:**
- Badge showing "Going" on event card if user is attending
- Count of total attendees (going + maybe)
- Attendee list showing user avatars and names
- Social proof to encourage participation

#### 3. Event Voting System (Optional Feature)
**What Users Can Do:**
- Creator can enable voting when creating event
- Vote on options for:
  - Movie selection (e.g., "Which movie should we watch?")
  - Location (e.g., "Where should we meet?")
  - Date/time (e.g., "Which day works best?")
  - Any other decision requiring group input
- One vote per user per event
- See real-time vote counts
- Vote before deadline
- Change vote before deadline

**UI Indicators:**
- "Voting" badge on event card
- "Voted" badge if user has voted
- Vote deadline countdown
- Vote option bars showing current results

**Implementation Approach:**
Two separate tables:
- `eventVoteOption` - The options to vote on
- `eventVote` - User votes (one per user per event)

#### 4. Real-Time Notifications
**When Notifications Fire:**
- New event created → Notify all tribe members
- Event updated (time/location change) → Notify attendees
- Event cancelled → Notify attendees
- Vote deadline approaching → Notify non-voters (future enhancement)

**Integration:**
- Non-blocking Socket.io emit
- Creates notification record in database
- Real-time delivery to online users
- In-app notification bell shows count

#### 5. Activity Feed Integration
**Activities Created:**
- "created a new event" - When event is created
- "is attending [event]" - When user RSVPs "going" (optional)
- Event milestones (future): "10 people attending", "Event is tomorrow"

**Pattern:**
- Non-blocking try/catch around activity creation
- Activity creation should never fail the main operation
- Provides visibility to tribe members about event activity

### User Flows

#### Flow 1: Create Confirmed Event
1. User clicks "Create Event" button
2. Permission check: Does user have `canCreateEvents`?
3. User fills form: title, description, date, time, location
4. User selects "Confirmed Event" type
5. Form validates (required: title, startDate)
6. API creates event in database
7. Event appears in events list (status: "upcoming")
8. Activity created: "[User] created a new event"
9. Real-time notification sent to all tribe members
10. Users can now RSVP

#### Flow 2: Create Voting Event
1. User clicks "Create Event" button
2. User selects "Needs Voting" type
3. User enters base event info (title, description)
4. User adds vote options (e.g., "Option 1: Friday 7PM", "Option 2: Saturday 2PM")
5. User sets vote deadline
6. Event created with `hasVote: true`
7. Tribe members see "Voting" badge
8. Members vote for their preferred option
9. After deadline, creator updates event with winning option
10. Event transitions to "confirmed" status

#### Flow 3: RSVP to Event
1. User views event card
2. User clicks "RSVP" button or status button ("Going", "Maybe", "Not Going")
3. API checks if RSVP exists:
   - If same status → Remove RSVP
   - If different status → Update RSVP
   - If no RSVP → Create new RSVP
4. Optimistic update in UI (instant feedback)
5. Event card updates to show "Going" badge
6. Attendee count increments
7. User appears in attendee list
8. Activity created (optional): "[User] is attending [Event]"

#### Flow 4: Edit Event
1. User clicks edit on event they created (or admin edits any event)
2. Permission check: Can user edit this event?
   - If creator → Yes
   - If has `canEditEvents` permission → Yes
   - If role is owner/admin/moderator → Yes
   - Otherwise → No (403 error)
3. User modifies title, description, date, time, location, or status
4. Form validates changes
5. API updates event
6. If time/location changed → Notify all attendees
7. Event card updates in UI

#### Flow 5: Vote on Event
1. User views event with voting enabled
2. User sees vote options with current vote counts
3. User clicks on their preferred option
4. Permission check: Is user a tribe member?
5. Check deadline: Is voting still open?
6. API creates/updates vote
7. Optimistic update shows user's selection
8. Vote count increments immediately
9. "Voted" badge appears on event card

### Edge Cases & Business Logic

#### Event Deletion
- Cascade delete: When event deleted, all RSVPs and votes are deleted
- Permission check: Only creator or admins can delete
- Confirmation dialog: "Are you sure? This will notify all attendees"
- Notification sent to attendees if event had RSVPs

#### RSVP Edge Cases
- Changing from "Going" to "Maybe": Update record
- Clicking "Going" when already "Going": Remove RSVP entirely
- Event at capacity (future): Show "Event Full" if max attendees reached
- Event past date: Can still change RSVP for historical record

#### Permission Edge Cases
- Member loses `canCreateEvents`: Can still edit their own existing events
- Member demoted from admin to member: Loses ability to edit others' events
- Event creator leaves tribe: Event remains with original creator info
- Explicit permission override: Takes precedence over role defaults

#### Voting Edge Cases
- Vote after deadline: Rejected with error message
- Vote option deleted: Cascade delete votes for that option
- Concurrent votes: Unique constraint prevents duplicate votes
- Changing vote: Update instead of insert

#### Event Status Management
- Auto-transition (future): Cron job moves "upcoming" → "ongoing" → "completed"
- Manual override: Admin can set to "cancelled" at any time
- Past events: Filter by date or status to show in "Past Events" section
- Calendar display: Only show "upcoming" and "ongoing" events

### Data Flow Architecture

```
User Action (Create Event)
    ↓
CreateEventDialog Component (UI)
    ↓
useCreateEvent() Hook
    ↓
POST /api/tribes/[tribe_id]/events
    ↓
Validation (Zod schema)
    ↓
createEvent() Service Function
    ↓
Permission Check (canUserCreateEvents)
    ↓
Database Insert (event table)
    ↓
Non-blocking: Create Activity + Send Notifications
    ↓
Return EventWithCreator to client
    ↓
TanStack Query Cache Update
    ↓
UI Re-renders with New Event
```

### Key Metrics (PRD Success Criteria)

**The "Utility Hook":**
- % of Active Users who RSVP to an Event (Target: 40-60% RSVP rate)
- Events created per tribe per month (Target: 2-4 events)

**Engagement Metrics:**
- Event attendance rate (RSVPs that actually attend)
- Average time between event creation and first RSVP
- Vote participation rate (for voting events)

### Integration Points

1. **Permissions System**: Uses `getMemberWithPermissions()` for all permission checks
2. **Activity Feed**: Creates activities for event creation (and optionally RSVPs)
3. **Notifications**: Real-time Socket.io notifications when events created/updated
4. **Tribe Membership**: Only tribe members can view, create, and RSVP to events
5. **User Profiles**: Event creator info displayed with avatar and name

### What's Currently Built

✅ **Complete:**
- Database schema (`event`, `eventAttendee` tables)
- Frontend UI components (EventCard, CreateEventDialog, EventsList, etc.)
- Permission flags in schema (`canCreateEvents`, etc.)

❌ **Missing (Needs Implementation):**
- Service layer (`lib/services/event.ts`)
- API routes (`/api/tribes/[tribe_id]/events/*`)
- Custom hooks (`lib/hooks/use-events.ts`)
- Validation schemas (`lib/validations/event.ts`)
- Type definitions for extended types (EventWithCreator, EventWithAttendees)
- Query keys for TanStack Query
- Integration with activity tracking
- Integration with notification system
- Voting system tables and logic (optional for MVP)

---

## Questions for Clarification

Before finalizing the implementation plan, I need clarity on scope and priorities:

### 1. Voting System Scope
**Question:** Should the voting system be included in the initial implementation, or should we implement basic events (CRUD + RSVP) first and add voting in a follow-up phase?

**Context:** The UI shows voting capability, but it's complex (requires 2 additional tables, voting logic, deadline management). Basic events + RSVP might be sufficient for MVP validation.

**Options:**
- **Option A**: Full implementation including voting (more complete but slower)
- **Option B**: Phase 1: Basic CRUD + RSVP only; Phase 2: Add voting later (faster to market)

### 2. Event Status Auto-Transition
**Question:** Should event status automatically transition based on dates (upcoming → ongoing → completed), or should it remain manual for MVP?

**Context:** Auto-transition requires scheduled jobs/cron. Manual status management is simpler but requires admin intervention.

**Options:**
- **Option A**: Manual status management only (simpler, MVP-appropriate)
- **Option B**: Implement auto-transition logic (more polished, requires infrastructure)

### 3. Activity Tracking Granularity
**Question:** Should we create activities for:
- Event creation only?
- Event creation + RSVPs (every RSVP)?
- Event creation + milestone RSVPs (e.g., "10 people attending")?

**Context:** Too many activities could clutter the feed; too few might reduce engagement visibility.

### 4. RSVP Removal Notification
**Question:** When a user removes their RSVP (by clicking same status), should we:
- Silently remove it?
- Create an activity "[User] is no longer attending"?
- Notify the event creator?

**Context:** This could be useful for event planning but might feel overly surveillant.

### 5. Past Events Display
**Question:** Should "completed" events be:
- Hidden from main events list entirely?
- Shown in separate "Past Events" section?
- Shown with photo upload capability (event album creation)?

**Context:** Photo uploads tied to events could increase engagement but adds scope.

---

## Next Steps

Once these questions are answered, I'll create a detailed implementation plan with:
- File-by-file implementation order
- Specific code patterns to follow
- API endpoint specifications
- Hook implementation details
- Testing considerations
