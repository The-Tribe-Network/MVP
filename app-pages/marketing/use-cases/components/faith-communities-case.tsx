import { SectionContainer } from "@/components/marketing/section-container";
import { Heart, Calendar, Archive, Megaphone, ImageIcon } from "lucide-react";
import Image from "next/image";

// Community members
const members = [
  { name: "Pastor Michael", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  { name: "Sister Grace", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  { name: "Elder Thomas", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
  { name: "Mary Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
];

export function FaithCommunitiesCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8 order-last md:order-first">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium uppercase tracking-wide">
              Primary Use Case
            </div> */}

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Religious & Faith Communities
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From weekly services to annual celebrations, bring your
                congregation together. Coordinate volunteers, preserve sacred
                moments, and strengthen your community bond.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Multi-Generational Engagement
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Simple enough for all ages, powerful enough for leadership.
                    Keep every generation connected to community life, from
                    youth groups to elder councils.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Sacred Event Coordination
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plan services, holy day celebrations, and community
                    gatherings with RSVPs and volunteer sign-ups. Know who's
                    bringing what before the potluck begins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Archive className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Preserve Your Traditions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Document celebrations, ceremonies, and milestone moments in
                    The Vault. Build a living archive of your community's
                    spiritual journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden shadow-xl p-5 md:p-6">
            <div className="space-y-4">
              {/* Announcement post */}
              <div className="bg-background rounded-xl p-4 shadow-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium mb-3">
                  <Megaphone className="w-3.5 h-3.5" />
                  Announcement
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={members[0].avatar}
                      alt={members[0].name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs">{members[0].name}</p>
                    <p className="text-xs text-muted-foreground">Community Leader</p>
                  </div>
                </div>
                <p className="text-sm font-medium mb-1">Sunday Service Update</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This week's service will be held outdoors in the garden. Please bring blankets and chairs. Potluck to follow!
                </p>
              </div>

              {/* Photo gallery preview */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Easter Celebration 2024</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">24 photos</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
                  <div className="aspect-square">
                    <Image
                      src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=200&h=200&fit=crop"
                      alt="Community gathering"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square">
                    <Image
                      src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=200&h=200&fit=crop"
                      alt="Celebration"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square relative">
                    <Image
                      src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=200&h=200&fit=crop"
                      alt="Fellowship"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">+21</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming event */}
              <div className="bg-background/60 rounded-xl p-4 shadow border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Community Potluck</p>
                    <p className="text-xs text-muted-foreground">Sunday, Jan 12 · After Service</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-1.5">
                        {members.slice(0, 3).map((m, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border-2 border-background overflow-hidden">
                            <Image src={m.avatar} alt={m.name} width={20} height={20} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">42 attending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
