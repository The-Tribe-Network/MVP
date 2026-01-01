'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileText, Lock, Globe, Users } from 'lucide-react';
import { albumDetailOptions } from '@/lib/query-options/albums';
import { useUpdateAlbum } from '@/lib/hooks/use-albums';
import {
  albumDetailsFormSchema,
  type AlbumDetailsFormInput,
} from '@/lib/validations/album';

interface AlbumDetailsProps {
  tribeId: string;
  albumId: string;
}

const privacyOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to all tribe members',
    icon: Globe,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only visible to you and admins',
    icon: Lock,
  },
  {
    value: 'admin_only',
    label: 'Admin Only',
    description: 'Only visible to admins and moderators',
    icon: Users,
  },
] as const;

export function AlbumDetails({ tribeId, albumId }: AlbumDetailsProps) {
  const {
    data: album,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(albumDetailOptions(tribeId, albumId));

  const { mutate: updateAlbum, isPending } = useUpdateAlbum();

  const form = useForm<AlbumDetailsFormInput>({
    resolver: zodResolver(albumDetailsFormSchema),
    defaultValues: {
      name: '',
      description: '',
      privacy: 'public',
    },
    values: album
      ? {
          name: album.name,
          description: album.description || '',
          privacy: album.privacy,
        }
      : undefined,
  });

  const onSubmit = (data: AlbumDetailsFormInput) => {
    updateAlbum(
      {
        tribeId,
        albumId,
        data: {
          name: data.name,
          description: data.description || undefined,
          privacy: data.privacy,
        },
      },
      {
        onSuccess: () => {
          toast.success('Album details updated successfully');
          form.reset(data);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update album details');
        },
      }
    );
  };

  if (isLoading) {
    return <AlbumDetailsSkeleton />;
  }

  if (isError || !album) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load album</h2>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'Album not found or you do not have permission to access it.'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Album Details</h2>
        <p className="text-muted-foreground mt-1">
          Update your album's name, description, and visibility settings
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                The name and description of your album
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter album name"
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/100 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this album is about (optional)"
                        maxLength={500}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Visibility
              </CardTitle>
              <CardDescription>
                Control who can see this album
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Setting</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {privacyOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <div>
                                  <span className="font-medium">{option.label}</span>
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    - {option.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending || !form.formState.isDirty}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function AlbumDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
