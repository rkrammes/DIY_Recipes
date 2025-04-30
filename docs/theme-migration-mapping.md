# Theme Migration Mapping

This document outlines the mapping between the current theme system and the proposed new theme system. This mapping will help ensure a smooth transition and maintain backward compatibility during the migration process.

## Current vs New Theme Names

| Current Theme | New Theme | Description |
|---------------|-----------|-------------|
| `hackers` | `synthwave-noir` | Dark theme with neon accents, cyberpunk aesthetic |
| `dystopia` | `terminal-mono` | Green-on-black terminal aesthetic with amber highlights |
| `neotopia` | `paper-ledger` | Light theme with muted natural colors and subtle textures |

## CSS Variable Mapping

This table shows how the current CSS variables map to the new semantic token system.

### Base Variables

| Current Variable | New Semantic Token | Notes |
|------------------|-------------------|-------|
| `--primary-bg` | `--surface-0` | Main background color |
| `--secondary-bg` | `--surface-1` | Secondary/panel background |
| `--panel-bg` | `--surface-1` with opacity | Panel backgrounds |
| `--panel-border` | `--border-subtle` | Border colors for panels |
| `--text` | `--text-primary` | Primary text color |
| `--muted-text` | `--text-secondary` | Secondary/muted text |
| `--accent-blue` | `--accent` | Primary accent color |
| `--accent-pink` | `--accent-hover` | Secondary accent/hover state |
| `--input-text` | `--text-primary` | Input text color |
| `--placeholder-text` | `--text-secondary` with opacity | Placeholder text |
| `--link` | `--accent` | Link color |
| `--button-text` | `--text-inverse` | Button text color |
| `--button-gradient` | Use `--accent` with Tailwind gradients | Button backgrounds |
| `--button-hover-border` | `--accent-hover` | Button hover borders |
| `--shadow` | `--shadow-soft` | Box shadows |
| `--scrollbar-thumb` | `--accent` with opacity | Scrollbar thumb |
| `--scrollbar-track` | `--surface-1` with opacity | Scrollbar track |
| `--alert-red` | `--error` | Error/alert color |
| `--warn-yellow` | `--warning` | Warning color |
| `--success-green` | `--success` | Success color |

### Hackers Theme to Synthwave Noir

| Current Variable | New Semantic Token | Notes |
|------------------|-------------------|-------|
| `--primary-bg: #0C0C0F` | `--surface-0: 60 25 300` | Converted to OKLCH |
| `--secondary-bg: #1F1124` | `--surface-1: 50 23 300` | Converted to OKLCH |
| `--text: #00FF88` | `--text-primary: 95 1 315` | Converted to OKLCH |
| `--muted-text: #00C0FF` | `--text-secondary: 85 5 310` | Converted to OKLCH |
| `--accent-blue: #00E7FF` | `--accent: 70 30 330` | Converted to OKLCH |
| `--accent-pink: #FF3EF6` | `--accent-hover: 75 32 330` | Converted to OKLCH |
| `--crt-bloom-intensity: 0.5px` | `--crt-bloom-intensity: 0.5px` | Preserved as-is |

### Dystopia Theme to Terminal Mono

| Current Variable | New Semantic Token | Notes |
|------------------|-------------------|-------|
| `--primary-bg: #0A0A0A` | `--surface-0: 10 2 280` | Converted to OKLCH |
| `--secondary-bg: #1A1A1A` | `--surface-1: 6 2 280` | Converted to OKLCH |
| `--text: #00E050` | `--text-primary: 85 1 100` | Converted to OKLCH |
| `--muted-text: #00A030` | `--text-secondary: 75 2 110` | Converted to OKLCH |
| `--accent-amber: #FF9900` | `--accent: 65 18 90` | Converted to OKLCH |
| `--ghost-text-offset: 1px` | `--ghost-text-offset: 1px` | Preserved as-is |
| `--flicker-intensity: 0.98` | `--flicker-intensity: 0.98` | Preserved as-is |

### Neotopia Theme to Paper Ledger

| Current Variable | New Semantic Token | Notes |
|------------------|-------------------|-------|
| `--primary-bg: #F0F0F0` | `--surface-0: 94 2 90` | Converted to OKLCH |
| `--secondary-bg: #E0E0E0` | `--surface-1: 90 2 90` | Converted to OKLCH |
| `--text: #101010` | `--text-primary: 25 1 70` | Converted to OKLCH |
| `--muted-text: #505050` | `--text-secondary: 40 2 75` | Converted to OKLCH |
| `--accent-blue: #00C8FF` | `--accent: 60 16 40` | Converted to OKLCH |
| `--neon-glow-color: var(--accent-blue)` | `--glow-pulse: 0 0 5px oklch(60 16 40 / 0.5)` | Converted to OKLCH |

## Tailwind Class Mapping

This table shows how to migrate from current Tailwind utility classes to the new semantic token-based classes.

| Current Class | New Class | Notes |
|--------------|-----------|-------|
| `bg-primary-bg` | `bg-surface-0` | Main background |
| `bg-secondary-bg` | `bg-surface-1` | Secondary background |
| `bg-panel-bg` | `bg-surface-1/80` | Panel with opacity |
| `text-text` | `text-text-primary` | Primary text |
| `text-muted-text` | `text-text-secondary` | Secondary text |
| `text-accent-blue` | `text-accent` | Accent text |
| `text-accent-pink` | `text-accent-hover` | Secondary accent text |
| `border-panel-border` | `border-border-subtle` | Border color |
| `shadow-lg` | `shadow-soft` | Box shadow |
| `hover:bg-accent-blue` | `hover:bg-accent-hover` | Hover background |
| `active:bg-accent-blue-dark` | `active:bg-accent-active` | Active background |
| `focus:outline-accent-pink` | `focus:outline-accent-hover` | Focus outline |

## Component Migration Examples

### Button Component

#### Before:
```tsx
<button 
  className="bg-accent-blue-dark text-button-text border border-transparent hover:border-button-hover-border-dark"
>
  Click Me
</button>
```

#### After:
```tsx
<button 
  className="bg-accent text-surface-0 border border-transparent hover:border-accent-hover active:bg-accent-active"
>
  Click Me
</button>
```

### Panel Component

#### Before:
```tsx
<div className="bg-panel-bg-dark border border-panel-border-dark shadow-lg">
  <h2 className="text-accent-blue-dark">Panel Title</h2>
  <p className="text-text-dark">Panel content</p>
</div>
```

#### After:
```tsx
<div className="bg-surface-1/80 border border-border-subtle shadow-soft">
  <h2 className="text-accent">Panel Title</h2>
  <p className="text-text-primary">Panel content</p>
</div>
```

### Form Input

#### Before:
```tsx
<input 
  className="bg-secondary-bg-dark text-input-text-dark border border-accent-blue-dark focus:outline-accent-orange-dark" 
  placeholder="Enter text"
/>
```

#### After:
```tsx
<input 
  className="bg-surface-1 text-text-primary border border-accent focus:outline-accent-hover" 
  placeholder="Enter text"
/>
```

## Theme-Specific Effects Migration

### Hackers Theme Effects

#### Before:
```tsx
<div className={`${theme === 'hackers' ? 'hackers-text-bloom' : ''}`}>
  Glowing Text
</div>
```

#### After:
```tsx
<div className="synthwave:text-glow">
  Glowing Text
</div>
```

### Dystopia Theme Effects

#### Before:
```tsx
<div className={`${theme === 'dystopia' ? 'animate-dystopia-flicker' : ''}`}>
  Flickering Element
</div>
```

#### After:
```tsx
<div className="terminal:animate-flicker">
  Flickering Element
</div>
```

### Neotopia Theme Effects

#### Before:
```tsx
<div className={`${theme === 'neotopia' ? 'neotopia-border-glow' : ''}`}>
  Glowing Border
</div>
```

#### After:
```tsx
<div className="paper:border-emboss">
  Embossed Border
</div>
```

## Migration Strategy

1. **Phase 1**: Implement the new token system alongside the existing system
   - Create the new tokens.css file
   - Update the Tailwind config to use the new tokens
   - Create a compatibility layer that maps old variables to new ones

2. **Phase 2**: Update the SettingsProvider
   - Add support for the new theme names
   - Create a mapping between old and new theme names
   - Ensure backward compatibility for existing theme references

3. **Phase 3**: Migrate components one by one
   - Start with shared/common components
   - Use the mapping tables above to convert class names
   - Test each component in all three themes

4. **Phase 4**: Remove deprecated variables and classes
   - Once all components are migrated, remove the old variables
   - Update any remaining theme references in the codebase
   - Remove the compatibility layer

## Backward Compatibility

To ensure backward compatibility during the migration, we'll implement a compatibility layer that maps old theme names to new ones:

```typescript
// In SettingsProvider.tsx
const themeMapping = {
  'hackers': 'synthwave-noir',
  'dystopia': 'terminal-mono',
  'neotopia': 'paper-ledger'
};

// When setting the theme
const setThemeWithBackwardCompatibility = (theme: string) => {
  // Support both old and new theme names
  const newTheme = themeMapping[theme] || theme;
  
  // Set the data-theme attribute with the new theme name
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // For backward compatibility, also set the body class with the old theme name
  if (Object.keys(themeMapping).includes(theme)) {
    document.body.className = theme;
  } else {
    // Find the old theme name that maps to this new theme
    const oldTheme = Object.entries(themeMapping)
      .find(([_, newName]) => newName === theme)?.[0];
    if (oldTheme) {
      document.body.className = oldTheme;
    }
  }
  
  // Store the new theme name
  localStorage.setItem('theme', newTheme);
};
```

This approach ensures that both old and new theme references will work during the migration period, allowing for a gradual transition to the new system.