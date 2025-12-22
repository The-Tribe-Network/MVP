# Form Development Command

This command provides task-specific guidance for building forms in this application using react-hook-form, Zod validation, and shadcn/ui Form components.

## When to Use This Command

Use this when:
- Creating a new form (create, edit, settings, auth)
- Converting legacy forms to the standard pattern
- Adding validation to existing forms
- Implementing multi-step wizards or complex forms
- Debugging form validation or submission issues
- Integrating forms with TanStack Query mutations

## Project Context

This project follows a **clean form architecture**:

1. **React Hook Form** - All form state managed by `useForm` hook
   - NO manual `useState` for form fields
   - NO external state (Zustand/Context) for form data
   - Automatic validation via `zodResolver`

2. **Zod Schemas** (`lib/validations/`)
   - Single source of truth for validation rules
   - Export TypeScript types via `z.infer`
   - Reusable across client and server

3. **Shadcn Form Components** (`components/ui/form.tsx`)
   - `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
   - Consistent UI patterns
   - Automatic error display

4. **TanStack Query Mutations**
   - Forms submit via mutation hooks
   - Invalidation handled in mutation hook, NOT form
   - Forms call `mutate()`, mutations handle success/error

**See `.claude/form-architecture-guide.md` for comprehensive patterns and `.claude/form-quick-reference.md` for quick checklist.**

---

## Common Tasks

### Task 1: Create a Simple Form (Single Page)

**When:** Creating forms like "Create Post", "Edit Profile", "Settings", etc.

**Steps:**

1. **Create/verify Zod schema** in `lib/validations/[feature].ts`:
   ```typescript
   import { z } from 'zod'

   export const createPostSchema = z.object({
     content: z.string().min(1, 'Content is required').max(5000),
     mediaId: z.string().uuid().nullable().optional(),
   })

   export type CreatePostInput = z.infer<typeof createPostSchema>
   ```

2. **Create form component** in `app-pages/[feature]/forms/create-[entity]-form.tsx`:
   ```typescript
   'use client'

   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
   import { Input } from '@/components/ui/input'
   import { Button } from '@/components/ui/button'
   import { useCreatePost } from '@/lib/hooks/use-posts'
   import { createPostSchema, type CreatePostInput } from '@/lib/validations/post'

   interface CreatePostFormProps {
     tribeId: string
     onSuccess?: () => void
   }

   export function CreatePostForm({ tribeId, onSuccess }: CreatePostFormProps) {
     // Initialize form with Zod validation
     const form = useForm<CreatePostInput>({
       resolver: zodResolver(createPostSchema),
       defaultValues: {
         content: '',
         mediaId: null,
       },
     })

     // Get mutation from TanStack Query hook
     const { mutate: createPost, isPending } = useCreatePost()

     // Handle submission
     const onSubmit = (data: CreatePostInput) => {
       createPost(
         { tribeId, ...data },
         {
           onSuccess: () => {
             form.reset() // Reset form state
             onSuccess?.() // Parent callback
           },
         }
       )
     }

     return (
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <FormField
             control={form.control}
             name="content"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Content</FormLabel>
                 <FormControl>
                   <Input placeholder="What's on your mind?" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <Button type="submit" disabled={isPending}>
             {isPending ? 'Creating...' : 'Create Post'}
           </Button>
         </form>
       </Form>
     )
   }
   ```

**Checklist:**
- [ ] Zod schema created with proper validation messages
- [ ] Type exported via `z.infer`
- [ ] Form uses `useForm` with `zodResolver`
- [ ] Mutation hook integrated from `lib/hooks/`
- [ ] Form resets on success
- [ ] Button shows loading state (`isPending`)

---

### Task 2: Create a Multi-Step Form (Wizard)

**When:** Forms with 3+ logical steps (e.g., Create Event, Create Album, Onboarding).

**Pattern:** ONE form instance for ALL steps, validate specific fields per step.

**Steps:**

1. **Create Zod schema** with ALL fields:
   ```typescript
   export const createEventSchema = z.object({
     // Step 1: Basic Info
     title: z.string().min(1).max(200),
     description: z.string().optional(),

     // Step 2: Date/Time
     startDate: z.date({ required_error: "Start date is required" }),
     endDate: z.date().optional(),

     // Step 3: Location
     location: z.string().min(1),
   }).refine(
     (data) => !data.endDate || data.endDate >= data.startDate,
     { message: "End date must be after start date", path: ["endDate"] }
   )

   export type CreateEventInput = z.infer<typeof createEventSchema>
   ```

2. **Create form container** with stepper state:
   ```typescript
   'use client'

   import { useState } from 'react'
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { Form } from '@/components/ui/form'
   import { useCreateEvent } from '@/lib/hooks/use-events'
   import { createEventSchema, type CreateEventInput } from '@/lib/validations/event'
   import { BasicInfoStep } from './steps/basic-info-step'
   import { DateTimeStep } from './steps/date-time-step'
   import { LocationStep } from './steps/location-step'

   export function CreateEventForm({ tribeId }: { tribeId: string }) {
     const [currentStep, setCurrentStep] = useState(1)

     // SINGLE form for ALL steps
     const form = useForm<CreateEventInput>({
       resolver: zodResolver(createEventSchema),
       mode: 'onChange', // Validate on change for better UX
       defaultValues: {
         title: '',
         description: '',
         startDate: undefined,
         endDate: undefined,
         location: '',
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
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <StepIndicator current={currentStep} total={3} />

           {currentStep === 1 && <BasicInfoStep control={form.control} />}
           {currentStep === 2 && <DateTimeStep control={form.control} />}
           {currentStep === 3 && <LocationStep control={form.control} />}

           <StepNavigation
             currentStep={currentStep}
             totalSteps={3}
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
       default: return []
     }
   }
   ```

3. **Create step components** that receive `control`:
   ```typescript
   import { Control } from 'react-hook-form'
   import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
   import { Input } from '@/components/ui/input'
   import { CreateEventInput } from '@/lib/validations/event'

   interface BasicInfoStepProps {
     control: Control<CreateEventInput>
   }

   export function BasicInfoStep({ control }: BasicInfoStepProps) {
     return (
       <div className="space-y-4">
         <FormField
           control={control}
           name="title"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Event Title</FormLabel>
               <FormControl>
                 <Input placeholder="e.g., Summer BBQ" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* Additional fields... */}
       </div>
     )
   }
   ```

**Checklist:**
- [ ] Single form instance for all steps
- [ ] Step fields validated with `form.trigger()`
- [ ] Step components receive `control` prop (NOT full form)
- [ ] `mode: 'onChange'` for better validation UX
- [ ] Review step shows data with `form.watch()`

---

### Task 3: Create a Dialog/Sheet Form

**When:** Quick create forms, inline editing in dialogs/sheets.

**Key Points:** Manage dialog state separately, reset form on close.

**Pattern:**

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
          form.reset() // Reset form
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

**Checklist:**
- [ ] Dialog state managed separately from form state
- [ ] `onOpenChange` resets form when closed
- [ ] Form resets on successful submission
- [ ] `SheetTrigger asChild` for custom trigger buttons

---

### Task 4: Create an Edit Form (Inline Editing)

**When:** Editing existing data inline or in modal.

**Key Points:** Initialize with existing data, use `useEffect` to reset when data changes.

**Pattern:**

```typescript
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUpdatePost } from '@/lib/hooks/use-posts'
import { updatePostSchema, type UpdatePostInput } from '@/lib/validations/post'
import type { Post } from '@/lib/database/types'

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

  // Reset form when post changes (e.g., editing different post)
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
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

**Checklist:**
- [ ] `defaultValues` set from existing data
- [ ] `useEffect` resets form when data changes
- [ ] Cancel callback provided for parent
- [ ] Buttons disabled during submission

---

### Task 5: Add Dependent Fields (Show/Hide)

**When:** Fields that show/hide based on other field values.

**Pattern:** Use `useWatch` to observe field values.

```typescript
import { useWatch } from 'react-hook-form'

export function PollSection({ control }: { control: Control<CreateEventInput> }) {
  // Watch the "hasPoll" field
  const hasPoll = useWatch({ control, name: 'hasPoll' })

  return (
    <>
      <FormField
        control={control}
        name="hasPoll"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel>Include Poll</FormLabel>
          </FormItem>
        )}
      />

      {/* Only show poll options if hasPoll is true */}
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

**Checklist:**
- [ ] Use `useWatch` to observe dependent field
- [ ] Conditional rendering based on watched value
- [ ] Watched field doesn't cause unnecessary re-renders

---

### Task 6: Add Dynamic Field Arrays

**When:** Adding/removing items like poll options, tags, attendees.

**Pattern:** Use `useFieldArray` for array fields.

```typescript
import { useFieldArray } from 'react-hook-form'
import { X, Plus } from 'lucide-react'

export function PollOptionsSection({ control }: { control: Control<CreateEventInput> }) {
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
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>
    </div>
  )
}
```

**Checklist:**
- [ ] `useFieldArray` initialized with field name
- [ ] Use `field.id` as key (NOT index)
- [ ] `append()` adds new items
- [ ] `remove(index)` removes items
- [ ] Validation applies to each array item

---

### Task 7: Add File Upload

**When:** Forms need image/file upload (avatar, media, attachments).

**Pattern:** Upload file first, then update form field with uploaded ID.

```typescript
import { useState } from 'react'
import { useUploadPostImage } from '@/lib/hooks/use-upload'

export function MediaSection({ control }: { control: Control<CreatePostInput> }) {
  const [preview, setPreview] = useState<string | null>(null)
  const { mutateAsync: uploadImage, isPending } = useUploadPostImage()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to server
    try {
      const { mediaId } = await uploadImage({ file })
      // Update form field with uploaded media ID
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

**Checklist:**
- [ ] File upload mutation hook exists
- [ ] Preview shown before upload
- [ ] Form field updated with uploaded ID
- [ ] Loading state shown during upload
- [ ] Error handling with toast

---

### Task 8: Migrate Legacy Form to React Hook Form

**When:** Converting old forms using manual `useState` to RHF pattern.

**Steps:**

1. **Identify form fields** and create/update Zod schema
2. **Replace useState** with `useForm` hook
3. **Replace custom FormField** with shadcn FormField pattern
4. **Remove manual validation** - let Zod handle it
5. **Update submission** to use `form.handleSubmit(onSubmit)`
6. **Test validation** - ensure error messages work

**Example Before/After:**

```typescript
// BEFORE (Legacy)
const [formData, setFormData] = useState({ email: '', password: '' })
const [errors, setErrors] = useState({})

const handleSubmit = (e) => {
  e.preventDefault()
  const validation = validateSchema(schema, formData)
  if (!validation.success) {
    setErrors(validation.errors)
    return
  }
  mutate(formData)
}

// AFTER (React Hook Form)
const form = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
})

const onSubmit = (data: FormInput) => {
  mutate(data)
}
```

**Checklist:**
- [ ] All `useState` for form fields removed
- [ ] Custom validation hooks removed
- [ ] Shadcn Form components used
- [ ] `form.reset()` called on success
- [ ] Validation works as expected

---

## Common Patterns

### Pattern: Checkbox Field
```typescript
<FormField
  control={form.control}
  name="agreeToTerms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>I agree to the terms</FormLabel>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>
```

### Pattern: Select Field
```typescript
<FormField
  control={form.control}
  name="privacy"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Privacy</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select privacy" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="private">Private</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Pattern: Textarea Field
```typescript
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Enter description..."
          className="min-h-[100px]"
          {...field}
        />
      </FormControl>
      <FormDescription>Optional details</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Pattern: Date Field (with react-day-picker)
```typescript
<FormField
  control={form.control}
  name="startDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Start Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
              {field.value ? format(field.value, "PPP") : "Pick a date"}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Anti-Patterns to Avoid

### ❌ DON'T: Use Zustand or useState for Form Fields
```typescript
// WRONG
const [name, setName] = useState('')
const [email, setEmail] = useState('')
```
**Why:** React Hook Form manages state internally. External state adds complexity.

### ❌ DON'T: Pass Entire Form Object to Children
```typescript
// WRONG
<BasicInfoStep form={form} />
```
**Why:** Breaks encapsulation. Pass only `control` prop.

### ❌ DON'T: Create Separate Forms Per Step
```typescript
// WRONG (multi-step)
const step1Form = useForm<Step1>()
const step2Form = useForm<Step2>()
```
**Why:** One form instance for all steps. Use `form.trigger()` for per-step validation.

### ❌ DON'T: Forget to Reset Form
```typescript
// WRONG
onSuccess: () => {
  setOpen(false) // Missing form.reset()
}
```
**Why:** Form state persists. Always reset on success/close.

---

## Decision Tree: Which Form Pattern?

```
How many fields?
│
├─ 1-5 fields, single page
│  └─ Use Task 1: Simple Form
│
├─ 6+ fields, multiple logical sections
│  └─ Is it multiple pages/steps?
│     │
│     ├─ YES → Use Task 2: Multi-Step Form
│     │
│     └─ NO → Use Task 1 with section components
│
├─ Inside Dialog/Sheet
│  └─ Use Task 3: Dialog Form
│
└─ Editing existing data
   └─ Use Task 4: Edit Form
```

---

## Files to Reference

- **Architecture Guide:** `.claude/form-architecture-guide.md` (comprehensive reference)
- **Quick Reference:** `.claude/form-quick-reference.md` (cheatsheet)
- **Validation Schemas:** `lib/validations/` (all Zod schemas)
- **Example Forms:**
  - Simple: `app-pages/auth/forms/sign-in-form.tsx`
  - Multi-step: `app-pages/create-event/index.tsx`
  - Complex: `app-pages/auth/forms/sign-up-form.tsx` (with dependent fields)
- **Mutation Hooks:** `lib/hooks/use-*.ts`
- **Shadcn Form:** `components/ui/form.tsx` (DO NOT EDIT - auto-generated)

---

## Tips for AI Assistants

When implementing forms:

1. **Always check existing patterns first:**
   - Look at similar forms in `app-pages/`
   - Follow same validation patterns
   - Use consistent field naming

2. **Keep forms focused:**
   - Form container manages form + mutation
   - Sections receive `control` prop only
   - No business logic in form components

3. **Type safety is critical:**
   - Export types from Zod schemas
   - Strong types for mutation parameters
   - Infer form types from schema

4. **Validation messages matter:**
   - User-friendly error messages
   - Specific field errors (not generic)
   - Consider cross-field validation

5. **Integration is key:**
   - Forms submit via TanStack Query mutations
   - Mutations handle invalidation
   - Forms handle reset and UI state

---

## Related Commands

- See `.claude/commands/tanstack-query.md` for mutation patterns
- See `CLAUDE.md` for overall architecture
- See `.claude/tanstack-query-guide.md` for data fetching patterns
