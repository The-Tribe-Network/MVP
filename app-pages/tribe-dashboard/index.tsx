"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import TribeInfoWidget from "@/app-pages/tribe-dashboard/info";
import MediaWidget from "@/app-pages/tribe-dashboard/media";
import EventsWidget, { eventsWidgetMockData } from "@/app-pages/tribe-dashboard/events";
import TrendingWidget, { trendingWidgetMockData } from "@/app-pages/tribe-dashboard/trending";
import TimelineWidget from "@/app-pages/tribe-dashboard/timeline";
import { useTribe } from "@/lib/hooks/use-tribes";
import type { TribeWithMembers } from "@/lib/database/types";
import { capitalize } from "@/lib/utils";

interface TribeDashboardContentProps {
  tribeId: string;
  dehydratedState?: DehydratedState;
  initialTribeData?: TribeWithMembers;
}

export function TribeDashboardContent({
  tribeId,
  dehydratedState,
  initialTribeData,
}: TribeDashboardContentProps) {
  // This hook will use the prefetched data from the server if available
  const { data: tribeData, isLoading } = useTribe(tribeId);

  // Use prefetched data or fallback to fetched data
  const tribeInfo = tribeData || initialTribeData;
  const capitalizedTribeName = capitalize(tribeInfo?.name || '');

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="h-full bg-background">
        <div className="mb-8 pt-6 hidden lg:block">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Tribe Info */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="space-y-6 sticky top-6">
              {isLoading && !tribeInfo ? (
                <div>Loading tribe info...</div>
              ) : tribeInfo ? (
                <TribeInfoWidget
                  tribeId={tribeId}
                  tribeName={tribeInfo.name}
                  tribeDescription={tribeInfo.description || ""}
                  tribeMembers={tribeInfo.memberCount}
                  {...(tribeInfo.avatar && { tribeAvatar: tribeInfo.avatar })}
                  tribeLocation={tribeInfo.location}
                />
              ) : null}
              <MediaWidget tribeId={tribeId} />
            </div>
          </div>

          {/* Middle Column - Timeline */}
          <div className="lg:col-span-6 pt-6 lg:pt-0">
            <TimelineWidget tribeId={tribeId} />
          </div>

          {/* Right Column - Trends & Events */}
          <div className="lg:col-span-3 space-y-6 sticky top-6 lg:block hidden">
            <TrendingWidget trends={trendingWidgetMockData} />
            <EventsWidget events={eventsWidgetMockData} tribeId={tribeData?.id || ''} />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
}



