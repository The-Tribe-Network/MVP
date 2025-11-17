"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Hash, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Server {
  id: string;
  name: string;
  icon?: string;
  isActive?: boolean;
}

const mockServers: Server[] = [
  { id: "home", name: "Home", icon: "🏠", isActive: true },
  { id: "general", name: "General", icon: "💬" },
  { id: "development", name: "Development", icon: "💻" },
  { id: "design", name: "Design", icon: "🎨" },
];

export function DiscordServerList() {
  const [activeServer, setActiveServer] = useState("home");

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Server List */}
        <div className="flex gap-1">
          {mockServers.map((server) => (
            <Tooltip key={server.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-800",
                    activeServer === server.id && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  onClick={() => setActiveServer(server.id)}
                >
                  {server.icon || server.name.charAt(0).toUpperCase()}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{server.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Add Server Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add Server</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

