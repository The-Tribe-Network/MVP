# Claude Commands for Cursor

This directory contains specialized commands and instructions for working with this codebase in Cursor.

## How to Use Commands in Cursor

### Method 1: @ Mention (Recommended)
Simply mention the command file in your chat:

- **Frontend tasks**: `@.claude/commands/frontend.md [your task]`
- **Backend tasks**: `@.claude/commands/backend.md [your task]`

**Examples:**
```
@.claude/commands/frontend.md Create a new post creation dialog using shadcn components
```

```
@.claude/commands/backend.md Implement API endpoint for creating events with proper permissions
```

### Method 2: Reference in Context
You can also reference these files at the start of a conversation to set context, then continue with your task.

## Available Commands

### `/frontend` - Frontend Development Agent
Specialized for React/Next.js frontend development:
- React/Next.js 15 with App Router
- TypeScript with full type safety
- TanStack Query for data fetching
- shadcn/ui components
- Tailwind CSS 4
- Form handling with react-hook-form + Zod

**Usage:** `@.claude/commands/frontend.md [your frontend task]`

### `/backend` - Backend Development Agent
Specialized for API and service layer development:
- Next.js 15 API Routes
- Drizzle ORM with PostgreSQL
- Better-Auth authentication
- Service layer pattern
- Permission system
- Zod validation

**Usage:** `@.claude/commands/backend.md [your backend task]`

### `/tanstack-query` - TanStack Query Development
Specialized for data fetching, caching, and state management:
- Query hooks and query options
- Mutation patterns and invalidation strategies
- Optimistic updates
- Server-side prefetching
- Cache management

**Usage:** `@.claude/commands/tanstack-query.md [your query/mutation task]`

### `/form` - Form Development
Specialized for building forms with react-hook-form:
- Simple forms and multi-step wizards
- Form validation with Zod
- Shadcn Form components
- Dialog/sheet forms
- File uploads and dynamic fields

**Usage:** `@.claude/commands/form.md [your form task]`

## Guides (Reference Documentation)

### Navigation Guide
Comprehensive guide for subpage headers and breadcrumb navigation:
- SubpageHeader component usage
- Breadcrumb patterns for all page types
- Settings page layout with sticky navigation
- Anti-patterns to avoid (never use back buttons)

**Reference:** `.claude/navigation-guide.md`

### TanStack Query Guide
Deep-dive into data fetching patterns:
- Query options and hooks architecture
- Mutation and invalidation strategies
- Server-side prefetching
- Optimistic updates

**Reference:** `.claude/tanstack-query-guide.md`

### Form Guides
Architecture and patterns for form development:
- Quick reference: `.claude/form-quick-reference.md`
- Architecture guide: `.claude/form-architecture-guide.md`
- Guide index: `.claude/FORM_GUIDE_INDEX.md`

## Automatic Instructions

The file `.claude/instructions.md` is automatically loaded by Cursor and provides general project guidance. You don't need to reference it manually.

## Tips

1. **Be specific**: Include details about what you want to build or modify
2. **Reference existing code**: Mention similar features if they exist
3. **Ask questions**: The commands will help you understand patterns and conventions
4. **Combine commands**: You can reference multiple files if needed

