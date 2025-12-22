# Form Refactoring Plan

> **Status:** Planning Phase
> **Last Updated:** 2025-01-22
> **Goal:** Migrate all forms to react-hook-form architecture

## Overview

This document tracks the migration of all forms in the codebase to use the standardized react-hook-form architecture. The new architecture uses:

- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Shadcn Form components** - UI consistency
- **TanStack Query** - Mutations and invalidation

**Architecture Pattern:** 3-Layer (Zod Schema → Form Component → Mutation Hook)

For detailed implementation guides, see:
- `.claude/commands/form.md` - Task-based guide
- `.claude/form-quick-reference.md` - Templates and cheatsheet
- `.claude/form-architecture-guide.md` - Deep dive

---

## Migration Status

### ✅ Completed (6 forms)

All auth forms and event creation already use the new architecture:

| File | Type | Migrated |
|------|------|----------|
| `app-pages/auth/forms/sign-in-form.tsx` | Simple | ✅ |
| `app-pages/auth/forms/sign-up-form.tsx` | Complex | ✅ |
| `app-pages/auth/forms/forgot-password-form.tsx` | Dialog | ✅ |
| `app-pages/auth/forms/reset-password-form.tsx` | Simple | ✅ |
| `app-pages/create-event/index.tsx` | Multi-step | ✅ |
| `app-pages/settings/security-tab.tsx` | Simple | ✅ |

---

## ❌ Needs Migration (16+ forms)

### Priority Tier 1 - Refactor First (HIGH IMPACT)

#### 1. Comment Forms (2 files)
**Impact:** High | **Effort:** Low | **Complexity:** Simple

**Files:**
- `app-pages/post/components/comments-section/comment-form.tsx`
- `app-pages/event-detail/components/event-comments/comment-form.tsx`

**Current Pattern:**
```typescript
const [value, setValue] = useState('')
// Manual onChange handlers
```

**Migration Strategy:**
1. Create `lib/validations/comment.ts` with schema
2. Replace `useState` with `useForm` hook
3. Wrap textarea in `FormField` component
4. Integrate with `useCreateComment()` mutation

**Estimated Time:** 1-2 hours

---

#### 2. OTP Verification Form (1 file)
**Impact:** High | **Effort:** Medium | **Complexity:** Medium

**File:**
- `app-pages/auth/forms/otp-verification-form.tsx`

**Current Pattern:**
```typescript
const [otp, setOtp] = useState('')
const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
const [resendCooldown, setResendCooldown] = useState(0)
const [isVerifying, setIsVerifying] = useState(false)
```

**Migration Strategy:**
1. Update `lib/validations/auth.ts` with OTP schema
2. Replace state management with `useForm`
3. Integrate OTP input component with form control
4. Keep timer/cooldown logic separate (UI state, not form state)
5. Use mutation for verification

**Special Considerations:**
- OTP input is a custom component (InputOTP from shadcn)
- Resend cooldown timer should remain separate useState
- Verification state can be derived from mutation status

**Estimated Time:** 3-4 hours

---

#### 3. Poll Creation Sheet (1 file)
**Impact:** Medium | **Effort:** Medium | **Complexity:** Medium

**File:**
- `app-pages/event-detail/create-poll-sheet.tsx`

**Current Pattern:**
```typescript
const [question, setQuestion] = useState('')
const [options, setOptions] = useState<string[]>(['', ''])
const [allowMultiple, setAllowMultiple] = useState(false)
const [isAnonymous, setIsAnonymous] = useState(false)
const [hasDeadline, setHasDeadline] = useState(false)
const [deadline, setDeadline] = useState<Date>()
```

**Migration Strategy:**
1. Use existing `createPollSchema` from `lib/validations/poll.ts`
2. Replace all state with `useForm` hook
3. Use `useFieldArray` for dynamic options array
4. Sheet open/close state remains separate
5. Reset form on successful creation

**Special Considerations:**
- Dynamic options array (add/remove)
- Date picker integration
- Switch components for boolean fields

**Estimated Time:** 4-5 hours

---

### Priority Tier 2 - Moderate Impact

#### 4. Profile Management (2 files)
**Impact:** Medium | **Effort:** High | **Complexity:** Complex

**Files:**
- `app-pages/settings/profiles/profile-tab.tsx`
- `app-pages/settings/profiles/use-profile-form.ts` (custom hook to be removed)

**Current Pattern:**
```typescript
// Custom hook with 26+ lines of useState calls
const {
  displayName, setDisplayName,
  bio, setBio,
  username, setUsername,
  location, setLocation,
  avatarUrl, setAvatarUrl,
  errors, setErrors,
  isLoading, setIsLoading,
  // ... more state
} = useProfileForm()
```

**Migration Strategy:**
1. Use `updateProfileSchema` from `lib/validations/profile.ts`
2. Delete `use-profile-form.ts` custom hook
3. Implement `useForm` in `profile-tab.tsx`
4. Use `useUpdateProfile()` mutation from `lib/hooks/use-profile.ts`
5. Keep avatar upload state separate (file upload UI state)
6. Use `useWatch` for dependent fields if needed

**Special Considerations:**
- Avatar upload with preview
- Username availability check (debounced)
- Multiple field validations
- Form resets on success

**Estimated Time:** 6-8 hours

---

#### 5. New Post Form (1 file)
**Impact:** High | **Effort:** High | **Complexity:** Complex

**File:**
- `app-pages/tribe-dashboard/components/widgets/timeline/views/new-post.tsx`

**Current Pattern:**
```typescript
const [newPost, setNewPost] = useState('')
const [isUploadingImage, setIsUploadingImage] = useState(false)
const [imagePreview, setImagePreview] = useState<string | null>(null)
const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
const [addToAlbum, setAddToAlbum] = useState(false)
const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
const [isMediaFromLibrary, setIsMediaFromLibrary] = useState(false)
```

**Migration Strategy:**
1. Use `createPostSchema` from `lib/validations/post.ts`
2. Replace form fields (content, mediaId) with `useForm`
3. Keep UI state separate:
   - `isMediaPickerOpen` (dialog state)
   - `isMediaFromLibrary` (dialog tab state)
   - `imagePreview` (upload preview UI)
4. Use `useCreatePost()` mutation
5. Reset form after successful post

**Special Considerations:**
- Image upload with preview
- Media picker integration (library vs upload)
- Album selection (conditional field)
- Character count display (use `useWatch`)

**Estimated Time:** 6-8 hours

---

#### 6. Create Album Wizard (3 files)
**Impact:** Medium | **Effort:** High | **Complexity:** Complex

**Files:**
- `app-pages/create-album/index.tsx` (main container)
- `app-pages/create-album/BasicInfoStep.tsx`
- `app-pages/create-album/SelectMediaStep.tsx`

**Current Pattern:**
```typescript
// Container manages all state
const [currentStep, setCurrentStep] = useState(1)
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [privacy, setPrivacy] = useState<'public' | 'private'>('private')
const [coverMode, setCoverMode] = useState<'upload' | 'select'>('upload')
const [uploadedCoverId, setUploadedCoverId] = useState<string | null>(null)
const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null)
const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([])
const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])
```

**Migration Strategy:**
1. Use `createAlbumSchema` from `lib/validations/album.ts`
2. Follow multi-step pattern from `app-pages/create-event/`
3. Single `useForm` instance in container for ALL steps
4. Use `form.trigger()` for per-step validation before advancing
5. Pass `control` prop to step components
6. Keep step navigation state (`currentStep`) separate
7. Use `useCreateAlbum()` mutation

**Step Breakdown:**
- **Step 1 (BasicInfo):** name, description, privacy
- **Step 2 (Cover):** coverMode, coverId (from upload or selection)
- **Step 3 (Media):** mediaIds array (from upload or selection)
- **Step 4 (Review):** Display all data, submit

**Special Considerations:**
- Multi-step validation with `form.trigger(['name', 'description'])`
- File upload state separate from form
- Media selection state separate from form
- Cover and media can come from upload OR library

**Estimated Time:** 8-10 hours

---

### Priority Tier 3 - Lower Priority

#### 7. Create Tribe Wizard (4 files)
**Impact:** Medium | **Effort:** Very High | **Complexity:** Very Complex

**Files:**
- `app-pages/create-new-tribe/BasicInfoStep.tsx`
- `app-pages/create-new-tribe/LocationStep.tsx`
- `app-pages/create-new-tribe/PrivacyStep.tsx`
- `app-pages/create-new-tribe/InviteMembersStep.tsx`

**Current Pattern:**
- Similar to album wizard but with location autocomplete and member invitations
- Location step has debounced API calls and geolocation
- Invite step has dynamic member list

**Migration Strategy:**
1. Create/update tribe validation schema
2. Single `useForm` for all steps
3. Location autocomplete integrated with form control
4. Use `useFieldArray` for invites
5. Complex per-step validation

**Special Considerations:**
- Location autocomplete with external API
- Geolocation integration
- Avatar upload
- Dynamic invite list
- Category selection

**Estimated Time:** 12-15 hours

---

#### 8. Account Settings (1 file)
**Impact:** Low | **Effort:** Low | **Complexity:** Simple

**File:**
- `app-pages/settings/account-tab.tsx`

**Current Status:** Placeholder form with no real state management

**Migration Strategy:**
- Wait until feature is implemented
- Use simple form pattern when ready

**Estimated Time:** 1-2 hours (when implemented)

---

## Presentational Components (No Migration Needed)

These components are already designed as controlled components that receive `value`/`onChange` props. They work perfectly with react-hook-form when the parent uses it:

| File | Purpose | Status |
|------|---------|--------|
| `app-pages/settings/profiles/form-fields.tsx` | Reusable FormField wrapper | ✅ Compatible |
| `app-pages/settings/profiles/username-field.tsx` | Username input with validation | ✅ Compatible |
| `app-pages/create-event/components/poll-question-input.tsx` | Poll question input | ✅ Compatible |

**No action needed** - these can be used as-is within FormField render props.

---

## Other Files (Non-Forms)

These files have "form" in the name but are NOT actual forms:

- `app-pages/discover/index.tsx` - Search/filter UI (not a submission form)
- Step components already part of migrated forms (e.g., `create-event/steps/`)

---

## Migration Guidelines

### General Pattern

**Before (Legacy):**
```typescript
const [value, setValue] = useState('')
const [error, setError] = useState('')

const handleSubmit = () => {
  if (!value) {
    setError('Required')
    return
  }
  mutate({ value })
}

return (
  <Input value={value} onChange={(e) => setValue(e.target.value)} />
  {error && <span>{error}</span>}
)
```

**After (react-hook-form):**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const form = useForm<InputType>({
  resolver: zodResolver(schema),
  defaultValues: { value: '' },
})

const { mutate } = useCreateThing()

const onSubmit = (data: InputType) => {
  mutate(data, {
    onSuccess: () => form.reset(),
  })
}

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </Form>
)
```

---

### Multi-Step Form Pattern

**Key Principles:**
1. Single `useForm` instance for ALL steps (not separate forms per step)
2. Use `form.trigger(fields)` to validate specific fields before advancing
3. Pass `control` prop to step components (not full form)
4. Set `mode: 'onChange'` for better UX

**Example Structure:**
```typescript
// Container component
const [currentStep, setCurrentStep] = useState(1)

const form = useForm<CreateEventInput>({
  resolver: zodResolver(createEventSchema),
  mode: 'onChange',
})

const goNext = async () => {
  const fields = getStepFields(currentStep)
  const isValid = await form.trigger(fields)
  if (isValid) setCurrentStep(prev => prev + 1)
}

return (
  <Form {...form}>
    {currentStep === 1 && <BasicInfoStep control={form.control} />}
    {currentStep === 2 && <DetailsStep control={form.control} />}
    <Button onClick={goNext}>Next</Button>
  </Form>
)
```

```typescript
// Step component
interface StepProps {
  control: Control<CreateEventInput>
}

export function BasicInfoStep({ control }: StepProps) {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
```

---

### Special Cases

#### Dynamic Fields (Field Arrays)
```typescript
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'options', // Array field name
})

// Add new option
append({ text: '' })

// Remove option
remove(index)

// Render fields
{fields.map((field, index) => (
  <FormField
    key={field.id}
    control={form.control}
    name={`options.${index}.text`}
    render={({ field }) => <Input {...field} />}
  />
))}
```

#### Watching Field Values
```typescript
import { useWatch } from 'react-hook-form'

const password = useWatch({
  control: form.control,
  name: 'password',
})

// Use password value for requirements indicator
<PasswordRequirements password={password} />
```

#### File Uploads
```typescript
// File upload state is separate (UI state, not form state)
const [imagePreview, setImagePreview] = useState<string | null>(null)

// After upload completes, set the mediaId in form
form.setValue('mediaId', uploadedMediaId)
```

---

## Validation Schemas

All forms must have Zod schemas in `lib/validations/`:

| Feature | File | Status |
|---------|------|--------|
| Auth | `lib/validations/auth.ts` | ✅ Exists |
| Comments | `lib/validations/comment.ts` | ❌ Need to create |
| Posts | `lib/validations/post.ts` | ✅ Exists |
| Events | `lib/validations/event.ts` | ✅ Exists |
| Albums | `lib/validations/album.ts` | ✅ Exists |
| Polls | `lib/validations/poll.ts` | ✅ Exists |
| Profile | `lib/validations/profile.ts` | ✅ Exists |
| Tribe | `lib/validations/tribe.ts` | ✅ Exists |
| Security | `lib/validations/security.ts` | ✅ Exists |

---

## Recommended Migration Order

| Order | Forms | Complexity | Estimated Time |
|-------|-------|------------|----------------|
| 1 | Comment forms (2) | Simple | 1-2 hours |
| 2 | OTP verification | Medium | 3-4 hours |
| 3 | Poll creation sheet | Medium | 4-5 hours |
| 4 | New post form | Complex | 6-8 hours |
| 5 | Create album wizard | Complex | 8-10 hours |
| 6 | Profile management | Complex | 6-8 hours |
| 7 | Create tribe wizard | Very Complex | 12-15 hours |
| 8 | Account settings | Simple | 1-2 hours |

**Total Estimated Time:** 42-54 hours

---

## Success Criteria

A form is considered successfully migrated when:

- ✅ Uses `useForm` hook with `zodResolver`
- ✅ Uses shadcn Form components (`Form`, `FormField`, etc.)
- ✅ Has Zod schema in `lib/validations/`
- ✅ Integrates with TanStack Query mutation
- ✅ Resets form on successful submission
- ✅ No manual `useState` for form field values
- ✅ No Zustand or external state for form data
- ✅ TypeScript types are correct
- ✅ Validation displays properly (FormMessage)
- ✅ All functionality works as before

---

## Anti-Patterns to Avoid

❌ **Don't use Zustand for form state**
```typescript
// BAD
const { formData, setFormData } = useFormStore()
```

❌ **Don't pass full form object to children**
```typescript
// BAD
<StepComponent form={form} />

// GOOD
<StepComponent control={form.control} />
```

❌ **Don't create separate forms per step**
```typescript
// BAD
const form1 = useForm({ ... })
const form2 = useForm({ ... })

// GOOD
const form = useForm({ ... }) // Single form for all steps
```

❌ **Don't forget to reset form**
```typescript
// BAD
onSuccess: () => {
  toast.success('Created!')
}

// GOOD
onSuccess: () => {
  form.reset()
  toast.success('Created!')
}
```

---

## Resources

- **Quick Reference:** `.claude/form-quick-reference.md` - Templates and cheatsheet
- **Task Guide:** `.claude/commands/form.md` - Step-by-step instructions for 8 common tasks
- **Architecture:** `.claude/form-architecture-guide.md` - Deep dive and patterns
- **Navigation:** `.claude/FORM_GUIDE_INDEX.md` - Find the right guide
- **React Hook Form Docs:** https://react-hook-form.com
- **Zod Docs:** https://zod.dev
- **Shadcn Form:** https://ui.shadcn.com/docs/components/form

---

## Progress Tracking

### Tier 1 Progress
- [ ] `app-pages/post/components/comments-section/comment-form.tsx`
- [ ] `app-pages/event-detail/components/event-comments/comment-form.tsx`
- [ ] `app-pages/auth/forms/otp-verification-form.tsx`
- [ ] `app-pages/event-detail/create-poll-sheet.tsx`

### Tier 2 Progress
- [ ] `app-pages/settings/profiles/profile-tab.tsx`
- [ ] `app-pages/settings/profiles/use-profile-form.ts` (delete)
- [ ] `app-pages/tribe-dashboard/components/widgets/timeline/views/new-post.tsx`
- [ ] `app-pages/create-album/index.tsx`
- [ ] `app-pages/create-album/BasicInfoStep.tsx`
- [ ] `app-pages/create-album/SelectMediaStep.tsx`

### Tier 3 Progress
- [ ] `app-pages/create-new-tribe/BasicInfoStep.tsx`
- [ ] `app-pages/create-new-tribe/LocationStep.tsx`
- [ ] `app-pages/create-new-tribe/PrivacyStep.tsx`
- [ ] `app-pages/create-new-tribe/InviteMembersStep.tsx`
- [ ] `app-pages/settings/account-tab.tsx` (when implemented)

---

**Last Updated:** 2025-01-22
**Document Version:** 1.0
