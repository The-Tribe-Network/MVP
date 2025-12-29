import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { ArrowRight, Construction, Sparkles } from "lucide-react";

export default function ComingSoonPageContent() {
  return (
    <SectionContainer className="pt-32 md:pt-40 pb-24 md:pb-32">
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Construction className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
          Something Amazing is{" "}
          <span className="text-primary">Coming Soon</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          We're putting the finishing touches on Tribe — the privacy-first
          community platform that will transform how your group stays connected,
          organized, and engaged.
        </p>

        {/* What to expect */}
        <div className="bg-muted/50 rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            What you'll get
          </h2>
          <ul className="text-left space-y-3 max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Superior photo archiving with organized albums
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Smart event management with built-in RSVPs
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Granular privacy controls and role-based permissions
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Rich posts with comments, likes, and threaded replies
              </span>
            </li>
          </ul>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-md mx-auto mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to know when we launch
          </p>
          <WaitlistForm source="coming-soon" variant="inline" />
        </div>

        {/* Back to Home Link */}
        <Link href="/home">
          <Button variant="ghost" className="group">
            Learn more about Tribe
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </SectionContainer>
  );
}
