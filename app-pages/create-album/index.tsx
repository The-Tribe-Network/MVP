'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { BasicInfoStep } from './BasicInfoStep'
import { CoverPhotoStep } from './CoverPhotoStep'
import { UploadMediaStep } from './UploadMediaStep'
import { SelectMediaStep } from './SelectMediaStep'
import { STEP_CONFIG, TOTAL_STEPS } from './stepConfig'
import { useCreateAlbum } from '@/lib/hooks/use-albums'
import { useDeleteMedia } from '@/lib/hooks/use-upload'
import { toast } from 'sonner'
import {
  albumStep1Schema,
  albumMediaValidation,
} from '@/lib/validations/album'
import type { PrivacyType, CoverMode } from './types'

interface CreateAlbumPageProps {
  tribeId: string
}

export default function CreateAlbumPage({ tribeId }: CreateAlbumPageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const formSubmittedSuccessfully = useRef(false)

  // Step 1 - Basic Info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<PrivacyType>('public')

  // Step 2 - Cover Photo
  const [coverMode, setCoverMode] = useState<CoverMode>('none')
  const [uploadedCoverId, setUploadedCoverId] = useState<string | null>(null)
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null)

  // Step 3 - Upload Media
  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([])

  // Step 4 - Select Media
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set())

  // Hooks
  const createAlbum = useCreateAlbum(tribeId)
  const deleteMedia = useDeleteMedia()

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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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

    router.back()
  }

  const handleSubmit = async () => {
    try {
      const finalCoverId = uploadedCoverId || selectedCoverId || undefined
      const allMediaIds = [...uploadedMediaIds, ...Array.from(selectedMediaIds)]

      await createAlbum.mutateAsync({
        name,
        description: description || undefined,
        privacy,
        coverId: finalCoverId,
        mediaIds: allMediaIds.length > 0 ? allMediaIds : undefined,
        isNewCover: uploadedCoverId !== null,
      })

      formSubmittedSuccessfully.current = true
      toast.success('Album created successfully!')
      router.push(`/tribe/${tribeId}/media`)
    } catch (error) {
      console.error('Failed to create album:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create album')
    }
  }

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1: {
        // Step 1: Basic Info validation
        const result = albumStep1Schema.safeParse({ name, description, privacy })
        return result.success
      }
      case 2: {
        // Step 2: Cover is always optional
        return true
      }
      case 3: {
        // Step 3: Upload media is optional (but validate max 20)
        return uploadedMediaIds.length <= 20
      }
      case 4: {
        // Step 4: Cross-validate with Step 3 - at least one must have media
        const result = albumMediaValidation.safeParse({
          uploadedMediaIds,
          selectedMediaIds: Array.from(selectedMediaIds),
        })
        return result.success
      }
      default:
        return false
    }
  }

  const currentStepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG]

  return (
    <div className="flex overflow-auto bg-background items-center justify-center min-h-screen p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Create a New Album</h1>
          <p className="text-muted-foreground">
            Organize and share your tribe's photos and memories
          </p>
        </div>

        <Card className="w-full bg-card border-zinc-700">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
                disabled={createAlbum.isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </div>
            </div>

            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

            <CardTitle className="text-2xl">{currentStepConfig.title}</CardTitle>
            <CardDescription>{currentStepConfig.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <BasicInfoStep
                name={name}
                description={description}
                privacy={privacy}
                onNameChange={setName}
                onDescriptionChange={setDescription}
                onPrivacyChange={setPrivacy}
              />
            )}

            {/* Step 2: Cover Photo */}
            {currentStep === 2 && (
              <CoverPhotoStep
                tribeId={tribeId}
                coverMode={coverMode}
                uploadedCoverId={uploadedCoverId}
                selectedCoverId={selectedCoverId}
                onCoverModeChange={setCoverMode}
                onUploadedCoverChange={setUploadedCoverId}
                onSelectedCoverChange={setSelectedCoverId}
              />
            )}

            {/* Step 3: Upload Media */}
            {currentStep === 3 && (
              <UploadMediaStep
                tribeId={tribeId}
                uploadedMediaIds={uploadedMediaIds}
                onUploadedMediaChange={setUploadedMediaIds}
              />
            )}

            {/* Step 4: Select Media */}
            {currentStep === 4 && (
              <SelectMediaStep
                tribeId={tribeId}
                selectedMediaIds={selectedMediaIds}
                onSelectedMediaChange={setSelectedMediaIds}
              />
            )}

            {/* Error Display */}
            {createAlbum.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {createAlbum.error instanceof Error
                  ? createAlbum.error.message
                  : 'Failed to create album'}
              </div>
            )}

            {/* Navigation Buttons */}
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              isStepValid={isStepValid()}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isSubmitting={createAlbum.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
