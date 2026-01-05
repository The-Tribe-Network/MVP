"use client";

import { useSearchParams } from "next/navigation";
import { SectionContainer } from "@/components/marketing/section-container";
import { SurveyForm } from "./components/survey-form";
import { ClipboardList, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SurveyPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    return (
      <SectionContainer className="pt-32 md:pt-40 pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid Survey Link</AlertTitle>
            <AlertDescription>
              This survey link is invalid or missing the required email parameter.
              Please sign up for the waitlist first to receive a valid survey link.
            </AlertDescription>
          </Alert>
          <Link href="/waitlist">
            <Button>Join the Waitlist</Button>
          </Link>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer className="pt-32 md:pt-40 pb-24 md:pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Help Us Build <span className="text-primary">Tribe</span> for You
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your feedback shapes our product. This quick survey helps us understand
            your needs and build features that matter most to you.
          </p>
        </div>

        {/* Survey Form */}
        <SurveyForm email={email} />
      </div>
    </SectionContainer>
  );
}
