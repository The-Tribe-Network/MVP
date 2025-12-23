'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTribeMembers } from '@/lib/hooks/use-members';
import type { MemberListItem } from '@/lib/database/types';

interface AddPermissionOverrideDialogProps {
  tribeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (member: MemberListItem) => void;
}

const roleColors = {
  owner: 'bg-purple-500 text-white',
  admin: 'bg-blue-500 text-white',
  moderator: 'bg-green-500 text-white',
  member: 'bg-gray-500 text-white',
};

export function AddPermissionOverrideDialog({
  tribeId,
  open,
  onOpenChange,
  onSelectMember,
}: AddPermissionOverrideDialogProps) {
  const { data: membersData, isLoading } = useTribeMembers(tribeId, {
    page: 1,
    pageSize: 100,
  });

  // Filter to only show members WITHOUT custom overrides
  const membersWithoutOverrides =
    membersData?.members?.filter((m: MemberListItem) => !m.hasCustomPermissions) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Permission Override</DialogTitle>
          <DialogDescription>
            Select a member to configure custom permissions that override their
            role defaults.
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading members...' : 'No members found.'}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {membersWithoutOverrides.map((member: MemberListItem) => (
                <CommandItem
                  key={member.id}
                  onSelect={() => {
                    onSelectMember(member);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{member.user.name}</div>
                      {member.user.username && (
                        <div className="text-xs text-muted-foreground">
                          @{member.user.username}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={roleColors[member.role as keyof typeof roleColors]}
                    >
                      {member.role}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {membersWithoutOverrides.length === 0 && !isLoading && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            All members already have permission overrides.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
