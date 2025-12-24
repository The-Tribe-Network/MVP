# Navigation & Subpage Headers Guide

This guide documents the navigation patterns used throughout the Tribe application. **All tribe subpages must use breadcrumb navigation** for consistent, predictable user experience.

## Why Breadcrumbs Over Back Buttons

| Problem with Back Buttons | How Breadcrumbs Solve It |
|--------------------------|-------------------------|
| `router.back()` navigates to unexpected places (search, external links) | Always shows correct hierarchy |
| No context about current location in the app | Full path visible: `Dashboard > Events > Event Name` |
| Can't skip navigation levels | Users can click any level to jump directly |
| Inconsistent destinations across pages | Predictable, hierarchical structure |

## Core Components

### 1. SubpageHeader (`components/shared/subpage-header.tsx`)

Reusable header component for all tribe subpages. Provides:
- Breadcrumb navigation (always starts with "Dashboard")
- Page title
- Optional subtitle/description
- Optional action buttons slot

**Props:**
```typescript
interface SubpageHeaderProps {
  tribeId: string;
  breadcrumbs: BreadcrumbItemData[];  // Trail after "Dashboard"
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface BreadcrumbItemData {
  label: string;
  href?: string;  // Only provide for intermediate items, not the last one
}
```

### 2. Breadcrumb Components (`components/ui/breadcrumb.tsx`)

shadcn/ui breadcrumb components for manual breadcrumb implementation:
- `Breadcrumb` - Container
- `BreadcrumbList` - List wrapper
- `BreadcrumbItem` - Individual item
- `BreadcrumbLink` - Clickable link
- `BreadcrumbPage` - Current page (not clickable)
- `BreadcrumbSeparator` - Separator between items

## Navigation Hierarchy

```
Dashboard (/tribe/{tribeId})
│
├── Events (/tribe/{tribeId}/events)
│   │   Breadcrumbs: Dashboard > Events
│   │
│   └── Event Detail (/tribe/{tribeId}/events/{eventId})
│           Breadcrumbs: Dashboard > Events > {Event Title}
│
├── Media (/tribe/{tribeId}/media)
│   │   Breadcrumbs: Dashboard > Media
│   │
│   ├── Browse (/tribe/{tribeId}/media/browse)
│   │       Breadcrumbs: Dashboard > Media > Browse
│   │
│   └── Album (/tribe/{tribeId}/media/album/{albumId})
│           Breadcrumbs: Dashboard > Media > {Album Name}
│
├── Post (/tribe/{tribeId}/post/{postId})
│       Breadcrumbs: Dashboard > Post
│
└── Settings (/tribe/{tribeId}/settings/{section})
        Breadcrumbs: Dashboard > Settings > {Section Name}
```

## Usage Patterns

### Pattern 1: Simple Subpage (Single Level)

For pages directly under the dashboard (Events, Media main page):

```typescript
// app-pages/events/events-header.tsx
import { SubpageHeader } from '@/components/shared/subpage-header'

export function EventsHeader({ tribeId }: { tribeId: string }) {
  return (
    <SubpageHeader
      tribeId={tribeId}
      breadcrumbs={[{ label: 'Events' }]}
      title="Tribe Events"
      subtitle="Plan and manage your tribe's events"
      actions={<CreateEventDialog />}
    />
  )
}
```

### Pattern 2: Nested Subpage (Multi-Level)

For pages nested under another subpage (Album under Media, Event Detail under Events):

```typescript
// app-pages/album/components/album-header/index.tsx
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AlbumHeader({ album, tribeId }: AlbumHeaderProps) {
  return (
    <div className="mb-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}/media`}>Media</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{album.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Rest of header content */}
    </div>
  )
}
```

### Pattern 3: Settings Pages (Dynamic Section)

Settings uses a shared header with dynamic breadcrumbs based on current route:

```typescript
// app-pages/tribe-settings/components/settings-header.tsx
'use client';

import { usePathname } from 'next/navigation';

const settingsLabels: Record<string, string> = {
  general: 'General',
  members: 'Members',
  roles: 'Roles',
  // ... other sections
};

export function SettingsHeader({ tribeId }: { tribeId: string }) {
  const pathname = usePathname();
  const currentSection = pathname?.replace(`/tribe/${tribeId}/settings/`, '').split('/')[0] || '';
  const sectionLabel = settingsLabels[currentSection] || 'Settings';

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {currentSection ? (
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}/settings`}>Settings</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Settings</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {currentSection && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold">Tribe Settings</h1>
      <p className="text-muted-foreground mt-1">
        Manage your tribe's configuration and preferences
      </p>
    </div>
  );
}
```

### Pattern 4: Detail Pages with Dynamic Titles

For pages where the title comes from data (Event Detail, Post Detail):

```typescript
// app-pages/event-detail/index.tsx
export function EventDetailContent({ tribeId, eventId }: Props) {
  const { data: event } = useEventDetail(tribeId, eventId)

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}/events`}>Events</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event?.title || 'Event'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page content */}
    </div>
  )
}
```

## Existing Implementations

| Page | File | Breadcrumb Pattern |
|------|------|-------------------|
| Events | `app-pages/events/events-header.tsx` | Dashboard > Events |
| Media Highlights | `app-pages/media/components/media-highlights-header.tsx` | Dashboard > Media |
| Media Browse | `app-pages/media-browse/components/browse-header.tsx` | Dashboard > Media > Browse |
| Album Detail | `app-pages/album/components/album-header/index.tsx` | Dashboard > Media > {Album} |
| Post Detail | `app-pages/post/components/post-header.tsx` | Dashboard > Post |
| Event Detail | `app-pages/event-detail/index.tsx` | Dashboard > Events > {Event} |
| Settings | `app-pages/tribe-settings/components/settings-header.tsx` | Dashboard > Settings > {Section} |

## Settings Page Layout

The settings layout includes additional features:

1. **Sticky sidebar navigation** - Nav stays visible when scrolling
2. **Bottom padding** - Content has padding at the bottom
3. **Shared header** - Breadcrumbs rendered once in layout

```typescript
// app/(protected)/tribe/[tribe_id]/settings/layout.tsx
<div className="flex flex-col">
  <SettingsHeader tribeId={tribe_id} />

  <div className="flex gap-8 mt-6">
    <div className="sticky top-6 self-start">
      <SettingsNavigation tribeId={tribe_id} />
    </div>
    <div className="flex-1 pb-12">{children}</div>
  </div>
</div>
```

## Anti-Patterns (Never Do)

### Never Use router.back()

```typescript
// ❌ BAD - Unpredictable navigation
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  return (
    <Button onClick={() => router.back()}>
      <ArrowLeft /> Back
    </Button>
  )
}

// ✅ GOOD - Predictable breadcrumb navigation
export function Header({ tribeId }: { tribeId: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {/* ... */}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### Never Use Standalone Back Links

```typescript
// ❌ BAD - Inconsistent with rest of app
<Link href={`/tribe/${tribeId}/media`}>
  <ArrowLeft /> Back to Media
</Link>

// ✅ GOOD - Use breadcrumbs
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href={`/tribe/${tribeId}/media`}>Media</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>{albumName}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Exception: Wizard/Multi-Step Forms

Multi-step creation flows (like Create Album) are exceptions to the breadcrumb rule. These use:
- Cancel button to exit the flow
- Internal step navigation (Next/Back buttons)
- Focused, modal-like experience

Example: `app-pages/create-album/index.tsx`

## Adding a New Subpage

When creating a new tribe subpage:

1. **Determine the breadcrumb path** based on the hierarchy
2. **Use SubpageHeader** for simple pages, or **manual breadcrumbs** for complex headers
3. **Ensure all intermediate links are clickable** (except the current page)
4. **Add the page to this guide** for reference

## Quick Reference

```typescript
// Import for SubpageHeader
import { SubpageHeader } from '@/components/shared/subpage-header'

// Import for manual breadcrumbs
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
```
