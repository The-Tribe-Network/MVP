'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTribeInvitations, useResendInvitation, useCancelInvitation } from '@/lib/hooks/use-tribe-invitations';
import { InvitationItem } from './invitation-item';
import { InvitationsSettingsSkeleton } from './loading';
import { InvitationsSettingsError } from './error';
import InviteDialogContent from '@/components/dialogs/invite';
import { useQuery } from '@tanstack/react-query';
import { tribeDetailOptions } from '@/lib/query-options/tribes';

interface InvitationsSettingsProps {
  tribeId: string;
}

type InvitationStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'expired';

export function InvitationsSettings({ tribeId }: InvitationsSettingsProps) {
  const [statusFilter, setStatusFilter] = useState<InvitationStatus>('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { 
    data: tribe, 
    isLoading: isTribeLoading, 
    isError: isTribeError, 
    error: tribeError, 
    refetch: refetchTribe,
  } = useQuery(tribeDetailOptions(tribeId));
  const {
    data: invitations,
    isLoading: isInvitationsLoading,
    isError: isInvitationsError,
    error: invitationsError,
    refetch,
  } = useTribeInvitations(tribeId);

  const { mutate: resendInvitation, isPending: isResending } = useResendInvitation(tribeId);
  const { mutate: cancelInvitation, isPending: isCancelling } = useCancelInvitation(tribeId);

  if (isTribeLoading || isInvitationsLoading) {
    return <InvitationsSettingsSkeleton />;
  }

  if (isTribeError || isInvitationsError) {
    return (
      <InvitationsSettingsError
        message={tribeError?.message || invitationsError?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!invitations || !tribe) {
    return <InvitationsSettingsError message="No invitations or tribe found" />;
  }

  // Filter invitations by status
  const filteredInvitations = invitations.filter((inv) => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  // Count by status
  const statusCounts = invitations.reduce(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground mt-2">
            Manage tribe invitations and view invitation history
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvitationStatus)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Invitations ({invitations.length})
              </SelectItem>
              <SelectItem value="pending">
                Pending {statusCounts.pending ? `(${statusCounts.pending})` : ''}
              </SelectItem>
              <SelectItem value="accepted">
                Accepted {statusCounts.accepted ? `(${statusCounts.accepted})` : ''}
              </SelectItem>
              <SelectItem value="rejected">
                Rejected {statusCounts.rejected ? `(${statusCounts.rejected})` : ''}
              </SelectItem>
              <SelectItem value="expired">
                Expired {statusCounts.expired ? `(${statusCounts.expired})` : ''}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowInviteDialog(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>

        {filteredInvitations.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter === 'all'
                ? 'No invitations have been sent yet'
                : `No ${statusFilter} invitations found`}
            </p>
            {statusFilter === 'all' && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Send Your First Invitation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvitations.map((invitation) => (
              <InvitationItem
                key={invitation.id}
                invitation={invitation}
                onResend={resendInvitation}
                onCancel={cancelInvitation}
                isResending={isResending}
                isCancelling={isCancelling}
              />
            ))}
          </div>
        )}
      </div>

      <InviteDialogContent
        isOpen={showInviteDialog}
        setIsOpen={setShowInviteDialog}
        tribeId={tribeId}
        tribeName={tribe?.name || 'Tribe'}
      />
    </>
  );
}
