'use client';

import { useRef, useState, useEffect } from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { Upload, Loader2, ImageIcon, X } from 'lucide-react';
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
import { useUploadTribeAvatar, useUploadTribeBanner, useDeleteMedia } from '@/lib/hooks/use-upload';
import { validateImageFile } from '@/lib/utils/image';
import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';
import type { UpdateTribeInput } from '@/lib/validations/tribe';
import { LocationField } from './location-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  bannerUrl?: string;
  tribeName: string;
}

export function TribeProfileSection({
  control,
  avatarUrl,
  bannerUrl,
  tribeName,
}: TribeProfileSectionProps) {
  const { setValue, formState } = useFormContext<UpdateTribeInput>();
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadTribeAvatar();
  const uploadBanner = useUploadTribeBanner();
  const deleteMedia = useDeleteMedia();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(avatarUrl);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | undefined>(bannerUrl);

  // Track pending banner upload for cleanup if user leaves without saving
  const pendingBannerRef = useRef<string | null>(null);

  // Clear pending ref when form is successfully submitted
  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      pendingBannerRef.current = null;
    }
  }, [formState.isSubmitSuccessful]);

  // Cleanup pending banner upload on unmount if form wasn't saved
  useEffect(() => {
    return () => {
      const pendingId = pendingBannerRef.current;
      if (pendingId) {
        // Fire and forget - delete the orphaned upload
        fetch(`/api/media/${pendingId}`, { method: 'DELETE' }).catch(console.error);
      }
    };
  }, []);

  const watchedName = useWatch({ control, name: 'name' }) || tribeName;
  const watchedAvatar = useWatch({ control, name: 'avatar' });
  const watchedBanner = useWatch({ control, name: 'banner' });

  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await uploadAvatar.mutateAsync({ file });
      setValue('avatar', result.id);
      setCurrentAvatarUrl(result.url);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };

  const handleBannerFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingBanner(true);
    try {
      const result = await uploadBanner.mutateAsync({ file });
      // Track as pending upload for cleanup if user leaves without saving
      pendingBannerRef.current = result.id;
      setValue('banner', result.id);
      setCurrentBannerUrl(result.url);
      toast.success('Banner uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner');
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = '';
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

  const handleRemoveBanner = async () => {
    const currentBanner = watchedBanner;

    // Check if banner is a media ID (UUID) that needs to be deleted
    const isMediaId = currentBanner &&
      typeof currentBanner === 'string' &&
      !currentBanner.startsWith('http') &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentBanner);

    // If it's a media ID, delete it from Cloudinary and database
    if (isMediaId) {
      try {
        await deleteMedia.mutateAsync(currentBanner);
        toast.success('Banner removed successfully');
      } catch (error) {
        console.error('Failed to delete banner media:', error);
        toast.error('Failed to delete banner. Please try again.');
        return; // Don't clear the banner if deletion failed
      }
    }

    // Set to empty string which will be transformed to null by the schema
    setValue('banner', '');
    setCurrentBannerUrl(undefined);
  };

  const handleAvatarUploadClick = () => {
    avatarFileInputRef.current?.click();
  };

  const handleBannerUploadClick = () => {
    bannerFileInputRef.current?.click();
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
        {/* Banner Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4" />
            <span>Banner Image</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A 16:9 banner image that appears at the top of your tribe dashboard
          </p>

          {/* Hidden file input for banner */}
          <input
            ref={bannerFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerFileSelect}
            className="hidden"
          />

          {currentBannerUrl ? (
            /* Banner preview with 16:9 aspect ratio */
            <div className="relative rounded-lg overflow-hidden border border-border">
              <div className="aspect-video">
                <img
                  src={currentBannerUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Button container - top right */}
              <div className="absolute top-2 right-2 flex gap-1">
                {/* Replace button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 hover:bg-background"
                      onClick={handleBannerUploadClick}
                      disabled={isUploadingBanner || deleteMedia.isPending}
                    >
                      {isUploadingBanner ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Replace banner</TooltipContent>
                </Tooltip>
                {/* Remove button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 hover:bg-background"
                      onClick={handleRemoveBanner}
                      disabled={isUploadingBanner || deleteMedia.isPending}
                    >
                      {deleteMedia.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove banner</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            /* Upload button/zone for banner */
            <button
              type="button"
              onClick={handleBannerUploadClick}
              disabled={isUploadingBanner}
              className={cn(
                'w-full aspect-video border-2 border-dashed rounded-lg',
                'flex flex-col items-center justify-center gap-2',
                'text-muted-foreground hover:text-foreground hover:border-foreground/50',
                'transition-colors cursor-pointer',
                isUploadingBanner && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUploadingBanner ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Click to upload a banner image</span>
                  <span className="text-xs">16:9 aspect ratio recommended • PNG, JPG, WebP up to 5MB</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentAvatarUrl || '/placeholder.svg?height=96&width=96'} />
            <AvatarFallback className="text-2xl bg-zinc-700">
              {watchedName ? watchedName.substring(0, 2).toUpperCase() : 'TR'}
            </AvatarFallback>
          </Avatar>
          <input
            ref={avatarFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleAvatarUploadClick}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
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
                disabled={isUploadingAvatar || deleteMedia.isPending}
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

