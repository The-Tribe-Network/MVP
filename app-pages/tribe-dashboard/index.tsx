'use client'

import {
  MediaWidget,
  EventsWidget,
  TrendingWidget,
  TimelineWidget,
  SidebarInfoWidget,
  trendingWidgetMockData
} from "@/app-pages/tribe-dashboard/components/widgets";
import { TribeHeader } from "./components/tribe-header";
import { ScrollableSidebar } from "./components/scrollable-sidebar";

interface TribeDashboardPageProps {
  tribeId: string;
}

export function TribeDashboardPage({
  tribeId,
}: TribeDashboardPageProps) {
  return (
    <div className="min-h-screen bg-background -mx-4 -mt-6 md:mx-0 md:mt-0">
      {/* Header with banner, avatar, name, and actions */}
      <TribeHeader tribeId={tribeId} />

      {/* Main content area */}
      <div className="max-w-7xl mx-auto md:px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left/Main Column - Timeline */}
          <main className="lg:col-span-8">
            <TimelineWidget tribeId={tribeId} />
          </main>

          {/* Right Column - Scrollable Sidebar */}
          <ScrollableSidebar className="lg:col-span-4">
            <SidebarInfoWidget tribeId={tribeId} />
            <EventsWidget tribeId={tribeId} />
            <MediaWidget tribeId={tribeId} />
            <TrendingWidget trends={trendingWidgetMockData} />
          </ScrollableSidebar>
        </div>
      </div>
    </div>
  );
}
