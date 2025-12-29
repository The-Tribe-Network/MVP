import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <SectionContainer className="pt-32 md:pt-40 pb-24 md:pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Hero Content */}
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Your Community Already Exists.{" "}
            <span className="text-primary">Now Give It a Home.</span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            You have the people. We provide the tools. Events, memories, members — one private home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 group"
              >
                See How It Works
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Join the waitlist for early access
          </p>
          <WaitlistForm source="hero" variant="inline" />
        </div>
      </div>
    </SectionContainer>
  );
}
