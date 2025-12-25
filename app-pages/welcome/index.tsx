'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { ProfileInfoStep } from './ProfileInfoStep'
import { UsernameStep } from './UsernameStep'
import { LocationField } from '@/app-pages/tribe-settings/general/sections/location-field'
import { STEP_CONFIG, TOTAL_STEPS } from './stepConfig'
import { useCompleteProfile } from '@/lib/hooks/use-profile'
import { toast } from 'sonner'
import { profileStep1Schema, profileStep2Schema, profileStep3Schema } from '@/lib/validations/profile'
import { getLocationPlaceId } from '@/lib/utils/location'

export default function WelcomePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const completeProfile = useCompleteProfile()

  // Form state
  const [avatar, setAvatar] = useState('') // Media ID
  const [avatarUrl, setAvatarUrl] = useState('') // Preview URL
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [username, setUsername] = useState('')
  const [location, setLocation] = useState('')

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

  const handleSubmit = async () => {
    try {
      await completeProfile.mutateAsync({
        displayName,
        bio: bio || undefined,
        avatar: avatar || undefined,
        username,
        location,
      })

      toast.success('Profile setup complete! Welcome to Tribe!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete profile')
    }
  }

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1: {
        const result = profileStep1Schema.safeParse({ displayName, bio })
        return result.success
      }
      case 2: {
        const result = profileStep2Schema.safeParse({ username })
        return result.success
      }
      case 3: {
        const result = profileStep3Schema.safeParse({ location })
        if (!result.success) return false

        // Also verify place ID can be extracted
        const validatedLocation = result.data.location
        return getLocationPlaceId(validatedLocation) !== null
      }
      default:
        return false
    }
  }

  const currentStepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG]

  return (
    <div className="flex overflow-auto bg-background items-center justify-center min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to Tribe!</h1>
          <p className="text-muted-foreground">Let's set up your profile to get started</p>
        </div>

        <Card className="w-full max-w-2xl bg-card border-zinc-700">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
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
              <ProfileInfoStep
                displayName={displayName}
                bio={bio}
                avatar={avatar}
                avatarUrl={avatarUrl}
                onDisplayNameChange={setDisplayName}
                onBioChange={setBio}
                onAvatarChange={setAvatar}
                onAvatarUrlChange={setAvatarUrl}
              />
            )}

            {currentStep === 2 && (
              <UsernameStep username={username} onUsernameChange={setUsername} />
            )}

            {currentStep === 3 && (
              <LocationField value={location} onChange={setLocation} />
            )}

            <NavigationButtons
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              isStepValid={isStepValid()}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isSubmitting={completeProfile.isPending}
              submitButtonText="Complete Setup"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
