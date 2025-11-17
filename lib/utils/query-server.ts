import { QueryClient, type QueryKey, type QueryFunction } from "@tanstack/react-query";
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
 * This will populate the query cache with the provided data.
 *
 * @param queryClient - The QueryClient instance
 * @param queryKey - The query key
 * @param queryFn - The query function (optional if using initialData)
 * @param initialData - The initial data to set in the cache
 */
export async function prefetchQuery<TData = unknown>({
  queryClient,
  queryKey,
  queryFn,
  initialData,
}: {
  queryClient: QueryClient;
  queryKey: QueryKey;
  queryFn?: QueryFunction<TData>;
  initialData?: TData;
}): Promise<void> {
  if (initialData !== undefined) {
    // Set the query data directly in the cache
    queryClient.setQueryData(queryKey, initialData);
  } else if (queryFn) {
    // Prefetch the query using the query function
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  } else {
    throw new Error("Either initialData or queryFn must be provided");
  }
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

