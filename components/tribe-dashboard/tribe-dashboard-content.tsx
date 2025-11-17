"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import TribeInfoWidget, { mockTribeInfoWidgetData } from "@/components/dashboard-widgets/info";
import AlbumsWidget, { mockAlbumsWidgetData } from "@/components/dashboard-widgets/albums";
import EventsWidget, { eventsWidgetMockData } from "@/components/dashboard-widgets/events";
import TrendingWidget, { trendingWidgetMockData } from "@/components/dashboard-widgets/trending";
import TimelineWidget, { mockTimelineData } from "@/components/dashboard-widgets/timeline";
import { useTribe } from "@/lib/hooks/use-tribes";

interface TribeDashboardContentProps {
  tribeId: string;
  dehydratedState?: DehydratedState;
}

export function TribeDashboardContent({
  tribeId,
  dehydratedState,
}: TribeDashboardContentProps) {
  // This hook will use the prefetched data from the server if available
  const { data: tribeData, isLoading } = useTribe(tribeId);

  // Use prefetched data or fallback to mock data
  const tribeInfo = tribeData
    ? {
        tribeName: tribeData.name,
        tribeDescription: tribeData.description || "",
        tribeMembers: tribeData.memberCount,
        ...(tribeData.avatar && { tribeAvatar: tribeData.avatar }),
      }
    : mockTribeInfoWidgetData;

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Tribe Info */}
            <div className="lg:col-span-3 hidden lg:block">
              <div className="space-y-6 sticky top-6">
                {isLoading ? (
                  <div>Loading tribe info...</div>
                ) : (
                  <TribeInfoWidget {...tribeInfo} />
                )}
                <AlbumsWidget photoAlbum={mockAlbumsWidgetData} />
              </div>
            </div>

            {/* Middle Column - Timeline */}
            <div className="lg:col-span-6">
              <TimelineWidget initialPosts={mockTimelineData} />
            </div>

            {/* Right Column - Trends & Events */}
            <div className="lg:col-span-3 space-y-6">
              <TrendingWidget trends={trendingWidgetMockData} />
              <EventsWidget events={eventsWidgetMockData} />
            </div>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
}

