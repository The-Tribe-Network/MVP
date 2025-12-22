import EventsPage from "@/app-pages/events"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function Page({ params, searchParams }: PageProps<'/tribe/[tribe_id]/events'>) {
  const { tribe_id } = await params
  const { limit: limitParam = '20', offset: offsetParam = '0' } = await searchParams;

  const queryClient = new QueryClient();

  // await Promise.all([
  //   queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
  //   queryClient.prefetchQuery(tribeAlbumsOptions(tribe_id)),
  //   queryClient.prefetchQuery(tribeMediaOptions(tribe_id, parsePaginationParams(limitParam, offsetParam))),
  // ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsPage tribeId={tribe_id} />
    </HydrationBoundary>
  )
}