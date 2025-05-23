# DIY Recipes Retro Terminal UI

This implementation recreates the retro terminal UI with the correct color scheme matching the original interface:
- **RED** headers for panel titles (SYS_STATUS, MODULE_STATISTICS, etc.)
- **GREEN** labels for data fields (UPTIME, FORMULATIONS, etc.)
- **CYAN/BLUE** values for all metrics and numeric data
- **PURPLE/MAGENTA** accent text for special indicators (TOTAL, USED, etc.)

## How to Use

1. Start the Next.js application on port 3000:
   ```bash
   ./test-terminal-ui.sh
   ```
   This script will start the application and capture a screenshot automatically.

2. Or start the application manually:
   ```bash
   cd /Users/ryankrammes/Kraft_AI\ \(App\)/DIY_Recipes/modern-diy-recipes
   npm run dev
   ```

3. Open in your browser:
   http://localhost:3000

4. To capture a screenshot of the terminal UI:
   ```bash
   node simple-screenshot.js
   ```
   Screenshots are saved in the `test-screenshots` directory.

## Color Scheme Details

The terminal uses the following color palette:
- Headers (Panel Titles): `#FF0000` (Pure Red) with text glow effect
- Labels: `#00FF00` (Pure Green) with subtle glow effect
- Values: `#00FFFF` (Cyan/Blue) with glow effect
- Accents: `#FF00FF` (Magenta/Purple) with subtle glow
- Background: `#000000` (Black)
- Borders: `#004400` (Dark Green)

## Files Included

- `/src/app/page.tsx` - The main React component implementing the terminal UI
- `/src/styles/formula-dashboard.css` - Styling for the terminal UI with the proper color scheme
- `test-terminal-ui.sh` - Script to run the app and take a screenshot
- `simple-screenshot.js` - Puppeteer script to capture screenshots of the terminal

## Terminal Structure

The terminal UI consists of a three-column layout:

1. **Header Bar**:
   - Left side: System title "DIY.SYS" in green
   - Right side: Status "READY" with current time that updates in real-time

2. **Main Content Area**:
   - **Left Navigation Column**: Menu items for different system sections
     - DASHBOARD (active)
     - FORMULA DATABASE
     - ALL_FORMULAS
     - RECENT
     - FAVORITES
     - CATEGORIES
     - And more...

   - **Middle Content Column**: Dashboard information and data
     - Section titles in RED with glow effect
     - Statistics display with count metrics
     - Activity table with color-coded status indicators
     - Data organized in a clean, terminal-inspired layout

   - **Right Commands Column**: System commands and resources
     - SYSTEM COMMANDS section with interactive options
     - SYSTEM STATUS section with current state
     - SYSTEM RESOURCES section with visual resource meters
     - Resource meters have PURPLE/MAGENTA accents for TOTAL/USED/ALLOC

## Implementation Details

- Monospace font stack utilizes available fonts:
  ```css
  font-family: 'IBM Plex Mono', 'JetBrains Mono', 'Px437_IBM_VGA', 'Share Tech Mono', 'Courier New', monospace;
  ```
- Real-time clock updates using React's `useEffect` and `setInterval`
- CSS Grid layout for precise column arrangement
- Interactive hover effects on navigation and command items
- Resource bars visualize system metrics with animated fills
- All colors defined using CSS variables for consistency and theming support

## Notes

- The UI is optimized to run on port 3000 as requested
- Font loading is properly handled to prevent FOUC (Flash of Unstyled Content)
- The implementation works with the existing Next.js configuration
- Color scheme strictly adheres to the RED/GREEN/CYAN/PURPLE requirements
- All interactive elements have appropriate hover states

## Credits

Created to match the original terminal layout and color scheme based on the provided specifications. Implemented as a Next.js application with React components and custom CSS.