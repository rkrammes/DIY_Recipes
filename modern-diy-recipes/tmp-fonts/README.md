# KRAFT_AI Cyberpunk Theme Collection

A collection of authentic cyberpunk-inspired UI themes for KRAFT_AI.

## Themes

### 1. Hackers (1995)
Authentic DOS/ANSI aesthetic inspired by the 1995 movie, featuring:
- True VGA font styling
- Authentic phosphor CRT glow effects
- DOS-style UI elements with character-based borders
- "City of Text" 3D grid visualization
- Classic aqua/teal color palette from the film

### 2. Matrix Dystopia
A balanced blend of The Matrix and Blade Runner:
- Matrix-inspired digital rain and green code elements
- Blade Runner cityscape silhouettes and neon signs
- Rain overlay and smoky atmosphere effects
- Ghost/holographic UI components
- Terminal-style interfaces with scanlines

### 3. Neotopia
Clean, bright cyberpunk UI with:
- White/light background with neon accents
- Holographic translucent panels
- Animated borders and subtle light effects
- Modern interface with cyberpunk aesthetics
- Glass morphism effects

## Usage

The themes are implemented using CSS custom properties and data attributes.

```html
<!-- Set theme using the data-theme attribute -->
<html data-theme="hackers">
  <!-- Content -->
</html>
```

To apply theme-specific elements:

```html
<!-- Hackers Theme Elements -->
<div data-hackers-window data-title="SYSTEM CONSOLE">
  <div data-dos-border>
    <div data-terminal-text>Hackers theme content</div>
  </div>
</div>

<!-- Matrix Dystopia Elements -->
<div data-matrix-code>
  <div data-console>Matrix theme content</div>
  <div data-ghost data-text="Echo Effect">Echo Effect</div>
</div>

<!-- Neotopia Elements -->
<div data-hologram data-glass>
  <div data-hologram-header>
    <span data-neon="blue">Neotopia theme content</span>
  </div>
</div>
```

## Running the Demo

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Font Requirements

The themes use the following fonts:
- IBM Plex Mono
- JetBrains Mono
- Px437_IBM_VGA_8x16 (for authentic DOS display)
- Share Tech Mono