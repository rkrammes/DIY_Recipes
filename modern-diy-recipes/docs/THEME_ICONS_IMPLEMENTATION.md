# Theme-Specific Icons Implementation

## Overview

This document describes the implementation of theme-specific SVG icons in the Kraft AI Terminal UI. The system replaces emoji icons with custom SVG icons that adapt to the current theme (hackers, dystopia, neotopia), enhancing the terminal aesthetic and providing a more consistent visual language across the application.

## Implementation Details

### 1. Icon Design Principles

- **Retro Terminal Aesthetic**: Icons follow an 8-bit/16-bit pixel-art inspired look
- **Theme Consistency**: Icons adapt to all three themes with accurate theme colors:
  - **Hackers**: Green (#00FF00)
  - **Dystopia**: Amber (#FFB000)
  - **Neotopia**: Blue (#00AAFF)
- **Minimalist Design**: Simple, geometric shapes with limited detail
- **Consistent Style**: Square corners and straight lines to match terminal aesthetics

### 2. Inline SVG Components

Instead of external SVG files or CSS filters, we're using inline SVG components that dynamically set their stroke color based on the current theme:

- **RecipeIcon**: For formulations/recipes
- **IngredientIcon**: For ingredients
- **ToolIcon**: For tools
- **LibraryIcon**: For library items
- **SettingsIcon**: For settings
- **FileIcon**: For file-related items

### 3. ThemeIcons Component with Dynamic SVG Rendering

The `ThemeIcon` component was implemented to render SVG icons with the correct theme colors:

```typescript
// src/components/ThemeIcons.tsx
export const ThemeIcon: React.FC<{ type: string; size?: number; className?: string }> = ({ 
  type, 
  size = 24, 
  className = '' 
}) => {
  const { theme } = useTheme();
  
  // Theme colors for fallback and direct color usage
  const themeColors = {
    hackers: '#00FF00', // Green
    dystopia: '#FFB000', // Amber
    neotopia: '#00AAFF'  // Blue
  };
  
  // Use direct SVG components for better color control
  if (['formulations', 'recipes', 'recipe'].includes(type)) {
    return <RecipeIcon size={size} className={className} />;
  } else if (['ingredients', 'ingredient'].includes(type)) {
    return <IngredientIcon size={size} className={className} />;
  } else if (['tools', 'tool'].includes(type)) {
    return <ToolIcon size={size} className={className} />;
  } else if (type === 'library') {
    return <LibraryIcon size={size} className={className} />;
  } else if (type === 'settings') {
    return <SettingsIcon size={size} className={className} />;
  } else if (type === 'file') {
    return <FileIcon size={size} className={className} />;
  }

  // Fallback - square with question mark in theme color
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={themeColors[theme] || '#FFFFFF'}
      strokeWidth="2" 
      strokeLinecap="square" 
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="4" width="16" height="16" />
      <text x="12" y="16" textAnchor="middle" fontSize="14" fill={themeColors[theme] || '#FFFFFF'}>?</text>
    </svg>
  );
};
```

Each individual icon component handles its own theme-specific color adaptation:

```typescript
// Cache of theme colors for reuse across components
const themeColors = {
  hackers: '#00FF00', // Green
  dystopia: '#FFB000', // Amber
  neotopia: '#00AAFF'  // Blue
};

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => {
  const { theme } = useTheme();

  // Use the color directly rather than through a function to reduce re-renders
  const strokeColor = themeColors[theme] || themeColors.hackers;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="round"
      className={className}
      key={`settings-${theme}`} // Force re-render on theme change
    >
      <path d="M4 8V4h4"></path>
      <path d="M20 8V4h-4"></path>
      <path d="M4 16v4h4"></path>
      <path d="M20 16v4h-4"></path>
      <rect x="10" y="4" width="4" height="4"></rect>
      <rect x="4" y="10" width="4" height="4"></rect>
      <rect x="16" y="10" width="4" height="4"></rect>
      <rect x="10" y="16" width="4" height="4"></rect>
    </svg>
  );
};
```

### 4. Inline SVG with Force Re-rendering

This optimized approach uses inline SVG components with dynamic stroke colors and React key props to ensure proper theme switching:

- **Accurate Theme Colors**: Directly sets the SVG stroke color to the exact theme color
- **React Key Props**: Force re-rendering when theme changes by using theme-dependent key props
- **No CSS Filter Issues**: Avoids color distortion that can happen with CSS filters
- **Consistent Theme Switching**: Icons properly update when switching themes with no page reload
- **Enhanced Performance**: Uses React's useMemo hook to optimize rendering
- **Dynamic Rendering**: Updates instantly when theme changes with proper re-rendering
- **No External Files**: Reduces HTTP requests and reliance on external assets
- **Simplified API**: Icon components work with just size and className props

### 5. Integration in KraftTerminalModularLayout

The `KraftTerminalModularLayout` component was updated to use the `ThemeIcon` component for both the main navigation categories and the settings subcategories:

- Updated first column items to use `ThemeIcon`
- Replaced emoji icons in settings subcategories with theme-specific icons
- Updated loading/error state icons to match the terminal aesthetic

## Usage

To use a theme-specific icon:

```jsx
import { ThemeIcon } from '@/components/ThemeIcons';

<ThemeIcon type="recipe" size={24} className="mr-2" />
```

Available icon types:
- `formulations` / `recipes` / `recipe`
- `ingredients` / `ingredient`
- `tools` / `tool`
- `library`
- `settings`
- `file`

## Testing

A Puppeteer test script `test-theme-icons.js` was created to validate the theme-specific icons implementation. The script:

1. Takes screenshots of the terminal UI in all three themes
2. Tests navigation through different sections to ensure icons render correctly
3. Validates theme switching (using F4 key) updates all icons appropriately

## Future Improvements

- Create additional icon types to cover more use cases
- Implement animated versions of icons for interactive elements
- Consider adding a dark/light variation within each theme
- Create a comprehensive icon gallery component for development