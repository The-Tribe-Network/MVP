import { Suspense } from "react";
import SurveyPageContent from "@/app-pages/marketing/survey";

export const metadata = {
  title: "Waitlist Survey | Tribe",
  description: "Help us build the perfect community platform for you",
};

export default function SurveyPage() {
  return (
    <Suspense fallback={<SurveyLoading />}>
      <SurveyPageContent />
    </Suspense>
  );
}

function SurveyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading survey...</div>
    </div>
  );
}
