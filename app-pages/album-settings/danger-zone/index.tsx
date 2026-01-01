'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  AlertCircle,
  AlertTriangle,
  Trash2,
  Loader2,
} from 'lucide-react';
import { albumDetailOptions } from '@/lib/query-options/albums';
import { useDeleteAlbum } from '@/lib/hooks/use-albums';

interface AlbumDangerZoneProps {
  tribeId: string;
  albumId: string;
}

export function AlbumDangerZone({ tribeId, albumId }: AlbumDangerZoneProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const {
    data: album,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(albumDetailOptions(tribeId, albumId));

  const { mutate: deleteAlbum, isPending: isDeleting } = useDeleteAlbum();

  const handleDeleteAlbum = () => {
    if (!album || deleteConfirmText !== album.name) {
      toast.error('Please type the album name correctly to confirm deletion');
      return;
    }

    deleteAlbum(
      { tribeId, albumId },
      {
        onSuccess: () => {
          toast.success('Album deleted successfully');
          router.push(`/tribe/${tribeId}/media/browse`);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to delete album');
        },
      }
    );
  };

  if (isLoading) {
    return <DangerZoneSkeleton />;
  }

  if (isError || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load album</h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'Album not found'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const photoCount = album.media?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>
        <p className="text-muted-foreground mt-1">
          Irreversible actions for this album
        </p>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Album
          </CardTitle>
          <CardDescription>
            Permanently delete this album and remove all photos from it.
            The photos themselves will not be deleted from the tribe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium mb-2">
                Warning: This action is irreversible
              </p>
              <p className="text-sm text-muted-foreground">
                Deleting this album will:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Remove this album permanently</li>
                <li>Unlink {photoCount} photo{photoCount !== 1 ? 's' : ''} from this album</li>
                <li>Remove all album metadata and settings</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Note: The photos will remain in the tribe's media library.
              </p>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Album
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Album Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p>
                        This action cannot be undone. This will permanently delete the
                        album <strong>"{album.name}"</strong> and unlink all photos from it.
                      </p>
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Album metadata will be permanently deleted</li>
                          <li>{photoCount} photo{photoCount !== 1 ? 's' : ''} will be unlinked</li>
                          <li>Cover image reference will be removed</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <Label htmlFor="confirm-delete">
                          Type <span className="font-mono font-semibold bg-muted px-1 py-0.5 rounded">{album.name}</span> to confirm:
                        </Label>
                        <Input
                          id="confirm-delete"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type album name here"
                          className="mt-2"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setDeleteConfirmText('')}
                    disabled={isDeleting}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAlbum();
                    }}
                    disabled={deleteConfirmText !== album.name || isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Permanently
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DangerZoneSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
