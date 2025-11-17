# Auth Provider

This directory contains the auth provider that manages authentication state using React Context, providing a consistent interface for authentication across the app.

## Files

- `auth-provider.tsx` - The main auth provider component
- `query-provider.tsx` - Query provider for data fetching

## Usage

### 1. Using the Auth Provider (Recommended)

The auth provider is already set up in your root layout. You can use it in any component:

```tsx
import { useAuth } from "@/lib/providers/auth-provider"

function MyComponent() {
  const { user, isLoading, setUser, reset } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  )
}
```

### 2. Using the Enhanced Hook (Recommended for most cases)

For convenience, use the `useAuthState` hook which provides additional helper methods:

```tsx
import { useAuthState } from "@/lib/hooks/use-auth"

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    logout,
    userName,
    userEmail 
  } = useAuthState()
  
  if (isLoading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }
  
  return (
    <div>
      <p>Welcome, {userName}!</p>
      <p>Email: {userEmail}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

### 3. Direct Context Access (Advanced)

For advanced use cases, you can access the auth context directly:

```tsx
import { useAuth } from "@/lib/providers/auth-provider"

function MyComponent() {
  const { user, setUser } = useAuth()
  
  // Your component logic
}
```

## Available Methods

### State
- `user` - Current user object or null
- `isLoading` - Loading state
- `error` - Error message or null
- `isAuthenticated` - Boolean indicating if user is logged in

### Actions
- `setUser(user)` - Set the current user
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error message
- `clearError()` - Clear error message
- `reset()` - Reset all state to initial values
- `logout()` - Convenience method to reset state (enhanced hook only)

### User Helpers (Enhanced hook only)
- `userId` - User ID
- `userEmail` - User email
- `userName` - User name
- `userImage` - User avatar image

## Example Components

See `components/auth/user-profile.tsx` for a complete example of how to use the auth provider.

## Provider Setup

The auth provider is automatically set up in your root layout (`app/layout.tsx`):

```tsx
<QueryProvider>
  <AuthProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthProvider>
</QueryProvider>
```

## Initialization

You can pass initial user data to the provider if needed:

```tsx
<AuthProvider initialUser={initialUserData}>
  {children}
</AuthProvider>
```

This is useful for SSR scenarios where you have user data from the server.
