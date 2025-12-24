'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { BasicInfoStep } from './BasicInfoStep'
import { LocationStep } from './LocationStep'
import { PrivacyStep } from './PrivacyStep'
import { InviteMembersStep } from './InviteMembersStep'
import type { PrivacyType, TribeCategory } from './types'
import { STEP_CONFIG, TOTAL_STEPS } from './stepConfig'
import { useCreateTribe } from '@/lib/hooks/use-tribes'
import { toast } from 'sonner'
import {
  createTribeFormSchema,
  step1Fields,
  step2Fields,
  step3Fields,
  type CreateTribeFormInput,
} from '@/lib/validations/tribe'

export default function CreateTribePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [currentEmail, setCurrentEmail] = useState('')
  const createTribe = useCreateTribe()

  // Single form instance manages all state
  const form = useForm<CreateTribeFormInput>({
    resolver: zodResolver(createTribeFormSchema),
    defaultValues: {
      tribeName: '',
      description: '',
      avatar: '',
      avatarUrl: '',
      category: 'other',
      location: '',
      privacy: 'private',
      invitations: [],
    },
    mode: 'onChange',
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'invitations',
  })

  // Watch form values for step components
  const formValues = form.watch()

  const handleNext = async () => {
    let fieldsToValidate: readonly string[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = step1Fields
        break
      case 2:
        fieldsToValidate = step2Fields
        break
      case 3:
        fieldsToValidate = step3Fields
        break
    }

    const isValid = await form.trigger(fieldsToValidate as (keyof CreateTribeFormInput)[])
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddEmail = () => {
    if (currentEmail && currentEmail.includes('@')) {
      // Check for duplicates
      if (!fields.some((f) => f.email === currentEmail)) {
        append({ email: currentEmail, role: 'member' })
      }
      setCurrentEmail('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    const index = fields.findIndex((f) => f.email === email)
    if (index !== -1) {
      remove(index)
    }
  }

  const handleUpdateRole = (email: string, newRole: 'admin' | 'moderator' | 'member') => {
    const index = fields.findIndex((f) => f.email === email)
    if (index !== -1) {
      update(index, { ...fields[index], role: newRole })
    }
  }

  const handleSubmit = async () => {
    const data = form.getValues()

    try {
      const result = await createTribe.mutateAsync({
        name: data.tribeName,
        description: data.description || undefined,
        avatar: data.avatar || undefined,
        location: data.location || undefined,
        privacy: data.privacy,
        category: data.category,
        invitations: data.invitations && data.invitations.length > 0 ? data.invitations : undefined,
      })

      toast.success('Tribe created successfully!')
      if (data.invitations && data.invitations.length > 0) {
        toast.success(`${data.invitations.length} invitation(s) sent!`)
      }
      form.reset()
      router.push(`/tribe/${result.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tribe')
    }
  }

  const isStepValid = (): boolean => {
    const { errors } = form.formState

    switch (currentStep) {
      case 1:
        return !errors.tribeName && !errors.description &&
               formValues.tribeName.length >= 2 && formValues.description.length > 0
      case 2:
        return !errors.location && formValues.location.length > 0
      case 3:
        return !errors.privacy
      case 4:
        return true // Invites are optional
      default:
        return false
    }
  }

  const currentStepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG]

  return (
    <div className="flex overflow-auto bg-background items-center justify-center h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Create a New Tribe</h1>
          <p className="text-muted-foreground">Tell us about your tribe and we'll help you get started</p>
        </div>
        <Card className="w-full max-w-2xl bg-card border-zinc-700">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground"
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
            {currentStep === 1 && (
              <BasicInfoStep
                tribeName={formValues.tribeName}
                description={formValues.description}
                avatar={formValues.avatar || ''}
                avatarUrl={formValues.avatarUrl}
                category={formValues.category as TribeCategory}
                onTribeNameChange={(value) => form.setValue('tribeName', value, { shouldValidate: true })}
                onDescriptionChange={(value) => form.setValue('description', value, { shouldValidate: true })}
                onAvatarChange={(value) => form.setValue('avatar', value)}
                onAvatarUrlChange={(value) => form.setValue('avatarUrl', value)}
                onCategoryChange={(value) => form.setValue('category', value)}
              />
            )}

            {currentStep === 2 && (
              <LocationStep
                location={formValues.location}
                onLocationChange={(value) => form.setValue('location', value, { shouldValidate: true })}
              />
            )}

            {currentStep === 3 && (
              <PrivacyStep
                privacy={formValues.privacy as PrivacyType}
                onPrivacyChange={(value) => form.setValue('privacy', value)}
              />
            )}

            {currentStep === 4 && (
              <InviteMembersStep
                inviteEmails={fields.map((f) => ({ email: f.email, role: f.role }))}
                currentEmail={currentEmail}
                onEmailChange={setCurrentEmail}
                onAddEmail={handleAddEmail}
                onRemoveEmail={handleRemoveEmail}
                onUpdateRole={handleUpdateRole}
              />
            )}

            <NavigationButtons
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              isStepValid={isStepValid()}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isSubmitting={createTribe.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
