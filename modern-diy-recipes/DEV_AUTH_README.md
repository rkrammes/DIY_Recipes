# Dev Authentication for DIY Recipes

This document explains the simplified development authentication setup for DIY Recipes.

## Overview

During development, you'll often want to stay logged in with a development account and toggle edit mode to test different user permissions. This simplified authentication system does exactly that without any external dependencies.

## Features

1. **Automatic Dev Login**: In development mode, you'll be automatically logged in as a dev user with admin privileges.
2. **Edit Mode Toggle**: Toggle edit mode on/off to simulate different user permissions.
3. **Persistent State**: Both authentication state and edit mode are stored in localStorage, so they persist across page refreshes.

## How It Works

The authentication system uses a simple React context provider (`DevAuthProvider`) that:

1. Automatically logs in as a dev user in development mode
2. Stores the authentication state in localStorage
3. Provides an edit mode toggle that also persists in localStorage

## Usage

### 1. Display Authentication Status

The authentication status component is automatically included in the navigation bar. It shows:

- Current logged-in user
- Edit mode toggle
- Sign out button

### 2. Check Authentication in Components

Use the `useDevAuth` hook in your components:

```tsx
import { useDevAuth } from '@/hooks/useDevAuth';

function MyComponent() {
  const { user, isAuthenticated, isEditMode } = useDevAuth();
  
  // Example: Only show edit buttons in edit mode
  return (
    <div>
      <h1>My Component</h1>
      {isAuthenticated && (
        <p>Welcome, {user?.email}!</p>
      )}
      
      {isEditMode && (
        <button>Edit</button>
      )}
    </div>
  );
}
```

### 3. Available Auth Methods

The `useDevAuth` hook provides several methods:

```tsx
const { 
  user,              // The current user (null if not authenticated)
  isAuthenticated,   // Boolean indicating if a user is logged in
  isEditMode,        // Boolean indicating if edit mode is enabled
  toggleEditMode,    // Function to toggle edit mode
  login,             // Function to log in as dev user
  logout             // Function to log out
} = useDevAuth();
```

## Edit Mode

Edit mode is a boolean flag that you can use to conditionally render UI elements or enable functionality based on user permissions.

For example:

```tsx
{isEditMode && (
  <div className="edit-controls">
    <button>Edit</button>
    <button>Delete</button>
  </div>
)}
```

## Implementation Details

The implementation consists of:

1. **useDevAuth.ts**: The main hook and context provider
2. **DevAuthProvider.tsx**: A simple wrapper component
3. **DevAuthStatus.tsx**: The UI component for the auth status

## No Backend Required

This solution works entirely in the browser without any backend requirements, making it perfect for development. For production, you would replace this with your actual authentication system.

## Customization

If you need to customize the dev user, edit the `defaultDevUser` object in `useDevAuth.ts`:

```typescript
const defaultDevUser: DevUser = {
  id: 'dev-user-1',
  email: 'dev@example.com',
  role: 'admin'
};
```