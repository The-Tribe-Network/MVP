'use client'

import { useQuery } from "@tanstack/react-query";
import { tribeDetailOptions } from "@/lib/query-options";
import {
  TribeInfoWidget,
  MediaWidget,
  EventsWidget,
  TrendingWidget,
  TimelineWidget,
  trendingWidgetMockData
} from "@/app-pages/tribe-dashboard/components/widgets";
import { TribeBanner, TribeBannerSkeleton } from "./components/tribe-banner";

interface TribeDashboardPageProps {
  tribeId: string;
}

export function TribeDashboardPage({
  tribeId,
}: TribeDashboardPageProps) {
  const { data: tribe, isLoading } = useQuery(tribeDetailOptions(tribeId));

  return (
    <div className="h-full bg-background">
      {/* Banner - spans full width */}
      <div className="mb-6">
        {isLoading ? (
          <TribeBannerSkeleton />
        ) : tribe ? (
          <TribeBanner
            bannerUrl={tribe.banner}
            tribeName={tribe.name}
          />
        ) : null}
      </div>

      <div className="mb-8 hidden lg:block">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Tribe Info */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="space-y-6 sticky top-[72px]">
            <TribeInfoWidget tribeId={tribeId} />
            <MediaWidget tribeId={tribeId} />
          </div>
        </div>

        {/* Middle Column - Timeline */}
        <div className="lg:col-span-6 pt-6 lg:pt-0">
          <TimelineWidget tribeId={tribeId} />
        </div>

        {/* Right Column - Trends & Events */}
        <div className="lg:col-span-3 lg:block hidden">
          <div className="space-y-6 sticky top-[72px]">
            <TrendingWidget trends={trendingWidgetMockData} />
            <EventsWidget tribeId={tribeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
