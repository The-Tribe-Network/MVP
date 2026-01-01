'use client';

import Link from 'next/link';
import { MoreHorizontal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AlbumActionsDropdownProps {
  tribeId: string;
  albumId: string;
}

export function AlbumActionsDropdown({
  tribeId,
  albumId,
}: AlbumActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Album actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/tribe/${tribeId}/media/album/${albumId}/settings`}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Album
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
