# Authentication and Settings System Architecture

## Overview

This document outlines the architecture for implementing an expandable authentication and settings section in the DIY Recipes application. The section will contain login functionality, edit mode selection, and theme selection, replacing the current standalone theme selector.

## Current Architecture

Currently, the application has:

1. A theme toggle button in the header-right section
2. An edit mode toggle button in the header-right section 
3. A magic link form for authentication (hidden by default)
4. Authentication using Supabase with magic links

## Proposed Architecture

### UI Components

#### 1. Expandable Settings Section

Create a collapsible container in the header-right section that replaces the current theme selector position:

```
Header Right
└── Settings Button (replaces current theme button)
    └── Collapsible Settings Container
        ├── Authentication Section
        │   ├── Email Input (for magic link)
        │   ├── Send Link Button
        │   └── Login/Logout Button
        ├── Edit Mode Toggle
        └── Theme Toggle
```

#### 2. Authentication Status Indicator

Add a visual indicator showing the current authentication status:

- Logged out: Settings button appears neutral
- Logged in: Settings button includes a visual indicator (icon or color)

### JavaScript Architecture

#### 1. Authentication Module Enhancement

Extend the existing auth.js to include:

- Session persistence
- Clear authentication state management
- Proper error handling

#### 2. Settings UI Module

Create a new settings-ui.js module to handle:

- Settings panel expansion/collapse
- Settings state persistence (remember user preferences)
- Unified event handling for all settings components

#### 3. Authentication State Integration

Ensure authentication state is properly integrated with:

- Edit mode functionality (only available when logged in)
- Recipe editing capabilities
- User-specific content visibility

### Data Flow

```
User Interaction → Settings UI → Authentication Module → Supabase Client
                                                      ↓
App Features ← Permission Management ← Authentication State
```

## Implementation Plan

1. Create the collapsible settings container in HTML structure
2. Implement settings-ui.js for handling the settings panel behavior
3. Modify auth.js and auth-ui.js to work with the new settings panel
4. Update UI state management to reflect authentication status across the application
5. Implement proper permission checks throughout the application based on auth state

## Security Considerations

1. Ensure edit mode is strictly tied to authentication status
2. Implement proper client-side validation for all inputs
3. Add appropriate error handling for authentication failures
4. Consider session timeout handling

## User Experience Improvements

1. Provide clear visual feedback on authentication status
2. Ensure smooth transitions when expanding/collapsing the settings panel
3. Maintain consistent styling with the rest of the application
4. Add helpful tooltips and instructions for authentication process