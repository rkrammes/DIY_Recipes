# DIY Recipes - Retro Sci-Fi UI Design Specification

## Core Design Vision

Transform the DIY Recipes application into a retro-futuristic interface inspired by sci-fi films of the 1970s-1990s (Alien, Blade Runner, TRON, etc.). The UI should feel like futuristic technology as imagined in the past - utilitarian yet visually striking.

## Design Principles

1. **Terminal Aesthetics**: Embrace monospace typography, scan line effects, and terminal-like interactions
2. **Grid Systems**: Use visible grids and alignment markers for structure and visual interest
3. **Feedback Loops**: Add subtle animations and effects that suggest the interface is "working" (scanning, processing)
4. **Contextual Controls**: Present only the relevant controls for the current context
5. **Data Visualization**: Make information feel tangible and interactive
6. **Color Theory**: Use limited color palettes with high contrast (green/amber/blue on black)

## Key Components

### 1. Command Terminal (Top Section)
A persistent command bar at the top of the UI that provides global navigation and status information.

**Visual Elements**:
- Status indicators showing system state (blinking LED-like indicators)
- Digital clock/timer (pulsing separator between digits)
- Main navigation tabs styled as terminal command buttons

**Interactions**:
- Tab switching simulates terminal screen refresh
- Subtle CRT flicker on state changes
- Auditory feedback for commands (low terminal beeps)

### 2. Navigation Matrix (Left Column)
A hierarchical navigation system that resembles computer file systems from the 80s-90s.

**Visual Elements**:
- Tree structure with visible connecting lines
- Monospace typography with green/amber text on dark background
- Selection indicators using full-row highlighting
- Category headers styled as computer system directories

**Interactions**:
- Expand/collapse animations mimic old computer terminals
- Hover states with scan line effects
- Selection changes trigger terminal "access" sound effects

### 3. Primary Workspace (Center Column)
The main content area that changes based on selected navigation item.

**Visual Elements**:
- "Formula Database" UI for recipes with data table styling
- "Data Terminal" view for viewing individual recipes
- Grid-based layouts with visible alignment markers
- Content framed with decorative terminal-style borders

**Interactions**:
- Content changes simulate CRT screen refresh
- Data display uses typewriter-style text reveal
- Scroll effects that mimic terminal pagination

### 4. Action Panel (Right Column)
Context-aware control panel that displays available actions for the selected item.

**Visual Elements**:
- Terminal-style command buttons grouped by function
- Status indicators showing available operations
- Operation descriptions displayed in terminal font
- Visual hierarchy through button styling variations

**Interactions**:
- Buttons have tactile press animations
- Contextual actions appear with fade-in effects
- Command execution triggers visual feedback

## Visual System

### Typography
- **Primary Font**: 'VGA' for headers and primary UI elements
- **Secondary Font**: 'IBM Plex Mono' for content and longer text
- **Accent Font**: 'Share Tech Mono' for data displays
- **Size Scale**: 12px, 14px, 16px, 20px, 24px (limited range for authenticity)

### Color Palette
- **Background**: Deep black (`#0c0c0c`) with subtle blue undertones
- **Primary Text**: Terminal green (`#33ff33`) or amber (`#ffb000`)
- **Secondary Text**: Muted variations (`#2cd232`, `#d28c32`)
- **Accent**: Electric blue (`#00a2ff`) for highlighting and interactions
- **Alert**: Warning red (`#ff3333`) for critical information
- **Grid Lines**: Subtle blue-green (`#1a3a3a`) for structural elements

### Effects
- **Scan Lines**: Subtle horizontal lines that move vertically across the screen
- **CRT Glow**: Soft bloom effect around bright text elements
- **Terminal Flicker**: Intermittent subtle opacity changes
- **Screen Refresh**: Brief flash effect when changing major views
- **Glitch Effects**: Occasional text displacement for system messages

## Component Styling

### Buttons
```css
.terminal-button {
  font-family: 'VGA', monospace;
  background-color: #1a1a1a;
  color: #33ff33;
  border: 1px solid #33ff33;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.terminal-button:hover {
  background-color: #222222;
  box-shadow: 0 0 8px rgba(51, 255, 51, 0.5);
}

.terminal-button:active {
  background-color: #2a2a2a;
  transform: translateY(1px);
}

.terminal-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background-color: #33ff33;
  animation: buttonScan 2s linear infinite;
}
```

### Data Displays
```css
.data-terminal {
  font-family: 'IBM Plex Mono', monospace;
  background-color: #0c0c0c;
  color: #33ff33;
  border: 1px solid #1a3a3a;
  padding: 1rem;
  position: relative;
}

.data-terminal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
}

.data-terminal .value {
  color: #ffb000;
}

.data-terminal .label {
  color: #7e7e7e;
}
```

### Navigation Items
```css
.nav-item {
  font-family: 'VGA', monospace;
  padding: 0.5rem 1rem;
  margin-bottom: 2px;
  color: #33ff33;
  display: flex;
  align-items: center;
}

.nav-item::before {
  content: ">";
  margin-right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.nav-item:hover {
  background-color: rgba(51, 255, 51, 0.1);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background-color: rgba(51, 255, 51, 0.2);
}

.nav-item.active::before {
  opacity: 1;
}
```

### Custom Animations
```css
@keyframes buttonScan {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes terminalFlicker {
  0%, 100% { opacity: 1; }
  92%, 94%, 96% { opacity: 0.8; }
}

@keyframes dataReveal {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes scanLine {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
```

## Section Transformations

### 1. Recipe Management → Formula Database
- Rename "Recipes" to "Formulas"
- Display recipes in a data terminal interface with green text on black
- Show formula metadata as specs/parameters
- Add "status indicators" for recipe categories

### 2. Ingredient Management → Element Library
- Rename "Ingredients" to "Elements"
- Create chemical-inspired visual cards for ingredients
- Display properties (pH, viscosity, etc.) as technical specifications
- Add "compatibility matrix" for ingredient interactions

### 3. Settings Panel → Control Matrix
- Transform settings into a control panel interface
- Group settings as "system parameters"
- Use toggle switches and dials styled as technical controls
- Add terminal-style feedback for settings changes

### 4. Recipe Editor → Formula Synthesis Lab
- Redesign editor as a technical workstation
- Show ingredient ratios as calibration sliders
- Present instructions as sequential operation steps
- Add "simulation" button for testing recipe changes

## Removal Plan

The following sections should be removed as they don't align with the core application purpose:
- Theme Demo (redundant with theme settings)
- Database direct access (abstract this behind the Formula Database)
- External integrations UI (move to system settings if needed)
- Documentation sections (integrate as help commands)

## Implementation Strategy

1. Begin with a design system update (colors, typography, effects)
2. Transform the layout structure while maintaining functionality
3. Rename sections and update terminology throughout the UI
4. Add animations and effects incrementally
5. Refine interactions and test thoroughly

## Animation Timing and Performance Considerations

- Keep animations under 300ms for responsiveness
- Use CSS transitions for simple effects (hover, active states)
- Implement more complex animations with keyframes
- Include reduced motion options for accessibility
- Consider performance impact of scan line and CRT effects

---

This specification provides the foundation for transforming DIY Recipes into a retro sci-fi experience while enhancing usability through contextual controls and clear visual hierarchy.