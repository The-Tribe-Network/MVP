'use client'

import { useState, useEffect, useRef } from 'react'
import { useProfile, useUpdateProfile, useCheckUsername } from '@/lib/hooks/use-profile'
import { useDeleteMedia } from '@/lib/hooks/use-upload'
import { useAuth } from '@/lib/providers/auth-provider'
import { updateProfileSchema } from '@/lib/validations/profile'
import { toast } from 'sonner'

export interface ProfileFormData {
  displayName: string
  bio: string
  username: string
  location: string
  avatarUrl: string | null
}

export function useProfileForm() {
  const { user: authUser } = useAuth()
  const { data: profileData, isLoading: isLoadingProfile } = useProfile()
  const updateProfile = useUpdateProfile()
  const deleteMedia = useDeleteMedia()
  const checkUsername = useCheckUsername()

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    bio: '',
    username: '',
    location: '',
    avatarUrl: null,
  })

  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // Track unsaved avatar for cleanup
  const [unsavedAvatarMediaId, setUnsavedAvatarMediaId] = useState<string | null>(null)
  const originalAvatarUrlRef = useRef<string | null>(null)
  const formSavedRef = useRef(false)

  // Initialize form with user data
  useEffect(() => {
    if (profileData || authUser) {
      const user = profileData || authUser
      if (user) {
        setFormData({
          displayName: user.displayName || user.name || '',
          bio: user.bio || '',
          username: user.username || '',
          location: user.location || '',
          avatarUrl: user.image || null,
        })
        originalAvatarUrlRef.current = user.image || null
      }
    }
  }, [profileData, authUser])

  // Cleanup unsaved avatar on unmount
  useEffect(() => {
    return () => {
      if (unsavedAvatarMediaId && !formSavedRef.current) {
        // Cleanup unsaved avatar: delete media and revert user.image
        Promise.all([
          deleteMedia.mutateAsync(unsavedAvatarMediaId).catch((error) => {
            console.error('Failed to delete unsaved avatar media:', error)
          }),
          // Revert user.image to original
          updateProfile.mutateAsync({
            removeAvatar: originalAvatarUrlRef.current === null,
          }).catch((error) => {
            console.error('Failed to revert avatar:', error)
          }),
        ]).catch((error) => {
          console.error('Failed to cleanup unsaved avatar:', error)
        })
      }
    }
  }, [unsavedAvatarMediaId, deleteMedia, updateProfile])

  const updateField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUsernameChange = async (value: string) => {
    updateField('username', value)
    setUsernameError(null)

    // Check username availability if it's different from current and valid
    if (value && value.length >= 3) {
      const currentUsername = profileData?.username || authUser?.username
      if (value.toLowerCase() !== currentUsername?.toLowerCase()) {
        setIsCheckingUsername(true)
        try {
          const result = await checkUsername.mutateAsync(value)
          if (!result.available) {
            setUsernameError('Username is already taken')
          }
        } catch (error) {
          // Silently fail - we'll validate on submit
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
  }

  const handleSubmit = async () => {
    // Validate form
    const validation = updateProfileSchema.safeParse({
      displayName: formData.displayName.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      username: formData.username.trim() || undefined,
      location: formData.location || undefined,
      removeAvatar: formData.avatarUrl === null && originalAvatarUrlRef.current !== null,
    })

    if (!validation.success) {
      const firstError = validation.error.errors[0]
      toast.error(firstError.message)
      return false
    }

    // Check if username has error
    if (usernameError) {
      toast.error('Please fix the username error before saving')
      return false
    }

    try {
      await updateProfile.mutateAsync(validation.data)

      // Mark form as saved and clear unsaved avatar tracking
      formSavedRef.current = true
      setUnsavedAvatarMediaId(null)
      originalAvatarUrlRef.current = formData.avatarUrl

      toast.success('Profile updated successfully!')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
      return false
    }
  }

  const hasChanges = (): boolean => {
    const user = profileData || authUser
    if (!user) return false

    return (
      formData.displayName !== (user.displayName || user.name || '') ||
      formData.bio !== (user.bio || '') ||
      formData.username !== (user.username || '') ||
      formData.location !== (user.location || '') ||
      formData.avatarUrl !== (user.image || null)
    )
  }

  const isFormValid = (): boolean => {
    const validation = updateProfileSchema.safeParse({
      displayName: formData.displayName.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      username: formData.username.trim() || undefined,
      location: formData.location || undefined,
    })
    return validation.success && !usernameError
  }

  const setUnsavedAvatarMediaIdWithReset = (mediaId: string | null) => {
    setUnsavedAvatarMediaId(mediaId)
    // Reset saved flag when avatar changes
    if (mediaId) {
      formSavedRef.current = false
    }
  }

  return {
    formData,
    updateField,
    handleUsernameChange,
    handleSubmit,
    hasChanges,
    isFormValid,
    isLoadingProfile,
    isSubmitting: updateProfile.isPending,
    usernameError,
    isCheckingUsername,
    unsavedAvatarMediaId,
    setUnsavedAvatarMediaId: setUnsavedAvatarMediaIdWithReset,
    originalAvatarUrl: originalAvatarUrlRef.current,
    setOriginalAvatarUrl: (url: string | null) => {
      originalAvatarUrlRef.current = url
    },
    markFormSaved: () => {
      formSavedRef.current = true
    },
  }
}

