'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { CreateAlbumNavigation, type CreateAlbumStep } from './components/create-album-navigation'
import { CreateAlbumHeader } from './components/create-album-header'
import { AlbumDetailsSection } from './album-details'
import { UploadMediaSection } from './upload-media'
import { SelectMediaSection } from './select-media'
import { useCreateAlbum } from '@/lib/hooks/use-albums'
import { useUploadAlbumCover, useDeleteMedia } from '@/lib/hooks/use-upload'
import { toast } from 'sonner'
import {
  createAlbumFormSchema,
  albumStep1Schema,
  albumMediaValidation,
  type CreateAlbumFormInput,
} from '@/lib/validations/album'

interface CreateAlbumPageProps {
  tribeId: string
}

export default function CreateAlbumPage({ tribeId }: CreateAlbumPageProps) {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState<CreateAlbumStep>('album-details')
  const [completedSteps, setCompletedSteps] = useState<Set<CreateAlbumStep>>(new Set())
  const formSubmittedSuccessfully = useRef(false)

  // Cover photo state (managed outside form for preview URL)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [uploadedCoverId, setUploadedCoverId] = useState<string | null>(null)

  // Media IDs (managed outside form for upload & select steps)
  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([])
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set())

  // Form setup with react-hook-form
  const form = useForm<CreateAlbumFormInput>({
    resolver: zodResolver(createAlbumFormSchema),
    defaultValues: {
      name: '',
      description: '',
      privacy: 'public',
      coverId: null,
      isNewCover: false,
    },
  })

  // Hooks
  const createAlbum = useCreateAlbum(tribeId)
  const uploadCover = useUploadAlbumCover()
  const deleteMedia = useDeleteMedia()

  // Watch form fields for validation
  const watchedName = useWatch({ control: form.control, name: 'name' })

  // Cleanup on unmount (if form wasn't submitted)
  useEffect(() => {
    return () => {
      if (!formSubmittedSuccessfully.current) {
        const assetsToCleanup = [uploadedCoverId, ...uploadedMediaIds].filter(Boolean) as string[]
        assetsToCleanup.forEach((id) => {
          deleteMedia.mutate(id)
        })
      }
    }
  }, [])

  // Track completed steps based on validation
  useEffect(() => {
    const formData = form.getValues()
    const newCompleted = new Set<CreateAlbumStep>()

    // Check album-details step
    const step1Valid = albumStep1Schema.safeParse(formData).success
    if (step1Valid) {
      newCompleted.add('album-details')
    }

    // Upload media step is always "valid" (optional)
    if (uploadedMediaIds.length > 0) {
      newCompleted.add('upload-media')
    }

    // Select media step is always "valid" (optional)
    if (selectedMediaIds.size > 0) {
      newCompleted.add('select-media')
    }

    setCompletedSteps(newCompleted)
  }, [watchedName, uploadedMediaIds, selectedMediaIds])

  // Cover photo handlers
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setIsUploadingCover(true)

    // Create local preview first
    const previewUrl = URL.createObjectURL(file)
    setCoverPreviewUrl(previewUrl)

    try {
      const result = await uploadCover.mutateAsync({ file, tribeId })

      // Clean up old uploaded cover if exists
      if (uploadedCoverId) {
        deleteMedia.mutate(uploadedCoverId)
      }

      setUploadedCoverId(result.id)
      setCoverPreviewUrl(result.url)
      form.setValue('coverId', result.id)
      form.setValue('isNewCover', true)
      toast.success('Cover uploaded successfully')
    } catch (error) {
      console.error('Failed to upload cover:', error)
      toast.error('Failed to upload cover')
      setCoverPreviewUrl(null)
    } finally {
      setIsUploadingCover(false)
      // Revoke the blob URL
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  const handleCoverSelect = (mediaId: string, url: string) => {
    // Clean up uploaded cover if exists (since we're selecting existing media)
    if (uploadedCoverId) {
      deleteMedia.mutate(uploadedCoverId)
      setUploadedCoverId(null)
    }

    setCoverPreviewUrl(url)
    form.setValue('coverId', mediaId)
    form.setValue('isNewCover', false)
  }

  const handleCoverRemove = async () => {
    // Delete uploaded cover from server if it was uploaded
    if (uploadedCoverId) {
      try {
        await deleteMedia.mutateAsync(uploadedCoverId)
        setUploadedCoverId(null)
      } catch (error) {
        console.error('Failed to delete cover:', error)
        toast.error('Failed to remove cover')
        return
      }
    }

    // Clean up preview URL
    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl)
    }

    setCoverPreviewUrl(null)
    form.setValue('coverId', null)
    form.setValue('isNewCover', false)
  }

  const handleCancel = async () => {
    const assetsToDelete = [uploadedCoverId, ...uploadedMediaIds].filter(Boolean) as string[]

    for (const id of assetsToDelete) {
      try {
        await deleteMedia.mutateAsync(id)
      } catch (error) {
        console.error('Failed to cleanup media:', id, error)
      }
    }

    router.push(`/tribe/${tribeId}/media`)
  }

  const handleSubmit = async () => {
    // Validate step 1 first
    const formData = form.getValues()
    const step1Result = albumStep1Schema.safeParse(formData)
    if (!step1Result.success) {
      toast.error('Please complete the album details first')
      setActiveStep('album-details')
      return
    }

    // Validate media requirement
    const allMediaIds = [...uploadedMediaIds, ...Array.from(selectedMediaIds)]
    const mediaResult = albumMediaValidation.safeParse({
      uploadedMediaIds,
      selectedMediaIds: Array.from(selectedMediaIds),
    })
    if (!mediaResult.success) {
      toast.error('Please add at least one photo to the album')
      return
    }

    try {
      await createAlbum.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        privacy: formData.privacy,
        coverId: formData.coverId || undefined,
        mediaIds: allMediaIds.length > 0 ? allMediaIds : undefined,
        isNewCover: formData.isNewCover,
      })

      formSubmittedSuccessfully.current = true
      toast.success('Album created successfully!')
      router.push(`/tribe/${tribeId}/media`)
    } catch (error) {
      console.error('Failed to create album:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create album')
    }
  }

  const canNavigateToStep = (step: CreateAlbumStep): boolean => {
    // Can always navigate to album-details
    if (step === 'album-details') return true

    // For other steps, album-details must be valid
    const formData = form.getValues()
    const step1Valid = albumStep1Schema.safeParse(formData).success
    return step1Valid
  }

  const renderActiveSection = () => {
    switch (activeStep) {
      case 'album-details':
        return (
          <AlbumDetailsSection
            control={form.control}
            tribeId={tribeId}
            coverPreviewUrl={coverPreviewUrl}
            onCoverUpload={handleCoverUpload}
            onCoverSelect={handleCoverSelect}
            onCoverRemove={handleCoverRemove}
            isUploadingCover={isUploadingCover}
          />
        )
      case 'upload-media':
        return (
          <UploadMediaSection
            tribeId={tribeId}
            uploadedMediaIds={uploadedMediaIds}
            onUploadedMediaChange={setUploadedMediaIds}
          />
        )
      case 'select-media':
        return (
          <SelectMediaSection
            tribeId={tribeId}
            selectedMediaIds={selectedMediaIds}
            onSelectedMediaChange={setSelectedMediaIds}
          />
        )
      default:
        return (
          <AlbumDetailsSection
            control={form.control}
            tribeId={tribeId}
            coverPreviewUrl={coverPreviewUrl}
            onCoverUpload={handleCoverUpload}
            onCoverSelect={handleCoverSelect}
            onCoverRemove={handleCoverRemove}
            isUploadingCover={isUploadingCover}
          />
        )
    }
  }

  const totalMediaCount = uploadedMediaIds.length + selectedMediaIds.size

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}/media`}>Media</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Album</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <CreateAlbumHeader />

        {/* Main Content with Sidebar */}
        <div className="flex gap-8 mt-8">
          {/* Sidebar Navigation */}
          <CreateAlbumNavigation
            activeStep={activeStep}
            onStepChange={setActiveStep}
            completedSteps={completedSteps}
            canNavigateToStep={canNavigateToStep}
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <Form {...form}>
              <form onSubmit={(e) => e.preventDefault()}>
                {renderActiveSection()}

                {/* Error Display */}
                {createAlbum.error && (
                  <div className="mt-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {createAlbum.error instanceof Error
                      ? createAlbum.error.message
                      : 'Failed to create album'}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    {totalMediaCount === 0
                      ? 'No media added yet'
                      : `${totalMediaCount} ${totalMediaCount === 1 ? 'photo' : 'photos'} will be added to the album`}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={createAlbum.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createAlbum.isPending || totalMediaCount === 0}
                    >
                      {createAlbum.isPending ? 'Creating...' : 'Create Album'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
