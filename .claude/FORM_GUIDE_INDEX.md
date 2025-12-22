# Form Development Guide Index

Welcome to the comprehensive form development guide for this project. This index helps you find the right resource for your form-building needs.

## Quick Navigation

| I want to... | Use this resource |
|--------------|-------------------|
| Build a simple form quickly | [Form Quick Reference](.claude/form-quick-reference.md) → Simple Form Template |
| Create a multi-step wizard | [Form Command](.claude/commands/form.md) → Task 2 |
| Convert a legacy form | [Form Command](.claude/commands/form.md) → Task 8 |
| Understand the architecture | [Form Architecture Guide](.claude/form-architecture-guide.md) |
| Get help with validation | [Form Quick Reference](.claude/form-quick-reference.md) → Validation Patterns |
| Add dynamic fields | [Form Command](.claude/commands/form.md) → Task 6 |
| Implement file upload | [Form Command](.claude/commands/form.md) → Task 7 |
| Debug form issues | [Form Architecture Guide](.claude/form-architecture-guide.md) → Common Pitfalls |

---

## Document Overview

### 1. Form Quick Reference (`form-quick-reference.md`)
**Best for:** Quick lookups, code snippets, common patterns

**Contents:**
- ✅ Copy/paste templates for simple forms
- ✅ Field patterns (input, textarea, select, checkbox, etc.)
- ✅ Validation patterns (required, email, regex, cross-field)
- ✅ Common gotchas and anti-patterns
- ✅ File organization structure
- ✅ Decision matrix for choosing patterns

**When to use:** You know what you need, just want the code quickly.

---

### 2. Form Command (`commands/form.md`)
**Best for:** Task-based guidance with step-by-step instructions

**Contents:**
- ✅ 8 common form tasks with detailed steps
- ✅ Simple forms, multi-step wizards, dialog forms, edit forms
- ✅ Advanced patterns (dependent fields, field arrays, file upload)
- ✅ Migration guide from legacy forms
- ✅ Decision trees and checklists
- ✅ Tips for AI assistants

**When to use:** You're building something specific and want guided steps.

**Usage in Cursor/Claude Code:**
```
@.claude/commands/form.md Create a multi-step event creation form
```

---

### 3. Form Architecture Guide (`form-architecture-guide.md`)
**Best for:** Deep understanding, comprehensive patterns, architecture decisions

**Contents:**
- ✅ Complete architecture explanation (3-layer pattern)
- ✅ 4 form patterns with full examples (Simple, Multi-step, Dialog, Edit)
- ✅ Integration with TanStack Query mutations
- ✅ Advanced patterns (dependent fields, dynamic arrays, file uploads)
- ✅ Common pitfalls to avoid
- ✅ Migration checklist from legacy patterns

**When to use:** You want to understand the "why" behind the patterns, or building something complex.

---

## Learning Path

### Beginner (New to this codebase)
1. Read **Form Quick Reference** → "Quick Start Checklist"
2. Copy **Simple Form Template** and customize
3. Look at example: `app-pages/auth/forms/sign-in-form.tsx`

### Intermediate (Building complex forms)
1. Start with **Form Command** → relevant task
2. Follow step-by-step instructions
3. Reference **Quick Reference** for field patterns
4. Look at example: `app-pages/create-event/index.tsx` (multi-step)

### Advanced (Understanding architecture)
1. Read **Form Architecture Guide** in full
2. Understand the 3-layer pattern
3. Study invalidation strategies
4. Review anti-patterns section
5. Build custom patterns for your use case

---

## Example Forms in Codebase

### Simple Forms
- **Sign In:** `app-pages/auth/forms/sign-in-form.tsx`
  - 2 fields (email, password)
  - Basic validation
  - TanStack Query mutation

- **Forgot Password:** `app-pages/auth/forms/forgot-password-form.tsx`
  - 1 field (email)
  - Success state handling
  - Dialog state management

### Complex Forms
- **Sign Up:** `app-pages/auth/forms/sign-up-form.tsx`
  - 6 fields including checkbox
  - Password requirements indicator (`useWatch`)
  - Cross-field validation (password confirmation)

- **Reset Password:** `app-pages/auth/forms/reset-password-form.tsx`
  - Token validation
  - Cross-field validation
  - Success/error state handling

### Multi-Step Wizards
- **Create Event:** `app-pages/create-event/index.tsx`
  - 5-step wizard
  - Single form instance
  - Per-step validation with `form.trigger()`
  - Step components receive `control` prop

---

## Common Scenarios

### Scenario: "I need to create a simple contact form"
1. Go to **Form Quick Reference**
2. Copy "Simple Form Template"
3. Create Zod schema in `lib/validations/contact.ts`
4. Customize fields
5. Create mutation hook in `lib/hooks/use-contact.ts`
6. Done!

### Scenario: "I need a multi-step onboarding wizard"
1. Go to **Form Command** → Task 2
2. Follow the 7-step checklist
3. Create schema with all fields
4. Create form container with step state
5. Create step components
6. Reference `app-pages/create-event/` for example
7. Test step validation

### Scenario: "I need to convert an old form to the new pattern"
1. Go to **Form Command** → Task 8
2. Follow migration checklist
3. Remove manual `useState`
4. Add `useForm` with `zodResolver`
5. Replace custom components with shadcn Form
6. Test validation

### Scenario: "My form validation isn't working"
1. Check **Form Architecture Guide** → Common Pitfalls
2. Verify Zod schema is correct
3. Ensure `resolver: zodResolver(schema)` is set
4. Check field name matches schema key
5. Look for `FormMessage` component in field

---

## File Structure Reference

```
project-root/
├── .claude/
│   ├── FORM_GUIDE_INDEX.md          # This file - navigation hub
│   ├── form-quick-reference.md      # Quick cheatsheet
│   ├── form-architecture-guide.md   # Comprehensive guide
│   └── commands/
│       └── form.md                  # Task-based command
│
├── app-pages/
│   └── [feature]/
│       └── forms/
│           ├── create-[entity]-form.tsx
│           ├── edit-[entity]-form.tsx
│           └── sections/            # Optional: for complex forms
│               ├── basic-info.tsx
│               └── advanced.tsx
│
├── lib/
│   ├── validations/
│   │   └── [feature].ts             # Zod schemas
│   └── hooks/
│       └── use-[feature].ts         # Mutation hooks
│
└── components/
    └── ui/
        └── form.tsx                 # Shadcn Form components (DO NOT EDIT)
```

---

## Key Principles

### 1. React Hook Form Manages State
- ❌ NO manual `useState` for form fields
- ❌ NO Zustand or external state for form data
- ✅ `useForm` hook handles everything

### 2. Zod Schemas are Single Source of Truth
- ✅ Define validation in `lib/validations/`
- ✅ Export types with `z.infer`
- ✅ Use `zodResolver` in form

### 3. Shadcn Form Components for Consistency
- ✅ `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- ✅ Auto-generated from shadcn CLI
- ❌ DO NOT edit `components/ui/form.tsx`

### 4. Clean Architecture
- ✅ Form container manages `useForm` + mutations
- ✅ Sections/steps receive `control` prop only
- ✅ No business logic in form components

### 5. Integration with TanStack Query
- ✅ Forms call mutation hooks from `lib/hooks/`
- ✅ Mutations handle invalidation
- ✅ Forms handle UI state (reset, close)

---

## Quick Decision Tree

```
What are you building?
│
├─ Simple form (1-5 fields)
│  └─ Use: Form Quick Reference → Simple Form Template
│
├─ Multi-step wizard (3+ steps)
│  └─ Use: Form Command → Task 2: Multi-Step Form
│
├─ Dialog/Sheet form
│  └─ Use: Form Command → Task 3: Dialog Form
│
├─ Edit existing data
│  └─ Use: Form Command → Task 4: Edit Form
│
├─ Form with file upload
│  └─ Use: Form Command → Task 7: File Upload
│
├─ Form with add/remove fields
│  └─ Use: Form Command → Task 6: Dynamic Field Arrays
│
└─ Converting legacy form
   └─ Use: Form Command → Task 8: Migrate Legacy Form
```

---

## Getting Help

### In Cursor/Claude Code:
```bash
# Get form-specific help
@.claude/commands/form.md [describe your task]

# Examples:
@.claude/commands/form.md Create a profile edit form with avatar upload
@.claude/commands/form.md Build a multi-step product creation wizard
@.claude/commands/form.md Add validation to existing contact form
```

### Quick References:
- **Templates:** `.claude/form-quick-reference.md`
- **Validation patterns:** `.claude/form-quick-reference.md` → Validation Patterns
- **Field patterns:** `.claude/form-quick-reference.md` → Field Patterns
- **Common gotchas:** `.claude/form-quick-reference.md` → Common Gotchas

### External Resources:
- **React Hook Form Docs:** https://react-hook-form.com
- **Zod Docs:** https://zod.dev
- **Shadcn Form:** https://ui.shadcn.com/docs/components/form

---

## Checklist for New Forms

Before you start:
- [ ] I've reviewed the Quick Reference for templates
- [ ] I've identified which pattern to use (simple, multi-step, dialog, edit)
- [ ] I have a mutation hook or know where to create it

During development:
- [ ] Created/updated Zod schema in `lib/validations/`
- [ ] Exported type with `z.infer`
- [ ] Used `useForm` with `zodResolver`
- [ ] Used shadcn Form components
- [ ] Integrated mutation from `lib/hooks/`
- [ ] Added `form.reset()` on success
- [ ] Tested validation with invalid data
- [ ] Tested successful submission

After completion:
- [ ] Form follows project architecture
- [ ] No manual `useState` for form fields
- [ ] No Zustand or external state
- [ ] Children receive `control` prop only
- [ ] TypeScript errors resolved
- [ ] Form resets on success/close

---

## Version History

- **v1.0** (2025-01-22): Initial form guides created
  - Migrated auth forms to react-hook-form
  - Created Quick Reference, Command, and Architecture Guide
  - Established 3-layer form pattern
  - Added comprehensive examples and templates

---

## Contributing

When adding new form patterns:
1. Add pattern to **Form Architecture Guide**
2. Add template to **Form Quick Reference**
3. Add task to **Form Command** if complex
4. Update this index with new scenario
5. Add example to codebase in `app-pages/`

---

## Summary

| Document | Purpose | Best For |
|----------|---------|----------|
| **Quick Reference** | Templates & snippets | Fast development, copy/paste code |
| **Command** | Task-based guidance | Step-by-step instructions |
| **Architecture Guide** | Deep understanding | Learning patterns, complex forms |
| **This Index** | Navigation | Finding the right resource |

**Start here:** If you're new, begin with the **Quick Reference** template and work from there. If you get stuck, consult the **Command** for your specific task. If you want deep understanding, read the **Architecture Guide**.

Happy form building! 🎉
