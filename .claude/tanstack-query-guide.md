# TanStack Query Patterns & Reference

This guide provides comprehensive patterns for TanStack Query implementation in the Tribe project.

## Overview

Our approach uses a **three-layer architecture** for maximum reusability and type safety:

1. **Query Key Factory** (`lib/constants/query-keys.ts`) - Centralized, hierarchical query keys
2. **Query Options** (`lib/query-options/*`) - Reusable query configuration (works in SSR, loaders, client)
3. **Custom Hooks** (`lib/hooks/use-*.ts`) - React hooks wrapping options for client-side usage

This pattern enables:
- Server-side prefetching with automatic client hydration
- Type-safe query results and mutations
- Consistent cache invalidation across the app
- Zero request waterfalls (parallel fetching)

---

## Architecture Layer 1: Query Key Factory

**File:** `lib/constants/query-keys.ts`

All query keys MUST be defined in this centralized factory. Never hardcode query keys.

### Structure

```typescript
export const queryKeys = {
  // Pattern: domain.scope.detail
  posts: {
    all: ["posts"] as const,
    tribe: (tribeId: string) => ["posts", "tribes", tribeId] as const,
    detail: (postId: string) => ["posts", "detail", postId] as const,
  },

  media: {
    all: ["media"] as const,
    tribe: (tribeId: string, filters?: Record<string, unknown>) =>
      ["media", "tribes", tribeId, filters] as const,
    detail: (mediaId: string) => ["media", "detail", mediaId] as const,
  },

  comments: {
    all: ["comments"] as const,
    post: (postId: string) => ["comments", "post", postId] as const,
  },
}
```

### Current Feature Domains

✓ **auth** - Session, user authentication
✓ **tribes** - Tribe lists, detail, invitations
✓ **posts** - Post lists (by tribe), detail
✓ **activities** - Tribe activity feeds, user activities
✓ **comments** - Comments by post
✓ **albums** - Tribe albums, album detail
✓ **media** - Media items with filters
✓ **preferences** - Tribe member preferences
✓ **profile** - Current user profile
✓ **security** - User sessions
✓ **events** - Tribe events, event detail, attendees
✓ **polls** - Event polls, poll detail
✓ **discover** - Discovery tribes, featured tribes

### Hierarchical Benefits

```typescript
// Invalidate all posts
queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })

// Invalidate posts for specific tribe
queryClient.invalidateQueries({ queryKey: queryKeys.posts.tribe(tribeId) })

// Invalidate specific post
queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })
```

### Filter Normalization Pattern

For queries with optional filters, normalize to prevent duplicate cache entries:

```typescript
// In query options
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

---

## Architecture Layer 2: Query Options

**Location:** `lib/query-options/` (14 modules)

Query options define reusable query configuration using the `queryOptions()` factory.

### Basic Pattern

```typescript
import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { fetchTribePosts } from '@/lib/api/posts'

export function tribePostsOptions(
  tribeId: string,
  options?: { limit?: number; offset?: number }
) {
  return queryOptions({
    queryKey: queryKeys.posts.tribe(tribeId),
    queryFn: () => fetchTribePosts({ tribeId, ...options }),
  })
}
```

### Why Query Options Matter

1. **Reusable across server and client:**
   ```typescript
   // Server Component (prefetch)
   await queryClient.prefetchQuery(tribePostsOptions(tribeId))

   // Client Component (hook)
   const { data } = useQuery(tribePostsOptions(tribeId))
   ```

2. **Type-safe query results:**
   ```typescript
   const posts = queryClient.getQueryData(tribePostsOptions(tribeId).queryKey)
   // posts is typed as PostWithStats[] automatically
   ```

3. **Centralized configuration:**
   - Change staleTime in one place
   - Update query logic once
   - Consistent error handling

### Advanced Patterns

#### Pattern: Dependent Queries (enabled)

Only run query when prerequisites are met:

```typescript
export function userTribesOptions() {
  return queryOptions({
    queryKey: queryKeys.tribes.lists(),
    queryFn: fetchUserTribes,
    // Can be overridden in hooks with `enabled` option
  })
}

// In hook
export function useUserTribes() {
  const { isAuthenticated } = useAuthUser()
  return useQuery({
    ...userTribesOptions(),
    enabled: isAuthenticated, // Only fetch if authenticated
  })
}
```

#### Pattern: Placeholder Data

Provide default values while fetching to prevent loading states:

```typescript
export function tribeMemberPreferencesOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.preferences.tribeMember(tribeId),
    queryFn: () => fetchTribeMemberPreferences(tribeId),
    placeholderData: {
      autoAddPostMediaToTribe: true // Show default while loading
    },
  })
}
```

#### Pattern: Custom Retry Logic

```typescript
export function authSessionOptions() {
  return queryOptions({
    queryKey: queryKeys.auth.session(),
    queryFn: fetchAuthSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on auth failures
      if (error.message.includes('Unauthorized')) return false
      return failureCount < 2
    },
  })
}
```

#### Pattern: Real-Time Refetch Interval

```typescript
export function userInvitationsOptions() {
  return queryOptions({
    queryKey: queryKeys.invitations.user(),
    queryFn: fetchUserInvitations,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  })
}
```

### Stale Time Strategy

| Resource Type | Stale Time | Reasoning |
|---------------|------------|-----------|
| Auth session/user | 5 minutes | Sensitive data, refetch on window focus |
| Invitations | 30s interval | Real-time notifications needed |
| Posts, comments, media | 1 minute (default) | Moderate change frequency |
| Tribe details | 1 minute (default) | Can change but not critical |
| Static data | 10+ minutes | Rarely changes |

---

## Architecture Layer 3: Custom Hooks

**Location:** `lib/hooks/use-*.ts` (17 files)

Custom hooks wrap query options for client-side usage and add mutation logic.

### Query Hooks (Read Operations)

Simple wrappers around query options:

```typescript
// lib/hooks/use-posts.ts
import { useQuery } from '@tanstack/react-query'
import { tribePostsOptions, postDetailOptions } from '@/lib/query-options/posts'

export function useTribePosts(
  tribeId: string,
  options?: { limit?: number; offset?: number }
) {
  return useQuery(tribePostsOptions(tribeId, options))
}

export function usePost(tribeId: string, postId: string) {
  return useQuery(postDetailOptions(tribeId, postId))
}
```

### Mutation Hooks (Write Operations)

Three invalidation strategies based on complexity:

#### Strategy 1: Simple Invalidation (Most Mutations)

For create/delete operations where cache should fully refresh:

```typescript
export function useCreateTribe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTribe,
    onSuccess: () => {
      // Invalidate all tribe-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.lists() })
    },
  })
}
```

**Use when:**
- Creating new resources (posts, tribes, albums)
- Deleting resources
- Updating data that affects multiple views

#### Strategy 2: Cascading Invalidation (Related Data)

Invalidate multiple related queries to keep UI in sync:

```typescript
export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateCommentParams) => createComment(params),
    onSuccess: (_, variables) => {
      // Invalidate the comments list
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.post(variables.postId),
      })

      // Also invalidate post detail to update comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      })
    },
  })
}
```

**Use when:**
- Mutation affects aggregate counts (comment count on post)
- Mutation creates activity feed items
- Mutation affects parent/child relationships

**Common cascades:**
- Create comment → invalidate comments + post detail
- Like post → invalidate post detail + activity feed (for milestones)
- Upload media → invalidate media list + albums list

#### Strategy 3: Full Optimistic Updates (Instant Feedback)

For reversible operations that need instant feedback:

```typescript
export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { tribeId: string; postId: string }) =>
      togglePostLike(params.tribeId, params.postId),

    // STEP 1: Optimistically update cache before server responds
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (prevent overwriting optimistic update)
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId)
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(variables.postId)
      })

      // Snapshot the previous values for rollback
      const previousPosts = queryClient.getQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId)
      )
      const previousPost = queryClient.getQueryData<PostWithStats>(
        queryKeys.posts.detail(variables.postId)
      )

      // Optimistically update the posts list
      queryClient.setQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId),
        (old) => {
          if (!old) return old
          return old.map((post) => {
            if (post.id === variables.postId) {
              return {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            }
            return post
          })
        }
      )

      // Optimistically update the post detail
      queryClient.setQueryData<PostWithStats>(
        queryKeys.posts.detail(variables.postId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            isLiked: !old.isLiked,
            likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
          }
        }
      )

      // Return context for rollback
      return { previousPosts, previousPost }
    },

    // STEP 2: Rollback on error
    onError: (err, variables, context) => {
      // Restore previous state
      if (context?.previousPosts) {
        queryClient.setQueryData(
          queryKeys.posts.tribe(variables.tribeId),
          context.previousPosts
        )
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          queryKeys.posts.detail(variables.postId),
          context.previousPost
        )
      }
    },

    // STEP 3: Refetch on success to sync with server
    onSuccess: (_, variables) => {
      // Invalidate to get fresh data (includes any server-side updates like milestones)
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      })

      // Also invalidate activities (like milestones at 10, 25, 50, 100)
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      })
    },
  })
}
```

**Use when:**
- Toggle operations (like/unlike, follow/unfollow)
- Simple boolean updates
- Operations that feel instant (user expects immediate feedback)

**Don't use for:**
- Create/delete operations (too risky to revert)
- Complex updates with validation
- Operations where server state is source of truth

**Currently used for:**
- `useLikePost()` - Post likes/unlikes
- `useLikeComment()` - Comment likes/unlikes

---

## Server-Side Prefetching Pattern

**Location:** `app/(protected)/*/page.tsx` files

All pages that need initial data use server-side prefetching to eliminate waterfalls.

### Basic Pattern

```typescript
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { tribePostsOptions, tribeDetailOptions } from '@/lib/query-options'

export default async function Page({ params, searchParams }: PageProps) {
  const { tribe_id } = await params
  const { limit = '20', offset = '0' } = await searchParams

  // Create a fresh query client (per-request isolation)
  const queryClient = new QueryClient()

  // Prefetch multiple queries IN PARALLEL
  await Promise.all([
    queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
    queryClient.prefetchQuery(tribePostsOptions(tribe_id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    })),
    queryClient.prefetchQuery(tribeMediaOptions(tribe_id, {
      type: 'image',
      limit: 4
    })),
  ])

  // Return with hydration boundary for SSR data reuse
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageComponent tribeId={tribe_id} />
    </HydrationBoundary>
  )
}
```

### Client Component Usage

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'
import { tribeDetailOptions } from '@/lib/query-options/tribes'

export function TribeInfoWidget({ tribeId }: { tribeId: string }) {
  // Uses prefetched data from server - NO loading state on initial render!
  const { data: tribe, isLoading, error, refetch } = useQuery(
    tribeDetailOptions(tribeId)
  )

  if (isLoading && !tribe) return <Skeleton />
  if (error) return <ErrorState onRetry={refetch} />

  return (
    <Card>
      <h2>{tribe.name}</h2>
      <p>{tribe.description}</p>
    </Card>
  )
}
```

### Benefits

1. **Zero Waterfalls:** `Promise.all()` fetches in parallel on server
2. **No Loading States:** Client receives prefetched data immediately
3. **SEO-Friendly:** Data rendered on server
4. **Type Safety:** Same query options used on server and client

### Current Prefetch Patterns

| Page | Prefetched Queries |
|------|-------------------|
| `/dashboard` | `userActivitiesOptions` |
| `/tribe/[tribe_id]` | `tribeDetailOptions`, `tribePostsOptions`, `tribeMediaOptions` |
| `/tribe/[tribe_id]/media` | `tribeDetailOptions`, `tribeAlbumsOptions`, `tribeMediaOptions` |
| `/tribe/[tribe_id]/post/[post_id]` | `postDetailOptions`, `postCommentsOptions` |
| `/discover` | `featuredTribesOptions`, `discoverTribesOptions` |

---

## API Client Architecture

**Location:** `lib/api/` (14 modules)

### Base Client

```typescript
// lib/api/client.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
  }

  get isUnauthorized() { return this.status === 401 }
  get isForbidden() { return this.status === 403 }
  get isNotFound() { return this.status === 404 }
  get isValidationError() { return this.status === 400 }
}

export async function apiFetch<TResponse>(
  url: string,
  options?: RequestInit
): Promise<TResponse> {
  try {
    const fullUrl = `${getBaseUrl()}${url}`
    const response = await fetch(fullUrl, options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.error || `API request failed with status ${response.status}`,
        response.status,
        error.code,
        error.details
      )
    }

    // Handle 204 No Content
    if (response.status === 204) return undefined as TResponse

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    console.error('Network request failed:', error)
    throw new ApiError('Network request failed', 0, 'NETWORK_ERROR')
  }
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value))
    }
  })
  return searchParams.toString() ? `?${searchParams.toString()}` : ''
}
```

### API Module Pattern

```typescript
// lib/api/posts.ts
import { apiFetch, buildQueryString } from './client'
import type { PostWithStats, CreatePostParams } from '@/lib/database/types'

const API_BASE = '/api/tribes'

export async function fetchTribePosts(
  params: { tribeId: string; limit?: number; offset?: number }
): Promise<PostWithStats[]> {
  const { tribeId, ...queryParams } = params
  const queryString = buildQueryString(queryParams)
  return apiFetch<PostWithStats[]>(`${API_BASE}/${tribeId}/posts${queryString}`)
}

export async function createPost(
  params: CreatePostParams
): Promise<PostWithAuthor> {
  const { tribeId, ...body } = params
  return apiFetch<PostWithAuthor>(
    `${API_BASE}/${tribeId}/posts`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
}

export async function togglePostLike(
  tribeId: string,
  postId: string
): Promise<{ isLiked: boolean }> {
  return apiFetch<{ isLiked: boolean }>(
    `${API_BASE}/${tribeId}/posts/${postId}/like`,
    { method: 'POST' }
  )
}
```

---

## Common Checklist: Adding New Feature

When implementing a new TanStack Query feature, follow this checklist:

### 1. Define Query Key
**File:** `lib/constants/query-keys.ts`

```typescript
export const queryKeys = {
  // ... existing keys
  myFeature: {
    all: ["myFeature"] as const,
    list: () => ["myFeature", "list"] as const,
    detail: (id: string) => ["myFeature", "detail", id] as const,
  },
}
```

- [ ] Use hierarchical naming: `feature.scope.detail`
- [ ] Include all filter/parameter variables in query key
- [ ] Use `as const` for type safety

### 2. Create API Functions
**File:** `lib/api/my-feature.ts`

```typescript
export async function fetchMyFeatureList(): Promise<MyFeature[]> {
  return apiFetch<MyFeature[]>('/api/my-features')
}

export async function createMyFeature(params: CreateParams): Promise<MyFeature> {
  return apiFetch<MyFeature>('/api/my-features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}
```

- [ ] Strong TypeScript types for params and return values
- [ ] Use `apiFetch` base client
- [ ] Use `buildQueryString` for GET params

### 3. Create Query Options
**File:** `lib/query-options/my-feature.ts`

```typescript
import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/lib/constants/query-keys'
import { fetchMyFeatureList } from '@/lib/api/my-feature'

export function myFeatureListOptions() {
  return queryOptions({
    queryKey: queryKeys.myFeature.list(),
    queryFn: fetchMyFeatureList,
    staleTime: 1000 * 60, // 1 minute (adjust as needed)
  })
}

export function myFeatureDetailOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.myFeature.detail(id),
    queryFn: () => fetchMyFeatureDetail(id),
  })
}
```

- [ ] Export function: `featureNameOptions(params)`
- [ ] Set appropriate `staleTime` based on data freshness needs
- [ ] Add JSDoc comment explaining the query

### 4. Create Custom Hooks
**File:** `lib/hooks/use-my-feature.ts`

```typescript
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myFeatureListOptions } from '@/lib/query-options/my-feature'
import { createMyFeature } from '@/lib/api/my-feature'
import { queryKeys } from '@/lib/constants/query-keys'

// Query hook
export function useMyFeatureList() {
  return useQuery(myFeatureListOptions())
}

// Mutation hook
export function useCreateMyFeature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMyFeature,
    onSuccess: () => {
      // Invalidate list query
      queryClient.invalidateQueries({
        queryKey: queryKeys.myFeature.list()
      })
    },
  })
}
```

- [ ] Mark with `'use client'` if needed
- [ ] Query hooks: Simple wrappers around options
- [ ] Mutation hooks: Include invalidation strategy
- [ ] Add JSDoc comments

### 5. Plan Invalidation Strategy
**Choose one:**

- [ ] **Simple:** Invalidate list + detail queries
- [ ] **Cascading:** Invalidate related queries (e.g., parent counts)
- [ ] **Optimistic:** Full optimistic update with rollback (only for toggles/likes)

### 6. Export from Index
**File:** `lib/hooks/index.ts`

```typescript
export * from './use-my-feature'
```

### 7. Document
- [ ] Add to this guide if pattern is new
- [ ] Update `CLAUDE.md` "Data Fetching with TanStack Query" section
- [ ] Add JSDoc comments in hook file

### 8. Test
- [ ] Query returns expected data structure
- [ ] Mutation invalidates correct queries
- [ ] If optimistic: Test with network failure (rollback works)
- [ ] If pagination: Test limit/offset behavior

---

## Anti-Patterns to Avoid

### ❌ Don't: Hardcode Query Keys

```typescript
// BAD
const { data } = useQuery({
  queryKey: ['posts', tribeId],
  queryFn: () => fetchPosts(tribeId),
})

// GOOD
const { data } = useQuery(tribePostsOptions(tribeId))
```

### ❌ Don't: Forget Invalidation in Mutations

```typescript
// BAD
export function useCreatePost() {
  return useMutation({
    mutationFn: createPost,
    // Missing onSuccess invalidation!
  })
}

// GOOD
export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId)
      })
    },
  })
}
```

### ❌ Don't: Over-Invalidate

```typescript
// BAD - Invalidates ALL posts across ALL tribes
queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })

// GOOD - Only invalidates posts for specific tribe
queryClient.invalidateQueries({
  queryKey: queryKeys.posts.tribe(tribeId)
})
```

### ❌ Don't: Complex Optimistic Updates

```typescript
// BAD - Too complex, too many failure modes
onMutate: async (variables) => {
  // Optimistically creating a new post with nested comments and media...
  // This is too complex and risky to rollback
}

// GOOD - Use simple invalidation instead
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.tribe(tribeId) })
}
```

### ❌ Don't: Mix Server/Client Query Clients

```typescript
// BAD - Reusing server query client on subsequent requests
let globalQueryClient = new QueryClient()

// GOOD - Fresh client per request on server, singleton on client
export function getQueryClient() {
  if (isServer) {
    return new QueryClient() // Fresh per request
  } else {
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient()
    }
    return browserQueryClient
  }
}
```

### ❌ Don't: Skip Filter Normalization

```typescript
// BAD - Can create duplicate cache entries
export function mediaOptions(tribeId: string, filters?: MediaFilters) {
  return queryOptions({
    queryKey: queryKeys.media.tribe(tribeId, filters), // filters might have undefined values
    queryFn: () => fetchMedia(tribeId, filters),
  })
}

// GOOD - Normalize filters
export function mediaOptions(tribeId: string, filters?: MediaFilters) {
  const filtersObject = filters
    ? Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined))
    : undefined

  return queryOptions({
    queryKey: queryKeys.media.tribe(tribeId, filtersObject),
    queryFn: () => fetchMedia(tribeId, filters),
  })
}
```

---

## Performance Tips

1. **Parallel Prefetching:** Always use `Promise.all()` for independent queries
   ```typescript
   await Promise.all([
     queryClient.prefetchQuery(option1),
     queryClient.prefetchQuery(option2),
   ])
   ```

2. **Smart Stale Times:** Set based on data change frequency
   - Fast-changing: 30s - 1min
   - Moderate: 3-5min
   - Slow-changing: 10min+

3. **Placeholder Data:** Prevent loading states for predictable defaults
   ```typescript
   placeholderData: { autoAddPostMediaToTribe: true }
   ```

4. **Dependent Queries:** Use `enabled` to prevent unnecessary fetches
   ```typescript
   enabled: !!userId && isAuthenticated
   ```

5. **Filter Normalization:** Prevent cache fragmentation from undefined values

6. **Optimistic Updates:** Only for simple, reversible operations (likes, toggles)

---

## Quick Reference

### File Organization

```
lib/
├── constants/
│   └── query-keys.ts              # Query key factory
├── query-options/                 # Query configuration (14 files)
│   ├── auth.ts
│   ├── tribes.ts
│   ├── posts.ts
│   ├── comments.ts
│   ├── media.ts
│   ├── albums.ts
│   ├── activities.ts
│   ├── events.ts
│   ├── preferences.ts
│   ├── profile.ts
│   ├── security.ts
│   ├── polls.ts
│   ├── discover.ts
│   └── index.ts
├── hooks/                         # Custom React hooks (17 files)
│   ├── use-posts.ts
│   ├── use-tribes.ts
│   ├── use-comments.ts
│   ├── use-media.ts
│   ├── use-albums.ts
│   ├── use-activities.ts
│   ├── use-events.ts
│   ├── use-auth.ts
│   ├── use-upload.ts
│   ├── use-preferences.ts
│   ├── use-polls.ts
│   ├── use-profile.ts
│   ├── use-security.ts
│   └── index.ts
└── api/                           # API client functions (14 files)
    ├── client.ts                  # Base client, ApiError
    ├── posts.ts
    ├── tribes.ts
    ├── comments.ts
    ├── media.ts
    └── [others].ts
```

### Mutation Invalidation Patterns

```typescript
// Simple: Invalidate list
queryClient.invalidateQueries({ queryKey: queryKeys.feature.list() })

// Cascade: Invalidate related
queryClient.invalidateQueries({ queryKey: queryKeys.comments.post(postId) })
queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })

// Optimistic: Full pattern
onMutate → snapshot → update
onError → rollback
onSuccess → invalidate
```

### Common Query Keys

```typescript
queryKeys.auth.session()
queryKeys.tribes.lists()
queryKeys.tribes.detail(tribeId)
queryKeys.posts.tribe(tribeId)
queryKeys.posts.detail(postId)
queryKeys.comments.post(postId)
queryKeys.media.tribe(tribeId, filters)
queryKeys.albums.tribe(tribeId)
queryKeys.activities.tribe(tribeId)
queryKeys.events.tribe(tribeId)
```

---

## Additional Resources

- TanStack Query Docs: https://tanstack.com/query/latest
- Project CLAUDE.md: See "Data Fetching with TanStack Query" section
- API Error Handling: See `lib/api/client.ts` `ApiError` class
- Type Definitions: See `lib/database/types.ts`
