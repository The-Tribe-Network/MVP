'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  changeMemberRoleSchema,
  type ChangeMemberRoleInput,
} from '@/lib/validations/members';
import { useChangeMemberRole } from '@/lib/hooks/use-members';
import type { MemberListItem } from '@/lib/database/types';

interface ChangeRoleDialogProps {
  tribeId: string;
  member: MemberListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: 'owner' | 'admin' | 'moderator' | 'member';
}

export function ChangeRoleDialog({
  tribeId,
  member,
  open,
  onOpenChange,
  currentUserRole,
}: ChangeRoleDialogProps) {
  const { mutate: changeRole, isPending } = useChangeMemberRole(tribeId);

  const form = useForm<ChangeMemberRoleInput>({
    resolver: zodResolver(changeMemberRoleSchema),
    defaultValues: {
      memberId: '',
      newRole: 'member',
    },
  });

  // Update form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        memberId: member.id,
        newRole:
          member.role === 'owner' ? 'admin' : (member.role as any) || 'member',
      });
    }
  }, [member, form]);

  const onSubmit = (data: ChangeMemberRoleInput) => {
    changeRole(data, {
      onSuccess: () => {
        toast.success(`Role changed to ${data.newRole}`);
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to change role');
      },
    });
  };

  if (!member) return null;

  // Determine available roles based on current user's role
  const availableRoles =
    currentUserRole === 'owner'
      ? ['admin', 'moderator', 'member']
      : currentUserRole === 'admin'
      ? ['moderator', 'member']
      : ['member'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Change the role for {member.user.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Changing...' : 'Change Role'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
