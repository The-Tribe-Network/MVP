'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { BasicInfoStep } from './BasicInfoStep'
import { LocationStep } from './LocationStep'
import { PrivacyStep } from './PrivacyStep'
import { InviteMembersStep } from './InviteMembersStep'
import { InvitedMember, PrivacyType } from './types'
import type { TribeCategory } from './types'
import { STEP_CONFIG, TOTAL_STEPS } from './stepConfig'
import { useCreateTribe } from '@/lib/hooks/use-tribes'
import { toast } from 'sonner'
import { step1Schema, step2Schema, step3Schema, step4Schema } from '@/lib/validations/tribe'
import { getLocationPlaceId } from '@/lib/utils/location'

export default function CreateTribePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const createTribe = useCreateTribe()

  // Form state
  const [tribeName, setTribeName] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState('') // Media ID
  const [avatarUrl, setAvatarUrl] = useState('') // Preview URL
  const [category, setCategory] = useState<TribeCategory>('other')
  const [location, setLocation] = useState('')
  const [privacy, setPrivacy] = useState<PrivacyType>('private')
  const [inviteEmails, setInviteEmails] = useState<InvitedMember[]>([])
  const [currentEmail, setCurrentEmail] = useState('')

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

  const handleAddEmail = () => {
    if (currentEmail && currentEmail.includes('@')) {
      setInviteEmails([...inviteEmails, { email: currentEmail, role: 'member' }])
      setCurrentEmail('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((m) => m.email !== email))
  }

  const handleUpdateRole = (email: string, newRole: InvitedMember['role']) => {
    setInviteEmails(inviteEmails.map((m) => (m.email === email ? { ...m, role: newRole } : m)))
  }

  const handleSubmit = async () => {
    try {
      const result = await createTribe.mutateAsync({
        name: tribeName,
        description: description || undefined,
        avatar: avatar || undefined,
        location: location || undefined,
        privacy: privacy,
        category: category,
        invitations: inviteEmails.length > 0 ? inviteEmails : undefined,
      })

      toast.success('Tribe created successfully!')
      if (inviteEmails.length > 0) {
        toast.success(`${inviteEmails.length} invitation(s) sent!`)
      }
      // Redirect to the new tribe dashboard
      router.push(`/tribe/${result.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tribe')
    }
  }

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1: {
        const result = step1Schema.safeParse({ tribeName, description })
        return result.success
      }
      case 2: {
        const result = step2Schema.safeParse({ location })

        if (!result.success) {
          return false
        }

        const validatedLocation = result.data.location

        return getLocationPlaceId(validatedLocation) !== null
      }
      case 3: {
        const result = step3Schema.safeParse({ privacy })
        return result.success
      }
      case 4: {
        // Invites are optional, so this step is always valid
        const result = step4Schema.safeParse({})
        return result.success
      }
      default:
        return false
    }
  }

  const currentStepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG]

  return (
    <div className="flex overflow-auto bg-background items-center justify-center h-full">
      <div className="flex-1 ml-[72px] flex flex-col items-center justify-center p-8">
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
                tribeName={tribeName}
                description={description}
                avatar={avatar}
                avatarUrl={avatarUrl}
                category={category}
                onTribeNameChange={setTribeName}
                onDescriptionChange={setDescription}
                onAvatarChange={setAvatar}
                onAvatarUrlChange={setAvatarUrl}
                onCategoryChange={setCategory}
              />
            )}

            {currentStep === 2 && (
              <LocationStep location={location} onLocationChange={setLocation} />
            )}

            {currentStep === 3 && (
              <PrivacyStep privacy={privacy} onPrivacyChange={setPrivacy} />
            )}

            {currentStep === 4 && (
              <InviteMembersStep
                inviteEmails={inviteEmails}
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
