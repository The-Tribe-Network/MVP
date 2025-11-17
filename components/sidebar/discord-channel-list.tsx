"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Hash, Lock, Volume2, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  isPrivate?: boolean;
  unread?: boolean;
}

interface ChannelGroup {
  id: string;
  name: string;
  channels: Channel[];
  isCollapsed?: boolean;
}

const mockChannelGroups: ChannelGroup[] = [
  {
    id: "general",
    name: "General",
    isCollapsed: false,
    channels: [
      { id: "welcome", name: "welcome", type: "text", unread: true },
      { id: "announcements", name: "announcements", type: "text" },
      { id: "general-chat", name: "general-chat", type: "text" },
    ],
  },
  {
    id: "development",
    name: "Development",
    isCollapsed: true,
    channels: [
      { id: "frontend", name: "frontend", type: "text" },
      { id: "backend", name: "backend", type: "text" },
      { id: "code-review", name: "code-review", type: "text", isPrivate: true },
    ],
  },
  {
    id: "voice",
    name: "Voice Channels",
    isCollapsed: true,
    channels: [
      { id: "general-voice", name: "General", type: "voice" },
      { id: "dev-voice", name: "Development", type: "voice" },
    ],
  },
];

export function DiscordChannelList() {
  const [channelGroups, setChannelGroups] = useState(mockChannelGroups);
  const [activeChannel, setActiveChannel] = useState("welcome");

  const toggleGroup = (groupId: string) => {
    setChannelGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, isCollapsed: !group.isCollapsed }
          : group
      )
    );
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.isPrivate) {
      return <Lock className="h-4 w-4" />;
    }
    return channel.type === "voice" ? (
      <Volume2 className="h-4 w-4" />
    ) : (
      <Hash className="h-4 w-4" />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {channelGroups.map((group) => (
        <Collapsible
          key={group.id}
          open={!group.isCollapsed}
          onOpenChange={() => toggleGroup(group.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 py-1 h-6 text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  group.isCollapsed && "-rotate-90"
                )}
              />
              <span className="uppercase tracking-wide">{group.name}</span>
              <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-0.5 px-2 py-1">
              {group.channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-2 py-1 h-6 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800",
                    activeChannel === channel.id && "bg-gray-700 text-gray-200"
                  )}
                  onClick={() => setActiveChannel(channel.id)}
                >
                  {getChannelIcon(channel)}
                  <span className="ml-1 truncate">{channel.name}</span>
                  {channel.unread && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

