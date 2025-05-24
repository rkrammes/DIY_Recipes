# Feature Preservation Plan

## Overview
Before cleaning up 32+ alternative interfaces, we need to preserve the best features that were implemented but missing from the main `TripleColumnLayoutClean` interface.

## Features to Add to Main Interface

### 🔴 Critical Features (High Priority)

1. **Keyboard Navigation System**
   - Arrow keys to navigate between columns
   - Up/Down arrows to navigate within columns
   - Enter/Space to select items
   - Tab navigation support
   - Visual focus indicators matching theme
   - Escape to exit keyboard mode
   - Source: `KraftTerminalModularLayout.tsx` (lines 504-863)

2. **Search Functionality**
   - Search input for filtering formulations/ingredients
   - Real-time filtering as you type
   - Searches across title and description
   - Source: `TripleColumnLayout.tsx`

3. **Loading States**
   - Show loading spinners during data fetch
   - Connection status indicators
   - System state: 'checking', 'online', 'offline'
   - Progress indicators for long operations
   - Source: `KraftTerminalModularLayout.tsx` (lines 1138-1313)

4. **Error Boundaries**
   - Wrap components in ErrorBoundary
   - Graceful error handling
   - Component already exists: `ErrorBoundary.tsx`

### 🟡 Important Features (Medium Priority)

5. **Keyboard Shortcuts**
   - Alt+1 through Alt+4 for quick category navigation
   - F4 to cycle themes
   - F10 to logout (with confirmation)
   - Source: `KraftTerminalModularLayout.tsx` (lines 535-561)

6. **Focus Management**
   - Proper tabIndex handling
   - Making third column elements focusable
   - Scroll focused elements into view
   - Source: `KraftTerminalModularLayout.tsx` (lines 592-762)

7. **Visual Enhancements**
   - Smooth transitions on hover/selection
   - Theme-specific focus animations
   - Retro-styled selection boxes
   - Source: `KraftTerminalModularLayout.tsx` (lines 866-1066)

### 🟢 Nice-to-Have Features

8. **Real-time Status Display**
   - Memory usage indicator
   - Network latency display
   - Last sync time
   - Current time in header

9. **Enhanced Audio Feedback**
   - Click sounds on navigation
   - Different sounds for different actions
   - Already integrated with audio system

## Implementation Order

1. **First**: Add ErrorBoundary wrapper to main components
2. **Second**: Implement search functionality (simplest feature)
3. **Third**: Add keyboard navigation system (most complex but highest value)
4. **Fourth**: Add loading states for better UX
5. **Fifth**: Add keyboard shortcuts for power users
6. **Finally**: Visual enhancements and status displays

## Files to Preserve During Cleanup

These files contain implementations we need:
- `src/components/ErrorBoundary.tsx` - Keep as-is
- Extract keyboard navigation code from `KraftTerminalModularLayout.tsx`
- Extract search code from `TripleColumnLayout.tsx`
- Extract loading state patterns

## Cleanup Strategy

After adding these features:
1. Archive all alternative interfaces to `archive/alternative-interfaces/`
2. Keep only essential routes and components
3. Remove all test pages and experimental variants
4. Ensure consistent theme application across remaining components

## Theme Consistency

The modular app needs themes to apply everywhere:
- All components must use `useTheme` hook
- Remove any hardcoded colors
- Ensure all new features respect theme colors
- Test with all three themes: Hackers, Dystopia, Neotopia