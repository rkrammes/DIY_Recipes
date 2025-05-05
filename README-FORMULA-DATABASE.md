# Formula Database - DIY Recipes Retro Sci-Fi Interface

The Formula Database is a complete redesign of the DIY Recipes application with a retro sci-fi aesthetic, transforming it into a futuristic laboratory interface.

## Quick Start

1. Run the Express server with `./start-formula-database.sh` or `npm start`
2. Access the application at: http://localhost:3000

## Features

- **Terminal Interface**: Complete redesign with CRT effects, scanlines, flicker, terminal-style typography
- **Three-Column Layout**: Command Terminal, Navigation Matrix, and Action Panel
- **Formula Database**: Recipes transformed into "Formulas" with sci-fi styling
- **Element Library**: Ingredients transformed into "Elements" with chemical-inspired visuals
- **Control Matrix**: Settings panel for customizing the terminal interface (Ctrl+Shift+C)
- **Command Terminal**: Type commands like HELP, STATUS, CLEAR, REFRESH

## Key Files

- `formula-database.html` - Main interface
- `js/formula-database-ui.js` - Recipe UI adapter with terminal styling
- `js/formula-actions.js` - Terminal-styled formula actions
- `js/element-actions.js` - Terminal-styled element actions
- `js/control-matrix.js` - Settings console for the terminal interface
- `js/terminal-main.js` - Main initialization script
- `styles/retro-terminal.css` - Terminal UI styling

## Documentation

- `FORMULA_DATABASE_INTEGRATION.md` - How the UI integrates with real recipe data
- `TERMINAL_UI_IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `retro-sci-fi-design-spec.md` - Design specification

## Terminal Commands

The Command Terminal (top bar) supports these commands:

- `HELP` - Shows available commands
- `STATUS` - Shows system status
- `CLEAR` - Clears the workspace
- `REFRESH` - Refreshes data from the source

## Keyboard Shortcuts

- `Ctrl+Shift+C` - Toggle Control Matrix (settings panel)

## Formula Database Views

1. **Dashboard** - System overview with formula stats and recent activity
2. **ALL_FORMULAS** - Complete list of formulas in the database
3. **RECENT** - Recently accessed formulas
4. **CATEGORIES** - Formulas organized by category

## Element Library Views

1. **ALL_ELEMENTS** - Complete list of elements (ingredients)
2. **COMPATIBILITY** - Element compatibility matrix
3. **PROPERTIES** - Element properties and characteristics

## Theme Options

Access theme settings in the Control Matrix (Ctrl+Shift+C):

1. **Green Terminal** (Default)
2. **Amber Terminal**
3. **Blue Terminal**
4. **White Terminal**

## Real Data Integration

The Formula Database uses real data from your DIY Recipes application:

- All recipes display as "formulas"
- All ingredients display as "elements"
- All actions work with your actual data
- Changes are saved to your existing database

## Troubleshooting

If you encounter any issues:

1. **Blank screen**: Check browser console for errors
2. **Missing styles**: Ensure `styles/retro-terminal.css` is accessible
3. **No formulas**: Check browser console for API connection errors
4. **Reset settings**: Use RESET DEFAULTS in Control Matrix

## For Developers

To extend or modify the Formula Database:

1. CSS components are in `styles/retro-terminal.css`
2. Terminal UI logic is in `js/terminal-main.js`
3. Recipe adapter is in `js/formula-database-ui.js`
4. Settings panel is in `js/control-matrix.js`

---

The Formula Database is designed to provide a unique and engaging user experience while preserving all the functionality of the original DIY Recipes application.