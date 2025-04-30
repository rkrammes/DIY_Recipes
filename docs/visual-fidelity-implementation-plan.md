# Visual Fidelity Implementation Plan

**Objective:** Implement the specific visual aesthetics (effects, layout, typography) for the "Hackers", "Dystopia", and "Neotopia" themes as described in Section 17 of the research digest, ensuring strict adherence to the original vision and specified workflows (Context7, Agent Orchestration).

**Guiding Principles:**
-   Prioritize visual accuracy based on Section 17 mockups and descriptions.
-   Use the agreed theme name mapping: UI/Docs ("Hackers", "Dystopia", "Neotopia") mapped to Code (`hackers`, `dystopia`, `neotopia` which correspond to the technical definitions previously named `synthwave-noir`, `terminal-mono`, `paper-ledger`).
-   Strictly follow Context7 usage (Sections 12, 13) and Agent Orchestration guidelines (Section 27).

## Phase 1: Setup & Theme Name UI Restoration

1.  **Implement Theme Name UI/Mapping:**
    *   **Agent:** `code`
    *   **Task:** Execute Phase 1 of `theme-name-restoration-plan.md`.
        *   Update `SettingsOverlay.tsx` to display "Hackers", "Dystopia", "Neotopia".
        *   Update `SettingsProvider.tsx` to handle the mapping correctly, storing the preferred names but setting the `data-theme` attribute with the technical identifiers (`hackers`, `dystopia`, `neotopia`).
    *   **Context7 Usage:** Add `// @ask:context7:react@latest - How to best manage state mapping?` if needed.

2.  **Integrate Context7 Configuration:**
    *   **Agent:** `code`
    *   **Task:** Create/update `roo.config.jsonc` (or equivalent IDE config) with Context7 server details and default library versions as per Section 13.1. Add `// use context7:...` directives to key files (`tailwind.config.cjs`, `lib/supabase.ts`, etc.) as per Section 12.3.
    *   **Context7 Usage:** Use `// @ask:context7:mcp - What is the latest config format?`

## Phase 2: Implement "Hackers" Theme Visuals (`data-theme="hackers"`)

*(Reference: Research Section 17.1)*

1.  **Fonts:**
    *   **Agent:** `code`
    *   **Task:** Ensure `Px437 IBM VGA 8x16` (headings) and `Share Tech Mono` (body) fonts are correctly loaded (via `@font-face` in `globals.css` or `next/font`) and applied using Tailwind theme config (`tailwind.config.cjs`) mapped to CSS variables (`--font-heading-hackers`, `--font-body-hackers`). Apply these variables within the `[data-theme="hackers"]` scope in `tokens.css` or `globals.css`.
    *   **Context7 Usage:** `// @ask:context7:next@latest - Best practice for loading multiple custom fonts?`

2.  **Layout & Borders:**
    *   **Agent:** `code`
    *   **Task:** Implement the "stacked window frames" layout concept for key panels/sections using CSS/Tailwind. Apply 2px beveled borders using `border` utilities and potentially pseudo-elements (`::before`, `::after`) styled within the `[data-theme="hackers"]` scope.
    *   **Context7 Usage:** `// @ask:context7:tailwind@latest - How to create beveled borders?`

3.  **CRT Scanline Overlay:**
    *   **Agent:** `code`
    *   **Task:** Implement the scanline overlay effect using a pseudo-element (`::before` or `::after`) on `.theme-background` or `body` within the `[data-theme="hackers"]` scope in `globals.css`. Use `linear-gradient` and `background-size` as described. Ensure 15% opacity.
    *   **Context7 Usage:** `// @ask:context7:css - Example of animated scanline overlay?`

4.  **Blinking Block Cursor:**
    *   **Agent:** `code`
    *   **Task:** Define `@keyframes blink` and apply `animation: blink 1s step-end infinite;` to relevant elements (e.g., a `.cursor` class used in input fields or terminal components) within the `[data-theme="hackers"]` scope.
    *   **Context7 Usage:** `// @ask:context7:css - Keyframes for cursor blink?`

5.  **Background Grid:**
    *   **Agent:** `code`
    *   **Task:** Implement the pulsing circuit-board grid background for `.theme-background` within `[data-theme="hackers"]` scope. Use `repeating-linear-gradient` or an SVG background. Define and apply the 8s pulse animation. *(Note: This might reuse/adapt the previously fixed `synthwave-noir` grid, just ensure colors match Section 17.1 - chartreuse/magenta)*.
    *   **Context7 Usage:** `// @ask:context7:css - Examples of animated grid backgrounds?`

6.  **(Optional/Stretch) 3D Flip Hover:**
    *   **Agent:** `architect` / `code`
    *   **Task:** Research simple CSS `transform: rotateY(180deg)` with `backface-visibility: hidden` for a basic flip effect on file/folder icons on hover within `[data-theme="hackers"]`. Implement if feasible without heavy libraries.
    *   **Context7 Usage:** `// @ask:context7:css - Simple CSS 3D flip effect?`

## Phase 3: Implement "Dystopia" Theme Visuals (`data-theme="dystopia"`)

*(Reference: Research Section 17.2)*

1.  **Fonts:**
    *   **Agent:** `code`
    *   **Task:** Load and apply `IBM Plex Mono` (headings, all caps) and `DIN Mono` (body) via Tailwind theme config mapped to CSS variables within `[data-theme="dystopia"]` scope.
    *   **Context7 Usage:** `// @ask:context7:tailwind@latest - Applying different fonts for headings/body per theme?`

2.  **Layout & Code Rain:**
    *   **Agent:** `code`
    *   **Task:** Implement the centered 960px viewport layout. Create a `CodeRain` component (using Canvas API for performance) and place it in the layout's gutters (outside the main content area) conditionally rendered when `data-theme="dystopia"`.
    *   **Context7 Usage:** `// @ask:context7:javascript - Efficient canvas code rain effect?`

3.  **Phosphor Glow Effect:**
    *   **Agent:** `code`
    *   **Task:** Apply green phosphor glow using `text-shadow` or `filter: drop-shadow()` with appropriate blur (8px) to primary text elements within `[data-theme="dystopia"]` scope.
    *   **Context7 Usage:** `// @ask:context7:css - Phosphor glow text effect?`

4.  **Glitch Tear Hover:**
    *   **Agent:** `code`
    *   **Task:** Implement the 1-frame horizontal glitch tear on hover for interactive elements. Use CSS `@keyframes` manipulating `clip-path` or `transform: skew()` briefly on hover within `[data-theme="dystopia"]`.
    *   **Context7 Usage:** `// @ask:context7:css - Keyframes for quick glitch/tear effect?`

5.  **(Optional/Stretch) Glyph Cascade Reveal:**
    *   **Agent:** `architect` / `code`
    *   **Task:** Research techniques for text reveal animations (e.g., using JS to animate character opacity/position or CSS `clip-path`). Implement for headings or key text elements if feasible within `[data-theme="dystopia"]`.
    *   **Context7 Usage:** `// @ask:context7:javascript - Text cascade reveal animation techniques?`

## Phase 4: Implement "Neotopia" Theme Visuals (`data-theme="neotopia"`)

*(Reference: Research Section 17.3)*

1.  **Fonts:**
    *   **Agent:** `code`
    *   **Task:** Load and apply `Neue Machina` (headings) and `Inter` (body) via Tailwind theme config mapped to CSS variables within `[data-theme="neotopia"]` scope.
    *   **Context7 Usage:** (Similar to previous font tasks)

2.  **Layout & Panels:**
    *   **Agent:** `code`
    *   **Task:** Style panels (`.panel`, `.glass-panel`) as floating glass with 12px `border-radius` and `box-shadow` for Z-depth within `[data-theme="neotopia"]`. Ensure appropriate background colors/opacity are used based on the `paper-ledger` palette.
    *   **Context7 Usage:** `// @ask:context7:tailwind@latest - Creating glassmorphism effect?`

3.  **Holo Pop-Out Hover:**
    *   **Agent:** `code`
    *   **Task:** Apply `transform: translateZ(8px)` (or `translateY` if Z is complex) and potentially scale on hover to interactive elements within `[data-theme="neotopia"]`. Ensure smooth `transition`.
    *   **Context7 Usage:** `// @ask:context7:css - Simple pop-out hover effect?`

4.  **Circuit-Trace Border Sweep:**
    *   **Agent:** `code`
    *   **Task:** Implement animated border effect using pseudo-elements (`::before`, `::after`) with `border-image` or animated `background-position` on a gradient border within `[data-theme="neotopia"]`.
    *   **Context7 Usage:** `// @ask:context7:css - Animated border sweep effect?`

5.  **Neon Bloom Flare on Save:**
    *   **Agent:** `code`
    *   **Task:** Define a CSS animation (`@keyframes bloom-flare`) that quickly scales a pseudo-element's `box-shadow` or applies a radial gradient. Trigger this animation via a temporary class added on save confirmation within `[data-theme="neotopia"]`.
    *   **Context7 Usage:** `// @ask:context7:css - Keyframes for bloom/flare effect?`

6.  **Parallax Background:**
    *   **Agent:** `code`
    *   **Task:** Implement the animated parallax city skyline background for `.theme-background` within `[data-theme="neotopia"]`. Use a background image and animate `background-position` based on scroll or time. Ensure low opacity (1%).
    *   **Context7 Usage:** `// @ask:context7:css - Parallax background image effect?`

## Phase 5: Testing & Refinement

1.  **Visual Verification:**
    *   **Agent:** `architect` / `user`
    *   **Task:** Manually compare the implemented themes against the descriptions and mockups in Section 17. Identify any discrepancies.
2.  **Iterative Debugging:**
    *   **Agent:** `debug` -> `code`
    *   **Task:** Address any visual bugs or inconsistencies identified in step 1, following the debug->fix->verify cycle. Use Context7 for API/syntax help.
3.  **Performance Check:**
    *   **Agent:** `code` / `ask`
    *   **Task:** Briefly check browser dev tools for animation performance. Ensure effects like code rain or parallax backgrounds are not causing significant main thread blockage. Use `// @ask:context7:performance - How to profile CSS animations?`

## Phase 6: Documentation Update

1.  **Update Theme Docs:**
    *   **Agent:** `architect` / `code`
    *   **Task:** Update all relevant theme documentation (`theming-implementation-plan.md`, `theme-migration-mapping.md`, `theme-name-restoration-plan.md`, etc.) to reflect the final implementation, correct names, and visual details. Ensure consistency.

**Execution Notes:**
-   Each numbered step within a Phase should be treated as a distinct sub-task delegated to the specified agent.
-   The `code` agent MUST use Context7 directives (`// @ask:context7...` or `// @code:context7...`) when implementing features related to libraries covered by Context7 (Tailwind, Next, React, CSS, JS, etc.).
-   Follow agent orchestration guidelines (Section 27) - use `ask` for lookups, `code` for atomic changes, `debug` for complex issues.
-   Communicate progress clearly after each phase or major step.