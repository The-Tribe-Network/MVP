'use client';

import { useRef, useState } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useUploadAvatar, useDeleteMedia } from '@/lib/hooks/use-upload';
import { validateImageFile } from '@/lib/utils/image';
import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import type { UpdateTribeInput } from '@/lib/validations/tribe';
import { LocationField } from './location-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_LABELS: Record<string, string> = {
  social: 'Social',
  gaming: 'Gaming',
  family: 'Family',
  work: 'Work',
  hobbies: 'Hobbies',
  other: 'Other',
};

const CATEGORIES = ['social', 'gaming', 'family', 'work', 'hobbies', 'other'];

interface TribeProfileSectionProps {
  control: Control<UpdateTribeInput>;
  avatarUrl?: string;
  tribeName: string;
}

export function TribeProfileSection({
  control,
  avatarUrl,
  tribeName,
}: TribeProfileSectionProps) {
  const { setValue } = useFormContext<UpdateTribeInput>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const deleteMedia = useDeleteMedia();
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(avatarUrl);

  const watchedName = useWatch({ control, name: 'name' }) || tribeName;
  const watchedAvatar = useWatch({ control, name: 'avatar' });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAvatar.mutateAsync(file);
      setValue('avatar', result.id);
      setCurrentAvatarUrl(result.url);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    const currentAvatar = watchedAvatar;
    
    // Check if avatar is a media ID (UUID) that needs to be deleted
    // UUIDs are 36 characters with dashes, and don't start with 'http'
    const isMediaId = currentAvatar && 
      typeof currentAvatar === 'string' && 
      !currentAvatar.startsWith('http') &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentAvatar);

    // If it's a media ID, delete it from Cloudinary and database
    if (isMediaId) {
      try {
        await deleteMedia.mutateAsync(currentAvatar);
        toast.success('Avatar removed successfully');
      } catch (error) {
        console.error('Failed to delete avatar media:', error);
        toast.error('Failed to delete avatar. Please try again.');
        return; // Don't clear the avatar if deletion failed
      }
    }

    // Set to empty string which will be transformed to null by the schema
    setValue('avatar', '');
    setCurrentAvatarUrl(undefined);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tribe Profile</CardTitle>
        <CardDescription>
          Basic information about your tribe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentAvatarUrl || '/placeholder.svg?height=96&width=96'} />
            <AvatarFallback className="text-2xl bg-zinc-700">
              {watchedName ? watchedName.substring(0, 2).toUpperCase() : 'TR'}
            </AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Avatar
                </>
              )}
            </Button>
            {currentAvatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={isUploading || deleteMedia.isPending}
              >
                {deleteMedia.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </Button>
            )}
          </div>
        </div>

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tribe Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter tribe name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what your tribe is about..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of your tribe (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                Help members find local events and meetups
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

