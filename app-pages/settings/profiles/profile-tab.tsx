'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { LocationStep } from '@/app-pages/create-new-tribe/LocationStep'
import { useProfileForm } from './use-profile-form'
import { AvatarSection } from './avatar-section'
import { UsernameField } from './username-field'
import { FormField, BioField } from './form-fields'
import { ProfileTabSkeleton } from './skeleton'


export function ProfileTab() {
  const {
    formData,
    updateField,
    handleUsernameChange,
    handleSubmit,
    hasChanges,
    isFormValid,
    isLoadingProfile,
    isSubmitting,
    usernameError,
    isCheckingUsername,
    unsavedAvatarMediaId,
    setUnsavedAvatarMediaId,
    originalAvatarUrl,
    setOriginalAvatarUrl,
    markFormSaved,
  } = useProfileForm()

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await handleSubmit()
    if (success) {
      markFormSaved()
    }
  }

  const handleAvatarChange = (url: string | null, mediaId: string | null) => {
    const previousUrl = formData.avatarUrl
    updateField('avatarUrl', url)

    if (url && mediaId) {
      // New avatar uploaded - track for cleanup
      setUnsavedAvatarMediaId(mediaId)
      // Store original if not already stored
      if (originalAvatarUrl === null) {
        setOriginalAvatarUrl(previousUrl)
      }
    } else if (url === null) {
      // Avatar removed
      setUnsavedAvatarMediaId(null)
    }
  }

  if (isLoadingProfile) {
    return <ProfileTabSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile picture and personal details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Avatar Section */}
          <AvatarSection
            avatarUrl={formData.avatarUrl}
            displayName={formData.displayName}
            onAvatarChange={handleAvatarChange}
            disabled={isSubmitting}
          />

          <Separator />

          {/* Display Name */}
          <FormField
            id="displayName"
            label="Display Name"
            value={formData.displayName}
            onChange={(value) => updateField('displayName', value)}
            placeholder="How should we call you?"
            description="This is your public display name on Tribe"
            required
            disabled={isSubmitting}
          />

          {/* Username */}
          <UsernameField
            value={formData.username}
            onChange={handleUsernameChange}
            error={usernameError}
            isChecking={isCheckingUsername}
            disabled={isSubmitting}
          />

          {/* Bio */}
          <BioField
            value={formData.bio}
            onChange={(value) => updateField('bio', value)}
            disabled={isSubmitting}
          />

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationStep
              location={formData.location}
              onLocationChange={(value) => updateField('location', value)}
            />
            <p className="text-xs text-muted-foreground">
              This helps members find local events and meetups
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasChanges() || !isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

