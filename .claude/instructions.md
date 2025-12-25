# Project Instructions

When working on frontend tasks in this project:

1. **Always read CLAUDE.md first** to understand architecture
2. **Check shadcn/ui components** in `components/ui/` before building custom UI
3. **Keep `/app` pages as Server Components** - no "use client" directive
4. **Use the data fetching pattern** shown in `app/(protected)/tribe/[tribe_id]/page.tsx`
5. **Follow PRD requirements** in docs/PRD.md and docs/MVP_PRD.md
6. **Use breadcrumb navigation** for all tribe subpages (never back buttons)

## Specialized Commands

Use these commands for task-specific guidance:

- **Forms:** Use `@.claude/commands/form.md` for building forms with react-hook-form
  - Quick reference: `.claude/form-quick-reference.md`
  - Architecture guide: `.claude/form-architecture-guide.md`

- **Data Fetching:** Use `@.claude/commands/tanstack-query.md` for TanStack Query
  - Comprehensive guide: `.claude/tanstack-query-guide.md`

- **Navigation:** Use `.claude/navigation-guide.md` for subpage headers and breadcrumbs
  - Key component: `components/shared/subpage-header.tsx`

- **Frontend:** Use `@.claude/commands/frontend.md` for React/Next.js tasks
- **Backend:** Use `@.claude/commands/backend.md` for API/service layer tasks

## Navigation & Headers Rules

When building tribe subpages:

1. **ALWAYS use breadcrumb navigation** - Never use back buttons or `router.back()`
2. **Use SubpageHeader component** - From `components/shared/subpage-header.tsx`
3. **Start breadcrumbs with "Dashboard"** - This is handled automatically by SubpageHeader
4. **Provide href for intermediate items** - Only the last breadcrumb item should be non-clickable
5. **See navigation guide** for patterns and examples

## Form Development Rules

When building forms:

1. **ALWAYS use react-hook-form** - Never manual `useState` for form fields
2. **ALWAYS use Zod for validation** - Schemas in `lib/validations/`
3. **ALWAYS use shadcn Form components** - From `components/ui/form.tsx`
4. **ALWAYS reset on success** - Call `form.reset()` after successful submission
5. **NEVER pass full form to children** - Pass `control` prop only
6. **See form guides** for patterns and examples

For any form-related task, reference the form command for specialized guidance.
