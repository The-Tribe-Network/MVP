"use client";

import { Button } from "@/components/ui/button";
import { useTribePosts } from "@/lib/hooks/use-posts";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useState } from "react";

interface TimelineHeaderProps {
  tribeId: string;
  view: "posts" | "new post";
  onViewChange: (view: "posts" | "new post") => void;
};

export default function TimelineHeader({ tribeId, view, onViewChange }: TimelineHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { refetch, data } = useTribePosts(tribeId);

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onViewChange("posts")
  }

  return (
    <div className="flex items-center justify-between gap-2 hover:cursor-pointer">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={view === "posts" ? handleRefresh : handleBack}
          disabled={isRefreshing || view === "posts" && data && data.length === 0}
        >
          {view === "posts" ? (
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          ) : (
            <ArrowLeft className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-2xl font-bold">
          {view === "posts" ? "Timeline" : "New Post"}
        </h2>
      </div>

      {view === "posts" && data && data.length > 0 && (
        <Button
          variant="default"
          onClick={() => onViewChange("new post")}
        >
          Create a Post
        </Button>
      )}
    </div>
  )
}