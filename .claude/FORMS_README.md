# Forms in Tribe v2

> **Complete guide to building forms in this application**

## 🎯 Quick Start

**Building a simple form? Start here:**

1. Copy the template from [`.claude/form-quick-reference.md`](.claude/form-quick-reference.md)
2. Create Zod schema in `lib/validations/[feature].ts`
3. Customize fields
4. Done!

**Need help?** See [`.claude/FORM_GUIDE_INDEX.md`](.claude/FORM_GUIDE_INDEX.md) for navigation.

---

## 📚 Documentation Structure

```
.claude/
├── FORMS_README.md                  # ← YOU ARE HERE (Overview)
├── FORM_GUIDE_INDEX.md              # Navigation hub
├── form-quick-reference.md          # Templates & cheatsheet
├── form-architecture-guide.md       # Deep dive
└── commands/
    └── form.md                      # Task-based guide
```

**Which document should I read?**

| I want to... | Read this |
|--------------|-----------|
| 🚀 Build a form quickly | [form-quick-reference.md](.claude/form-quick-reference.md) |
| 📖 Understand the architecture | [form-architecture-guide.md](.claude/form-architecture-guide.md) |
| ✅ Follow step-by-step tasks | [commands/form.md](.claude/commands/form.md) |
| 🗺️ Navigate all guides | [FORM_GUIDE_INDEX.md](.claude/FORM_GUIDE_INDEX.md) |

---

## 🏗️ Architecture Overview

### The 3-Layer Pattern

```
┌─────────────────────────────────────────────┐
│ 1. ZOD SCHEMA (Validation)                  │
│    lib/validations/feature.ts               │
│                                              │
│    export const schema = z.object({ ... })  │
│    export type Input = z.infer<typeof ...>  │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 2. FORM COMPONENT (UI)                      │
│    app-pages/feature/forms/create-form.tsx  │
│                                              │
│    const form = useForm({                   │
│      resolver: zodResolver(schema)          │
│    })                                        │
│                                              │
│    <Form {...form}>                         │
│      <FormField control={form.control} />   │
│    </Form>                                   │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│ 3. MUTATION (Data Layer)                    │
│    lib/hooks/use-feature.ts                 │
│                                              │
│    const { mutate } = useMutation({         │
│      mutationFn: apiFunction,               │
│      onSuccess: () => invalidate(...)       │
│    })                                        │
└─────────────────────────────────────────────┘
```

### Key Technologies

- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Shadcn/ui Form** - UI components
- **TanStack Query** - Mutations and cache invalidation

---

## ✅ Golden Rules

### DO ✅

- **Use `useForm` hook** - It manages all form state
- **Use `zodResolver`** - Automatic validation
- **Use shadcn Form components** - Consistent UI
- **Pass `control` to children** - Not full form object
- **Reset on success** - `form.reset()`
- **Examples exist** - Check `app-pages/auth/forms/`

### DON'T ❌

- **Manual `useState`** - RHF handles state
- **Zustand for forms** - External state adds complexity
- **Custom validation** - Zod does this
- **Pass full `form`** - Only pass `control`
- **Forget to reset** - Form state persists

---

## 📖 Common Patterns

### Simple Form (1-5 fields)

```typescript
const form = useForm<CreatePostInput>({
  resolver: zodResolver(createPostSchema),
  defaultValues: { content: '', mediaId: null },
})

const { mutate, isPending } = useCreatePost()

const onSubmit = (data: CreatePostInput) => {
  mutate(data, { onSuccess: () => form.reset() })
}
```

**Example:** `app-pages/auth/forms/sign-in-form.tsx`

---

### Multi-Step Form (Wizard)

```typescript
const [currentStep, setCurrentStep] = useState(1)

// ONE form for ALL steps
const form = useForm<CreateEventInput>({
  resolver: zodResolver(createEventSchema),
  mode: 'onChange', // Important!
})

// Validate before advancing
const goNext = async () => {
  const fields = getStepFields(currentStep)
  const isValid = await form.trigger(fields)
  if (isValid) setCurrentStep(prev => prev + 1)
}
```

**Example:** `app-pages/create-event/index.tsx`

---

### Dialog/Sheet Form

```typescript
const [open, setOpen] = useState(false)

const form = useForm({ ... })

const onSubmit = (data) => {
  mutate(data, {
    onSuccess: () => {
      form.reset()
      setOpen(false)
    },
  })
}

// Reset when closed
const handleOpenChange = (open: boolean) => {
  setOpen(open)
  if (!open) form.reset()
}
```

---

### Edit Form

```typescript
const form = useForm({
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

## 🎨 Form Field Examples

### Text Input
```typescript
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
```

### Textarea
```typescript
<FormControl>
  <Textarea className="min-h-[100px]" {...field} />
</FormControl>
```

### Checkbox
```typescript
<FormControl>
  <Checkbox
    checked={field.value}
    onCheckedChange={field.onChange}
  />
</FormControl>
```

### Select
```typescript
<Select onValueChange={field.onChange} defaultValue={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select..." />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

---

## 🔍 Validation Examples

### Required Field
```typescript
name: z.string().min(1, 'Name is required')
```

### Email
```typescript
email: z.string().email('Invalid email address')
```

### Password with Rules
```typescript
password: z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
```

### Cross-Field Validation
```typescript
z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
)
```

---

## 🗂️ File Organization

```
project-root/
├── app-pages/
│   └── [feature]/
│       └── forms/
│           ├── create-[entity]-form.tsx   # Form container
│           ├── edit-[entity]-form.tsx     # Edit form
│           └── sections/                  # Optional sections
│               ├── basic-info.tsx
│               └── advanced.tsx
│
├── lib/
│   ├── validations/
│   │   └── [feature].ts                   # Zod schemas
│   └── hooks/
│       └── use-[feature].ts               # Mutation hooks
│
└── components/
    └── ui/
        └── form.tsx                       # Shadcn (DO NOT EDIT)
```

---

## 📝 Migration Checklist

Converting a legacy form? Check these off:

- [ ] Created/updated Zod schema in `lib/validations/`
- [ ] Removed all manual `useState` for form fields
- [ ] Replaced with `useForm` hook + `zodResolver`
- [ ] Replaced custom components with shadcn Form
- [ ] Updated field pattern to `FormField` render prop
- [ ] Added `form.reset()` on successful submission
- [ ] Tested validation with invalid data
- [ ] Tested successful submission
- [ ] Verified TypeScript types are correct

---

## 🎓 Examples in Codebase

### ⭐ Start Here (Simple Forms)

1. **Sign In Form** - `app-pages/auth/forms/sign-in-form.tsx`
   - 2 fields (email, password)
   - Basic validation
   - Perfect starting point

2. **Forgot Password** - `app-pages/auth/forms/forgot-password-form.tsx`
   - 1 field
   - Success state handling
   - Dialog integration

### 🚀 Advanced Examples

3. **Sign Up Form** - `app-pages/auth/forms/sign-up-form.tsx`
   - 6 fields including checkbox
   - `useWatch` for password indicator
   - Cross-field validation

4. **Create Event** - `app-pages/create-event/index.tsx`
   - 5-step wizard
   - Per-step validation
   - Complete multi-step pattern

---

## 🆘 Common Issues

### "Validation not working"
- ✅ Check schema in `lib/validations/`
- ✅ Verify `resolver: zodResolver(schema)`
- ✅ Ensure field `name` matches schema key
- ✅ Check for `FormMessage` in field

### "Form not resetting"
- ✅ Add `form.reset()` in `onSuccess`
- ✅ For dialogs, also call in `onOpenChange`
- ✅ Verify mutation success callback is firing

### "TypeScript errors"
- ✅ Export type with `z.infer<typeof schema>`
- ✅ Use type for `useForm<YourType>`
- ✅ Ensure mutation params match type

### "Field values not updating"
- ✅ Use `{...field}` spread in input
- ✅ Don't use `value` and `onChange` separately
- ✅ For custom components, use `field.onChange`

---

## 🔗 Quick Links

### Documentation
- [Quick Reference](.claude/form-quick-reference.md) - Templates & cheatsheet
- [Task Guide](.claude/commands/form.md) - Step-by-step instructions
- [Architecture](.claude/form-architecture-guide.md) - Deep dive
- [Index](.claude/FORM_GUIDE_INDEX.md) - Navigation

### Main Project Docs
- [CLAUDE.md](../CLAUDE.md) - Project architecture
- [TanStack Query Guide](.claude/tanstack-query-guide.md) - Data fetching

### External Resources
- [React Hook Form Docs](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Shadcn Form Component](https://ui.shadcn.com/docs/components/form)

---

## 🎯 Next Steps

### For New Developers
1. Read this overview
2. Look at `app-pages/auth/forms/sign-in-form.tsx`
3. Copy template from Quick Reference
4. Build your first form!

### For Experienced Developers
1. Review [Architecture Guide](.claude/form-architecture-guide.md)
2. Study multi-step pattern in `app-pages/create-event/`
3. Build complex forms with confidence

### For AI Assistants
1. Reference [commands/form.md](.claude/commands/form.md) for tasks
2. Use templates from [form-quick-reference.md](.claude/form-quick-reference.md)
3. Follow patterns from existing forms
4. Never deviate from the 3-layer architecture

---

## 💡 Pro Tips

1. **Always start simple** - Begin with basic form, add complexity as needed
2. **Check examples first** - See if similar form exists in `app-pages/`
3. **Use the guides** - They exist to save you time
4. **Follow the pattern** - Consistency makes the codebase maintainable
5. **Test validation** - Always test with invalid data first

---

## 📊 Form Patterns at a Glance

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Simple** | 1-5 fields, single page | Sign In |
| **Multi-Step** | 6+ fields, logical steps | Create Event |
| **Dialog** | Quick create/edit in modal | Create Album |
| **Edit** | Modify existing data | Edit Profile |

---

**Need Help?** Start with [FORM_GUIDE_INDEX.md](.claude/FORM_GUIDE_INDEX.md) to find the right guide for your task.

**Building Forms?** Copy templates from [form-quick-reference.md](.claude/form-quick-reference.md) to get started fast.

---

*Last Updated: January 2025*
*Version: 1.0*
