"use client";

import { SectionContainer } from "@/components/marketing/section-container";
import {
  Archive,
  Shield,
  Calendar,
  FolderOpen,
  Search,
  Clock,
  UserCog,
  Settings,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type SubFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type Solution = {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
  image: string;
  subFeatures: SubFeature[];
};

export function SolutionSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use 'dark' as default for SSR, then switch to actual theme after mount
  const currentTheme = mounted ? (resolvedTheme || "dark") : "dark";

  const solutions: Solution[] = [
    {
      icon: Archive,
      title: "The Vault",
      description:
        "Never lose a memory again. The Vault is your community's photo archive — organized, searchable, and built to last. Instagram stories disappear. The Vault doesn't.",
      highlight: "The Sticky Feature",
      image: `/app-screenshots-1024/media_browse_${currentTheme}.png`,
      subFeatures: [
        {
          icon: FolderOpen,
          title: "Organized Albums",
          description: "Create albums for events, trips, or any occasion. Keep everything organized.",
        },
        {
          icon: Search,
          title: "Actually Searchable",
          description: "Find photos by date, event, or uploader. No more endless scrolling.",
        },
        {
          icon: Clock,
          title: "Chronological",
          description: "See your community's history unfold. Memories in order, always.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Granular RBAC",
      description:
        "Your executive board shouldn't have the same permissions as new members. Tribe's role-based access control gives you surgical precision over who can do what.",
      highlight: "Fine-Tuned Permissions",
      image: `/app-screenshots-1024/rbac_${currentTheme}.png`,
      subFeatures: [
        {
          icon: UserCog,
          title: "20+ Permissions",
          description: "Fine-tune what each member can do. Posting, events, albums, moderation — all configurable.",
        },
        {
          icon: Shield,
          title: "Role-Based Defaults",
          description: "Owner, admin, moderator, member. Start with smart defaults, customize as needed.",
        },
        {
          icon: Settings,
          title: "Per-Member Overrides",
          description: "Grant special permissions or restrict specific members without changing their role.",
        },
      ],
    },
    {
      icon: Calendar,
      title: "Structured Events",
      description:
        "Stop using Google Forms for RSVPs. Tribe's event system is built for communities that actually coordinate in real life.",
      highlight: "Real Coordination",
      image: `/app-screenshots-1024/event_detail_${currentTheme}.png`,
      subFeatures: [
        {
          icon: Calendar,
          title: "Real RSVPs",
          description: "See who's coming, who's not, and who's maybe. Capacity limits and waitlists included.",
        },
        {
          icon: BarChart3,
          title: "Event Polls",
          description: "Can't decide on a date? Let members vote. Democracy for scheduling.",
        },
        {
          icon: Users,
          title: "Attendee Management",
          description: "Control who sees the attendee list. Public, members-only, or admins-only.",
        },
      ],
    },
  ];

  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">
            Tribe Changes Everything
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Built from the ground up for communities. Privacy-first, ad-free, and actually useful.
          </p>
        </div>

        <div className="space-y-32">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={solution.title}
                className={`grid md:grid-cols-2 gap-16 items-center ${
                  isEven ? "" : "md:grid-flow-dense"
                }`}
              >
                {/* Text */}
                <div className={`space-y-8 ${isEven ? "" : "md:col-start-2"}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {solution.highlight}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold">
                      {solution.title}
                    </h3>
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {solution.description}
                  </p>

                  {/* Sub-features */}
                  <div className="space-y-5 pt-4">
                    {solution.subFeatures.map((subFeature) => {
                      const SubIcon = subFeature.icon;
                      return (
                        <div key={subFeature.title} className="flex gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                            <SubIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{subFeature.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {subFeature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Screenshot */}
                <div
                  className={`relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-background ${
                    isEven ? "" : "md:col-start-1"
                  }`}
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={solution.image}
                      alt={solution.title}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {/* Gradient overlay for polish */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
