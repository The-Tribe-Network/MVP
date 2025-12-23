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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  updateMemberPermissionsSchema,
  type UpdateMemberPermissionsInput,
} from '@/lib/validations/members';
import {
  useUpdateMemberPermissions,
  useClearMemberPermissions,
} from '@/lib/hooks/use-members';
import type { MemberListItem, TribeMemberWithPermissionsExtended } from '@/lib/database/types';

interface ManagePermissionsDialogProps {
  tribeId: string;
  member: MemberListItem | TribeMemberWithPermissionsExtended | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const permissionGroups = [
  {
    title: 'Posting',
    permissions: [
      {
        name: 'canPost',
        label: 'Create posts',
        description: 'Allow creating new posts',
      },
      {
        name: 'canComment',
        label: 'Comment on posts',
        description: 'Allow commenting on posts',
      },
      {
        name: 'canEditOwnPosts',
        label: 'Edit own posts',
        description: 'Allow editing their own posts',
      },
      {
        name: 'canDeleteOwnPosts',
        label: 'Delete own posts',
        description: 'Allow deleting their own posts',
      },
    ],
  },
  {
    title: 'Media',
    permissions: [
      {
        name: 'canUploadMedia',
        label: 'Upload media',
        description: 'Allow uploading photos/videos',
      },
      {
        name: 'canCreateAlbums',
        label: 'Create albums',
        description: 'Allow creating new albums',
      },
      {
        name: 'canDeleteOwnMedia',
        label: 'Delete own media',
        description: 'Allow deleting their own media',
      },
    ],
  },
  {
    title: 'Events',
    permissions: [
      {
        name: 'canCreateEvents',
        label: 'Create events',
        description: 'Allow creating new events',
      },
      {
        name: 'canEditEvents',
        label: 'Edit events',
        description: 'Allow editing events',
      },
      {
        name: 'canDeleteEvents',
        label: 'Delete events',
        description: 'Allow deleting events',
      },
    ],
  },
  {
    title: 'Members',
    permissions: [
      {
        name: 'canInviteMembers',
        label: 'Invite members',
        description: 'Allow sending tribe invitations',
      },
      {
        name: 'canRemoveMembers',
        label: 'Remove members',
        description: 'Allow removing members from tribe',
      },
      {
        name: 'canChangeMemberRoles',
        label: 'Change roles',
        description: 'Allow changing member roles',
      },
      {
        name: 'canManagePermissions',
        label: 'Manage permissions',
        description: 'Allow managing member permissions',
      },
    ],
  },
  {
    title: 'Moderation',
    permissions: [
      {
        name: 'canModeratePosts',
        label: 'Moderate posts',
        description: 'Allow moderating posts',
      },
      {
        name: 'canModerateComments',
        label: 'Moderate comments',
        description: 'Allow moderating comments',
      },
      {
        name: 'canDeleteAnyPost',
        label: 'Delete any post',
        description: 'Allow deleting any post',
      },
      {
        name: 'canDeleteAnyComment',
        label: 'Delete any comment',
        description: 'Allow deleting any comment',
      },
      {
        name: 'canDeleteAnyMedia',
        label: 'Delete any media',
        description: 'Allow deleting any media',
      },
    ],
  },
  {
    title: 'Tribe Settings',
    permissions: [
      {
        name: 'canEditTribeSettings',
        label: 'Edit tribe settings',
        description: 'Allow editing tribe settings',
      },
      {
        name: 'canDeleteTribe',
        label: 'Delete tribe',
        description: 'Allow deleting the tribe',
      },
      {
        name: 'canTransferOwnership',
        label: 'Transfer ownership',
        description: 'Allow transferring ownership',
      },
    ],
  },
  {
    title: 'Messaging',
    permissions: [
      {
        name: 'canSendMessages',
        label: 'Send messages',
        description: 'Allow sending messages',
      },
    ],
  },
];

export function ManagePermissionsDialog({
  tribeId,
  member,
  open,
  onOpenChange,
}: ManagePermissionsDialogProps) {
  const { mutate: updatePermissions, isPending: isUpdating } =
    useUpdateMemberPermissions(tribeId);
  const { mutate: clearPermissions, isPending: isClearing } =
    useClearMemberPermissions(tribeId);

  const form = useForm<UpdateMemberPermissionsInput>({
    resolver: zodResolver(updateMemberPermissionsSchema),
    defaultValues: {
      memberId: '',
      restrictionReason: undefined,
    },
  });

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      // Handle both MemberListItem and TribeMemberWithPermissionsExtended types
      const restrictionReason =
        'restrictionReason' in member
          ? member.restrictionReason
          : member.permissions?.restrictionReason;

      form.reset({
        memberId: member.id,
        restrictionReason: restrictionReason || undefined,
      });
    }
  }, [member, form]);

  const onSubmit = (data: UpdateMemberPermissionsInput) => {
    updatePermissions(data, {
      onSuccess: () => {
        toast.success('Permissions updated successfully');
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update permissions');
      },
    });
  };

  const handleClearPermissions = () => {
    if (!member) return;

    clearPermissions(member.id, {
      onSuccess: () => {
        toast.success('Permissions cleared - using role defaults');
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to clear permissions');
      },
    });
  };

  if (!member) return null;

  const isPending = isUpdating || isClearing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Configure custom permissions for {member.user.name}. Toggle
            permissions to override role defaults.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {permissionGroups.map((group, groupIndex) => (
                  <div key={group.title}>
                    <h4 className="font-semibold mb-3">{group.title}</h4>
                    <div className="space-y-4">
                      {group.permissions.map((permission) => (
                        <FormField
                          key={permission.name}
                          control={form.control}
                          name={permission.name as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0">
                              <div className="space-y-0.5">
                                <FormLabel>{permission.label}</FormLabel>
                                <FormDescription className="text-xs">
                                  {permission.description}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    {groupIndex < permissionGroups.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}

                <Separator />

                <FormField
                  control={form.control}
                  name="restrictionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restriction Reason (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why these permissions were customized..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional note explaining why custom permissions were set
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-between">
              <div>
                {/* Check if member has custom permissions - handle both type formats */}
                {(('hasCustomPermissions' in member && member.hasCustomPermissions) ||
                  ('hasOverrides' in member && member.hasOverrides)) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClearPermissions}
                    disabled={isPending}
                  >
                    Clear Overrides
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isUpdating ? 'Saving...' : 'Save Permissions'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
