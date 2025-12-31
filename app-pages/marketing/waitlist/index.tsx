import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { ArrowRight, Mail, Sparkles, Users } from "lucide-react";

export default function WaitlistPageContent() {
  return (
    <SectionContainer className="pt-32 md:pt-40 pb-24 md:pb-32">
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
          Join the <span className="text-primary">Tribe</span> Waitlist
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Be among the first to experience the privacy-first community platform
          designed for real groups. Get early access, exclusive updates, and
          help shape the future of Tribe.
        </p>

        {/* Benefits */}
        <div className="bg-muted/50 rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Early access benefits
          </h2>
          <ul className="text-left space-y-3 max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Priority access when we launch
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Exclusive founder pricing for early adopters
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Direct input on features and product direction
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
              <span className="text-foreground">
                Behind-the-scenes updates and sneak peeks
              </span>
            </li>
          </ul>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Mail className="w-4 h-4" />
            <span>Enter your email to join the waitlist</span>
          </div>
          <WaitlistForm source="waitlist-page" variant="inline" />
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
