import { SectionContainer } from "@/components/marketing/section-container";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { Palette, UserPlus, MessageSquare, Heart, BookOpen, ImageIcon } from "lucide-react";
import Image from "next/image";

// Hobby group members
const hobbyMembers = [
  { name: "Lisa Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
  { name: "Tom Bradley", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  { name: "Maria Santos", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  { name: "Jake Wilson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
];

export function HobbyGroupsCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Mockup */}
          <div className="rounded-2xl border bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-purple-500/5 overflow-hidden shadow-xl p-5 md:p-6">
            <div className="space-y-4">
              {/* Project post */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={hobbyMembers[0].avatar} alt={hobbyMembers[0].name} width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs">{hobbyMembers[0].name}</p>
                      <span className="text-xs text-muted-foreground">· 2h ago</span>
                    </div>
                    <p className="text-sm mt-1">
                      Finally finished my watercolor landscape! What do you all think?
                    </p>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden mb-3">
                  <Image
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=300&fit=crop"
                    alt="Watercolor painting"
                    width={500}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-rose-500">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span className="text-xs font-medium">24</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">12</span>
                  </div>
                </div>
              </div>

              {/* Book club discussion */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium">January Book Discussion</span>
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={hobbyMembers[1].avatar} alt={hobbyMembers[1].name} width={28} height={28} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs">{hobbyMembers[1].name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      "I loved the twist in chapter 12! Didn't see that coming at all."
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 ml-6 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={hobbyMembers[2].avatar} alt={hobbyMembers[2].name} width={24} height={24} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[10px]">{hobbyMembers[2].name}</p>
                    <p className="text-[10px] text-muted-foreground">Same! The foreshadowing was so subtle.</p>
                  </div>
                </div>
              </div>

              {/* Photo gallery preview */}
              <div className="bg-background/60 rounded-xl p-4 shadow border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Community Projects</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">48 photos</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="aspect-square rounded overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop" alt="Art" width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=100&h=100&fit=crop" alt="Art" width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop" alt="Art" width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded overflow-hidden relative">
                    <Image src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=100&h=100&fit=crop" alt="Art" width={100} height={100} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-[10px] font-medium">+44</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Social & Hobby Groups
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From book clubs to maker spaces, bring your passion community
                together. Share creations, coordinate gatherings, and welcome
                new members with ease.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Share Your Creations</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Post photos of projects, artworks, and accomplishments. The
                    Vault keeps your community's creative output beautifully
                    organized.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Easy Onboarding</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Invite new members with controlled access levels. Set
                    permissions so newcomers can participate without
                    overwhelming admin duties.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community Discussion</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Rich posts with comments, likes, and nested replies. Build
                    conversations around shared interests, not scattered across
                    multiple apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA for Use Cases */}
        <div className="text-center space-y-8 pt-16">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">
              Ready to Build Your Community?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the waitlist and be among the first to try Tribe.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <WaitlistForm source="use-cases" variant="inline" />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
