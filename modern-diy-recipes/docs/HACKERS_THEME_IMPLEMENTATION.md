# Hackers Theme Implementation Documentation

## Overview

This document describes the enhanced "Hackers" theme implementation for the Kraft AI application. The theme combines elements from the 1995 movie "Hackers" with modern synthwave aesthetics to create a unique visual experience.

## Design Inspiration

The theme draws from two main sources:
1. **Authentic "Hackers" movie UI elements** - Based on screenshots from the film showing cyan/teal menus with purple selections and colorful terminal interfaces
2. **Synthwave aesthetics** - Modern interpretation with animated grid backgrounds for visual richness

## Key Components

### Color Palette

The theme uses a comprehensive color palette derived from the movie:

- **Terminal Colors:**
  - `--hackers-cyan`: 75% 0.25 195 (Light cyan for menus & server info)
  - `--hackers-green`: 80% 0.40 135 (Bright green for terminal text)
  - `--hackers-purple`: 60% 0.35 290 (Purple for selections/highlights)
  - `--hackers-orange`: 70% 0.40 60 (Orange for network info)
  - `--hackers-red`: 65% 0.45 20 (Red for errors/warnings)
  - `--hackers-yellow`: 85% 0.40 90 (Yellow for cautions)
  - `--hackers-blue-highlight`: 60% 0.30 250 (Blue selection bar)

- **Synthwave Elements:**
  - `--hackers-grid-color`: 70% 0.35 300 (Purple grid lines for background)
  - `--hackers-neon-pink`: 65% 0.35 330 (Pink for synthwave accents)

### UI Component Styling

1. **File Navigation**
   - Cyan/teal menus with uppercase text (directly from movie)
   - Purple box borders around selected items
   - Arrow indicators for menu items
   - Technical grid background

2. **Terminal Windows**
   - Multi-colored text based on content type (matching screenshot)
   - Green for standard output
   - Cyan for system info
   - Orange for network data
   - Red for errors
   - Yellow for warnings
   - Blue selection highlight bars

3. **Background Elements**
   - Animated perspect grid with movement
   - Subtle scanlines for CRT effect
   - Deep blue-black gradient base

### Animations

- Grid movement animation for dynamic background
- Scanline effects for authentic CRT look  
- Text flicker/noise for terminal authenticity

### Special Elements

- "Hack the Planet" Easter egg in small text
- Confidential section styling with purple borders
- File number boxes with purple borders

## Usage Notes

- Apply theme with `[data-theme="hackers"]` attribute on container elements
- Use appropriate CSS classes for terminal content:
  - `.server-info` or `[data-server]` for cyan text
  - `.value-positive` for green text
  - `.network-info` for orange text
  - `.warning` for yellow text
  - `.error` for red text
  - `.system-message` for purple text

- Use custom attributes for menu items:
  - `[data-file-browser]` for file navigation panels
  - `[data-file-item]` for file items
  - `[data-terminal]` for terminal windows