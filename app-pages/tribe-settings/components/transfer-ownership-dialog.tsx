'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransferOwnership } from '@/lib/hooks/use-tribe-settings';
import { tribeAdminMembersOptions } from '@/lib/query-options/tribe-settings';
import { toast } from 'sonner';

interface TransferOwnershipDialogProps {
  tribeId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferOwnershipDialog({
  tribeId,
  isOpen,
  onOpenChange,
}: TransferOwnershipDialogProps) {
  const router = useRouter();
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [openPopover, setOpenPopover] = useState(false);
  const transferOwnership = useTransferOwnership(tribeId);

  const { data: adminData, isLoading } = useQuery({
    ...tribeAdminMembersOptions(tribeId),
    enabled: isOpen,
  });

  const selectedAdmin = adminData?.members.find((m) => m.id === selectedAdminId);

  const handleTransfer = async () => {
    if (!selectedAdminId) {
      toast.error('Please select an admin member');
      return;
    }

    try {
      await transferOwnership.mutateAsync({ newOwnerId: selectedAdminId });
      toast.success('Ownership transferred successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to transfer ownership');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Transfer ownership of this tribe to another admin member. You will become an admin after the transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Admin Member</Label>
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopover}
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {selectedAdmin
                    ? `${selectedAdmin.name}${selectedAdmin.username ? ` (${selectedAdmin.username})` : ''}`
                    : 'Select an admin...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search admins..." />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? 'Loading...' : 'No admin members found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {adminData?.members.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.id}
                          onSelect={() => {
                            setSelectedAdminId(member.id === selectedAdminId ? '' : member.id);
                            setOpenPopover(false);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.image || undefined} />
                              <AvatarFallback>
                                {member.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">{member.name}</div>
                              {member.username && (
                                <div className="text-xs text-muted-foreground">
                                  @{member.username}
                                </div>
                              )}
                            </div>
                          </div>
                          <Check
                            className={cn(
                              'ml-2 h-4 w-4',
                              selectedAdminId === member.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedAdmin && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{selectedAdmin.name}</strong> will become the new owner of this tribe. You will become an admin member.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedAdminId || transferOwnership.isPending}
          >
            {transferOwnership.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              'Transfer Ownership'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

