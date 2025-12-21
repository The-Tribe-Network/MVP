# Unused Files Analysis Report

**Generated:** $(date)
**Total Files Analyzed:** 429
**Unused Files Found:** 36

## Summary

This report identifies files that are not imported or referenced anywhere in the codebase. Files are categorized by type and include notes about whether they can be safely deleted.

---

## Unused Files by Category

### 1. Configuration Files (Keep - Required for Build/Development)

These files are not "imported" but are required for the project to function:

- **`.mcp.json`** - MCP server configuration (may be needed for development tools)
- **`components.json`** - shadcn/ui configuration (required for component generation)

**Recommendation:** Keep these files

---

### 2. UI Components (Potentially Unused - Verify Before Deleting)

These shadcn/ui components are not currently imported:

- `components/ui/accordion.tsx`
- `components/ui/alert.tsx`
- `components/ui/breadcrumb.tsx`
- `components/ui/chart.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/context-menu.tsx`
- `components/ui/hover-card.tsx`
- `components/ui/menubar.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/pagination.tsx`
- `components/ui/resizable.tsx`
- `components/ui/slider.tsx`
- `components/ui/table.tsx`
- `components/ui/toggle-group.tsx`
- `components/ui/use-mobile.tsx`

**Recommendation:** 
- These are shadcn/ui components that may be used in the future
- Check if any are referenced in design docs or planned features
- Safe to keep if you plan to use them, otherwise can be removed

---

### 3. Duplicate/Old Component Files

- **`components/tribe-dashboard/tribe-dashboard-content.tsx`** - Old version, replaced by `app-pages/tribe-dashboard/index.tsx`
  - References non-existent components (`@/components/dashboard-widgets/*`)
  - The new version is in `app-pages/tribe-dashboard/index.tsx` and is actively used

**Recommendation:** ✅ **Safe to delete**

- **`components/page-header.tsx`** - Not imported anywhere
  - Similar functionality might exist elsewhere

**Recommendation:** ⚠️ **Verify if needed, then delete**

---

### 4. Feature Components (Unused)

- **`app-pages/event-detail/event-calendar-view.tsx`** - Calendar view component not used
- **`app-pages/media/trending-section.tsx`** - Trending section component not used

**Recommendation:** ⚠️ **Check if these are planned features or can be deleted**

---

### 5. Type Definitions (Unused)

- **`app-pages/welcome/types.ts`** - Defines `ProfileSetupData` interface
  - Not imported anywhere in the codebase
  - May have been replaced or is no longer needed

**Recommendation:** ⚠️ **Verify if welcome flow still needs this, then delete**

---

### 6. Hooks (Unused)

- **`lib/hooks/use-polls.ts`** - Polls hook not imported
- **`lib/hooks/use-socket.ts`** - Socket hook not imported

**Recommendation:** ⚠️ **Check if these are for future features or can be deleted**

---

### 7. Providers (Unused)

- **`lib/providers/theme-provider.tsx`** - Duplicate/unused theme provider
  - `components/theme-provider.tsx` is the one actually used in `app/layout.tsx`

**Recommendation:** ✅ **Safe to delete** (duplicate)

---

### 8. Services (Unused)

- **`lib/services/socket-emit.ts`** - Socket emit service not imported

**Recommendation:** ⚠️ **Check if socket functionality is still needed**

---

### 9. Stores (Unused)

- **`lib/stores/ui-store.ts`** - UI store not imported

**Recommendation:** ⚠️ **Check if this was replaced by another state management solution**

---

### 10. Mock Data (Unused)

- **`lib/data/mock-data.ts`** - Contains `mockTribeInfoData`
  - Not imported anywhere

**Recommendation:** ✅ **Safe to delete** (unless needed for testing)

---

### 11. Database Migration Files (Keep - Required for Database)

- **`lib/database/migrations/meta/0000_snapshot.json`** - Migration snapshot
- **`lib/database/migrations/meta/_journal.json`** - Migration journal
- **`lib/database/migrations/relations.ts`** - Migration relations

**Recommendation:** ⚠️ **Keep these - they're part of the database migration system**

---

### 12. Socket Server Files (Unused Routes)

These files in `socket-server/src/routes/` are not imported:

- `socket-server/src/routes/activities.ts`
- `socket-server/src/routes/location.ts`
- `socket-server/src/routes/media.ts`
- `socket-server/src/email/client.ts`
- `socket-server/src/database/types.ts`

**Note:** `socket-server/src/routes/index.ts` is empty, suggesting these routes may not be set up yet.

**Recommendation:** ⚠️ **Check if socket server functionality is still being developed or can be removed**

---

## Files Safe to Delete Immediately

These files are confirmed duplicates or unused:

1. ✅ `components/tribe-dashboard/tribe-dashboard-content.tsx` - Old duplicate
2. ✅ `lib/providers/theme-provider.tsx` - Duplicate (use `components/theme-provider.tsx`)
3. ✅ `lib/data/mock-data.ts` - Unused mock data

---

## Files to Verify Before Deleting

1. ⚠️ `components/page-header.tsx` - Check if needed
2. ⚠️ `app-pages/event-detail/event-calendar-view.tsx` - Check if planned feature
3. ⚠️ `app-pages/media/trending-section.tsx` - Check if planned feature
4. ⚠️ `app-pages/welcome/types.ts` - Check if welcome flow needs it
5. ⚠️ `lib/hooks/use-polls.ts` - Check if polls feature is active
6. ⚠️ `lib/hooks/use-socket.ts` - Check if socket functionality is used
7. ⚠️ `lib/services/socket-emit.ts` - Check if socket functionality is used
8. ⚠️ `lib/stores/ui-store.ts` - Check if replaced by another solution
9. ⚠️ All socket-server route files - Check if socket server is active

---

## Files to Keep

1. 🔒 `.mcp.json` - MCP configuration
2. 🔒 `components.json` - shadcn/ui configuration
3. 🔒 `lib/database/migrations/meta/*` - Database migration files
4. 🔒 All UI components in `components/ui/` - May be used in future

---

## Next Steps

1. Review the "Files Safe to Delete Immediately" section
2. Manually verify files in "Files to Verify Before Deleting"
3. Check git history to understand why some files exist
4. Consider creating a feature flag or TODO comment for files that are for future features
5. Remove confirmed unused files to reduce codebase size

---

## How to Use This Report

1. **For immediate cleanup:** Delete files marked with ✅
2. **For careful review:** Check files marked with ⚠️
3. **For keeping:** Files marked with 🔒 should be retained

---

*This report was generated using an improved static analysis script that handles barrel exports, dynamic imports, and Next.js patterns.*






