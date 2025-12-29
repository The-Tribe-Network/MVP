import { SectionContainer } from "@/components/marketing/section-container";
import { Users, Calendar, Archive } from "lucide-react";

export function ReligiousCase() {
  return (
    <SectionContainer>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Placeholder */}
          <div className="rounded-2xl border bg-secondary/20 aspect-[4/3] flex items-center justify-center shadow-xl">
            <p className="text-muted-foreground text-center px-4">
              Congregation events & community photos
            </p>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Religious & Faith Communities
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Churches, mosques, temples, and faith groups deserve better than scattered group chats. Keep your congregation connected and organized.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Leadership Permissions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Separate permissions for clergy, ministry leaders, and congregation members. Everyone has the right level of access.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Event Coordination</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Organize services, community dinners, volunteer events, and youth activities with RSVPs and reminders.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
                  <Archive className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community Archives</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Preserve photos from celebrations, ceremonies, and gatherings. Build a lasting record of your community's journey.
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
