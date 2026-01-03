import { SectionContainer } from "@/components/marketing/section-container";
import { Briefcase, MapPin, Shield, Calendar, Search, GraduationCap } from "lucide-react";
import Image from "next/image";

// Alumni/professional members
const professionals = [
  { name: "David Chen", title: "VP Engineering", company: "TechCorp", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", class: "2015" },
  { name: "Michelle Park", title: "Product Manager", company: "StartupX", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", class: "2017" },
  { name: "James Wilson", title: "Consultant", company: "BCG", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", class: "2014" },
  { name: "Emma Thompson", title: "Founder & CEO", company: "InnovateLab", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", class: "2016" },
];

export function ProfessionalNetworksCase() {
  return (
    <SectionContainer background="muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Professional & Alumni Networks
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Maintain the connections that matter most. Coordinate industry
                events, keep alumni engaged, and build networks that grow with
                your community.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Member Directory</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Searchable profiles help members find each other by
                    industry, location, or expertise. Your network, always at
                    your fingertips.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Event Coordination</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plan networking events, reunions, and industry meetups with
                    RSVPs and attendance tracking. See who's attending before
                    you book the venue.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Privacy-First Networking</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Control who sees what with granular permissions. Perfect for
                    exclusive alumni groups and professional communities that
                    value discretion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="rounded-2xl border bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-blue-500/5 overflow-hidden shadow-xl p-5 md:p-6">
            <div className="space-y-4">
              {/* Search bar mockup */}
              <div className="bg-background rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-3 px-3 py-2 border rounded-lg bg-muted/30">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Search by name, company, or class year...</span>
                </div>
              </div>

              {/* Member directory cards */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">Class of 2015-2017</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">156 members</span>
                </div>
                <div className="space-y-3">
                  {professionals.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={p.avatar} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.title} at {p.company}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">'{p.class.slice(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Networking event */}
              <div className="bg-background rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">NYC Alumni Mixer</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>The Standard Hotel, NYC</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Jan 25, 2026 · 6:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex -space-x-2">
                    {professionals.map((p, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background overflow-hidden">
                        <Image src={p.avatar} alt={p.name} width={24} height={24} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                      +28
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">32 attending</span>
                </div>
              </div>

              {/* Privacy badge */}
              <div className="bg-background/60 rounded-xl p-3 shadow border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Private community · Invite only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
