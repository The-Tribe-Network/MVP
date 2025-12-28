"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Flame, Clock, TrendingUp, FileText, Image, ChevronDown, SlidersHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostSortOption, PostContentType } from "@/lib/hooks/use-posts";

interface TimelineHeaderProps {
  tribeId: string;
  view: "posts" | "new post";
  onViewChange: (view: "posts" | "new post") => void;
  sort: PostSortOption;
  contentType: PostContentType;
  onSortChange: (sort: PostSortOption) => void;
  onContentTypeChange: (contentType: PostContentType) => void;
};

const sortOptions: { value: PostSortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'hot', label: 'Hot', icon: <Flame className="h-3.5 w-3.5" /> },
  { value: 'new', label: 'New', icon: <Clock className="h-3.5 w-3.5" /> },
  { value: 'top', label: 'Top', icon: <TrendingUp className="h-3.5 w-3.5" /> },
];

const contentTypeOptions: { value: PostContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: null },
  { value: 'text', label: 'Text', icon: <FileText className="h-3.5 w-3.5" /> },
  { value: 'media', label: 'Media', icon: <Image className="h-3.5 w-3.5" /> },
];

export default function TimelineHeader({
  tribeId,
  view,
  onViewChange,
  sort,
  contentType,
  onSortChange,
  onContentTypeChange,
}: TimelineHeaderProps) {
  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onViewChange("posts");
  };

  const currentSort = sortOptions.find((o) => o.value === sort) || sortOptions[1];
  const currentContentType = contentTypeOptions.find((o) => o.value === contentType) || contentTypeOptions[0];

  // Show back button and "New Post" title when in new post view
  if (view === "new post") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">New Post</h2>
      </div>
    );
  }

  // Posts view - show filters
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Mobile: Dropdowns */}
      <div className="flex items-center gap-2 lg:hidden">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              {currentSort.icon}
              {currentSort.label}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={cn(
                  "gap-2",
                  sort === option.value && "bg-muted"
                )}
              >
                {option.icon}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Content Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {currentContentType.label}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {contentTypeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onContentTypeChange(option.value)}
                className={cn(
                  "gap-2",
                  contentType === option.value && "bg-muted"
                )}
              >
                {option.icon}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: Inline buttons */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Sort Options */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => onSortChange(option.value)}
              className={cn(
                "h-7 px-3 text-xs font-medium gap-1.5 rounded-md",
                sort === option.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>

        {/* Content Type Filter */}
        <div className="flex items-center gap-1">
          {contentTypeOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => onContentTypeChange(option.value)}
              className={cn(
                "h-7 px-2.5 text-xs font-medium gap-1.5",
                contentType === option.value
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Create Post Button */}
      <Button
        variant="default"
        size="sm"
        onClick={() => onViewChange("new post")}
        className="h-8 text-xs ml-auto"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Post</span>
        <span className="sm:hidden">Post</span>
      </Button>
    </div>
  );
}
