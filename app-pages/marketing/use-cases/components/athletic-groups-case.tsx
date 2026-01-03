import { SectionContainer } from "@/components/marketing/section-container";
import { Calendar, Users, Camera, Check, MapPin, Heart, MessageSquare } from "lucide-react";
import Image from "next/image";

// Team members
const teamMembers = [
  { name: "Coach Mike", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
  { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
  { name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
];

export function AthleticGroupsCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Mockup */}
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 overflow-hidden shadow-xl p-5 md:p-6">
            <div className="space-y-4">
              {/* Upcoming game */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Saturday League Game</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>Central Park Field 3</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Jan 11, 2026 · 10:00 AM</p>
                  </div>
                </div>
                {/* RSVP status */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex -space-x-2">
                    {teamMembers.map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-background overflow-hidden">
                        <Image src={m.avatar} alt={m.name} width={28} height={28} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      +8
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>You're going</span>
                  </div>
                </div>
              </div>

              {/* Post with image */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={teamMembers[0].avatar} alt={teamMembers[0].name} width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs">{teamMembers[0].name}</p>
                      <span className="text-xs text-muted-foreground">· 3h ago</span>
                    </div>
                    <p className="text-sm mt-1">
                      Great practice today team! Keep up the energy for Saturday's game!
                    </p>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden mb-3">
                  <Image
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=250&fit=crop"
                    alt="Team practice"
                    width={500}
                    height={250}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-rose-500">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span className="text-xs font-medium">18</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">6</span>
                  </div>
                </div>
              </div>

              {/* Quick roster preview */}
              <div className="bg-background/60 rounded-xl p-4 shadow border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Team Roster</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">24 members</span>
                </div>
                <div className="flex -space-x-2">
                  {teamMembers.map((m, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                      <Image src={m.avatar} alt={m.name} width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    +20
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Athletic & Recreation Groups
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're organizing weekend leagues or training for your
                next adventure, keep your team coordinated and motivated
                together.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Game & Meetup Scheduling</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Schedule practices, games, and group runs with built-in
                    RSVPs and capacity limits. No more chasing down
                    confirmations in group chats.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Team Roster Management</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Keep your member directory up to date. Find teammates,
                    coordinate carpools, and build connections that last beyond
                    the season.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Event Photo Galleries</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Capture race finishes, game-day moments, and training
                    milestones. Auto-organize photos by event in The Vault.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
