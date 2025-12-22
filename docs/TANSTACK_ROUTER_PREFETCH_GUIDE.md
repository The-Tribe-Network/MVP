# TanStack Router Query Prefetching Guide

This guide covers all the different ways to prefetch queries with TanStack Router.

## 1. Route Loaders (Recommended)

Route loaders are the primary way to prefetch data in TanStack Router. They run before the route component renders.

### Basic Loader with Query Prefetching

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useQuery } from '@tanstack/react-query'

// Define your query options
const tribeQueryOptions = (tribeId: string) => queryOptions({
  queryKey: ['tribes', tribeId],
  queryFn: () => fetchTribeById(tribeId),
})

// Create route with loader
export const Route = createFileRoute('/tribe/$tribe_id')({
  // Loader runs on server/client before component renders
  loader: async ({ context, params }) => {
    const { queryClient } = context
    
    // Prefetch the query
    await queryClient.prefetchQuery(
      tribeQueryOptions(params.tribe_id)
    )
    
    // You can also return data directly
    return {
      tribeId: params.tribe_id,
    }
  },
  
  component: TribePage,
})

// Component can use the prefetched data
function TribePage() {
  const { tribe_id } = Route.useParams()
  const { data } = useQuery(tribeQueryOptions(tribe_id))
  
  return <div>{data?.name}</div>
}
```

### Loader with Multiple Queries

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    
    // Prefetch multiple queries in parallel
    await Promise.all([
      queryClient.prefetchQuery(tribeQueryOptions(params.tribe_id)),
      queryClient.prefetchQuery(postsQueryOptions(params.tribe_id)),
      queryClient.prefetchQuery(membersQueryOptions(params.tribe_id)),
    ])
  },
  
  component: TribePage,
})
```

### Loader with Error Handling

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    
    try {
      await queryClient.prefetchQuery(
        tribeQueryOptions(params.tribe_id)
      )
    } catch (error) {
      // Handle errors - router will catch and show error boundary
      throw error
    }
  },
  
  errorComponent: ({ error }) => <div>Error: {error.message}</div>,
  
  component: TribePage,
})
```

## 2. Before Load Hook

The `beforeLoad` hook runs even earlier than loaders and is useful for authentication checks and conditional prefetching.

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  beforeLoad: async ({ context, params }) => {
    // Check authentication first
    const user = await context.auth.getUser()
    if (!user) {
      throw redirect({ to: '/sign-in' })
    }
    
    // Prefetch user-specific data
    await context.queryClient.prefetchQuery(
      userPermissionsQueryOptions(user.id)
    )
  },
  
  loader: async ({ context, params }) => {
    // Loader can use data from beforeLoad
    await context.queryClient.prefetchQuery(
      tribeQueryOptions(params.tribe_id)
    )
  },
  
  component: TribePage,
})
```

## 3. Client-Side Prefetching with Links

TanStack Router automatically prefetches routes when you hover over or focus on links.

### Automatic Prefetching

```typescript
import { Link } from '@tanstack/react-router'

// Automatically prefetches on hover/focus
<Link to="/tribe/$tribe_id" params={{ tribe_id: '123' }}>
  View Tribe
</Link>
```

### Manual Prefetching

```typescript
import { useRouter } from '@tanstack/react-router'

function MyComponent() {
  const router = useRouter()
  
  const handleMouseEnter = () => {
    // Manually prefetch a route
    router.preloadRoute({
      to: '/tribe/$tribe_id',
      params: { tribe_id: '123' },
    })
  }
  
  return (
    <Link
      to="/tribe/$tribe_id"
      params={{ tribe_id: '123' }}
      onMouseEnter={handleMouseEnter}
    >
      View Tribe
    </Link>
  )
}
```

### Prefetching with Query Data

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

function MyComponent() {
  const queryClient = useQueryClient()
  const router = useRouter()
  
  const handleClick = async () => {
    // Prefetch query data before navigation
    await queryClient.prefetchQuery(
      tribeQueryOptions('123')
    )
    
    // Then navigate
    router.navigate({
      to: '/tribe/$tribe_id',
      params: { tribe_id: '123' },
    })
  }
  
  return <button onClick={handleClick}>Go to Tribe</button>
}
```

## 4. Programmatic Prefetching

You can prefetch queries programmatically anywhere in your app.

### Using QueryClient Directly

```typescript
import { useQueryClient } from '@tanstack/react-query'

function MyComponent() {
  const queryClient = useQueryClient()
  
  const prefetchTribe = async (tribeId: string) => {
    await queryClient.prefetchQuery(
      tribeQueryOptions(tribeId)
    )
  }
  
  return (
    <div>
      <button onClick={() => prefetchTribe('123')}>
        Prefetch Tribe 123
      </button>
    </div>
  )
}
```

### Prefetching in useEffect

```typescript
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

function MyComponent({ tribeId }: { tribeId: string }) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Prefetch when component mounts or tribeId changes
    queryClient.prefetchQuery(tribeQueryOptions(tribeId))
  }, [tribeId, queryClient])
  
  return <div>...</div>
}
```

## 5. SSR/SSG Prefetching

For server-side rendering, you can prefetch in your server entry point.

### Server-Side Prefetching

```typescript
// app.tsx or server entry
import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

async function renderApp(url: string) {
  const queryClient = new QueryClient()
  const router = createRouter({ routeTree })
  
  // Prefetch queries on server
  await router.load({
    pathname: url,
    search: {},
  })
  
  // The loader will run and prefetch queries
  // Then dehydrate for client hydration
  const dehydratedState = dehydrate(queryClient)
  
  return {
    html: renderToString(<App router={router} queryClient={queryClient} />),
    dehydratedState,
  }
}
```

## 6. Using `ensureQueryData` vs `prefetchQuery`

TanStack Query provides two similar methods:

### `prefetchQuery` - Always fetches
```typescript
// Always makes a network request (unless data is fresh)
await queryClient.prefetchQuery(tribeQueryOptions(tribeId))
```

### `ensureQueryData` - Only fetches if needed
```typescript
// Only fetches if data is stale or missing
await queryClient.ensureQueryData(tribeQueryOptions(tribeId))
```

### Example in Loader

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    
    // Use ensureQueryData if you want to avoid unnecessary refetches
    await queryClient.ensureQueryData(
      tribeQueryOptions(params.tribe_id)
    )
  },
  
  component: TribePage,
})
```

## 7. Prefetching with Search Params

You can prefetch queries based on search parameters.

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    filter: z.string().optional(),
  }),
  
  loader: async ({ context, params, search }) => {
    const { queryClient } = context
    
    // Prefetch with search params
    await queryClient.prefetchQuery({
      queryKey: ['tribes', params.tribe_id, 'posts', search],
      queryFn: () => fetchPosts(params.tribe_id, search),
    })
  },
  
  component: TribePage,
})
```

## 8. Conditional Prefetching

You can conditionally prefetch based on route context or params.

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    const user = await context.auth.getUser()
    
    // Only prefetch if user has permission
    if (user?.canViewTribe) {
      await queryClient.prefetchQuery(
        tribeQueryOptions(params.tribe_id)
      )
    }
    
    // Prefetch different data based on user role
    if (user?.role === 'admin') {
      await queryClient.prefetchQuery(
        adminDataQueryOptions(params.tribe_id)
      )
    }
  },
  
  component: TribePage,
})
```

## 9. Prefetching Related Data

Prefetch related data that might be needed soon.

```typescript
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    const { queryClient } = context
    
    // Prefetch main data
    const tribe = await queryClient.fetchQuery(
      tribeQueryOptions(params.tribe_id)
    )
    
    // Prefetch related data based on main data
    if (tribe.hasPosts) {
      await queryClient.prefetchQuery(
        postsQueryOptions(params.tribe_id)
      )
    }
    
    if (tribe.hasEvents) {
      await queryClient.prefetchQuery(
        eventsQueryOptions(params.tribe_id)
      )
    }
  },
  
  component: TribePage,
})
```

## 10. Using `queryOptions` Helper

The `queryOptions` helper is recommended for type-safe query definitions.

```typescript
import { queryOptions } from '@tanstack/react-query'

// Define query options once
const tribeQueryOptions = (tribeId: string) => queryOptions({
  queryKey: ['tribes', tribeId],
  queryFn: async () => {
    const response = await fetch(`/api/tribes/${tribeId}`)
    if (!response.ok) throw new Error('Failed to fetch')
    return response.json()
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})

// Use in loader
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      tribeQueryOptions(params.tribe_id)
    )
  },
  
  component: TribePage,
})

// Use in component
function TribePage() {
  const { tribe_id } = Route.useParams()
  const { data, isLoading } = useQuery(tribeQueryOptions(tribe_id))
  
  if (isLoading) return <div>Loading...</div>
  return <div>{data.name}</div>
}
```

## Best Practices

1. **Use Loaders for Route-Level Data**: Prefetch data that the route component needs
2. **Use `queryOptions` Helper**: For type safety and reusability
3. **Prefetch in Parallel**: Use `Promise.all()` for multiple independent queries
4. **Handle Errors**: Always handle errors in loaders
5. **Use `ensureQueryData` for Conditional Prefetching**: Avoid unnecessary refetches
6. **Leverage Automatic Link Prefetching**: TanStack Router handles this automatically
7. **Prefetch Related Data**: If you know users will likely need related data, prefetch it
8. **Consider Stale Time**: Set appropriate `staleTime` to avoid unnecessary refetches

## Comparison with Your Current Next.js Setup

Your current Next.js setup uses:
- Server Components to fetch data
- `setQueryData` to populate TanStack Query cache
- `dehydrate` to pass state to client

With TanStack Router, you would:
- Use loaders instead of Server Components
- Use `prefetchQuery` instead of `setQueryData`
- Still use `dehydrate` for SSR
- Get automatic prefetching on link hover/focus

## Migration Example

**Current (Next.js):**
```typescript
// app/tribe/[tribe_id]/page.tsx
export default async function TribePage({ params }) {
  const tribeData = await getTribeById(params.tribe_id)
  const queryClient = getQueryClient()
  
  queryClient.setQueryData(['tribes', params.tribe_id], tribeData)
  const dehydratedState = dehydrate(queryClient)
  
  return <TribeContent dehydratedState={dehydratedState} />
}
```

**With TanStack Router:**
```typescript
// routes/tribe.$tribe_id.tsx
export const Route = createFileRoute('/tribe/$tribe_id')({
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ['tribes', params.tribe_id],
      queryFn: () => getTribeById(params.tribe_id),
    })
  },
  
  component: TribePage,
})

function TribePage() {
  const { tribe_id } = Route.useParams()
  const { data } = useQuery({
    queryKey: ['tribes', tribe_id],
    queryFn: () => getTribeById(tribe_id),
  })
  
  return <TribeContent tribe={data} />
}
```

