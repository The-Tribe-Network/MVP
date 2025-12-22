# Form Architecture Guide

This guide establishes a **consistent, clean, and modular pattern** for all forms in the Tribe codebase using react-hook-form and shadcn/ui components.

## Core Principles

1. **React Hook Form manages ALL form state** - No Zustand, no manual useState for form fields
2. **Zod schemas live in `/lib/validations/`** - Single source of truth for validation
3. **Forms integrate seamlessly with TanStack Query mutations** - Existing pattern
4. **Component hierarchy mirrors the clean architecture** - Same pattern as media page
5. **Shadcn Form components are required** - Consistent UI patterns

## Architecture Layers

### Layer 1: Form Container Component

**Responsibilities:**
- Initialize `useForm` hook with zodResolver
- Handle form submission with TanStack Query mutation
- Manage success/error callbacks
- Compose layout with form sections

**Location:** `/app-pages/[feature]/forms/[form-name].tsx` or `/app-pages/[feature]/index.tsx`

**Pattern:**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { useCreatePost } from '@/lib/hooks/use-posts'
import { createPostSchema, type CreatePostInput } from '@/lib/validations/post'

interface CreatePostFormProps {
  tribeId: string
  onSuccess?: () => void
}

export function CreatePostForm({ tribeId, onSuccess }: CreatePostFormProps) {
  // 1. Initialize form with schema validation
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      mediaId: null,
    },
  })

  // 2. Get mutation from TanStack Query hook
  const { mutate: createPost, isPending } = useCreatePost()

  // 3. Handle submission
  const onSubmit = (data: CreatePostInput) => {
    createPost(
      { tribeId, ...data },
      {
        onSuccess: () => {
          form.reset() // Reset form state
          onSuccess?.() // Call parent callback
        },
      }
    )
  }

  // 4. Compose layout with form sections
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ContentSection control={form.control} />
        <MediaSection control={form.control} />
        <SubmitSection isPending={isPending} />
      </form>
    </Form>
  )
}
```

**Key Points:**
- Form container is the ONLY component that calls `useForm`
- Form container is the ONLY component that knows about mutations
- Child sections receive `control` prop (NOT the entire `form` object)
- No business logic in container—just composition

---

### Layer 2: Form Sections

**Responsibilities:**
- Render form fields for a logical grouping
- Use FormField with control prop
- Display validation errors
- No state management

**Location:** `/app-pages/[feature]/forms/sections/` or inline if simple

**Pattern:**
```typescript
import { Control } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { CreatePostInput } from '@/lib/validations/post'

interface ContentSectionProps {
  control: Control<CreatePostInput>
}

export function ContentSection({ control }: ContentSectionProps) {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Post Content</FormLabel>
          <FormControl>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Share your thoughts with the tribe.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

**Key Points:**
- Sections receive typed `Control<FormSchema>` prop
- Use `FormField` render prop pattern
- Spread `{...field}` to input components
- `FormMessage` automatically shows validation errors
- Sections are pure presentation—no side effects

---

### Layer 3: Validation Schemas

**Responsibilities:**
- Define form shape and validation rules
- Export TypeScript types via `z.infer`
- Centralize business rules

**Location:** `/lib/validations/[feature].ts`

**Pattern:**
```typescript
import { z } from 'zod'

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(5000, 'Post content must be less than 5000 characters'),
  mediaId: z.string().uuid().nullable().optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

// For multi-step forms, export step schemas
export const postStep1Schema = createPostSchema.pick({ content: true })
export const postStep2Schema = createPostSchema.pick({ mediaId: true })
```

**Key Points:**
- One schema per form (or step for multi-step forms)
- Export inferred type for TypeScript usage
- Use Zod refinements for cross-field validation
- Validation messages should be user-friendly

---

## Form Patterns

### Pattern 1: Simple Form (Single Page)

**Use Case:** Create post, create comment, settings forms

**Example:** Create Post Form

**Structure:**
```
app-pages/
  posts/
    forms/
      create-post-form.tsx       # Form container
      sections/
        content-section.tsx      # Form field sections
        media-section.tsx
        submit-section.tsx
```

**Implementation:**
```typescript
// create-post-form.tsx
export function CreatePostForm({ tribeId }: CreatePostFormProps) {
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '', mediaId: null },
  })

  const { mutate: createPost, isPending } = useCreatePost()

  const onSubmit = (data: CreatePostInput) => {
    createPost({ tribeId, ...data }, {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ContentSection control={form.control} />
        <MediaSection control={form.control} />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </Form>
  )
}
```

---

### Pattern 2: Multi-Step Form (Wizard)

**Use Case:** Create event, create album, onboarding

**Example:** Create Event Form (already implemented correctly!)

**Structure:**
```
app-pages/
  create-event/
    index.tsx                    # Form container with stepper
    steps/
      basic-info-step.tsx        # Step 1 component
      date-time-step.tsx         # Step 2 component
      location-step.tsx          # Step 3 component
      poll-step.tsx              # Step 4 component
      review-step.tsx            # Step 5 component
```

**Implementation:**
```typescript
// index.tsx
export function CreateEventPage({ tribeId }: CreateEventPageProps) {
  const [currentStep, setCurrentStep] = useState(1)

  // SINGLE form instance for ALL steps
  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      title: '',
      description: '',
      location: '',
      startDate: undefined,
      endDate: undefined,
    },
  })

  const { mutate: createEvent, isPending } = useCreateEvent()

  const onSubmit = (data: CreateEventInput) => {
    createEvent({ tribeId, data }, {
      onSuccess: () => {
        router.push(`/tribe/${tribeId}/events`)
      },
    })
  }

  // Validate current step before advancing
  const goToNextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep)
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) setCurrentStep(prev => prev + 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StepIndicator current={currentStep} total={5} />

        {currentStep === 1 && <BasicInfoStep control={form.control} />}
        {currentStep === 2 && <DateTimeStep control={form.control} />}
        {currentStep === 3 && <LocationStep control={form.control} />}
        {currentStep === 4 && <PollStep control={form.control} />}
        {currentStep === 5 && <ReviewStep form={form} />}

        <StepNavigation
          currentStep={currentStep}
          totalSteps={5}
          onBack={() => setCurrentStep(prev => prev - 1)}
          onNext={goToNextStep}
          onSubmit={form.handleSubmit(onSubmit)}
          isPending={isPending}
        />
      </form>
    </Form>
  )
}

// Helper to validate specific fields per step
function getStepFields(step: number): (keyof CreateEventInput)[] {
  switch (step) {
    case 1: return ['title', 'description']
    case 2: return ['startDate', 'endDate']
    case 3: return ['location']
    case 4: return ['hasPoll', 'pollOptions']
    default: return []
  }
}
```

**Step Component Pattern:**
```typescript
// steps/basic-info-step.tsx
interface BasicInfoStepProps {
  control: Control<CreateEventInput>
}

export function BasicInfoStep({ control }: BasicInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer BBQ Party" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Event details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
```

**Key Points for Multi-Step:**
- ONE form instance for all steps (not per-step forms)
- Use `form.trigger(fields)` to validate specific fields before advancing
- Use `mode: 'onChange'` for better validation UX
- Review step can use `form.watch()` to display values

---

### Pattern 3: Dialog/Sheet Form

**Use Case:** Quick create forms, inline editing

**Example:** Create Album Sheet

**Structure:**
```
app-pages/
  media/
    components/
      create-album-sheet.tsx     # Sheet with embedded form
```

**Implementation:**
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Form } from '@/components/ui/form'
import { useCreateAlbum } from '@/lib/hooks/use-albums'
import { createAlbumSchema, type CreateAlbumInput } from '@/lib/validations/album'

interface CreateAlbumSheetProps {
  tribeId: string
  trigger: React.ReactNode
}

export function CreateAlbumSheet({ tribeId, trigger }: CreateAlbumSheetProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<CreateAlbumInput>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: {
      name: '',
      description: '',
      privacy: 'public',
    },
  })

  const { mutate: createAlbum, isPending } = useCreateAlbum()

  const onSubmit = (data: CreateAlbumInput) => {
    createAlbum(
      { tribeId, ...data },
      {
        onSuccess: () => {
          form.reset() // Reset form state
          setOpen(false) // Close dialog
        },
      }
    )
  }

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      form.reset()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Album</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <AlbumFieldsSection control={form.control} />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Creating...' : 'Create Album'}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

**Key Points for Dialog Forms:**
- Manage dialog open state separately from form state
- Reset form when dialog closes (`onOpenChange`)
- Close dialog on successful submission
- Use `SheetTrigger asChild` for custom trigger buttons

---

### Pattern 4: Inline Edit Form

**Use Case:** Edit post content, edit comment, profile updates

**Example:** Edit Post Form

**Implementation:**
```typescript
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { useUpdatePost } from '@/lib/hooks/use-posts'
import { updatePostSchema, type UpdatePostInput } from '@/lib/validations/post'

interface EditPostFormProps {
  post: Post
  onCancel: () => void
  onSuccess: () => void
}

export function EditPostForm({ post, onCancel, onSuccess }: EditPostFormProps) {
  const form = useForm<UpdatePostInput>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      content: post.content,
      mediaId: post.mediaId,
    },
  })

  // Reset form when post changes (if editing different post)
  useEffect(() => {
    form.reset({
      content: post.content,
      mediaId: post.mediaId,
    })
  }, [post.id, form])

  const { mutate: updatePost, isPending } = useUpdatePost()

  const onSubmit = (data: UpdatePostInput) => {
    updatePost(
      { postId: post.id, tribeId: post.tribeId, ...data },
      {
        onSuccess: () => {
          onSuccess()
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ContentSection control={form.control} />

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

**Key Points for Edit Forms:**
- Initialize with existing data in `defaultValues`
- Use `useEffect` to reset form when data changes
- Provide cancel callback for parent to handle UI state
- Disable buttons during submission

---

## Integration with TanStack Query

### Mutation Hook Pattern

**Location:** `/lib/hooks/use-[feature].ts`

**Pattern:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost } from '@/lib/api/posts'
import { queryKeys } from '@/lib/constants/query-keys'
import { toast } from 'sonner'

interface CreatePostParams {
  tribeId: string
  content: string
  mediaId: string | null
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreatePostParams) => createPost(params),
    onSuccess: (data, variables) => {
      // 1. Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      })

      // 2. Show success toast
      toast.success('Post created successfully!')
    },
    onError: (error) => {
      // 3. Show error toast
      toast.error(error.message || 'Failed to create post')
    },
  })
}
```

### Form + Mutation Integration

```typescript
export function CreatePostForm({ tribeId }: CreatePostFormProps) {
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: '', mediaId: null },
  })

  // Get mutation hook
  const { mutate: createPost, isPending, error } = useCreatePost()

  const onSubmit = (data: CreatePostInput) => {
    // Call mutation with form data
    createPost(
      { tribeId, ...data },
      {
        onSuccess: () => {
          form.reset() // Reset form on success
        },
        // Error handling is in mutation hook
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </Form>
  )
}
```

**Key Points:**
- Mutations handle their own success toasts and invalidations
- Forms handle form reset on success
- Loading states (`isPending`) control button disabled state
- Error toasts are shown by mutation hook

---

## Advanced Patterns

### Dependent Fields

**Use Case:** Show/hide fields based on other field values

**Example:** Poll fields only show when "Include Poll" is checked

```typescript
export function PollSection({ control }: PollSectionProps) {
  // Watch the "hasPoll" field value
  const hasPoll = useWatch({ control, name: 'hasPoll' })

  return (
    <>
      <FormField
        control={control}
        name="hasPoll"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Include Poll</FormLabel>
          </FormItem>
        )}
      />

      {hasPoll && (
        <FormField
          control={control}
          name="pollOptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Options</FormLabel>
              <FormControl>
                <PollOptionsInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}
```

---

### Dynamic Field Arrays

**Use Case:** Add/remove items (poll options, event attendees)

**Example:** Poll Options

```typescript
import { useFieldArray } from 'react-hook-form'

export function PollOptionsSection({ control }: PollOptionsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pollOptions',
  })

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={control}
          name={`pollOptions.${index}.text`}
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder={`Option ${index + 1}`} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ text: '' })}
      >
        Add Option
      </Button>
    </div>
  )
}
```

---

### File Upload Integration

**Use Case:** Image upload with preview

**Example:** Media Upload Section

```typescript
export function MediaSection({ control }: MediaSectionProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const { mutateAsync: uploadImage, isPending } = useUploadPostImage()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    try {
      const { mediaId } = await uploadImage({ file })
      // Update form field
      control._formValues.mediaId = mediaId
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  return (
    <FormField
      control={control}
      name="mediaId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Attach Image (Optional)</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isPending}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

---

### Cross-Field Validation

**Use Case:** End date must be after start date

**Pattern:**
```typescript
export const eventDateSchema = z.object({
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'], // Error appears on endDate field
  }
)
```

---

## Common Pitfalls to Avoid

### ❌ DON'T: Use Zustand or useState for Form State

```typescript
// ❌ ANTI-PATTERN
const [formData, setFormData] = useState({ name: '', description: '' })
const setName = (name: string) => setFormData(prev => ({ ...prev, name }))
```

**Why:** React Hook Form already manages form state efficiently with uncontrolled components. External state management adds complexity and causes re-renders.

---

### ❌ DON'T: Pass Entire Form Object to Children

```typescript
// ❌ ANTI-PATTERN
<BasicInfoStep form={form} />
```

**Why:** Passing the entire form object breaks encapsulation and makes components harder to test. Children should only receive what they need (`control` prop).

---

### ❌ DON'T: Create Separate Form Instances Per Step

```typescript
// ❌ ANTI-PATTERN (multi-step form)
const step1Form = useForm<Step1Schema>({ ... })
const step2Form = useForm<Step2Schema>({ ... })
```

**Why:** Each step should be part of ONE form. Use field validation (`form.trigger`) to validate per-step.

---

### ❌ DON'T: Manually Track Form Dirty State

```typescript
// ❌ ANTI-PATTERN
const [isDirty, setIsDirty] = useState(false)
```

**Why:** React Hook Form provides `formState.isDirty` out of the box.

---

### ❌ DON'T: Forget to Reset Form State

```typescript
// ❌ ANTI-PATTERN (dialog form)
const handleClose = () => {
  setOpen(false)
  // Missing: form.reset()
}
```

**Why:** Form state persists after dialog closes. Always reset on close.

---

### ✅ DO: Use Control Prop Pattern

```typescript
// ✅ CORRECT
interface SectionProps {
  control: Control<FormSchema>
}

export function Section({ control }: SectionProps) {
  return <FormField control={control} name="field" ... />
}
```

---

### ✅ DO: Validate Before Step Transitions

```typescript
// ✅ CORRECT
const goToNextStep = async () => {
  const isValid = await form.trigger(['field1', 'field2'])
  if (isValid) setCurrentStep(prev => prev + 1)
}
```

---

### ✅ DO: Reset Form on Success

```typescript
// ✅ CORRECT
const onSubmit = (data: FormInput) => {
  mutate(data, {
    onSuccess: () => {
      form.reset()
      onSuccess?.()
    },
  })
}
```

---

## Migration Checklist

When converting an existing form to this architecture:

- [ ] Install react-hook-form and @hookform/resolvers (already done in this project)
- [ ] Create/update Zod schema in `/lib/validations/`
- [ ] Replace useState with `useForm` hook
- [ ] Replace custom inputs with shadcn Form components
- [ ] Extract form sections into separate components with `control` prop
- [ ] Integrate with TanStack Query mutation hook
- [ ] Add form reset on success
- [ ] Test validation, submission, and error handling
- [ ] Remove any Zustand/external state for form data

---

## File Organization Reference

```
tribe-v2/
├── app-pages/
│   └── [feature]/
│       ├── index.tsx                    # Main page (if feature is a page)
│       └── forms/
│           ├── create-[entity]-form.tsx # Form container
│           ├── edit-[entity]-form.tsx
│           └── sections/                # Form sections (optional)
│               ├── basic-info-section.tsx
│               └── advanced-section.tsx
│
├── lib/
│   ├── validations/
│   │   └── [feature].ts                 # Zod schemas
│   ├── hooks/
│   │   └── use-[feature].ts             # Mutation hooks
│   └── api/
│       └── [feature].ts                 # API client functions
│
└── components/
    └── ui/
        └── form.tsx                     # Shadcn Form (DO NOT EDIT)
```

---

## Examples in Codebase

### ✅ Follow This Pattern:
- **Create Event**: `/app-pages/create-event/index.tsx`
  - Multi-step form with RHF
  - Step components receive `control` prop
  - Integrates with TanStack Query
  - Clean architecture

- **Security Settings**: `/app-pages/settings/security-tab.tsx`
  - Simple form with RHF
  - Inline form fields
  - Password change validation

### ❌ Don't Follow These (Legacy Patterns):
- **Auth Forms**: `/app-pages/auth/forms/`
  - Uses custom validation hook
  - Manual useState for all fields
  - Will be migrated eventually

- **Create Album**: `/app-pages/create-album/index.tsx`
  - Manual state management
  - Step-by-step validation without RHF
  - Complex prop drilling

---

## Summary

| Pattern | Form Type | Use This Architecture |
|---------|-----------|----------------------|
| Simple Form | Single page, few fields | Form Container + Inline Fields |
| Multi-Step Form | Wizard with 3+ steps | Form Container + Step Components |
| Dialog Form | Sheet/Dialog with form | Form Container Inside Dialog |
| Edit Form | Inline editing | Form Container with defaultValues |

**Golden Rule:** React Hook Form manages state. Components receive `control`. TanStack Query handles mutations. Keep it simple.
