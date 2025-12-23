'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, RefreshCw, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TribeInvitationWithInviter } from '@/lib/database/types';
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

interface InvitationItemProps {
  invitation: TribeInvitationWithInviter;
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
  isResending: boolean;
  isCancelling: boolean;
}

const statusColors = {
  pending: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  accepted: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  rejected: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
  expired: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
};

const roleLabels = {
  admin: 'Admin',
  moderator: 'Moderator',
  member: 'Member',
};

export function InvitationItem({
  invitation,
  onResend,
  onCancel,
  isResending,
  isCancelling,
}: InvitationItemProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isPending = invitation.status === 'pending';
  const isExpired = invitation.status === 'expired';
  const canResend = isPending || isExpired;
  const canCancel = isPending;

  const handleCancel = () => {
    onCancel(invitation.id);
    setShowCancelDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">{invitation.email}</span>
            <Badge variant="secondary" className="flex-shrink-0">
              {roleLabels[invitation.role]}
            </Badge>
            <Badge variant="outline" className={`flex-shrink-0 ${statusColors[invitation.status]}`}>
              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Sent {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
            </span>
            <span>•</span>
            <span>Invited by {invitation.inviterName || invitation.inviterEmail}</span>
            {invitation.expiresAt && isPending && (
              <>
                <span>•</span>
                <span>
                  Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {canResend && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResend(invitation.id)}
              disabled={isResending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend
            </Button>
          )}
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              disabled={isCancelling}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to <strong>{invitation.email}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
