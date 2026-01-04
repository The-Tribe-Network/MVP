# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tribe** is a utility-first community organization platform. For product context, target users, features, and business rationale, see **`lib/docs/MVP_PRD_2025.md`**.

**Tech Stack**: Next.js 15, TypeScript, Better-Auth, Drizzle ORM (PostgreSQL/Neon), TanStack Query, Cloudinary, Resend

**MVP Status**: Production-Ready

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

**IMPORTANT:** For comprehensive TanStack Query patterns, see `.claude/tanstack-query-guide.md`. For task-specific guidance, see `.claude/commands/tanstack-query.md`.

**Architecture**: Three-layer pattern optimized for reusability and type safety:

1. **Query Key Factory** (`lib/constants/query-keys.ts`):
   - Single source of truth for all query keys
   - Hierarchical structure: `domain.scope.detail`
   - **NEVER hardcode query keys** - always use this factory

   ```typescript
   queryKeys.tribes.detail(tribeId)
   queryKeys.posts.tribe(tribeId)
   queryKeys.posts.detail(postId)
   queryKeys.activities.tribe(tribeId)
   queryKeys.media.tribe(tribeId, filters)
   queryKeys.albums.tribe(tribeId)
   queryKeys.comments.post(postId)
   queryKeys.events.tribe(tribeId)
   queryKeys.preferences.tribeMember(tribeId)
   ```

2. **Query Options** (`lib/query-options/` - 14 modules):
   - Reusable configuration using `queryOptions()` factory
   - Works in Server Components (prefetch) AND Client Components (hooks)
   - Single source of truth for query configuration

   ```typescript
   // lib/query-options/posts.ts
   export function tribePostsOptions(tribeId: string, options?: PaginationOptions) {
     return queryOptions({
       queryKey: queryKeys.posts.tribe(tribeId),
       queryFn: () => fetchTribePosts({ tribeId, ...options }),
       staleTime: 1000 * 60, // 1 minute
     })
   }
   ```

3. **Custom Hooks** (`lib/hooks/use-*.ts` - 17 files):
   - React hooks wrapping query options for client-side usage
   - Thin wrappers for queries, rich logic for mutations

   ```typescript
   // lib/hooks/use-posts.ts
   export function useTribePosts(tribeId: string, options?: PaginationOptions) {
     return useQuery(tribePostsOptions(tribeId, options))
   }
   ```

**Key Files**:
- `lib/constants/query-keys.ts` - **CRITICAL**: All query keys defined here
- `lib/query-options/` - Query configuration (auth, tribes, posts, comments, media, albums, activities, events, preferences, profile, security, polls, discover)
- `lib/hooks/` - Custom React hooks (use-posts, use-tribes, use-comments, use-media, use-albums, use-activities, use-events, use-auth, use-upload, use-preferences, use-polls, use-profile, use-security)
- `lib/api/` - API client functions (14 modules)

**Server-Side Prefetching Pattern**:

All pages use server-side prefetching to eliminate waterfalls and loading states:

```typescript
// app/(protected)/tribe/[tribe_id]/page.tsx
export default async function Page({ params }: PageProps) {
  const { tribe_id } = await params
  const queryClient = new QueryClient()

  // Prefetch queries IN PARALLEL on server
  await Promise.all([
    queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
    queryClient.prefetchQuery(tribePostsOptions(tribe_id, { limit: 20 })),
    queryClient.prefetchQuery(tribeMediaOptions(tribe_id, { type: 'image', limit: 4 })),
  ])

  // Hydrate client with server data (zero waterfalls!)
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageComponent tribeId={tribe_id} />
    </HydrationBoundary>
  )
}
```

Client component uses prefetched data with NO loading state:

```typescript
'use client'
export function PageComponent({ tribeId }: { tribeId: string }) {
  // Uses prefetched data - instant render!
  const { data: tribe } = useQuery(tribeDetailOptions(tribeId))
  return <div>{tribe.name}</div>
}
```

**Mutation Invalidation Strategies**:

Three patterns based on complexity:

**1. Simple Invalidation** (most mutations):
```typescript
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.tribe(variables.tribeId) })
    },
  })
}
```

**2. Cascading Invalidation** (related data):
```typescript
export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      // Invalidate comments list
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.post(variables.postId) })
      // Also invalidate post detail to update comment count
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) })
    },
  })
}
```

**3. Optimistic Updates** (instant feedback for toggles):

Used for likes/unlikes only. See `useLikePost()` in `lib/hooks/use-posts.ts`:

```typescript
export function useLikePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: togglePostLike,
    // STEP 1: Optimistically update cache before server responds
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.tribe(variables.tribeId) })
      const previousPosts = queryClient.getQueryData(queryKeys.posts.tribe(variables.tribeId))
      queryClient.setQueryData(queryKeys.posts.tribe(variables.tribeId), (old) =>
        old?.map((post) =>
          post.id === variables.postId
            ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 }
            : post
        )
      )
      return { previousPosts }
    },
    // STEP 2: Rollback on error
    onError: (_, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts.tribe(variables.tribeId), context.previousPosts)
      }
    },
    // STEP 3: Invalidate on success to sync server state
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.tribe(variables.tribeId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.postId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.tribe(variables.tribeId) }) // For like milestones
    },
  })
}
```

**Common Invalidation Cascades**:
- Create comment → invalidate `comments.post(postId)` + `posts.detail(postId)` (for count)
- Like post → invalidate `posts.detail(postId)` + `activities.tribe(tribeId)` (for milestones)
- Upload media → invalidate `media.tribe(tribeId)` + `albums.tribe(tribeId)`
- Delete post → invalidate `posts.tribe(tribeId)` + `activities.tribe(tribeId)`

**Stale Time Guidelines**:
- Auth session/user: 5 minutes (refetch on window focus)
- Invitations: 30 seconds (real-time refetch interval)
- Posts, comments, media: 1 minute default (moderate change frequency)
- Tribe details: 1 minute default
- Static/preference data: 5-10 minutes

**Filter Normalization Pattern**:

Always normalize filters to prevent cache fragmentation:

```typescript
export function tribeMediaOptions(tribeId: string, filters?: MediaFilters) {
  // Remove undefined values to normalize query key
  const filtersObject = filters
    ? Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined))
    : undefined

  return queryOptions({
    queryKey: queryKeys.media.tribe(tribeId, filtersObject),
    queryFn: () => fetchTribeMedia(tribeId, filters),
  })
}
```

**When Adding New Features**:

1. Add query key to `lib/constants/query-keys.ts`
2. Create API functions in `lib/api/feature.ts`
3. Create query options in `lib/query-options/feature.ts`
4. Create hooks in `lib/hooks/use-feature.ts`
5. Export from `lib/hooks/index.ts`
6. Plan invalidation strategy (simple, cascading, or optimistic)
7. Document in `.claude/tanstack-query-guide.md` if pattern is new

**Critical Rules**:
- ❌ Never hardcode query keys - always use `queryKeys` factory
- ❌ Never forget invalidation in mutations
- ❌ Never use optimistic updates for create/delete (only toggles)
- ✅ Always use `Promise.all()` for parallel server prefetching
- ✅ Always normalize filters before query keys
- ✅ Always use query options (not raw `useQuery` objects)

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

### Form Handling & Validation

**IMPORTANT:** This project uses **react-hook-form + Zod + shadcn Form components** for ALL forms. Never use manual `useState` for form fields.

**📚 Comprehensive Form Guides:**
- **Quick Start:** `.claude/form-quick-reference.md` - Templates and cheatsheet
- **Task-Based:** `.claude/commands/form.md` - Step-by-step instructions
- **Architecture:** `.claude/form-architecture-guide.md` - Deep dive and patterns
- **Navigation:** `.claude/FORM_GUIDE_INDEX.md` - Find the right guide

**Architecture Pattern (3 Layers):**

1. **Zod Schema** (`lib/validations/[feature].ts`):
   ```typescript
   export const createPostSchema = z.object({
     content: z.string().min(1, 'Content is required').max(5000),
     mediaId: z.string().uuid().nullable().optional(),
   })

   export type CreatePostInput = z.infer<typeof createPostSchema>
   ```

2. **Form Component** (`app-pages/[feature]/forms/`):
   ```typescript
   'use client'

   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

   export function CreatePostForm({ tribeId }: Props) {
     const form = useForm<CreatePostInput>({
       resolver: zodResolver(createPostSchema),
       defaultValues: { content: '', mediaId: null },
     })

     const { mutate: createPost, isPending } = useCreatePost()

     const onSubmit = (data: CreatePostInput) => {
       createPost({ tribeId, ...data }, {
         onSuccess: () => form.reset(),
       })
     }

     return (
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)}>
           <FormField
             control={form.control}
             name="content"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Content</FormLabel>
                 <FormControl>
                   <Input {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <Button type="submit" disabled={isPending}>Create</Button>
         </form>
       </Form>
     )
   }
   ```

3. **TanStack Query Mutation** (from `lib/hooks/use-[feature].ts`):
   - Forms call mutation hooks
   - Mutations handle invalidation and success toasts
   - Forms handle reset and UI state

**Validation Schemas** (`lib/validations/`):
- `auth.ts` - Sign-in, sign-up, forgot/reset password
- `event.ts` - Create/update event, poll data
- `album.ts` - Create/update album, step-by-step schemas
- `post.ts` - Create/update post, also exports `validateApiRequest()` helper
- `comment.ts` - Comment validation
- `tribe.ts` - Tribe validation
- `profile.ts` - Profile updates
- `security.ts` - Password changes
- `poll.ts` - Poll-specific validation

**Example Forms in Codebase:**
- **Simple:** `app-pages/auth/forms/sign-in-form.tsx`
- **Complex:** `app-pages/auth/forms/sign-up-form.tsx` (dependent fields, password requirements)
- **Multi-Step:** `app-pages/create-event/index.tsx` (5-step wizard)

**API Validation Pattern** (Server-side):
```typescript
import { createPostSchema, validateApiRequest } from "@/lib/validations/post";

const body = await request.json();
const validation = validateApiRequest(createPostSchema, body);
if (!validation.success) {
  return NextResponse.json({ error: "Validation failed", details: validation.error }, { status: 400 });
}
// Use validation.data (type-safe)
```

**Critical Rules:**
- ❌ Never use manual `useState` for form fields - RHF manages state
- ❌ Never pass full `form` object to children - pass `control` prop only
- ❌ Never use Zustand or external state for form data
- ✅ Always use `useForm` with `zodResolver`
- ✅ Always use shadcn Form components from `components/ui/form.tsx`
- ✅ Always reset form on success: `form.reset()`
- ✅ See form guides for patterns: simple, multi-step, dialog, edit forms

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
- `components/shared/` for reusable shared components (e.g., `subpage-header.tsx`)

### Navigation & Subpage Headers

**IMPORTANT:** All tribe subpages use **breadcrumb navigation** instead of back buttons. This provides consistent, predictable navigation across the app.

**📚 Comprehensive Guide:** `.claude/navigation-guide.md`

**Key Components:**
- `components/shared/subpage-header.tsx` - Reusable header with breadcrumbs, title, subtitle, and action slot
- `components/ui/breadcrumb.tsx` - shadcn/ui breadcrumb components

**Breadcrumb Hierarchy:**
```
Dashboard (tribe home)
├── Events → Dashboard > Events
│   └── Event Detail → Dashboard > Events > {Event Title}
├── Media → Dashboard > Media
│   ├── Browse → Dashboard > Media > Browse
│   └── Album → Dashboard > Media > {Album Name}
├── Post → Dashboard > Post
└── Settings → Dashboard > Settings > {Section}
```

**Using SubpageHeader:**
```typescript
import { SubpageHeader } from '@/components/shared/subpage-header'

<SubpageHeader
  tribeId={tribeId}
  breadcrumbs={[{ label: 'Events' }]}
  title="Tribe Events"
  subtitle="Plan and manage your tribe's events"
  actions={<CreateEventButton />}
/>
```

**For Nested Pages (multi-level breadcrumbs):**
```typescript
<SubpageHeader
  tribeId={tribeId}
  breadcrumbs={[
    { label: 'Media', href: `/tribe/${tribeId}/media` },
    { label: albumName }
  ]}
  title={albumName}
  subtitle="View album photos"
/>
```

**Critical Rules:**
- ❌ Never use `router.back()` for navigation - it's unpredictable
- ❌ Never use standalone back buttons/links - use breadcrumbs instead
- ✅ Always start breadcrumbs with "Dashboard" (handled by SubpageHeader)
- ✅ Always use SubpageHeader for tribe subpages
- ✅ For nested pages, provide intermediate `href` values in breadcrumbs

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

### Product & Business (source of truth for non-technical context)
- **`lib/docs/MVP_PRD_2025.md`** - Product requirements, target users, features, roadmap
- `lib/docs/GTM_STRATEGY.md` - Go-to-market strategy
- `lib/docs/PRICING_STRATEGY.md` - Pricing strategy

### Technical Guides (`.claude/` directory)
- `.claude/tanstack-query-guide.md` - TanStack Query patterns
- `.claude/form-architecture-guide.md` - Form handling patterns
- `.claude/navigation-guide.md` - Breadcrumb/navigation patterns
- `.claude/commands/` - Task-specific guidance (backend, frontend, forms, tanstack-query)

## Anti-Patterns (NEVER DO)

This section shows explicit BAD vs GOOD patterns. **Always follow the GOOD pattern.**

### Database Queries - Never Use Sequential Queries When Joins Are Possible

❌ **BAD - Two separate queries for related data:**
```typescript
// This makes 2 database round trips when 1 would suffice
const albums = await db
  .select({ id: album.id, name: album.name, coverUrl: media.fileUrl })
  .from(album)
  .leftJoin(media, eq(album.coverId, media.id))
  .where(inArray(album.id, albumIds));

// SEPARATE QUERY - BAD!
const albumPhotoCounts = await db
  .select({ albumId: albumMedia.albumId, count: count() })
  .from(albumMedia)
  .where(inArray(albumMedia.albumId, albumIds))
  .groupBy(albumMedia.albumId);

const photoCountMap = new Map(albumPhotoCounts.map((ac) => [ac.albumId, Number(ac.count)]));
```

✅ **GOOD - Single query with subquery join:**
```typescript
// Subquery to get media count per album
const mediaCountSubquery = db
  .select({
    albumId: albumMedia.albumId,
    count: count(albumMedia.id).as('count'),
  })
  .from(albumMedia)
  .groupBy(albumMedia.albumId)
  .as('media_counts');

// Single query with LEFT JOIN to subquery
const albums = await db
  .select({
    id: album.id,
    name: album.name,
    coverUrl: media.fileUrl,
    photoCount: sql<number>`COALESCE(${mediaCountSubquery.count}, 0)`,
  })
  .from(album)
  .leftJoin(media, eq(album.coverId, media.id))
  .leftJoin(mediaCountSubquery, eq(album.id, mediaCountSubquery.albumId))
  .where(inArray(album.id, albumIds));
```

### Types - Never Create Types From Scratch When Extending Existing Types

❌ **BAD - Creating types from scratch:**
```typescript
// Don't redefine fields that already exist in the database types
export type LinkedAlbumPreview = {
  id: string;
  name: string;
  coverUrl: string | null;
  photoCount: number;
};
```

✅ **GOOD - Use Pick/Extend from existing types:**
```typescript
import type { Album } from '@/lib/database/types';

// Extend existing types using Pick, Omit, or intersection
export type LinkedAlbumPreview = Pick<Album, 'id' | 'name'> & {
  coverUrl: string | null;
  photoCount: number;
};
```

### Query Keys - Never Hardcode Query Keys

❌ **BAD - Hardcoded query keys:**
```typescript
const { data } = useQuery({
  queryKey: ['posts', 'tribe', tribeId], // HARDCODED - BAD!
  queryFn: () => fetchTribePosts(tribeId),
});
```

✅ **GOOD - Use query key factory:**
```typescript
import { queryKeys } from '@/lib/constants/query-keys';

const { data } = useQuery({
  queryKey: queryKeys.posts.tribe(tribeId), // Uses factory
  queryFn: () => fetchTribePosts(tribeId),
});
```

### Form State - Never Use useState for Form Fields

❌ **BAD - Manual state management:**
```typescript
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [errors, setErrors] = useState({});

const handleSubmit = () => {
  if (!name) setErrors({ name: 'Required' });
  // Manual validation logic...
};
```

✅ **GOOD - Use react-hook-form with Zod:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<FormInput>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: '', email: '' },
});

const onSubmit = form.handleSubmit((data) => {
  // data is validated and typed
});
```

### Database Queries in API Routes - Never Write Queries Directly

❌ **BAD - Database queries in API route:**
```typescript
// app/api/tribes/[tribe_id]/posts/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // DON'T write queries directly in API routes
  const [post] = await db.insert(posts).values({
    tribeId: body.tribeId,
    content: body.content,
  }).returning();
  
  return NextResponse.json(post);
}
```

✅ **GOOD - Use service functions:**
```typescript
// app/api/tribes/[tribe_id]/posts/route.ts
import { createPost } from '@/lib/services/post';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Service handles permissions, validation, activity tracking
  const post = await createPost(tribeId, userId, body.content);
  
  return NextResponse.json(post);
}
```

## Common Pitfalls to Avoid

1. **Don't skip membership checks** in API routes - always verify user is in tribe
2. **Don't fetch permissions separately** - use `getMemberWithPermissions()`
3. **Don't create activities manually for likes/comments** - service functions handle this
4. **Don't modify `components/ui/`** - these are auto-generated by shadcn/ui
5. **Don't use sequential queries** when joins or parallel queries are possible
6. **Don't forget to invalidate queries** after mutations in TanStack Query hooks
