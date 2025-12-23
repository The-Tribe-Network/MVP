'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { memberWithPermissionsOptions } from '@/lib/query-options/tribe-settings';
import { TransferOwnershipDialog } from '@/app-pages/tribe-settings/components/transfer-ownership-dialog';
import { DeleteTribeDialog } from '@/app-pages/tribe-settings/components/delete-tribe-dialog';

interface DangerZoneSectionProps {
  tribeId: string;
}

export function DangerZoneSection({ tribeId }: DangerZoneSectionProps) {
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: memberData } = useQuery(memberWithPermissionsOptions(tribeId));

  // Check if user can see danger zone actions
  const canDelete =
    memberData?.member.role === 'owner' || memberData?.permissions?.canDeleteTribe === true;
  const canTransfer =
    memberData?.member.role === 'owner' || memberData?.permissions?.canTransferOwnership === true;

  if (!canDelete && !canTransfer) {
    return null;
  }

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canTransfer && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Transfer Ownership</h4>
                <p className="text-sm text-muted-foreground">
                  Transfer ownership of this tribe to another admin member
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowTransferDialog(true)}
              >
                Transfer Ownership
              </Button>
            </div>
          )}

          {canDelete && (
            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
              <div>
                <h4 className="font-medium text-destructive">Delete Tribe</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this tribe and all of its content. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Tribe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TransferOwnershipDialog
        tribeId={tribeId}
        isOpen={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      />

      <DeleteTribeDialog
        tribeId={tribeId}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}

