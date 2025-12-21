# Type System Improvements

## Problem

The previous type system manually defined properties in extended types instead of properly composing them. This caused several issues:

1. **No TypeScript alerts on schema changes**: If you modified the `user` table, TypeScript wouldn't alert you where those changes affected extended types
2. **Manual maintenance**: You had to manually update hardcoded property definitions across multiple types
3. **Type inconsistency**: Risk of types drifting out of sync with the actual database schema

### Example of the Problem

**Before** (hardcoded properties):
```typescript
export type CommentWithStats = Comment & {
  author: {
    name: string;
    username: string;
    avatar: string;  // ❌ If you add/remove fields from user table, TS won't catch this
  };
  likeCount: number;
  isLiked: boolean;
};
```

If you added a `displayName` field to the `user` table, TypeScript would NOT alert you that `CommentWithStats.author` should include it.

## Solution

The improved type system uses **proper type composition and inheritance**:

### 1. Utility Types for Partial User Objects

```typescript
// Utility types to pick specific user fields
export type UserPreview = Pick<User, 'id' | 'name' | 'image'>;
export type UserWithUsername = Pick<User, 'id' | 'name' | 'username' | 'image'>;
export type UserBasic = Pick<User, 'id' | 'name' | 'email' | 'image' | 'username'>;
```

**Benefits**:
- ✅ If you change the `user` table schema, TypeScript will alert you if the picked fields no longer exist
- ✅ No manual property definitions
- ✅ Single source of truth

### 2. Progressive Type Composition

Instead of redefining properties, extend base types progressively:

**After** (proper composition):
```typescript
// Base extended type
export type CommentWithAuthor = Comment & {
  author: User;  // ✅ Extends the full User type from schema
};

// Build on top of it
export type CommentWithStats = CommentWithAuthor & {
  likeCount: number;
  isLiked: boolean;
};
```

**Benefits**:
- ✅ TypeScript will catch any schema changes to `Comment` or `User`
- ✅ Types automatically inherit new fields when you update the schema
- ✅ Clear inheritance hierarchy

### 3. Named Intermediate Types

Create named types for reusable compositions:

```typescript
// Named type for event attendee with user
export type EventAttendeeWithUser = EventAttendee & {
  user: User;
};

// Use it in other types
export type EventWithAttendees = EventWithCreator & {
  attendees: EventAttendeeWithUser[];  // ✅ Reusable, type-safe
};
```

## Real-World Examples

### Before: Hardcoded Properties ❌

```typescript
export type MediaWithAlbumInfo = Media & {
  uploader: {
    id: string;
    name: string | null;
    image: string | null;
  };  // ❌ Manually defined, won't catch schema changes
  likeCount: number;
};
```

### After: Proper Composition ✅

```typescript
export type MediaWithAlbumInfo = Media & {
  uploader: UserPreview;  // ✅ Uses Pick<User, 'id' | 'name' | 'image'>
  likeCount: number;
};
```

### Progressive Type Building

```typescript
// Level 1: Base with creator
export type EventWithCreator = Event & {
  creator: User;
  tribe: Tribe;
};

// Level 2: Add attendees
export type EventWithAttendees = EventWithCreator & {
  attendees: EventAttendeeWithUser[];
};

// Level 3: Add computed fields
export type EventWithDetails = EventWithAttendees & {
  attendeeCount: number;
  isUserAttending?: boolean;
};

// Level 4: Add more details
export type EventWithAttendance = EventWithDetails & {
  isAttending: boolean;
};
```

**Benefits**:
- Clear type hierarchy
- Each level builds on the previous
- Changes to base types automatically propagate
- Easy to understand relationships

## How This Helps You

### Scenario 1: Adding a Field to User Table

**Add a `phoneNumber` field to the user schema**:

```typescript
export const user = pgTable("user", {
  // ... existing fields
  phoneNumber: text("phone_number"),  // New field
});
```

**Before**: You'd have to manually find and update every place that hardcoded user properties.

**After**: TypeScript automatically includes `phoneNumber` in:
- All `User` types
- All types that extend `User` (like `PostWithAuthor`, `CommentWithAuthor`, etc.)
- All `UserPreview`, `UserWithUsername`, `UserBasic` types (if you add it to the Pick)

### Scenario 2: Renaming a Field

**Rename `image` to `avatarUrl` in user schema**:

**Before**: TypeScript wouldn't catch the hardcoded `image: string | null` in your extended types.

**After**: TypeScript will show errors everywhere `image` is used, forcing you to update to `avatarUrl`.

### Scenario 3: Changing Field Nullability

**Make `name` non-nullable in user schema**:

```typescript
name: text("name").notNull(),  // Changed from nullable
```

**Before**: Hardcoded `name: string | null` would be out of sync.

**After**: TypeScript automatically updates `name: string` everywhere.

## Migration Checklist

If you have any remaining hardcoded types, migrate them:

1. ✅ Replace hardcoded user objects with `User`, `UserPreview`, `UserWithUsername`, or `UserBasic`
2. ✅ Use progressive composition (`PostWithAuthor` extends `Post`, then `PostWithStats` extends `PostWithAuthor`)
3. ✅ Create named intermediate types for reusable compositions
4. ✅ Avoid duplicating property definitions - always extend base types

## Best Practices

### ✅ DO

```typescript
// Use utility types for partial user data
export type MediaWithStats = Media & {
  uploader?: UserPreview;
};

// Build types progressively
export type PostWithAuthor = Post & { author: User };
export type PostWithStats = PostWithAuthor & { likeCount: number };

// Create named intermediate types
export type EventAttendeeWithUser = EventAttendee & { user: User };
```

### ❌ DON'T

```typescript
// Don't hardcode properties
export type MediaWithStats = Media & {
  uploader?: {
    id: string;
    name: string | null;  // ❌ Hardcoded
  };
};

// Don't skip intermediate types
export type PostWithStats = Post & {
  author: User;
  likeCount: number;  // ❌ Mixing concerns
};

// Don't duplicate definitions
export type EventWithDetails = Event & {
  creator: User;
  tribe: Tribe;
  attendees: (EventAttendee & { user: User })[]; // ❌ Should be EventAttendeeWithUser
};
```

## Result

Your type system now:
- ✅ Automatically reflects database schema changes
- ✅ Catches type errors at compile time
- ✅ Requires minimal manual maintenance
- ✅ Provides clear type inheritance hierarchy
- ✅ Self-documents type relationships
