'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BasicInfoStep,
  LocationStep,
  PrivacyStep,
  InviteMembersStep,
  ProgressBar,
  NavigationButtons,
} from './components'
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
  const { mutate: createTribe, isPending } = useCreateTribe()

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

  const onSubmit = (data: CreateTribeFormInput) => {
    createTribe(
      {
        name: data.tribeName,
        description: data.description || undefined,
        avatar: data.avatar || undefined,
        location: data.location || undefined,
        privacy: data.privacy,
        category: data.category,
        invitations: data.invitations && data.invitations.length > 0 ? data.invitations : undefined,
      },
      {
        onSuccess: (result) => {
          toast.success('Tribe created successfully!')
          if (data.invitations && data.invitations.length > 0) {
            toast.success(`${data.invitations.length} invitation(s) sent!`)
          }
          form.reset()
          router.push(`/tribe/${result.id}`)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to create tribe')
        },
      }
    )
  }

  const isStepValid = (): boolean => {
    const { errors } = form.formState
    const values = form.getValues()

    switch (currentStep) {
      case 1:
        return !errors.tribeName && !errors.description &&
               values.tribeName.length >= 2 && values.description.length > 0
      case 2:
        return !errors.location && values.location.length > 0
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
          <p className="text-muted-foreground">Tell us about your tribe and we&apos;ll help you get started</p>
        </div>
        <Card className="w-full max-w-2xl bg-card border-zinc-700">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
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
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {currentStep === 1 && <BasicInfoStep control={form.control} />}
                {currentStep === 2 && <LocationStep control={form.control} />}
                {currentStep === 3 && <PrivacyStep control={form.control} />}
                {currentStep === 4 && <InviteMembersStep control={form.control} />}

                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  isStepValid={isStepValid()}
                  onBack={handleBack}
                  onNext={handleNext}
                  onSubmit={form.handleSubmit(onSubmit)}
                  isSubmitting={isPending}
                />
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
