# Form Quick Reference

A quick cheatsheet for building forms in this application. For detailed guidance, see `.claude/form-architecture-guide.md` and `.claude/commands/form.md`.

## Quick Start Checklist

### Simple Form (5 steps)

1. **Create Zod schema** (`lib/validations/[feature].ts`)
2. **Create form component** with `useForm` + `zodResolver`
3. **Add form fields** using shadcn `FormField` pattern
4. **Integrate mutation** from `lib/hooks/use-*.ts`
5. **Reset on success** with `form.reset()`

### Multi-Step Form (7 steps)

1. **Create Zod schema** with all fields
2. **Create form container** with `useState` for step
3. **Initialize ONE form** for all steps
4. **Create step components** receiving `control` prop
5. **Validate per-step** with `form.trigger(fields)`
6. **Navigate between steps** after validation
7. **Submit on final step** via mutation

---

## Form Template (Copy/Paste)

### Simple Form Template

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateEntity } from '@/lib/hooks/use-entity'
import { createEntitySchema, type CreateEntityInput } from '@/lib/validations/entity'

interface CreateEntityFormProps {
  onSuccess?: () => void
}

export function CreateEntityForm({ onSuccess }: CreateEntityFormProps) {
  const form = useForm<CreateEntityInput>({
    resolver: zodResolver(createEntitySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const { mutate: createEntity, isPending } = useCreateEntity()

  const onSubmit = (data: CreateEntityInput) => {
    createEntity(data, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
```

### Zod Schema Template

```typescript
import { z } from 'zod'

export const createEntitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(false),
})

export type CreateEntityInput = z.infer<typeof createEntitySchema>
```

---

## Field Patterns

### Text Input
```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input placeholder="Placeholder..." {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea
```typescript
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea placeholder="..." className="min-h-[100px]" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox
```typescript
<FormField
  control={form.control}
  name="agreeToTerms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
      <FormControl>
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>I agree to the terms</FormLabel>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>
```

### Select
```typescript
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Switch/Toggle
```typescript
<FormField
  control={form.control}
  name="isEnabled"
  render={({ field }) => (
    <FormItem className="flex items-center justify-between">
      <div>
        <FormLabel>Enable Feature</FormLabel>
        <FormDescription>Turn this feature on or off</FormDescription>
      </div>
      <FormControl>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

### Date Input (HTML5)
```typescript
<FormField
  control={form.control}
  name="birthday"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Birthday</FormLabel>
      <FormControl>
        <Input type="date" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Validation Patterns

### Required Field
```typescript
name: z.string().min(1, 'Name is required')
```

### Min/Max Length
```typescript
name: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters')
```

### Email
```typescript
email: z.string().email('Invalid email address')
```

### URL
```typescript
website: z.string().url('Must be a valid URL').optional()
```

### Number Range
```typescript
age: z.number().min(18, 'Must be 18 or older').max(120)
```

### Regex Pattern
```typescript
password: z.string()
  .min(8)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
```

### Optional Field
```typescript
description: z.string().max(500).optional()
// or
description: z.string().max(500).nullable()
```

### Enum
```typescript
privacy: z.enum(['public', 'private', 'admin_only'])
```

### Cross-Field Validation
```typescript
z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error shows on confirmPassword field
})
```

### Date Range Validation
```typescript
z.object({
  startDate: z.date(),
  endDate: z.date().optional(),
}).refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
)
```

---

## Advanced Patterns

### Watch Field Value (Dependent Fields)
```typescript
import { useWatch } from 'react-hook-form'

const hasPoll = useWatch({ control: form.control, name: 'hasPoll' })

return (
  <>
    <FormField control={control} name="hasPoll" {...switchField} />
    {hasPoll && <FormField control={control} name="pollOptions" {...arrayField} />}
  </>
)
```

### Dynamic Field Array
```typescript
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'items',
})

return (
  <>
    {fields.map((field, index) => (
      <FormField
        key={field.id} // Use field.id, NOT index
        control={form.control}
        name={`items.${index}.name`}
        {...}
      />
    ))}
    <Button type="button" onClick={() => append({ name: '' })}>
      Add Item
    </Button>
  </>
)
```

### File Upload
```typescript
const { mutateAsync: uploadFile } = useUploadFile()

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const { fileId } = await uploadFile({ file })
  form.setValue('fileId', fileId)
}

return <Input type="file" onChange={handleFileChange} />
```

---

## Form State

### Check if Form is Dirty
```typescript
const isDirty = form.formState.isDirty
```

### Check Validation Errors
```typescript
const hasErrors = Object.keys(form.formState.errors).length > 0
```

### Manually Trigger Validation
```typescript
// Validate all fields
await form.trigger()

// Validate specific fields
await form.trigger(['email', 'password'])
```

### Set Field Value Programmatically
```typescript
form.setValue('fieldName', 'newValue')
```

### Get Field Value
```typescript
const value = form.watch('fieldName')
// or
const value = form.getValues('fieldName')
```

### Reset to Default Values
```typescript
form.reset() // Reset to defaultValues
form.reset({ name: 'New Default' }) // Reset with new values
```

---

## Multi-Step Form Pattern

```typescript
const [currentStep, setCurrentStep] = useState(1)

const form = useForm<FormInput>({
  resolver: zodResolver(schema),
  mode: 'onChange', // Important for multi-step!
})

// Validate before advancing
const goToNextStep = async () => {
  const fieldsToValidate = getStepFields(currentStep)
  const isValid = await form.trigger(fieldsToValidate)
  if (isValid) setCurrentStep(prev => prev + 1)
}

// Helper function
function getStepFields(step: number): (keyof FormInput)[] {
  switch (step) {
    case 1: return ['field1', 'field2']
    case 2: return ['field3', 'field4']
    default: return []
  }
}

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {currentStep === 1 && <Step1 control={form.control} />}
      {currentStep === 2 && <Step2 control={form.control} />}

      <Button type="button" onClick={goToNextStep}>Next</Button>
    </form>
  </Form>
)
```

---

## Dialog/Sheet Form Pattern

```typescript
const [open, setOpen] = useState(false)

const form = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})

const onSubmit = (data: FormInput) => {
  mutate(data, {
    onSuccess: () => {
      form.reset() // Reset form
      setOpen(false) // Close dialog
    },
  })
}

// Reset when dialog closes
const handleOpenChange = (open: boolean) => {
  setOpen(open)
  if (!open) form.reset()
}

return (
  <Sheet open={open} onOpenChange={handleOpenChange}>
    <SheetContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Fields */}
        </form>
      </Form>
    </SheetContent>
  </Sheet>
)
```

---

## Edit Form Pattern

```typescript
import { useEffect } from 'react'

const form = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: entity.name,
    description: entity.description,
  },
})

// Reset when entity changes
useEffect(() => {
  form.reset({
    name: entity.name,
    description: entity.description,
  })
}, [entity.id, form])
```

---

## Common Gotchas

### ❌ Don't forget `{...field}`
```typescript
// WRONG
<Input value={field.value} onChange={field.onChange} />

// RIGHT
<Input {...field} />
```

### ❌ Don't use array index as key
```typescript
// WRONG
{fields.map((field, index) => <div key={index}>...</div>)}

// RIGHT
{fields.map((field) => <div key={field.id}>...</div>)}
```

### ❌ Don't pass full form to children
```typescript
// WRONG
<StepComponent form={form} />

// RIGHT
<StepComponent control={form.control} />
```

### ❌ Don't forget to reset
```typescript
// WRONG
onSuccess: () => {
  setOpen(false) // Missing form.reset()
}

// RIGHT
onSuccess: () => {
  form.reset()
  setOpen(false)
}
```

---

## File Organization

```
app-pages/
  [feature]/
    forms/
      create-[entity]-form.tsx    # Form container
      edit-[entity]-form.tsx      # Edit form
      sections/                   # Form sections (optional)
        basic-info-section.tsx
        advanced-section.tsx

lib/
  validations/
    [feature].ts                  # Zod schemas
  hooks/
    use-[feature].ts              # Mutation hooks
```

---

## Resources

- **Detailed Guide:** `.claude/form-architecture-guide.md`
- **Task-Based Help:** `.claude/commands/form.md`
- **Example Forms:**
  - Simple: `app-pages/auth/forms/sign-in-form.tsx`
  - Complex: `app-pages/auth/forms/sign-up-form.tsx`
  - Multi-step: `app-pages/create-event/index.tsx`
- **React Hook Form Docs:** https://react-hook-form.com
- **Zod Docs:** https://zod.dev
- **Shadcn Form:** https://ui.shadcn.com/docs/components/form

---

## Decision Matrix

| Form Type | Use Pattern |
|-----------|-------------|
| 1-5 fields, single page | Simple Form Template |
| 6+ fields, multiple steps | Multi-Step Form Pattern |
| Inside dialog/sheet | Dialog/Sheet Form Pattern |
| Editing existing data | Edit Form Pattern |
| Dynamic add/remove items | useFieldArray |
| Conditional fields | useWatch |
| File upload | Upload mutation + setValue |

---

## Golden Rules

1. **React Hook Form manages ALL form state** - No manual useState for fields
2. **Zod schemas in `lib/validations/`** - Single source of truth
3. **Shadcn Form components always** - Consistent UI
4. **Children receive `control` prop only** - Not full form object
5. **Reset on success/close** - `form.reset()` is mandatory
6. **One form for multi-step** - Use `form.trigger()` for per-step validation
7. **Mutations handle invalidation** - Forms only handle UI state
