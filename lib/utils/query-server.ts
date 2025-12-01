import { QueryClient, type QueryKey } from "@tanstack/react-query";
import { dehydrate, type DehydratedState } from "@tanstack/react-query";

/**
 * Creates a new QueryClient instance for server-side use.
 * This should be called per request, not shared across requests.
 */
export function getQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Prefetches a query on the server with initial data.
 * This uses `setQueryData` to store the initial data in the cache,
 * which is the recommended way to pass initial data to TanStack Query.
 *
 * @param queryClient - The QueryClient instance
 * @param queryKey - The query key
 * @param initialData - The initial data to set in the cache
 */
export function prefetchQuery<TData = unknown>({
  queryClient,
  queryKey,
  initialData,
}: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  initialData: TData;
}): void {
  // Use setQueryData to store initial data in the cache
  // This is the recommended way to pass initial data to queries
  queryClient.setQueryData(queryKey, initialData);
}

/**
 * Dehydrates the QueryClient state for client-side hydration.
 * This serializes the query cache so it can be passed to the client.
 *
 * @param queryClient - The QueryClient instance to dehydrate
 * @returns The dehydrated state that can be passed to HydrationBoundary
 */
export function dehydrateQueryClient(
  queryClient: QueryClient
): DehydratedState {
  return dehydrate(queryClient);
}



