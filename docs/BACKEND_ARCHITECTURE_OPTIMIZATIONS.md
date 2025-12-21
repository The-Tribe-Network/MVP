# Backend Architecture Optimization Report

> **Generated:** 2025-12-16
> **Scope:** Codebase architecture improvements (not runtime performance)
> **Focus:** Code organization, reusability, maintainability, and consistency

---

## Executive Summary

This report identifies **architectural optimization opportunities** in the Tribe backend codebase. The analysis revealed significant code duplication, missing abstractions, and inconsistent patterns across the API routes, services, hooks, and validation layers.

**Key Findings:**
- **35+ API routes** duplicate the same authentication/authorization boilerplate
- **`validateApiRequest` helper** is copy-pasted across 6 validation files
- **3 different error handling patterns** exist across routes (inconsistent UX)
- **Query builder patterns** are duplicated in 3+ service files
- **Mutation hooks** duplicate optimistic update and invalidation logic
- **Like/unlike endpoints** use different approaches (toggle vs separate routes)

**Estimated Impact:**
- **Reduce codebase by ~500-800 lines** through deduplication
- **Improve consistency** across all API endpoints
- **Reduce bugs** by centralizing common logic
- **Faster feature development** with reusable abstractions
- **Easier testing** with extracted middleware/utilities

---

## 1. Critical Code Duplication Issues

### 1.1 Authentication & Authorization Boilerplate

**Problem:** Every API route (35+ files) repeats the same auth/membership check:

```typescript
// REPEATED IN 35+ FILES
const user = await getServerUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const isMember = await checkTribeMembership(tribeId, user.id);
if (!isMember) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Impact:**
- ~15-20 lines duplicated per route
- ~600 lines of duplicated code
- Changes to auth logic require 35+ file updates
- Risk of inconsistent behavior

**Solution:** Create API middleware/wrappers

**Priority:** 🔴 CRITICAL

**Files Affected:**
- `app/api/tribes/[tribe_id]/posts/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/comments/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/comments/[comment_id]/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/like/route.ts`
- `app/api/tribes/[tribe_id]/media/route.ts`
- `app/api/tribes/[tribe_id]/media/[media_id]/route.ts`
- `app/api/tribes/[tribe_id]/media/[media_id]/like/route.ts`
- `app/api/tribes/[tribe_id]/albums/route.ts`
- `app/api/tribes/[tribe_id]/albums/[album_id]/route.ts`
- `app/api/tribes/[tribe_id]/events/route.ts`
- `app/api/tribes/[tribe_id]/events/[event_id]/route.ts`
- `app/api/tribes/[tribe_id]/members/route.ts`
- `app/api/tribes/[tribe_id]/members/[member_id]/route.ts`
- `app/api/tribes/[tribe_id]/invitations/route.ts`
- `app/api/tribes/[tribe_id]/activities/route.ts`
- And 20+ more files...

---

### 1.2 Duplicated `validateApiRequest` Helper

**Problem:** The exact same function is copy-pasted in 6 validation files:

**Files with duplication:**
- `lib/validations/post.ts` (lines 51-65)
- `lib/validations/comment.ts` (lines 44-58)
- `lib/validations/album.ts`
- `lib/validations/tribe.ts`
- `lib/validations/profile.ts`
- `lib/validations/security.ts`

```typescript
// COPY-PASTED 6 TIMES
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  return { success: false, error: errorMessage, details: result.error };
}
```

**Impact:**
- ~15 lines × 6 files = 90 lines of duplication
- Bug fixes require 6 file updates
- Easy to miss updates

**Solution:** Move to `lib/validations/index.ts` as shared export

**Priority:** 🟡 HIGH

---

### 1.3 Duplicated Parameter Validation Schemas

**Problem:** UUID validation schema duplicated across multiple files:

```typescript
// REPEATED in post.ts, comment.ts, media.ts, album.ts, etc.
const uuidSchema = z.string().uuid("Invalid UUID format");

// Also duplicated:
export const tribeIdParamSchema = z.object({
  tribe_id: z.string().uuid("Invalid tribe ID"),
});

export const postIdParamSchema = z.object({
  post_id: z.string().uuid("Invalid post ID"),
});
```

**Solution:** Create shared param validation schemas in `lib/validations/params.ts`

**Priority:** 🟡 HIGH

---

### 1.4 "Get with Metadata" Query Pattern Duplication

**Problem:** The same query pattern is duplicated in multiple services:

**Pattern:** Fetch base data → Get IDs → Batch fetch stats → Merge results

**Repeated in:**
- `lib/services/post.ts` - `getTribePosts()` (lines 135-253)
- `lib/services/post.ts` - `getPostByIdWithMetadata()` (lines 289-408)
- `lib/services/comment.ts` - `getPostComments()` (lines 77-153)
- `lib/services/media.ts` - `getMediaByTribe()` (lines 105-215)
- `lib/services/media.ts` - `getAllTribeMedia()` (lines 218-328)

**Code Sample from post.ts:**
```typescript
// 1. Fetch posts with joins
const posts = await db.select(...).from(post).innerJoin(user, ...).where(...);

// 2. Extract IDs
const postIds = posts.map(p => p.id);

// 3. Batch fetch like counts
const likeCounts = await db
  .select({ postId: postLike.postId, count: sql<number>`count(*)::int` })
  .from(postLike)
  .where(inArray(postLike.postId, postIds))
  .groupBy(postLike.postId);

// 4. Batch fetch comment counts
const commentCounts = await db
  .select({ postId: comment.postId, count: sql<number>`count(*)::int` })
  .from(comment)
  .where(inArray(comment.postId, postIds))
  .groupBy(comment.postId);

// 5. Batch check user likes
const userLikes = userId ? await db.select(...) : [];

// 6. Merge into result
const likeCountMap = new Map(likeCounts.map(...));
const commentCountMap = new Map(commentCounts.map(...));
const userLikesSet = new Set(userLikes.map(...));

return posts.map(post => ({
  ...post,
  likeCount: likeCountMap.get(post.id) || 0,
  commentCount: commentCountMap.get(post.id) || 0,
  isLikedByUser: userLikesSet.has(post.id),
}));
```

**Impact:**
- ~100-120 lines duplicated per service
- ~400-500 total lines of duplicated code
- Changes to optimization strategy require multiple updates

**Solution:** Create generic query builder in `lib/services/query-builders.ts`

**Priority:** 🟡 HIGH

---

### 1.5 Permission Check Pattern Duplication

**Problem:** Similar permission check patterns in multiple services:

```typescript
// PATTERN REPEATED in post.ts, comment.ts, media.ts, album.ts
async function canUser[Action](tribeId: string, userId: string): Promise<boolean> {
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) return false;

  // Check permission override
  if (memberData.permissions?.can[Action] === false) return false;
  if (memberData.permissions?.can[Action] === true) return true;

  // Check role-based default
  return ["owner", "admin", "moderator"].includes(memberData.member.role);
}
```

**Files with pattern:**
- `lib/services/post.ts` - `canUserPost()`, `canUserModeratePosts()`
- `lib/services/comment.ts` - `canUserModerateComments()`
- `lib/services/media.ts` - Permission checks inline (not extracted to function)
- `lib/services/album.ts` - Permission checks inline

**Solution:** Create generic permission checker factory

**Priority:** 🟡 HIGH

---

## 2. Inconsistent Patterns

### 2.1 Inconsistent Like/Unlike Endpoint Design

**Problem:** Posts/Comments use toggle pattern, Media uses separate endpoints

**Posts & Comments:**
```typescript
// POST /api/tribes/[tribe_id]/posts/[post_id]/like
// Returns: { isLiked: boolean }
// Single endpoint that toggles like state
```

**Media:**
```typescript
// POST /api/tribes/[tribe_id]/media/[media_id]/like   (add like)
// DELETE /api/tribes/[tribe_id]/media/[media_id]/like (remove like)
// GET /api/tribes/[tribe_id]/media/[media_id]/like    (check if liked)
// Three separate endpoints
```

**Impact:**
- Inconsistent API design
- Inconsistent client-side implementation
- Media requires 3 endpoints vs 1 for posts

**Recommendation:** Standardize all like/unlike to use toggle pattern

**Priority:** 🟢 MEDIUM

**Files to update:**
- `app/api/tribes/[tribe_id]/media/[media_id]/like/route.ts`
- `lib/services/media.ts` - `likeMedia()`, `unlikeMedia()` → `toggleMediaLike()`
- `lib/hooks/use-media.ts` - Update mutation hooks

---

### 2.2 Inconsistent Error Handling Patterns

**Problem:** Three different error handling approaches across routes

**Pattern A - Detailed (in post routes):**
```typescript
if (error instanceof Error) {
  if (error.message.includes("permission") || error.message.includes("not found")) {
    const status = error.message.includes("not found") ? 404 : 403;
    return NextResponse.json({ error: error.message }, { status });
  }
}
return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
```

**Pattern B - Specific (in media routes):**
```typescript
if (error instanceof Error) {
  if (error.message === 'Media already liked') {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
return NextResponse.json({ error: "Failed to like media" }, { status: 500 });
```

**Pattern C - Generic only (in some routes):**
```typescript
return NextResponse.json({ error: "Failed to..." }, { status: 500 });
```

**Impact:**
- Inconsistent error responses to client
- Some routes return helpful errors, others don't
- Difficult to debug issues

**Recommendation:** Create standardized error response builder

**Priority:** 🟡 HIGH

---

### 2.3 Inconsistent Optimistic Update Implementation

**Problem:** Posts/Comments have optimistic updates, Media doesn't

**Posts (`lib/hooks/use-posts.ts`):**
```typescript
export function useLikePost() {
  return useMutation({
    onMutate: async (variables) => {
      await queryClient.cancelQueries(...);
      const previousPosts = queryClient.getQueryData(...);

      // Optimistic update
      queryClient.setQueryData(..., (old) => {
        return old.map(post =>
          post.id === variables.postId
            ? { ...post, isLikedByUser: !post.isLikedByUser }
            : post
        );
      });

      return { previousPosts }; // For rollback
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(..., context.previousPosts);
      }
    },
  });
}
```

**Media (`lib/hooks/use-media.ts`):**
```typescript
export function useLikeMedia() {
  return useMutation({
    // NO onMutate - no optimistic updates
    onSuccess: () => {
      queryClient.invalidateQueries(...);
    },
  });
}
```

**Impact:**
- Inconsistent UX (posts feel faster than media)
- Media interactions feel sluggish
- Different developer experience

**Recommendation:** Add optimistic updates to media hooks OR create shared mutation factory

**Priority:** 🟢 MEDIUM

---

### 2.4 Inconsistent Ownership Check Patterns

**Problem:** Different approaches to checking content ownership across services

**Posts (`lib/services/post.ts`):**
```typescript
const existingPost = await getPostById(postId);
const isAuthor = existingPost.authorId === userId;
const canModerate = await canUserModeratePosts(existingPost.tribeId, userId);

if (!isAuthor && !canModerate) {
  throw new Error("User does not have permission to update this post");
}
```

**Comments (`lib/services/comment.ts`):**
```typescript
// Gets tribeId in same query as comment (optimized)
const [existingComment] = await db
  .select({
    ...comment,
    post: { tribeId: post.tribeId },
  })
  .from(comment)
  .innerJoin(post, eq(comment.postId, post.id))
  .where(eq(comment.id, commentId))
  .limit(1);

const isAuthor = existingComment.userId === userId;
const canModerate = await canUserModerateComments(existingComment.post.tribeId, userId);
```

**Media (`lib/services/media.ts`):**
```typescript
// Only checks uploader, no moderation check
if (mediaRecord[0].uploadedBy !== userId) {
  throw new Error("User does not have permission to delete this media");
}
// TODO: Add check for admin/mod permissions
```

**Impact:**
- Media can't be deleted by moderators (TODO comment indicates missing feature)
- Inconsistent permission model
- Posts/Comments allow mod deletion, Media doesn't

**Recommendation:** Standardize to allow author OR moderator for all content types

**Priority:** 🟡 HIGH (also a feature gap for Media)

---

## 3. Missing Abstractions

### 3.1 No API Route Middleware/Wrappers

**Problem:** No reusable middleware for common API concerns

**Current State:** Every route manually implements:
- Authentication check
- Tribe membership check
- Parameter validation
- Error handling
- Response formatting

**Recommendation:** Create middleware wrappers

**Proposed Structure:**
```
lib/api/
├── middleware/
│   ├── with-auth.ts           # Authentication middleware
│   ├── with-tribe-access.ts   # Tribe membership check
│   ├── with-validation.ts     # Schema validation
│   └── index.ts
├── response-helpers.ts        # Standardized responses
└── types.ts                   # API handler types
```

**Priority:** 🔴 CRITICAL

---

### 3.2 No Generic Permission Checker Factory

**Problem:** Permission check logic duplicated across services

**Current:** Each service has its own `canUser[Action]()` functions

**Recommendation:** Create permission checker factory

**Proposed API:**
```typescript
// lib/services/permissions.ts

export function createPermissionChecker(permissionKey: keyof TribeMemberPermission) {
  return async (tribeId: string, userId: string, options?: {
    allowedRoles?: TribeRole[];
    requireExplicit?: boolean;
  }): Promise<boolean> => {
    const memberData = await getMemberWithPermissions(tribeId, userId);
    if (!memberData) return false;

    // Check explicit permission override
    if (memberData.permissions?.[permissionKey] === false) return false;
    if (memberData.permissions?.[permissionKey] === true) return true;

    // Check role-based default
    const defaultRoles = options?.allowedRoles || ["owner", "admin", "moderator"];
    return defaultRoles.includes(memberData.member.role);
  };
}

// Usage in services:
const canPost = createPermissionChecker("canPost");
const canModerate = createPermissionChecker("canModeratePosts");
```

**Priority:** 🟡 HIGH

---

### 3.3 No Shared Query Builder for "Base + Stats" Pattern

**Problem:** Complex query pattern duplicated in 5+ service functions

**Recommendation:** Create generic query builder utility

**Proposed API:**
```typescript
// lib/services/query-builders.ts

type StatsConfig = {
  likeCount?: { table: any; foreignKey: string };
  commentCount?: { table: any; foreignKey: string };
  userLikes?: { table: any; foreignKey: string };
  // Extensible for other stats
};

async function fetchWithStats<T>(
  baseQuery: Promise<T[]>,
  config: StatsConfig,
  userId?: string
): Promise<T[]> {
  // Generic implementation of the duplicated pattern
}

// Usage in post.ts:
const posts = await fetchWithStats(
  db.select(...).from(post)...,
  {
    likeCount: { table: postLike, foreignKey: "postId" },
    commentCount: { table: comment, foreignKey: "postId" },
    userLikes: { table: postLike, foreignKey: "postId" },
  },
  userId
);
```

**Priority:** 🟡 HIGH

---

### 3.4 No Shared Mutation Hook Utilities

**Problem:** Optimistic update logic duplicated across hooks

**Recommendation:** Create mutation hook factory/utilities

**Proposed Structure:**
```
lib/hooks/
├── factories/
│   ├── create-like-mutation.ts    # Generic like/unlike factory
│   ├── create-crud-mutations.ts   # Generic CRUD factory
│   └── index.ts
└── utils/
    ├── optimistic-updates.ts      # Reusable optimistic update logic
    └── query-invalidation.ts      # Standard invalidation patterns
```

**Priority:** 🟢 MEDIUM

---

### 3.5 No Centralized Error Response Formatter

**Problem:** Error responses inconsistently formatted

**Recommendation:** Create error response builder

**Proposed API:**
```typescript
// lib/api/response-helpers.ts

export function errorResponse(
  error: unknown,
  context?: string
): NextResponse {
  // Centralized error handling logic
  // - Parse error type
  // - Determine status code
  // - Format error message
  // - Include details in dev mode
}

// Usage:
try {
  // ...
} catch (error) {
  return errorResponse(error, "creating post");
}
```

**Priority:** 🟡 HIGH

---

## 4. Organizational Improvements

### 4.1 Create API Utilities Directory

**Recommendation:** Create `lib/api/` directory structure

**Proposed Structure:**
```
lib/api/
├── middleware/
│   ├── with-auth.ts              # requireUser() wrapper
│   ├── with-tribe-access.ts      # requireTribeMember() wrapper
│   ├── with-validation.ts        # Schema validation wrapper
│   ├── with-permissions.ts       # Permission check wrapper
│   └── index.ts
├── response-helpers.ts           # Standardized responses
├── error-handlers.ts             # Error mapping/formatting
├── types.ts                      # API handler type definitions
└── index.ts
```

**Benefits:**
- Clear separation of API-specific utilities
- Easy to find and reuse common patterns
- Better code organization

**Priority:** 🔴 CRITICAL (foundation for other improvements)

---

### 4.2 Centralize Validation Utilities

**Recommendation:** Consolidate validation helpers

**Current State:**
- `validateApiRequest()` duplicated 6 times
- UUID schemas duplicated across files

**Proposed:**
```
lib/validations/
├── index.ts                      # Export validateApiRequest, shared schemas
├── params.ts                     # Shared param schemas (tribeId, postId, etc.)
├── post.ts
├── comment.ts
├── media.ts
├── album.ts
├── tribe.ts
├── event.ts
└── auth.ts
```

**Changes:**
- Move `validateApiRequest` to `index.ts`
- Create `params.ts` with shared UUID schemas
- Remove duplicated code from individual files

**Priority:** 🟡 HIGH

---

### 4.3 Standardize Service Function Naming

**Current State:** Mostly consistent, but some variations

**Recommendation:** Enforce naming conventions:
- `get[Resource]()` - Fetch single resource
- `get[Resources]()` - Fetch multiple resources
- `create[Resource]()` - Create new resource
- `update[Resource]()` - Update resource
- `delete[Resource]()` - Delete resource
- `toggle[Resource][Action]()` - Toggle state (like/unlike, follow/unfollow)
- `can[User][Action]()` - Permission checks (private functions)

**Priority:** 🟢 LOW (mostly already followed)

---

## 5. Actionable Optimization Plan

### Phase 1: Foundation (Highest ROI)

**Goal:** Eliminate critical duplication, establish patterns

1. **Create API middleware directory** (`lib/api/`)
   - `with-auth.ts` - Authentication wrapper
   - `with-tribe-access.ts` - Tribe membership wrapper
   - `with-validation.ts` - Validation wrapper
   - `response-helpers.ts` - Error/success response builders
   - **Estimated reduction:** ~600 lines
   - **Files to create:** 4-5 new files
   - **Files to update:** 35+ API routes

2. **Centralize validation utilities**
   - Move `validateApiRequest` to `lib/validations/index.ts`
   - Create `lib/validations/params.ts` for shared param schemas
   - **Estimated reduction:** ~150 lines
   - **Files to create:** 1
   - **Files to update:** 6 validation files + all API routes using params

3. **Standardize error handling**
   - Create `lib/api/error-handlers.ts`
   - Update all routes to use standard error responses
   - **Estimated reduction:** ~200 lines
   - **Files to update:** 35+ API routes

**Phase 1 Total Impact:**
- **Lines removed:** ~950
- **New files:** 6
- **Updated files:** 40+
- **Estimated effort:** 2-3 days

---

### Phase 2: Service Layer (Medium ROI)

**Goal:** Reduce service duplication, improve maintainability

4. **Create permission checker factory**
   - Add to `lib/services/permissions.ts`
   - Refactor `canUserPost()`, `canUserModerate()`, etc.
   - **Estimated reduction:** ~100 lines
   - **Files to update:** 4 service files

5. **Create query builder utilities**
   - Create `lib/services/query-builders.ts`
   - Refactor `getTribePosts()`, `getPostComments()`, `getMediaByTribe()`
   - **Estimated reduction:** ~400 lines
   - **Files to update:** 3 service files

6. **Standardize ownership checks**
   - Add moderation check to media operations
   - Ensure consistent pattern across post/comment/media
   - **Estimated reduction:** ~50 lines
   - **Files to update:** 1 service file (media.ts)

**Phase 2 Total Impact:**
- **Lines removed:** ~550
- **New files:** 1
- **Updated files:** 8
- **Estimated effort:** 2-3 days

---

### Phase 3: Client Layer (Lower ROI, UX benefit)

**Goal:** Improve consistency, reduce hook duplication

7. **Standardize like/unlike endpoints**
   - Refactor media like/unlike to use toggle pattern
   - Update hooks to match post/comment pattern
   - **Estimated reduction:** ~50 lines
   - **Files to update:** 2 (API route + hook)

8. **Add optimistic updates to media hooks**
   - Add `onMutate` to media like/delete operations
   - Match pattern from post/comment hooks
   - **Estimated reduction:** 0 (adds code, improves UX)
   - **Files to update:** 1 (use-media.ts)

9. **Create mutation hook utilities** (optional)
   - Create `lib/hooks/factories/` for reusable patterns
   - Refactor like mutations to use factory
   - **Estimated reduction:** ~100 lines
   - **Files to update:** 3-4 hook files

**Phase 3 Total Impact:**
- **Lines removed:** ~150
- **New files:** 1-2 (if factories created)
- **Updated files:** 6
- **Estimated effort:** 1-2 days

---

### Total Estimated Impact

**Code Reduction:**
- Phase 1: ~950 lines
- Phase 2: ~550 lines
- Phase 3: ~150 lines
- **Total: ~1,650 lines removed** (from current ~15,000 line backend)

**New Infrastructure:**
- 8-10 new utility/helper files
- Clear patterns for future development
- Improved testability

**Development Speed:**
- New API routes: 50% faster (use middleware)
- New services: 30% faster (use query builders)
- Bug fixes: Centralized, affect all routes

---

## 6. Implementation Guidelines

### For Phase 1 (API Middleware)

**Step-by-step approach:**

1. Create `lib/api/middleware/with-auth.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import type { User } from "@/lib/database/schemas/auth";

type AuthenticatedHandler<T = any> = (
  request: NextRequest,
  context: { params: Promise<T>; user: User }
) => Promise<NextResponse>;

export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return handler(request, { ...context, user });
  };
}
```

2. Create `lib/api/middleware/with-tribe-access.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import type { User } from "@/lib/database/schemas/auth";
import type { TribeMemberWithPermissions } from "@/lib/database/types";

type TribeAccessHandler<T = any> = (
  request: NextRequest,
  context: {
    params: Promise<T>;
    user: User;
    memberData: TribeMemberWithPermissions;
  }
) => Promise<NextResponse>;

export function withTribeAccess<T extends { tribe_id: string }>(
  handler: TribeAccessHandler<T>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<T>; user: User }
  ): Promise<NextResponse> => {
    const params = await context.params;
    const memberData = await getMemberWithPermissions(params.tribe_id, context.user.id);

    if (!memberData) {
      return NextResponse.json(
        { error: "You must be a member of this tribe" },
        { status: 403 }
      );
    }

    return handler(request, { ...context, params: Promise.resolve(params), memberData });
  };
}
```

3. Compose middleware:
```typescript
// lib/api/middleware/index.ts
import { withAuth } from "./with-auth";
import { withTribeAccess } from "./with-tribe-access";

// Convenience composer
export function withTribeMember<T extends { tribe_id: string }>(
  handler: /* ... */
) {
  return withAuth(withTribeAccess(handler));
}

export { withAuth, withTribeAccess };
```

4. Update API routes to use middleware:
```typescript
// BEFORE (app/api/tribes/[tribe_id]/posts/route.ts)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tribe_id } = await params;
  const isMember = await checkTribeMembership(tribe_id, user.id);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Actual logic...
}

// AFTER
import { withTribeMember } from "@/lib/api/middleware";

export const GET = withTribeMember<{ tribe_id: string }>(
  async (request, { params, user, memberData }) => {
    const { tribe_id } = await params;

    // Actual logic (user and memberData already available)
  }
);
```

---

### For Phase 2 (Query Builders)

**Generic stats fetcher:**

```typescript
// lib/services/query-builders.ts
import { db } from "@/lib/database/client";
import { sql, inArray } from "drizzle-orm";

type EntityWithId = { id: string };

type StatsConfig = {
  likeCount?: {
    table: any;
    foreignKey: string;
  };
  commentCount?: {
    table: any;
    foreignKey: string;
  };
  userLikes?: {
    table: any;
    foreignKey: string;
  };
};

export async function enrichWithStats<T extends EntityWithId>(
  entities: T[],
  config: StatsConfig,
  userId?: string
): Promise<(T & { likeCount?: number; commentCount?: number; isLikedByUser?: boolean })[]> {
  if (entities.length === 0) return [];

  const ids = entities.map(e => e.id);

  // Fetch like counts
  const likeCounts = config.likeCount
    ? await db
        .select({
          id: config.likeCount.table[config.likeCount.foreignKey],
          count: sql<number>`count(*)::int`,
        })
        .from(config.likeCount.table)
        .where(inArray(config.likeCount.table[config.likeCount.foreignKey], ids))
        .groupBy(config.likeCount.table[config.likeCount.foreignKey])
    : [];

  // Fetch comment counts
  const commentCounts = config.commentCount
    ? await db
        .select({
          id: config.commentCount.table[config.commentCount.foreignKey],
          count: sql<number>`count(*)::int`,
        })
        .from(config.commentCount.table)
        .where(inArray(config.commentCount.table[config.commentCount.foreignKey], ids))
        .groupBy(config.commentCount.table[config.commentCount.foreignKey])
    : [];

  // Fetch user likes
  const userLikes = config.userLikes && userId
    ? await db
        .select({ id: config.userLikes.table[config.userLikes.foreignKey] })
        .from(config.userLikes.table)
        .where(
          and(
            inArray(config.userLikes.table[config.userLikes.foreignKey], ids),
            eq(config.userLikes.table.userId, userId)
          )
        )
    : [];

  // Create maps
  const likeCountMap = new Map(likeCounts.map(lc => [lc.id, lc.count]));
  const commentCountMap = new Map(commentCounts.map(cc => [cc.id, cc.count]));
  const userLikesSet = new Set(userLikes.map(ul => ul.id));

  // Merge
  return entities.map(entity => ({
    ...entity,
    ...(config.likeCount && { likeCount: likeCountMap.get(entity.id) || 0 }),
    ...(config.commentCount && { commentCount: commentCountMap.get(entity.id) || 0 }),
    ...(config.userLikes && { isLikedByUser: userLikesSet.has(entity.id) }),
  }));
}
```

**Usage in post.ts:**
```typescript
import { enrichWithStats } from "./query-builders";
import { postLike, comment } from "@/lib/database/schemas";

// BEFORE: 100+ lines of manual query building

// AFTER:
export async function getTribePosts(tribeId: string, userId?: string) {
  // 1. Fetch base posts with author
  const posts = await db
    .select({
      id: post.id,
      // ... other fields
      author: user,
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.tribeId, tribeId));

  // 2. Enrich with stats (single call instead of 100 lines)
  return enrichWithStats(
    posts,
    {
      likeCount: { table: postLike, foreignKey: "postId" },
      commentCount: { table: comment, foreignKey: "postId" },
      userLikes: { table: postLike, foreignKey: "postId" },
    },
    userId
  );
}
```

---

## 7. Testing Strategy

### Unit Tests for New Utilities

1. **Middleware tests** (`lib/api/middleware/__tests__/`)
   - Test authentication rejection
   - Test tribe membership rejection
   - Test successful passthrough
   - Test context propagation

2. **Query builder tests** (`lib/services/__tests__/query-builders.test.ts`)
   - Test stats enrichment with various configs
   - Test empty entity lists
   - Test missing userId (should skip user-specific stats)

3. **Permission checker tests** (`lib/services/__tests__/permissions.test.ts`)
   - Test explicit permission overrides
   - Test role-based defaults
   - Test non-member rejection

### Integration Tests

- Update existing API route tests to work with middleware
- Ensure all routes still function correctly
- Verify error responses are consistent

---

## 8. Migration Checklist

### Pre-Migration

- [ ] Review this document with team
- [ ] Prioritize phases based on current sprint goals
- [ ] Set up feature branch for refactoring
- [ ] Ensure all existing tests pass

### Phase 1 Migration

- [ ] Create `lib/api/` directory structure
- [ ] Implement `with-auth.ts`
- [ ] Implement `with-tribe-access.ts`
- [ ] Implement `response-helpers.ts`
- [ ] Write unit tests for middleware
- [ ] Update 5-10 API routes as proof-of-concept
- [ ] Review and iterate on API
- [ ] Update remaining API routes
- [ ] Centralize validation utilities
- [ ] Update all validation imports

### Phase 2 Migration

- [ ] Implement permission checker factory
- [ ] Refactor service permission checks
- [ ] Implement query builder utilities
- [ ] Refactor `getTribePosts()`
- [ ] Refactor `getPostComments()`
- [ ] Refactor media query functions
- [ ] Add moderation checks to media operations
- [ ] Write tests for new utilities

### Phase 3 Migration

- [ ] Standardize media like/unlike to toggle
- [ ] Add optimistic updates to media hooks
- [ ] (Optional) Create mutation hook factories
- [ ] Update all mutation hooks
- [ ] Test UX improvements

### Post-Migration

- [ ] Update CLAUDE.md with new patterns
- [ ] Document middleware usage
- [ ] Document query builder usage
- [ ] Create examples for future development
- [ ] Celebrate reduced codebase size!

---

## 9. Long-Term Maintenance

### Enforce Patterns in Code Review

**New API Routes:**
- ✅ Must use `withAuth()` or `withTribeMember()` middleware
- ✅ Must use validation schemas from `lib/validations/`
- ✅ Must use standardized error responses
- ✅ Must delegate business logic to services

**New Service Functions:**
- ✅ Should use `enrichWithStats()` for entity + metadata queries
- ✅ Should use permission checker factory for permissions
- ✅ Should create activities for important actions
- ✅ Should throw descriptive errors (not return null/undefined)

**New Hooks:**
- ✅ Must use query keys from `lib/constants/query-keys.ts`
- ✅ Should implement optimistic updates for mutations
- ✅ Should invalidate related queries on success
- ✅ Should handle errors gracefully

### Update Documentation

- [ ] Add middleware usage examples to CLAUDE.md
- [ ] Add query builder examples to PERFORMANCE_OPTIMIZATIONS.md
- [ ] Create CONTRIBUTING.md with code patterns
- [ ] Update PRD with standardized API patterns

---

## Appendix A: File Reference

### Files with Critical Duplication

**Authentication/Authorization boilerplate (35+ files):**
- `app/api/tribes/[tribe_id]/posts/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/comments/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/comments/[comment_id]/route.ts`
- `app/api/tribes/[tribe_id]/posts/[post_id]/like/route.ts`
- `app/api/tribes/[tribe_id]/media/route.ts`
- `app/api/tribes/[tribe_id]/media/[media_id]/route.ts`
- `app/api/tribes/[tribe_id]/media/[media_id]/like/route.ts`
- `app/api/tribes/[tribe_id]/albums/route.ts`
- `app/api/tribes/[tribe_id]/albums/[album_id]/route.ts`
- `app/api/tribes/[tribe_id]/albums/[album_id]/media/route.ts`
- `app/api/tribes/[tribe_id]/events/route.ts`
- `app/api/tribes/[tribe_id]/events/[event_id]/route.ts`
- `app/api/tribes/[tribe_id]/events/[event_id]/attend/route.ts`
- `app/api/tribes/[tribe_id]/members/route.ts`
- `app/api/tribes/[tribe_id]/members/[member_id]/route.ts`
- `app/api/tribes/[tribe_id]/invitations/route.ts`
- `app/api/tribes/[tribe_id]/invitations/[invitation_id]/route.ts`
- `app/api/tribes/[tribe_id]/activities/route.ts`
- `app/api/tribes/[tribe_id]/route.ts`
- And 15+ more...

**validateApiRequest duplication (6 files):**
- `lib/validations/post.ts` (lines 51-65)
- `lib/validations/comment.ts` (lines 44-58)
- `lib/validations/album.ts`
- `lib/validations/tribe.ts`
- `lib/validations/profile.ts`
- `lib/validations/security.ts`

**Query pattern duplication (5 functions):**
- `lib/services/post.ts` - `getTribePosts()` (lines 135-253)
- `lib/services/post.ts` - `getPostByIdWithMetadata()` (lines 289-408)
- `lib/services/comment.ts` - `getPostComments()` (lines 77-153)
- `lib/services/media.ts` - `getMediaByTribe()` (lines 105-215)
- `lib/services/media.ts` - `getAllTribeMedia()` (lines 218-328)

---

## Appendix B: Estimated LOC Impact

| Optimization | Lines Removed | New Lines Added | Net Reduction | Priority |
|-------------|---------------|-----------------|---------------|----------|
| API Middleware | ~600 | ~150 | ~450 | Critical |
| Centralized Validation | ~150 | ~30 | ~120 | High |
| Error Handling | ~200 | ~50 | ~150 | High |
| Permission Factory | ~100 | ~40 | ~60 | High |
| Query Builders | ~400 | ~80 | ~320 | High |
| Ownership Checks | ~50 | ~20 | ~30 | High |
| Like/Unlike Standardization | ~50 | ~30 | ~20 | Medium |
| Mutation Factories | ~100 | ~60 | ~40 | Medium |
| **TOTAL** | **~1,650** | **~460** | **~1,190** | - |

**Note:** These are conservative estimates. Actual reduction may be higher when accounting for improved readability and reduced complexity.

---

## Conclusion

This backend codebase is **well-architected at a high level** (good separation of concerns, clear patterns), but suffers from **implementation-level duplication** that makes it harder to maintain and evolve.

The optimizations outlined in this document will:
- ✅ **Reduce codebase by ~1,200 lines** (8% reduction)
- ✅ **Eliminate critical duplication** in 40+ files
- ✅ **Standardize patterns** across all API routes
- ✅ **Improve developer velocity** for new features
- ✅ **Reduce bug surface area** through centralization
- ✅ **Enhance testability** with isolated utilities

**Recommended Approach:** Implement Phase 1 immediately (API middleware), then Phase 2 (service utilities). Phase 3 can be done incrementally as UX improvements.

---

**Generated by:** Claude Code Backend Analysis Agent
**Date:** 2025-12-16
**Codebase Version:** `b0aa743` (main branch)
