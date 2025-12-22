# TanStack Query Development Command

This command provides task-specific guidance for TanStack Query implementation, including query options, custom hooks, mutations, and optimistic updates.

## When to Use This Command

Use this when:
- Adding new data fetching features to the app
- Creating queries, mutations, or query options
- Implementing optimistic updates for instant feedback
- Setting up query invalidation strategies
- Debugging query cache issues or stale data
- Optimizing query performance or reducing waterfalls
- Refactoring existing queries to follow project patterns

## Project Context

This project follows a **three-layer architecture**:

1. **Query Key Factory** (`lib/constants/query-keys.ts`)
   - Single source of truth for all query keys
   - Hierarchical structure: `domain.scope.detail`
   - Never hardcode query keys elsewhere

2. **Query Options** (`lib/query-options/`)
   - Reusable query configuration
   - Works in Server Components (prefetch) and Client Components (hooks)
   - Factory functions returning `queryOptions()`

3. **Custom Hooks** (`lib/hooks/use-*.ts`)
   - React hooks wrapping query options
   - Client-side only (`'use client'`)
   - Include mutation logic with invalidation strategies

**See `.claude/tanstack-query-guide.md` for comprehensive patterns and examples.**

---

## Common Tasks

### Task 1: Create a New Query Hook

**When:** Adding a new feature that fetches data from the server.

**Steps:**

1. **Add query key** to `lib/constants/query-keys.ts`:
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

2. **Create API function** in `lib/api/my-feature.ts`:
   ```typescript
   import { apiFetch } from './client'
   import type { MyFeature } from '@/lib/database/types'

   export async function fetchMyFeatureList(): Promise<MyFeature[]> {
     return apiFetch<MyFeature[]>('/api/my-features')
   }

   export async function fetchMyFeatureDetail(id: string): Promise<MyFeature> {
     return apiFetch<MyFeature>(`/api/my-features/${id}`)
   }
   ```

3. **Create query options** in `lib/query-options/my-feature.ts`:
   ```typescript
   import { queryOptions } from '@tanstack/react-query'
   import { queryKeys } from '@/lib/constants/query-keys'
   import { fetchMyFeatureList } from '@/lib/api/my-feature'

   export function myFeatureListOptions() {
     return queryOptions({
       queryKey: queryKeys.myFeature.list(),
       queryFn: fetchMyFeatureList,
       staleTime: 1000 * 60, // 1 minute
     })
   }
   ```

4. **Create custom hook** in `lib/hooks/use-my-feature.ts`:
   ```typescript
   'use client'
   import { useQuery } from '@tanstack/react-query'
   import { myFeatureListOptions } from '@/lib/query-options/my-feature'

   export function useMyFeatureList() {
     return useQuery(myFeatureListOptions())
   }
   ```

5. **Export hook** from `lib/hooks/index.ts`:
   ```typescript
   export * from './use-my-feature'
   ```

6. **Use in component**:
   ```typescript
   import { useMyFeatureList } from '@/lib/hooks'

   export function MyComponent() {
     const { data, isLoading, error } = useMyFeatureList()
     // ...
   }
   ```

**Checklist:**
- [ ] Query key added to factory
- [ ] API function created with TypeScript types
- [ ] Query options created
- [ ] Hook created and exported
- [ ] Appropriate staleTime set (default 1min, auth 5min, real-time 30s)

---

### Task 2: Create a Mutation Hook (Simple Invalidation)

**When:** Adding create/update/delete operations that should refresh the cache.

**Steps:**

1. **Create API function** in `lib/api/my-feature.ts`:
   ```typescript
   export interface CreateMyFeatureParams {
     name: string
     description: string
   }

   export async function createMyFeature(
     params: CreateMyFeatureParams
   ): Promise<MyFeature> {
     return apiFetch<MyFeature>('/api/my-features', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(params),
     })
   }
   ```

2. **Add mutation hook** in `lib/hooks/use-my-feature.ts`:
   ```typescript
   import { useMutation, useQueryClient } from '@tanstack/react-query'
   import { createMyFeature } from '@/lib/api/my-feature'

   export function useCreateMyFeature() {
     const queryClient = useQueryClient()

     return useMutation({
       mutationFn: createMyFeature,
       onSuccess: () => {
         // Invalidate the list query to refetch
         queryClient.invalidateQueries({
           queryKey: queryKeys.myFeature.list()
         })
       },
     })
   }
   ```

3. **Use in component**:
   ```typescript
   const createMutation = useCreateMyFeature()

   const handleCreate = async () => {
     try {
       await createMutation.mutateAsync({
         name: 'New Feature',
         description: 'Description'
       })
       toast.success('Created successfully')
     } catch (error) {
       toast.error('Failed to create')
     }
   }
   ```

**Checklist:**
- [ ] API function created with strong types
- [ ] Mutation hook created with `useMutation`
- [ ] `onSuccess` invalidates related queries
- [ ] Error handling in component

---

### Task 3: Implement Cascading Invalidation

**When:** A mutation affects multiple related queries (e.g., creating a comment updates both comments list and post's comment count).

**Example Pattern:**

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

      // ALSO invalidate post detail to update comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      })

      // Optionally invalidate activity feed if comments create activities
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      })
    },
  })
}
```

**Common Cascade Patterns:**

| Mutation | Invalidate |
|----------|------------|
| Create comment | `comments.post(postId)` + `posts.detail(postId)` |
| Like post | `posts.detail(postId)` + `activities.tribe(tribeId)` (for milestones) |
| Upload media | `media.tribe(tribeId)` + `albums.tribe(tribeId)` |
| Delete post | `posts.tribe(tribeId)` + `activities.tribe(tribeId)` |
| Join tribe | `tribes.detail(tribeId)` + `tribes.lists()` |

**Checklist:**
- [ ] Identify all affected queries
- [ ] Invalidate direct query (e.g., comments list)
- [ ] Invalidate parent query (e.g., post detail for count)
- [ ] Invalidate activity feed if mutation creates milestones

---

### Task 4: Implement Optimistic Updates (Advanced)

**When:** Toggle operations (like/unlike) that need instant feedback.

**WARNING:** Only use for simple, reversible operations. Avoid for create/delete.

**Full Pattern:**

```typescript
export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { tribeId: string; postId: string }) =>
      togglePostLike(params.tribeId, params.postId),

    // STEP 1: Optimistically update cache
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId)
      })
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(variables.postId)
      })

      // Snapshot previous data
      const previousPosts = queryClient.getQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId)
      )
      const previousPost = queryClient.getQueryData<PostWithStats>(
        queryKeys.posts.detail(variables.postId)
      )

      // Optimistically update cache
      queryClient.setQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId),
        (old) => {
          if (!old) return old
          return old.map((post) =>
            post.id === variables.postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                }
              : post
          )
        }
      )

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

    // STEP 3: Refetch on success
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      })
    },
  })
}
```

**Checklist:**
- [ ] `onMutate`: Cancel queries + snapshot + update cache
- [ ] `onError`: Rollback to snapshot
- [ ] `onSuccess`: Invalidate for server sync
- [ ] Test with network failure (simulated offline mode)
- [ ] Ensure all affected cache entries are updated

---

### Task 5: Add Server-Side Prefetching

**When:** Creating a new page that needs initial data without loading states.

**Steps:**

1. **In page component** (`app/(protected)/*/page.tsx`):
   ```typescript
   import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
   import { myFeatureListOptions } from '@/lib/query-options/my-feature'

   export default async function Page({ params }: PageProps) {
     const queryClient = new QueryClient()

     // Prefetch queries in parallel
     await Promise.all([
       queryClient.prefetchQuery(myFeatureListOptions()),
       queryClient.prefetchQuery(myFeatureDetailOptions(params.id)),
     ])

     return (
       <HydrationBoundary state={dehydrate(queryClient)}>
         <MyPageComponent id={params.id} />
       </HydrationBoundary>
     )
   }
   ```

2. **In client component** (`app-pages/my-page/index.tsx`):
   ```typescript
   'use client'
   import { useQuery } from '@tanstack/react-query'
   import { myFeatureListOptions } from '@/lib/query-options/my-feature'

   export function MyPageComponent({ id }: { id: string }) {
     // Uses prefetched data - NO loading state on first render!
     const { data, error } = useQuery(myFeatureListOptions())

     if (error) return <ErrorState />
     if (!data) return null // Should never happen with prefetch

     return <div>{/* Render with data */}</div>
   }
   ```

**Benefits:**
- Zero waterfalls (parallel prefetch on server)
- No loading skeletons needed
- SEO-friendly (data rendered on server)
- Instant hydration on client

**Checklist:**
- [ ] Page prefetches queries with `Promise.all()`
- [ ] Wrapped with `<HydrationBoundary>`
- [ ] Client component uses same query options
- [ ] No loading state needed for prefetched data

---

### Task 6: Handle Filters and Pagination

**When:** Query needs dynamic filters or pagination parameters.

**Pattern:**

1. **Normalize filters** to prevent cache fragmentation:
   ```typescript
   export function myFeatureListOptions(filters?: MyFilters) {
     // Remove undefined values
     const filtersObject = filters
       ? Object.fromEntries(
           Object.entries(filters).filter(([_, v]) => v !== undefined)
         )
       : undefined

     return queryOptions({
       queryKey: queryKeys.myFeature.list(filtersObject),
       queryFn: () => fetchMyFeatures(filters),
     })
   }
   ```

2. **Include filters in query key**:
   ```typescript
   export const queryKeys = {
     myFeature: {
       list: (filters?: Record<string, unknown>) =>
         ["myFeature", "list", filters] as const,
     },
   }
   ```

3. **Build query string** in API function:
   ```typescript
   import { buildQueryString } from './client'

   export async function fetchMyFeatures(filters?: MyFilters): Promise<MyFeature[]> {
     const queryString = buildQueryString(filters ?? {})
     return apiFetch<MyFeature[]>(`/api/my-features${queryString}`)
   }
   ```

**Checklist:**
- [ ] Filters normalized (undefined values removed)
- [ ] Filters included in query key
- [ ] API uses `buildQueryString()` helper
- [ ] Different filter values create separate cache entries

---

### Task 7: Debug Stale Data or Cache Issues

**Common Issues:**

1. **Data not updating after mutation:**
   - Check if `onSuccess` invalidates correct queries
   - Verify query keys match between query and invalidation
   - Use React Query DevTools to inspect cache

2. **Multiple cache entries for same data:**
   - Check filter normalization (undefined values)
   - Ensure query key parameters are consistent
   - Verify object keys are in same order

3. **Loading state shown despite prefetch:**
   - Check if server prefetch succeeded (no errors)
   - Verify `HydrationBoundary` wraps component
   - Ensure query keys match between server and client

4. **Data refetching too often:**
   - Increase `staleTime` in query options
   - Check if `refetchOnWindowFocus` is needed
   - Use `gcTime` to keep data in cache longer

**Debugging Tools:**

- **React Query DevTools:** `<ReactQueryDevtools />` (already in `QueryProvider`)
- **Check cache:** `queryClient.getQueryData(queryKeys.feature.detail(id))`
- **Inspect queries:** DevTools shows all active queries and their state
- **Network tab:** Verify actual API calls match expectations

**Checklist:**
- [ ] React Query DevTools installed and visible
- [ ] Query keys consistent across queries/invalidations
- [ ] Filters normalized (no undefined values)
- [ ] StaleTime appropriate for data change frequency

---

## Decision Tree: Which Invalidation Strategy?

```
Is this a toggle/like operation?
│
├─ YES → Use Optimistic Updates (Task 4)
│         - onMutate: update cache
│         - onError: rollback
│         - onSuccess: invalidate
│
└─ NO → Does mutation affect related queries?
        │
        ├─ YES → Use Cascading Invalidation (Task 3)
        │         - Invalidate direct query
        │         - Invalidate parent/related queries
        │
        └─ NO → Use Simple Invalidation (Task 2)
                  - Invalidate only affected query
```

---

## Quick Reference: Common Patterns

### Pattern: Dependent Queries
```typescript
export function useMyFeature() {
  const { isAuthenticated } = useAuthUser()
  return useQuery({
    ...myFeatureOptions(),
    enabled: isAuthenticated, // Only fetch if authenticated
  })
}
```

### Pattern: Placeholder Data
```typescript
export function myPreferencesOptions() {
  return queryOptions({
    queryKey: queryKeys.preferences.current(),
    queryFn: fetchPreferences,
    placeholderData: { theme: 'light' }, // Show default while loading
  })
}
```

### Pattern: Real-Time Refetch
```typescript
export function notificationsOptions() {
  return queryOptions({
    queryKey: queryKeys.notifications.list(),
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}
```

### Pattern: Custom Retry Logic
```typescript
retry: (failureCount: number, error: Error) => {
  // Don't retry auth failures
  if (error.message.includes('Unauthorized')) return false
  return failureCount < 2
}
```

---

## Tips for AI Assistants

When implementing TanStack Query features:

1. **Always check existing patterns first:**
   - Review similar features in `lib/hooks/`
   - Use same conventions and naming
   - Follow existing invalidation strategies

2. **Be explicit about invalidation:**
   - Document which queries are invalidated and why
   - Consider cascading effects (comment count, activity feed)
   - Test that invalidation actually refreshes UI

3. **Type safety is critical:**
   - All API functions strongly typed
   - Query return types inferred from API functions
   - Mutation parameters use dedicated interfaces

4. **Performance matters:**
   - Use `Promise.all()` for parallel queries
   - Set appropriate `staleTime` based on data frequency
   - Normalize filters to prevent cache fragmentation

5. **Document in code:**
   - Add JSDoc comments to hooks
   - Explain invalidation strategy in comments
   - Reference related queries/mutations

---

## Files to Reference

- **Patterns:** `.claude/tanstack-query-guide.md` (comprehensive reference)
- **Query Keys:** `lib/constants/query-keys.ts`
- **Example Hooks:** `lib/hooks/use-posts.ts` (has optimistic updates)
- **Example Options:** `lib/query-options/posts.ts`
- **API Client:** `lib/api/client.ts` (base fetch + error handling)
- **Types:** `lib/database/types.ts`

---

## Related Commands

- See `CLAUDE.md` for overall project architecture
- See `docs/PERFORMANCE_OPTIMIZATIONS.md` for database query patterns
- See `lib/providers/query-provider.tsx` for query client configuration
