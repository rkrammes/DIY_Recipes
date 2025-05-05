# Simple Dev Authentication for DIY Recipes

## Overview

I've implemented a simple development authentication system that keeps you logged in as a development user and provides an edit mode toggle. This implementation is lightweight, requires no backend, and works entirely client-side.

## Features

- **Dev User Auto-Login**: In development mode, you're automatically logged in as a dev user
- **Edit Mode Toggle**: Toggle to simulate different user permissions
- **Persistence**: Authentication state and edit mode persist across page refreshes via localStorage

## How to Use

1. The dev authentication is automatically active in development mode
2. You'll see the edit mode toggle in the top navigation bar
3. Click the toggle to switch edit mode on/off
4. You can log out if needed, and log back in as the dev user

## Implementation

The implementation consists of:

1. **Context and Hooks**:
   - `devAuthContext.ts`: Defines the auth context and hook
   - `DevAuthProvider.tsx`: Provides the auth state to the app

2. **UI Components**:
   - `DevAuthStatus.tsx`: Shows the current auth status and edit mode toggle
   - `McpNavigation.tsx`: Uses the auth state to display UI elements

3. **Integration**:
   - The existing `McpAuthProvider` has been updated to use our simpler solution
   - The layout is updated to display the auth status in development mode

## Edit Mode

The `isEditMode` flag can be used throughout the app to conditionally render UI elements:

```tsx
import { useDevAuth } from '@/hooks/devAuthContext';

function MyComponent() {
  const { isEditMode } = useDevAuth();
  
  return (
    <div>
      {isEditMode && (
        <button>Edit</button>
      )}
    </div>
  );
}
```

## Why This Approach?

1. **Simplicity**: No need for complex server setup or proxy
2. **Performance**: Lightweight, client-side only implementation
3. **Developer Experience**: Automatic login and simple toggle for testing different user states
4. **Production Ready**: Automatically disabled in production builds

## Next Steps

If you need to:

1. **Customize the Dev User**: Edit the `defaultDevUser` object in `devAuthContext.ts`
2. **Add User Roles**: Extend the `DevUser` interface to include more role details
3. **Add Edit Mode Features**: Use the `isEditMode` flag in your components

The Supabase integration is still available, but this simpler approach should work well for development purposes.