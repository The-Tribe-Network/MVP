'use client';

import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRemoveMember } from '@/lib/hooks/use-members';
import type { MemberListItem } from '@/lib/database/types';

interface RemoveMemberDialogProps {
  tribeId: string;
  member: MemberListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveMemberDialog({
  tribeId,
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const { mutate: removeMember, isPending } = useRemoveMember(tribeId);

  const handleRemove = () => {
    if (!member) return;

    removeMember(member.id, {
      onSuccess: () => {
        toast.success(`${member.user.name} removed from tribe`);
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to remove member');
      },
    });
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{' '}
            <strong>{member.user.name}</strong> from this tribe? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Removing...' : 'Remove Member'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
