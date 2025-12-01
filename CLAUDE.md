# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tribe is a full-stack social platform for creating and managing private/public tribes (communities). Built with Next.js 15, TypeScript, Better-Auth, Drizzle ORM, and TanStack Query. Features include posts, comments, media/albums, events, notifications, and real-time messaging.

## Development Commands

### Running the Application
```bash
pnpm run dev          # Start development server (http://localhost:3000)
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

### Database Operations
```bash
# Better-Auth database migrations
pnpm run generate-auth    # Generate Better-Auth migrations
pnpm run migrate-auth     # Run Better-Auth migrations

# Drizzle ORM operations
pnpm run push-db          # Push schema changes to database
pnpm run migrate-avatar   # Run custom avatar migration
```

### Important Notes
- The project uses **pnpm** as the package manager
- Database migrations are handled separately for Better-Auth tables and application tables
- Always run `generate-auth` and `migrate-auth` after modifying auth configuration
- Use `push-db` for quick schema updates during development (use with caution in production)

## Architecture & Code Organization

### Application Structure

The codebase follows Next.js 15 App Router conventions with a clear separation between:

1. **Route Groups**:
   - `app/(auth)/*` - Authentication pages (sign-in, sign-up, verify, forgot, reset)
   - `app/(protected)/*` - Protected routes requiring authentication
   - Route group layouts handle authentication checks and redirects

2. **Page Components (`app-pages/`)**:
   - All complex UI components live in `app-pages/` directory, organized by feature
   - Next.js pages in `app/` are **thin wrappers** that import from `app-pages/`
   - This keeps the App Router clean and makes components reusable
   - Example: `app/(protected)/tribe/[tribe_id]/page.tsx` → imports from `app-pages/tribe-dashboard/`

3. **API Routes (`app/api/`)**:
   - RESTful API structure: `/api/tribes/[tribe_id]/posts/[post_id]`
   - All routes require authentication via `getServerUser()`
   - Use Zod schemas from `lib/validations/` for request validation
   - Always check tribe membership before data access

### Database Layer

**Database Provider**: PostgreSQL (Neon) with Drizzle ORM

**Schema Organization** (`lib/database/schemas/`):
- `auth.ts` - Better-Auth tables (user, session, account, verification)
- `tribe.ts` - Tribe, tribeMember, tribeMemberPermission, tribeMemberPreference, tribeInvitation
- `post.ts` - Post, postLike, comment, commentLike
- `media.ts` - Album, media, mediaLike
- `event.ts` - Event, eventAttendee
- `activity.ts` - Activity, notification
- `hashtag.ts` - Hashtag, postHashtag
- `message.ts` - Message, messageRead
- `enums.ts` - All database enums (tribeRole, privacyType, etc.)
- `index.ts` - Centralized exports

**Key Patterns**:
- Use UUIDs for all primary keys (`uuid("id").primaryKey().defaultRandom()`)
- Timestamp fields: `createdAt`, `updatedAt` (with `.$onUpdate(() => new Date())`)
- Foreign keys have cascade/restrict policies defined
- Lazy references used to avoid circular dependencies (e.g., tribe.avatar → media.id)

### Service Layer (`lib/services/`)

Services handle business logic and database queries. Key services:

- `auth.ts` - `getServerUser()`, session management
- `tribe.ts` - `createTribe()`, `getTribeById()`, `getUserTribes()`, `leaveTribe()`
- `post.ts` - `createPost()`, `getTribePosts()`, `updatePost()`, `deletePost()`, like/unlike
- `comment.ts` - CRUD operations, nested replies, likes
- `media.ts` - Media upload, album management, like/unlike
- `permissions.ts` - **CRITICAL**: `getMemberWithPermissions()`, `canUserUploadMedia()`, `canUserCreateAlbums()`, `canUserDeleteMedia()`
- `activity.ts` - Activity feed, milestone tracking (post likes, member joins)
- `invitation.ts` - Tribe invitations with email notifications

**Performance Optimizations**:
- Services are optimized to minimize database queries (see docs/PERFORMANCE_OPTIMIZATIONS.md)
- Use `getMemberWithPermissions()` instead of separate membership + permission queries
- Joins are used to fetch related data in single queries
- Avatar URLs are resolved via joins instead of separate queries

### Permission System

**Role-Based Permissions**:
- Roles: `owner`, `admin`, `moderator`, `member`
- Fine-grained permissions stored in `tribeMemberPermission` table
- Permissions can override role defaults (e.g., restrict a member's posting ability)

**Permission Checks**:
1. Always call `getMemberWithPermissions(tribeId, userId)` to get member + permissions in one query
2. Check permission overrides first (explicit true/false in tribeMemberPermission)
3. Fall back to role-based defaults
4. For content ownership (posts, media), check if user is the creator

**Important**: API routes must check membership BEFORE accessing tribe data. Use `checkTribeMembership()` or `getMemberWithPermissions()`.

### Data Fetching with TanStack Query

**Query Key Factory** (`lib/constants/query-keys.ts`):
```typescript
queryKeys.tribes.detail(tribeId)
queryKeys.posts.tribe(tribeId)
queryKeys.activities.tribe(tribeId)
queryKeys.media.tribe(tribeId, filters)
queryKeys.albums.tribe(tribeId)
queryKeys.comments.post(postId)
```

**Custom Hooks** (`lib/hooks/`):
- `use-posts.ts` - `useTribePosts()`, `useCreatePost()`, `useLikePost()` with optimistic updates
- `use-albums.ts` - Album queries and mutations
- `use-media.ts` - Media queries with filtering
- `use-upload.ts` - Cloudinary upload with progress tracking
- `use-tribe-preferences.ts` - Tribe member preferences

**Optimistic Updates Pattern**:
See `useLikePost()` in `lib/hooks/use-posts.ts` for reference implementation:
- Cancel ongoing queries
- Snapshot previous data
- Optimistically update cache
- Rollback on error
- Invalidate on success

### Type System

**Type Definitions** (`lib/database/types.ts`):
- Base types: `Tribe`, `Post`, `Media`, `Event`, etc. (from Drizzle schema inference)
- Extended types: `TribeWithCreator`, `PostWithAuthor`, `MediaWithUploader`, etc.
- Insert types: `TribeInsert`, `PostInsert`, etc.

**Usage Pattern**:
```typescript
import type { TribeWithMembers, PostWithAuthor } from "@/lib/database/types";
```

All API responses should use these extended types to ensure consistent data shape across client/server.

### Form Validation

**Zod Schemas** (`lib/validations/`):
- `tribe.ts` - Tribe creation/update validation
- `post.ts` - Post CRUD, also exports `validateApiRequest()` helper
- `comment.ts` - Comment validation
- `auth.ts` - Sign-in, sign-up validation

**API Validation Pattern**:
```typescript
import { createPostSchema, validateApiRequest } from "@/lib/validations/post";

const body = await request.json();
const validation = validateApiRequest(createPostSchema, body);
if (!validation.success) {
  return NextResponse.json({ error: "Validation failed", details: validation.error }, { status: 400 });
}
// Use validation.data (type-safe)
```

### Authentication (Better-Auth)

**Configuration**: `lib/clients/auth.ts`
- Email/Password with OTP verification
- OAuth: Google, GitHub
- Magic link authentication
- Email templates via Resend

**Auth Patterns**:
- Server-side: `await getServerUser()` in API routes and server components
- Client-side: Use Better-Auth React hooks
- Protected routes: Check session in layout or middleware
- Session is stored in HTTP-only cookies

### Media Handling

**Upload Provider**: Cloudinary
- Configuration: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Upload route: `/api/upload/post-image`, `/api/upload/avatar`
- Media records stored in database with Cloudinary URLs

**Media-Album Relationship**:
- Media can optionally belong to an album (`media.albumId`)
- User preference: `autoAddPostMediaToTribe` determines if post images auto-add to tribe albums
- Retrieve via `lib/hooks/use-tribe-preferences.ts`

### Activity & Notifications

**Activity System** (`lib/services/activity.ts`):
- Tracks user actions: new_post, post_like, new_comment, member_join, media_upload, etc.
- Milestone activities: Generated automatically (e.g., "Post reached 10 likes")
- Activities appear in tribe activity feeds

**Creating Activities**:
```typescript
import { createActivity } from "@/lib/services/activity";

await createActivity({
  type: "new_post",
  userId: user.id,
  tribeId: tribe.id,
  postId: post.id,
  metadata: { content: post.content.substring(0, 100) }
});
```

## Environment Variables

Required variables (see `.env`):

### Database
- `DATABASE_URL` - PostgreSQL connection string (Neon serverless)

### Authentication (Better-Auth)
- `BETTER_AUTH_SECRET` - Random secret for session encryption
- `BETTER_AUTH_URL` - Base URL for Better-Auth (`http://localhost:3000` for dev)
- `NEXT_PUBLIC_APP_URL` - Public-facing app URL
- `LOCAL_ORIGIN` - Local network origin (for mobile testing)

### OAuth Providers
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

### Email (Resend)
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - From email address
- `APP_NAME` - Application name for emails

### Media (Cloudinary)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_URL` - Full Cloudinary URL

### Other
- `NODE_ENV` - Environment (development/production)

## Critical Patterns to Follow

### 1. Always Check Tribe Membership
```typescript
const user = await getServerUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const isMember = await checkTribeMembership(tribeId, user.id);
if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

### 2. Use Services for Business Logic
- DO NOT write database queries directly in API routes
- Use service functions from `lib/services/`
- Services handle permissions, validation, and activity tracking

### 3. Optimize Database Queries
- Use joins instead of sequential queries
- Fetch related data in parallel with `Promise.all()`
- Leverage `getMemberWithPermissions()` for membership + permissions in one query
- See docs/PERFORMANCE_OPTIMIZATIONS.md for patterns

### 4. Type Safety
- Always use types from `lib/database/types.ts`
- Return properly typed responses from API routes
- Use Zod validation for all user inputs

### 5. Activity Tracking
- Create activities for important user actions
- Use milestone thresholds: 10, 25, 50, 100 likes/comments/media
- Activities drive engagement in tribe feeds

### 6. Error Handling
```typescript
try {
  // Logic here
} catch (error) {
  console.error("Context:", error);
  if (error instanceof Error && error.message.includes("permission")) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return NextResponse.json({ error: "Generic error message" }, { status: 500 });
}
```

## Project-Specific Conventions

### File Naming
- React components: PascalCase (e.g., `TribeCard.tsx`)
- Utilities/services: kebab-case (e.g., `query-keys.ts`, `use-posts.ts`)
- API routes: kebab-case with Next.js conventions (e.g., `[tribe_id]`)

### Component Organization
- `app-pages/` for page-level components
- `components/` for shared UI components
- `components/ui/` for shadcn/ui components (auto-generated, don't edit manually)

### Import Aliases
- `@/*` maps to project root
- Example: `import { db } from "@/lib/database/client"`

### Database Conventions
- All IDs are UUIDs (generated by database)
- Foreign keys use descriptive names: `tribeId`, `userId`, `createdBy`
- Timestamps: Always include `createdAt`, `updatedAt`
- Soft deletes: Not currently implemented (use hard deletes)

## Socket Server (Separate Project)

There is a `socket-server/` directory for real-time messaging (Socket.IO). This is a separate Node.js server, not part of the Next.js app.

## Documentation Files

- `docs/MVP_PRD.md` - Minimum viable product requirements
- `docs/PRD.md` - Full product requirements document
- `docs/PERFORMANCE_OPTIMIZATIONS.md` - Database query optimization guide
- `docs/PHASE_1_OPTIMIZATIONS.md`, `docs/PHASE_2_OPTIMIZATIONS.md` - Implementation phases
- `docs/google_mvp_prd.md` - Google-specific MVP requirements

## Common Pitfalls to Avoid

1. **Don't skip membership checks** in API routes - always verify user is in tribe
2. **Don't fetch permissions separately** - use `getMemberWithPermissions()`
3. **Don't create activities manually for likes/comments** - service functions handle this
4. **Don't modify `components/ui/`** - these are auto-generated by shadcn/ui
5. **Don't use sequential queries** when joins or parallel queries are possible
6. **Don't forget to invalidate queries** after mutations in TanStack Query hooks
