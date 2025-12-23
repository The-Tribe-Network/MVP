'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteTribe } from '@/lib/hooks/use-tribe-settings';
import { toast } from 'sonner';

interface DeleteTribeDialogProps {
  tribeId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTribeDialog({
  tribeId,
  isOpen,
  onOpenChange,
}: DeleteTribeDialogProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const deleteTribe = useDeleteTribe(tribeId);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await deleteTribe.mutateAsync();
      toast.success('Tribe deleted successfully');
      onOpenChange(false);
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tribe');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Tribe
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the tribe and all of its content, including posts, media, events, and member data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-2">
              Warning: This action is irreversible
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All posts and comments will be deleted</li>
              <li>All media and albums will be deleted</li>
              <li>All events and RSVPs will be deleted</li>
              <li>All member data and permissions will be deleted</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <strong>DELETE</strong> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmation !== 'DELETE' || deleteTribe.isPending}
          >
            {deleteTribe.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Tribe'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

