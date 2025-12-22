import {
  TribeInfoWidget,
  MediaWidget,
  EventsWidget,
  TrendingWidget,
  TimelineWidget,
  trendingWidgetMockData
} from "@/app-pages/tribe-dashboard/components/widgets";
import { TribeDashboardStoreProvider } from "@/app-pages/tribe-dashboard/components/store-provider";
import { TribeDashboardDialogContainer } from "@/app-pages/tribe-dashboard/components/dialogs/dialog-container";

interface TribeDashboardPageProps {
  tribeId: string;
}

export function TribeDashboardPage({
  tribeId,
}: TribeDashboardPageProps) {

  return (
    <TribeDashboardStoreProvider>
      <div className="h-full bg-background">
        <div className="mb-8 pt-6 hidden lg:block">
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
              <EventsWidget events={[]} tribeId={tribeId} />
            </div>
          </div>
        </div>
      </div>
      <TribeDashboardDialogContainer />
    </TribeDashboardStoreProvider>
  );
}
