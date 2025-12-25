'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { StepSidebar } from './components/step-sidebar'
import { StepNavigation } from './components/step-navigation'
import { BasicInfoStep } from './components/basic-info-step'
import { LocationStep } from './components/location-step'
import { PrivacyStep } from './components/privacy-step'
import { InviteMembersStep } from './components/invite-members-step'
import { useCreateTribe } from '@/lib/hooks/use-tribes'
import { toast } from 'sonner'
import {
  createTribeFormSchema,
  step1Fields,
  step2Fields,
  step3Fields,
  type CreateTribeFormInput,
} from '@/lib/validations/tribe'

const STEPS = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Location' },
  { id: 3, name: 'Privacy' },
  { id: 4, name: 'Invite' },
]

// Map step to fields for validation
const getStepFields = (step: number): (keyof CreateTribeFormInput)[] => {
  switch (step) {
    case 1:
      return [...step1Fields] as (keyof CreateTribeFormInput)[]
    case 2:
      return [...step2Fields] as (keyof CreateTribeFormInput)[]
    case 3:
      return [...step3Fields] as (keyof CreateTribeFormInput)[]
    case 4:
      return [] // Invites are optional
    default:
      return []
  }
}

export default function CreateTribePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { mutate: createTribe, isPending: isSubmitting } = useCreateTribe()

  const form = useForm<CreateTribeFormInput>({
    resolver: zodResolver(createTribeFormSchema),
    defaultValues: {
      tribeName: '',
      description: '',
      avatar: '',
      avatarUrl: '',
      banner: '',
      bannerUrl: '',
      category: 'other',
      location: '',
      privacy: 'private',
      invitations: [],
    },
    mode: 'onChange',
  })

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep)
    const isValid = fieldsToValidate.length > 0
      ? await form.trigger(fieldsToValidate)
      : true

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = async (targetStep: number) => {
    // Allow going backward without validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep)
      return
    }

    // Validate current step before going forward
    const fieldsToValidate = getStepFields(currentStep)
    const isValid = fieldsToValidate.length > 0
      ? await form.trigger(fieldsToValidate)
      : true

    if (isValid) {
      setCurrentStep(targetStep)
    }
  }

  const handleSubmit = async () => {
    // Only allow submission on the last step
    if (currentStep !== STEPS.length) {
      return
    }

    // Validate entire form before submitting
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Please fix the errors before submitting')
      return
    }

    const data = form.getValues()
    createTribe(
      {
        name: data.tribeName,
        description: data.description || undefined,
        avatar: data.avatar || undefined,
        banner: data.banner || undefined,
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep control={form.control} />
      case 2:
        return <LocationStep control={form.control} />
      case 3:
        return <PrivacyStep control={form.control} />
      case 4:
        return <InviteMembersStep control={form.control} />
      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl pt-8 pb-8 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create a New Tribe</h1>
        <p className="text-muted-foreground mt-1">
          Tell us about your tribe and we'll help you get started
        </p>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          {/* Prevent accidental form submission */}
          <div
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.preventDefault()
              }
            }}
          >
            <div className="flex gap-6">
              {/* Left: Sticky Step Navigation (hidden on mobile) */}
              <StepSidebar
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={goToStep}
                className="hidden lg:block sticky self-start top-[72px]"
              />

              {/* Vertical Separator (hidden on mobile) */}
              <Separator orientation="vertical" className="hidden lg:block h-auto" />

              {/* Right: Form Content */}
              <div className="flex-1 min-w-0">
                {renderStep()}

                {/* Bottom Navigation (always visible) */}
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={STEPS.length}
                  isSubmitting={isSubmitting}
                  onPrevious={prevStep}
                  onNext={nextStep}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        </Form>
      </FormProvider>
    </div>
  )
}
