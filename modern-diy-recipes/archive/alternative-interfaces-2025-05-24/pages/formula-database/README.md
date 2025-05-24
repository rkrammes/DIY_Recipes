# Formula Database Module

## Overview
The Formula Database is a sci-fi themed interface for the DIY Recipes application that transforms recipes into "scientific formulas" with a retro terminal UI. It provides an alternative view of recipe data that follows a laboratory/terminal aesthetic.

## Integration with Core Architecture

### Layout System
- Uses the app's core layout system through `app/formula-database/layout.tsx`
- Properly inherits the root layout and console layout
- Maintains hierarchy of providers and theme context

### Theme Integration
- Uses the consolidated ThemeProvider from the app
- Maps the app themes (hackers, dystopia, neotopia) to terminal themes
- Supports bidirectional theme updates (terminal UI can update app theme)
- Uses CSS variables for styling to maintain consistent look and feel

### Styling Architecture
- Uses modular CSS in `terminal-module.css` 
- Integrates with the app's theme tokens and variables
- Avoids conflicts with global styles
- Maintains responsive design patterns from the main app

## Features

1. **Three-Column Layout**
   - Command terminal (top)
   - Navigation matrix (left) - Lists all formulas
   - Primary workspace (center) - Shows formula details
   - Action panel (right) - Shows actions and system status

2. **Terminal UI Components**
   - CRT-style scanlines and flicker effects
   - System console with command history
   - Terminal-style typography and syntax
   - Retro terminal status indicators

3. **Theme Integration**
   - Multiple color themes (green, amber, blue, white)
   - Synchronized with application themes
   - Terminal-specific styling that respects the app's theme system

4. **Interactive Elements**
   - Command system for terminal operations
   - Reactive data loading with error handling
   - Formula browsing and detailed view
   - System message console

## How to Access

You can access the Formula Database interface in two ways:

1. Visit http://localhost:3000/formula-database
2. Click the "Formula Database" button in the floating menu on the main page

## Command Terminal Usage

The Command Terminal (top bar) supports these commands:

- `HELP` - Shows available commands
- `STATUS` - Shows system status
- `CLEAR` - Clears workspace
- `REFRESH` - Refreshes data
- `THEME` - Cycles display themes
- `VERSION` - Shows software version info
- `LIST` - Lists all formulas

## Technical Considerations

1. **Provider Integration**
   - The component uses the app's ThemeProvider context for theme changes
   - Proper handling of theme mapping between app themes and terminal themes
   - Uses context to ensure consistency across the app

2. **Data Fetching**
   - Fetches recipe data using the app's API routes
   - Maintains consistent error handling pattern
   - Follows the same data model as the rest of the app

3. **State Management**
   - Uses local React state for UI elements
   - Syncs with global theme state when necessary
   - Maintains clean prop passing and component hierarchy

## Maintenance Notes

1. When updating:
   - Ensure changes respect the existing theme system
   - Test formula database with all app themes
   - Verify the responsive layout works on all screen sizes

2. Theme modifications:
   - Update both `terminal-module.css` and theme mapping in the component
   - Test bidirectional theme updates
   - Keep the terminal theme class system in sync with app themes

---

🧪 Enjoy your journey through the Formula Database! 🧪