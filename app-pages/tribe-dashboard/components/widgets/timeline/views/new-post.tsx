import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Image, Paperclip, ImagePlus, AlbumIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useState, useEffect } from "react";
import { useCreatePost } from "@/lib/hooks/use-posts";
import { useDeleteMedia, useUploadPostImage } from "@/lib/hooks/use-upload";
import { useTribeAlbums } from "@/lib/hooks/use-albums";
import { useTribeMemberPreferences } from "@/lib/hooks/use-tribe-preferences";
import { toast } from "sonner";
import { validateImageFile } from "@/lib/utils/image";
import { User } from "better-auth";
import NewPostAlbumToggle from "../components/new-post-album-toggle";
import AttachedAlbumPreview from "../components/attached-album-preview";
import { useAuthUser } from "@/lib/hooks/use-auth";
import SelectPostMediaDialog from "@/components/dialogs/select-post-media";
import SelectPostAlbumDialog, { type SelectedAlbum } from "@/components/dialogs/select-post-album";

interface NewPostProps {
  tribeId: string;
  onViewChange: (view: "posts" | "new post") => void;
};

export function NewPost({ tribeId, onViewChange }: NewPostProps) {
  const [newPost, setNewPost] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
  const [addToAlbum, setAddToAlbum] = useState(true)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isMediaFromLibrary, setIsMediaFromLibrary] = useState(false)
  const [isAlbumPickerOpen, setIsAlbumPickerOpen] = useState(false)
  const [linkedAlbum, setLinkedAlbum] = useState<SelectedAlbum | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuthUser();

  const createPostMutation = useCreatePost()
  const deleteMediaMutation = useDeleteMedia()
  const uploadImageMutation = useUploadPostImage()
  const { data: preferences, isLoading: isLoadingPreferences } = useTribeMemberPreferences(tribeId)
  const { data: albums, isLoading: isLoadingAlbums } = useTribeAlbums(tribeId)

  // Initialize state from preferences when they load
  useEffect(() => {
    if (preferences) {
      setAddToAlbum(preferences.autoAddPostMediaToTribe)
    }
  }, [preferences])

  // Reset album selection when image is removed
  useEffect(() => {
    if (!imagePreview && !uploadedImageId) {
      setSelectedAlbumId(null)
    }
  }, [imagePreview, uploadedImageId])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file')
      return
    }

    // Delete previous image if one exists (uploaded, not from library)
    const previousImageId = uploadedImageId
    if (previousImageId && !isMediaFromLibrary) {
      try {
        await deleteMediaMutation.mutateAsync(previousImageId)
      } catch (error) {
        console.error('Failed to delete previous image:', error)
        // Continue with upload even if deletion fails
      }
    }

    // Clear any linked album - only one attachment type allowed
    setLinkedAlbum(null)

    setIsUploadingImage(true)
    try {
      // Determine albumId based on toggle state
      const albumId = addToAlbum ? selectedAlbumId : null

      const result = await uploadImageMutation.mutateAsync({
        file,
        tribeId,
        postId: null,
        albumId: albumId || undefined, // Only send if not null
      })
      setUploadedImageId(result.id)
      setImagePreview(result.url)
      setIsMediaFromLibrary(false)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  };

  const handleRemoveImage = async () => {
    // Only delete from Cloudinary if it was uploaded for this post (not from library)
    if (uploadedImageId && !isMediaFromLibrary) {
      try {
        await deleteMediaMutation.mutateAsync(uploadedImageId)
        toast.success('Image removed successfully')
      } catch (error) {
        console.error('Failed to delete image:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to remove image')
        // Continue to clear local state even if deletion fails
      }
    }
    setUploadedImageId(null)
    setImagePreview(null)
    setIsMediaFromLibrary(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleAttachMedia = () => {
    setIsMediaPickerOpen(true)
  }

  const handleMediaSelected = (media: { id: string; url: string }) => {
    // Clear any linked album - only one attachment type allowed
    setLinkedAlbum(null)
    
    setUploadedImageId(media.id)
    setImagePreview(media.url)
    setIsMediaFromLibrary(true)
    setAddToAlbum(false) // Media from library is already in the tribe's media
  }

  const handleUploadNewMedia = () => {
    fileInputRef.current?.click()
  }

  const handleAlbums = () => {
    setIsAlbumPickerOpen(true)
  }

  const handleAlbumSelected = async (album: SelectedAlbum) => {
    // Clear any attached photo - only one attachment type allowed
    // Delete uploaded image if it was uploaded for this post (not from library)
    if (uploadedImageId && !isMediaFromLibrary) {
      try {
        await deleteMediaMutation.mutateAsync(uploadedImageId)
      } catch (error) {
        console.error('Failed to delete previous image:', error)
      }
    }
    setUploadedImageId(null)
    setImagePreview(null)
    setIsMediaFromLibrary(false)
    setSelectedAlbumId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    setLinkedAlbum(album)
  }

  const handleRemoveLinkedAlbum = () => {
    setLinkedAlbum(null)
  }

  const handleEvents = () => {
    // TODO: Implement events functionality
    toast.info('Events feature coming soon')
  }

  const handlePost = async () => {
    if (!newPost.trim() || !user) return

    try {
      await createPostMutation.mutateAsync({
        tribeId,
        content: newPost.trim(),
        addToAlbum,
        mediaId: uploadedImageId || null,
        albumId: addToAlbum ? selectedAlbumId || null : null,
        linkedAlbumId: linkedAlbum?.id || null,
      })
      setNewPost('')
      setUploadedImageId(null)
      setImagePreview(null)
      setIsMediaFromLibrary(false)
      setLinkedAlbum(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onViewChange("posts")
    } catch (error) {
      console.error('Failed to create post:', error)
      // Error handling could be improved with toast notifications
    }
  }

  return (
    <div className="pt-6 px-4 md:px-0">
      <div className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="min-h-[100px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
          disabled={createPostMutation.isPending}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto object-contain max-h-[400px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleRemoveImage}
              disabled={isUploadingImage || createPostMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Linked album preview */}
        {linkedAlbum && (
          <AttachedAlbumPreview
            album={linkedAlbum}
            onRemove={handleRemoveLinkedAlbum}
            disabled={createPostMutation.isPending}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 gap-2"
                    disabled={isUploadingImage || createPostMutation.isPending}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                    <span className="hidden md:inline">Photos</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleAttachMedia}>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach tribe media
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleUploadNewMedia}>
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Upload new media
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                className="h-9 gap-2"
                onClick={handleAlbums}
                disabled={isUploadingImage || createPostMutation.isPending}
              >
                <AlbumIcon className="h-4 w-4" />
                <span className="hidden md:inline">Albums</span>
              </Button>
              <Button
                variant="ghost"
                className="h-9 gap-2"
                onClick={handleEvents}
                disabled={isUploadingImage || createPostMutation.isPending}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Events</span>
              </Button>
            </div>

            {!isMediaFromLibrary && (
              <NewPostAlbumToggle
                imagePreview={imagePreview}
                addToAlbum={addToAlbum}
                setAddToAlbum={setAddToAlbum}
                isDisabled={isUploadingImage || createPostMutation.isPending || isLoadingPreferences}
                selectedAlbumId={selectedAlbumId}
                setSelectedAlbumId={setSelectedAlbumId}
                albums={albums || []}
                isLoadingAlbums={isLoadingAlbums}
              />
            )}
          </div>

          <Button
            onClick={handlePost}
            disabled={!newPost.trim() || createPostMutation.isPending || isUploadingImage}
          >
            {createPostMutation.isPending ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      <SelectPostMediaDialog
        tribeId={tribeId}
        isOpen={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={handleMediaSelected}
      />

      <SelectPostAlbumDialog
        tribeId={tribeId}
        isOpen={isAlbumPickerOpen}
        onOpenChange={setIsAlbumPickerOpen}
        onSelect={handleAlbumSelected}
      />
    </div>
  )
}