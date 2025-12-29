import Image from "next/image";
import { SectionContainer } from "@/components/marketing/section-container";

export function AppShowcase() {
  return (
    <SectionContainer className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Screenshot Container */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50">
          {/* Light mode screenshot - hidden in dark mode */}
          <Image
            src="/app-screenshots-1024/tribe_dashboard_light.png"
            alt="Tribe Dashboard - Your community hub for events, media, and member coordination"
            width={1024}
            height={768}
            className="w-full h-auto block dark:hidden"
            priority
          />
          {/* Dark mode screenshot - hidden in light mode */}
          <Image
            src="/app-screenshots-1024/tribe_dashboard_dark.png"
            alt="Tribe Dashboard - Your community hub for events, media, and member coordination"
            width={1024}
            height={768}
            className="w-full h-auto hidden dark:block"
            priority
          />
        </div>

        {/* Optional caption */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your tribe's central hub — events, photos, and coordination in one place
        </p>
      </div>
    </SectionContainer>
  );
}
