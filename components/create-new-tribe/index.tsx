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
import { STEP_CONFIG, TOTAL_STEPS } from './stepConfig'
import { useCreateTribe } from '@/lib/hooks/use-tribes'
import { toast } from 'sonner'

export default function CreateTribePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const createTribe = useCreateTribe()

  // Form state
  const [tribeName, setTribeName] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState('')
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
        category: 'other', // Default category, can be enhanced later
      })

      toast.success('Tribe created successfully!')
      // Redirect to the new tribe dashboard
      router.push(`/tribe/${result.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tribe')
    }
  }

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return tribeName.trim() !== '' && description.trim() !== ''
      case 2:
        return location.trim() !== ''
      case 3:
        return true // Privacy has default value
      case 4:
        return true // Invites are optional
      default:
        return false
    }
  }

  const currentStepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG]

  return (
    <div className="flex h-screen bg-card">
      <div className="flex-1 ml-[72px] flex items-center justify-center p-8">
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
                onTribeNameChange={setTribeName}
                onDescriptionChange={setDescription}
                onAvatarChange={setAvatar}
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
