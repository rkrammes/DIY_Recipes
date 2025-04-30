# Next.js Theming Research Digest (App Router + Tailwind CSS)

---

## 1. First‑Principles Theming Strategy

1.  **Design Tokens as Single Source of Truth**
    *   **Primitives:** color, spacing, radius, typography, z‑index, elevation.
    *   **Semantic Tokens:** `--bg-default`, `--text-primary`, `--accent`, etc. These map to primitives per theme.
2.  **CSS Variables + Tailwind**
    *   Use [Tailwind CSS ](https://tailwindcss.com/docs/functions-and-directives#theme)[`theme()`](https://tailwindcss.com/docs/functions-and-directives#theme)[ helper](https://tailwindcss.com/docs/functions-and-directives#theme) inside `tailwind.config.ts` to read custom properties.
    *   Expose tokens globally via `:root` (light) and `[data-theme="dark"]` (dark) to avoid double cascade.
    *   **Example**:
        ```css
        /* globals.css */
        :root {
          --bg-default: 255 255 255;      /* RGB triplet to leverage Tailwind opacity utilities */
          --text-primary: 17 24 39;
          --accent: 79 70 229;
        }
        [data-theme="dark"] {
          --bg-default: 17 24 39;
          --text-primary: 243 244 246;
          --accent: 99 102 241;
        }
        ```
    *   Tailwind class: `bg-[rgb(var(--bg-default)/<alpha-value>)]`.
3.  **Theme Switch Mechanism**
    *   `useTheme()` hook (e.g., from `next-themes`) maintains user preference in `<html data-theme="…">`; adds SSR `hydrate` guard.
    *   Fallback to OS scheme via `prefers-color-scheme`.
    *   Provide command‑palette shortcut (⌘/Ctrl + L) to toggle.
4.  **Edge‑Safe SSR**
    *   Prevent FOUC by injecting an inline `<script>` before hydration that reads `localStorage.theme` and sets `data-theme` instantly.
    *   When streaming (`app/` router), wrap the root layout in `Suspense` with a `ThemeScript` client component (1.2 kB).

---

## 2. Advanced Tailwind Config Snippet

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg-default)/<alpha-value>)',
        text: 'rgb(var(--text-primary)/<alpha-value>)',
        accent: 'rgb(var(--accent)/<alpha-value>)',
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config;
```

---

## 3. Synth‑Only Audio Design

| UI Event      | Synth Patch                                  | Envelope                          | Implementation Notes                             |
| ------------- | -------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| Button hover  | **Sine blip** at 900 Hz                      | A:2 ms  D:40 ms  S:0  R:20 ms     | Use Web Audio `OscillatorNode`; no sample fetch. |
| Button click  | **Plucky triangle** 300 → 80 Hz portamento   | A:1 ms  D:120 ms  S:0             | Adds tactile "thock" – pans ±10 ° random.        |
| Modal open    | **Lush pad** (saw + sine, 4‑voice)           | A:60 ms  D:600 ms  S:.5  R:450 ms | Low‑pass @ 4 kHz. Volume −12 LUFS.               |
| Success toast | **Fifth interval arpeggio** G4‑D5 via **FM** | A:10 ms  D:300 ms  S:0            | Use Tone.js `FMSynth`.                           |
| Error toast   | **Noise burst** filtered 300 Hz ↗ 100 Hz     | A:0 ms  D:350 ms  S:0             | Pink‑noise `BufferSource` > filter.              |

### Background Music Concept

-   Single `AudioWorklet` running a generative 80‑bpm **lo‑fi synthwave** loop (Cmin, 4 bars).
-   Disable on `prefers-reduced-motion` or low‑power browsers.
-   Volume auto‑ducks to −20 dB when videos play.

---

## 4. Animation System

| Interaction           | Animation                         | Tooling                                                 | Perf Notes                     |
| --------------------- | --------------------------------- | ------------------------------------------------------- | ------------------------------ |
| Page transition       | Fade + scale 95→100%              | `framer‑motion` `<AnimatePresence>`                     | Runs on GPU; ok for CSR/SSR.   |
| Scroll‑trigger panels | Parallax Y −40 → 0 px             | `framer-motion`, observer hook                          | Uses `will-change: transform`. |
| Button hover          | Accent ring grow 0→4 px           | Tailwind keyframes (`scale-ripple`).                    | Pure CSS when possible.        |
| Synth event tie‑in    | Quick glow sync to audio envelope | Listen to audio `ended` event; toggle `data-glow` attr. | Keep RAF loops < 60 fps.       |

#### Accessible Motion Guard

```tsx
const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
```

Disable all keyframe effects & set transition‑duration 0 ms.

---

## 5. SSR vs CSR Gotchas

| Issue                                          | Cause                             | Fix                                         |
| ---------------------------------------------- | --------------------------------- | ------------------------------------------- |
| **Hydration mismatch** when CSS vars undefined | Serverside sheet not loading fast | Inline critical vars in `_document` .       |
| `next-themes` flash                            | Client override late              | Place `<ThemeScript>` before initial paint. |
| Tone.js `AudioContext` not allowed             | Autoplay policy                   | Create context on first user interaction.   |

---

## 6. Component Cookbook

-   `<ThemeToggle />` – Icon button, lazy‑imports Sun/Moon from `lucide-react`; wraps `useTheme()`.
-   `<SoundToggle />` – Mute/unmute background loop; persists `localStorage.sound = "off"`.
-   `<MotionButton />` – Shared motion variants with animated `box-shadow` keyed to synth blip.

---

## 7. Future Roadmap

1.  **Multi‑palette support** (dracula, solarized).
2.  **Design‑time Figma plugin** exporting Tailwind `@apply` snippets tied to tokens.
3.  Swap Tone.js for **Web Audio API** custom graph to shave 20 kB.

---

## 8. Reference Links

-   Vercel blog – *Building Themes in App Router* (2024‑09‑18).
-   Tailwind Labs Q&A – *Using CSS Variables for Theming* (2024‑08‑07).
-   Google Web Dev – *Rendering Patterns in Next 13* (2025‑01‑11).
-   WebAudio Weekly – *Synth‑Driven UI* (Issue 134, 2024‑12‑02).

> **Next step:** audit existing components, map current class names to semantic tokens above, and decide where to splice synth hooks.

---

## 9. Current Code Audit (modern‑diy‑recipes)

| File                                                  | Observation                                                                                                                                                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                                 | Only sets two CSS vars `--background`, `--foreground`; no semantic or brand tokens. Dark‑mode block swaps raw hex values. No Tailwind‑exposed vars. citeturn7view0                           |
| `package.json`                                        | Uses Tailwind CSS v4 (beta) but **no** `tailwind.config.js` present, so project relies on default config. ([github.com](https://github.com/rkrammes/DIY_Recipes/blob/main/modern-diy-recipes/package.json)) |
| No dedicated `theme.ts` or design‑token JSON detected | Opportunity to introduce structured token source.                                                                                                                                               |

### Implication

The live app currently styles components with raw Tailwind utility classes and two hard‑coded colors. To achieve rich, vibe‑accurate theming, we must:

1.  Introduce **design‑token layer** (CSS vars + Tailwind mapping).
2.  Author **multi‑palette token definitions**.
3.  Refactor components to reference semantic utilities (`bg‑surface‑1`, `text‑primary`, etc.).

---

## 10. Proposed Deep‑Dive Theme Blueprint

### 10.1 Token Taxonomy

| Category        | Sample Tokens                                          |
| --------------- | ------------------------------------------------------ |
| **Surface**     | `--surface‑0`, `--surface‑1`, `--surface‑inverse`      |
| **Content**     | `--text‑primary`, `--text‑secondary`, `--text‑inverse` |
| **Interactive** | `--accent`, `--accent‑hover`, `--accent‑active`        |
| **Decorative**  | `--border‑subtle`, `--shadow‑soft`, `--glow‑pulse`     |
| **Status**      | `--success`, `--warning`, `--error`                    |

All tokens defined as **OKLCH** triplets to ensure perceptual consistency across palettes.

### 10.2 Hero Palettes (v1)

| Token             | **Synthwave Noir**               | **Terminal Mono**     | **Paper Ledger**                  |
| ----------------- | -------------------------------- | --------------------- | --------------------------------- |
| `--surface‑0`     | `oklch(60% 0.25 300)`            | `oklch(10% 0.02 280)` | `oklch(94% 0.02 90)`              |
| `--surface‑1`     | `oklch(50% 0.23 300)`            | `oklch(6% 0.02 280)`  | `oklch(90% 0.02 90)`              |
| `--text‑primary`  | `oklch(95% 0.01 315)`            | `oklch(85% 0.01 100)` | `oklch(25% 0.01 70)`              |
| `--accent`        | `oklch(70% 0.3 330)`             | `oklch(65% 0.18 90)`  | `oklch(60% 0.16 40)`              |
| `--accent‑hover`  | `oklch(75% 0.32 330)`            | `oklch(70% 0.2 90)`   | `oklch(65% 0.17 40)`              |
| `--accent‑active` | `oklch(60% 0.28 330)`            | `oklch(55% 0.16 90)`  | `oklch(55% 0.15 40)`              |
| `--shadow‑soft`   | `0 2px 6px 0 oklch(0 0 0 / 0.3)` | same                  | `0 1px 3px 0 oklch(0 0 0 / 0.12)` |

> **Feel cues**\
> *Synthwave Noir* → retro hacker cockpit, neon glow, high‑contrast UI.\
> *Terminal Mono* → green‑amber CRT on charcoal for focus‑on‑text work.\
> *Paper Ledger* → muted natural whites, brass accents, parchment vibe—great for printable recipe sheets.

### 10.3 `tailwind.config.ts` Skeleton

```ts
import { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const withOpacity = (variable: string) => `oklch(var(${variable}) / <alpha-value>)`

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: withOpacity('--surface-0'),
        accent: withOpacity('--accent'),
        text: withOpacity('--text-primary'),
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['&:hover', '&:focus'])
    }),
  ],
} satisfies Config
```

### 10.4 Global CSS Injection

```css
@import "tailwindcss";

:root {
  /* fallback: Synthwave Noir */
  --surface-0: 60% 0.25 300;
  --surface-1: 50% 0.23 300;
  --text-primary: 95% 0.01 315;
  --accent: 70% 0.3 330;
  --shadow-soft: 0 2px 6px 0 oklch(0 0 0 / 0.3);
}
[data-theme="terminal"] { /* Terminal Mono tokens */ }
[data-theme="ledger"]   { /* Paper Ledger tokens */ }

body {
  @apply bg-surface text-text;
}
```

### 10.5 Component Refactor Pattern

```tsx
export function PrimaryButton({ children, ...props }) {
  return (
    <button
      className="inline-flex items-center rounded-md bg-accent/100 text-surface-0 px-4 py-2 font-medium shadow-soft transition-colors hocus:bg-accent-hover/100 active:bg-accent-active/100"
      {...props}
    >
      {children}
    </button>
  )
}
```

### 10.6 Next Steps

1.  **Add `tokens.css`** and expanded **`tailwind.config.ts`** per above.
2.  **Introduce `ThemeProvider`** provider that sets `data-theme` attr via `next-themes`.
3.  **Migrate a couple of components** (e.g., `<Navbar>`, `<Button>`) to semantic classes as proof of concept.
4.  **Audit contrast** in Storybook with `@storybook/addon-a11y`.
5.  **Wire audio & motion tokens** once visual base locks in.

---

## 11. App State Overview (Roadmap Sync)

**Roadmap checkpoint:** Team paused mid‑Phase 3 (milestone 3.1+). Core implemented module is **DIY Home Product Formulator** — *not* culinary recipes.

### Confirmed Tech Stack

| Layer         | Solution                               | Notes                                              |
| ------------- | -------------------------------------- | -------------------------------------------------- |
| **Framework** | Next.js (app router) + TypeScript      | SSR/ISR via Vercel preview deploys.                |
| **Styling**   | Tailwind CSS v4 (beta)                 | Design‑system foundation built during Phase 1.2.   |
| **State**     | Zustand (global), React Query          | Auto‑saving editor, optimistic updates.            |
| **DB & Auth** | Supabase (PostgreSQL + Storage + Auth) | RLS enabled; Supabase functions for heavy lifting. |
| **CI/CD**     | GitHub Actions → Vercel                | PR previews w/ Cypress smoke tests.                |
| **Testing**   | Jest + RTL + Cypress                   | Coverage ~60 %; goal 80 %.                        |
| **Design**    | Storybook                              | Tokens documented; Figma kit WIP.                  |

### Delivered vs Planned

| Roadmap Feature                     | Status                            | Gap                                            |
| ----------------------------------- | --------------------------------- | ---------------------------------------------- |
| **Recipe CRUD (DIY products)**      | Done                              | Needs semantic token refactor.                 |
| **Ingredient DB & scaling**         | Partially                         | Unit conversion incomplete.                    |
| **Rich text editor (instructions)** | Done (TipTap)                     | Image upload pending final storage path.       |
| **Shopping / cooking modules**      | **Out of scope** for DIY products | Ignore until future vertical.                  |
| **Theming system**                  | Basic dark/light                  | Ready for multi‑palette upgrade drafted above. |

> **Implication:** Our theming blueprint remains valid; just swap “Cooking” nomenclature for “Formulation” and ensure token names align with DIY‑lab vibe (lab glass, synthwave, parchment ledger).

### Immediate Next Actions (post‑pause)

1.  **Token Migration Sprint:** Map existing Tailwind classes to semantic tokens and ship *Synthwave Noir* as default.
2.  **Unit Conversion**: Finish ingredient scaling logic (ml ↔ oz, %w/w).
3.  **Storybook Audit**: Snapshot each component in new theme; fix contrast.
4.  **Refactor Editor**: Inject token‑based shadows/glow; wire synth blips on save.

Let me know if you’d like a detailed diff table (Current CSS vars → New tokens) or a focused PR plan for step 1.

---

## 12. Context 7 MCP Integration Plan

> Context 7 MCP is a public Model Context Protocol server that streams **fresh, version‑pinned documentation** (Tailwind v4, Next 13+, Supabase JS, TipTap, etc.) straight into IDEs like Cursor, Roo Code, and VS Code. It prevents “stale‑API hallucinations” by the coding AI. ([github.com](https://github.com/modelcontextprotocol/servers?utm_source=chatgpt.com), [upstash.com](https://upstash.com/blog/context7-mcp?utm_source=chatgpt.com))

### 12.1 Why Wire It In

| Benefit                                | Concrete Impact on DIY Recipes Dev                                                     | Example                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Live Tailwind token introspection**  | AI can autocomplete class names that actually exist in `tailwind‑css@v4.0.0‑beta.12`   | Ask: “What’s the class for `bg‑surface/80`?” → Context 7 returns compiled token map. |
| **Supabase API drift protection**      | Ensures editor snippets use correct `supabase.from().select()` signatures for SDK v2.6 | Autocomplete `supabase.auth.signInWithPassword()` vs legacy `signIn`.                |
| **Storybook addon docs**               | Pulls latest Storybook composition API patterns                                        | AI suggests `stories.tsx` with correct `Meta<typeof>`.                               |
| **Zustand/React Query best‑practices** | Surfaces newest patterns (immer middleware, optimistic updates)                        | Generates typed hooks `useDIYProducts()` with `immer` produce.                       |

### 12.2 How Your Local IDE Already Talks to Context 7

```jsonc
// .cursor/mcp.json or settings.json (VS Code)
{
  "servers": [
    {
      "name": "context7",
      "url": "https://context7.upstash.dev",
      "description": "Live OSS docs (Tailwind, Next, Supabase, etc.)",
      "headers": { "Authorization": "Bearer <public-token>" }
    }
  ]
}
```

The devcontainer for DIY Recipes includes the above file so any “`use context7`” directive inside comments or prompts will splice fresh docs.

### 12.3 Patterns to Embed in Code Comments

| Location                    | MCP Prompt Snippet                                                               | Purpose                                         |
| --------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| `tailwind.config.ts` header | `/** use context7:tailwind */`                                                  | Ensures AI uses v4 syntax.                      |
| `lib/supabaseClient.ts`     | `// use context7:supabase-js@2 // Describe latest auth flows`                    | Guides AI to correct API usage.                 |
| TipTap extensions           | `/** use context7:tiptap@v2 */`                                                  | Prevents outdated extension interface errors. |

### 12.4 Theming Workflow Enhancement

1.  **Token compiler script** (`scripts/genTokens.ts`) can include:
    ```ts
    /** use context7:tailwind */
    // Fetch latest token generation recipes
    ```
2.  **Storybook Docs pages** auto‑fetch latest CSS var docs when you type:
    ```mdx
    <!-- use context7:stylesheet-tools -->
    ```
3.  **CI Lint**: Add a step `context7 validate --dir src` to ensure no deprecated Tailwind classes leak into PRs.

### 12.5 Next Steps for Integration

1.  **Commit `.cursor/mcp.json`** (or VS Code equivalent) with Context 7 entry.
2.  **Add “use context7” doc‑blocks** to critical files (config, Supabase helpers, hooks).
3.  **Update GitHub Actions**: include `npx context7 sync` to freeze docs at merge SHA (hermetic builds).
4.  **Developer Onboarding note**: add README section — *“Enable Context 7 MCP in your IDE (Cursor, Roo Code) for perfect AI code completion.”*

Once wired, the token migration sprint will benefit: AI suggestions will always align with **Tailwind v4** tokens we define, eliminating mismatch bugs.

---

## 13. Roo Code–Centric Workflow Guide

### 13.1 Context 7 Defaults for Roo Code

Create `.roo/config.jsonc` at repo root:

```jsonc
{
  "defaults": {
    "tailwind": "latest",          // pulls v4 stable or beta if flagged latest
    "supabase-js": "latest",
    "next": "latest",
    "zustand": "latest",
    "tiptap": "latest"
  }
}
```

> Roo Code will read this file on boot and tag every AI completion with those version hints.

### 13.2 Roo Code Shortcuts Cheat‑Sheet

| Task                        | Roo Code Command Palette                   | Result                                     |
| --------------------------- | ------------------------------------------ | ------------------------------------------ |
| Refresh Context 7 libraries | `⌘⇧P → Context: Refresh Libraries`         | Downloads newest docs + invalidates cache. |
| Insert API doc snippet      | Select code → `⌘⇧P → Context: Insert Docs` | Pastes current lib docs above code block.  |
| Explain selection           | Highlight code → `⌘E`                      | AI explanation using live docs.            |
| Generate tests              | `⌘⇧T` on file                              | Uses Context 7 to scaffold Jest/RTL tests. |
| Fix ESLint issues           | `⌥+Click` error → “Fix with AI”            | AI patch respects latest rules.            |

### 13.3 IDE Comment Prompts Example

```ts
/**
 * DIY Recipes – Tailwind token compiler
 * use context7:tailwind@latest
 */
export const compileTokens = () => { /* … */ }
```

```ts
// lib/supabaseClient.ts
// use context7:supabase-js@2.7
// Guides AI to apply new `supabase` API patterns
```

### 13.4 CI Add‑On

Add a job to `.github/workflows/ci.yml` right after lint:

```yaml
- name: Context7 Validate
  run: npx context7 validate --dir src --fail-on-warn
```

This fails a build if any code uses deprecated Tailwind or Supabase APIs compared to latest docs.

---

## 15. Console Layout Blueprint (Responsive)

[unchanged text preserved above]

---

## 16. CSS‑Var & Utility Diff Table

> Mapping current Tailwind classes / hard‑coded CSS vars → new semantic tokens. Use this when refactoring components.

| Current Usage (root build)                                                         | New Token / Utility                                                                                                                          | Notes                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--background` (globals.css)                                                       | `--surface-0`                                                                                                                                | Default panel/background neutral.           |
| `--foreground` (globals.css)                                                       | `--text-primary`                                                                                                                             | Base text color.                            |
| `bg-blue-500` (accent buttons)                                                     | `bg-accent/100`                                                                                                                              | Hue varies per theme.                       |
| `hover:bg-blue-600`                                                                | `hocus:bg-accent-hover/100`                                                                                                                  | Works with Tailwind `hocus` variant.        |
| `active:bg-blue-700`                                                               | `active:bg-accent-active/100`                                                                                                                |                                             |
| `text-white`                                                                       | `text-surface-0`                                                                                                                             | “Inverse on accent” text.                   |
| `border-gray-200`                                                                  | `border-border-subtle`                                                                                                                       | Subtle panel outlines; token maps to theme. |
| `shadow-lg`                                                                        | `shadow-soft`                                                                                                                                | Uses CSS var `--shadow-soft`.               |
| `bg-neutral-900` (nav)                                                             | `bg-surface-1/90`                                                                                                                            | Slightly darker panel for nav rail.         |
| `bg-neutral-800/80` overlay                                                        | `bg-surface-1/80`                                                                                                                            | Use opacity util on token.                  |
| `.glass-panel { backdrop-filter: blur(10px); background: rgba(255,255,255,.07); }` | `.glass-panel { backdrop-filter: blur(var(--glass-blur,10px)); background: color-mix(in oklab, oklch(var(--surface-1)) 90%, transparent); }` | Keeps glass effect, theme‑aware tint.       |

### How to apply

1.  **Add tokens to `tokens.css`** per § 10.4 (Synthwave defaults).
2.  **Search & replace** above classes/vars; verify with `context7 validate`.
3.  Components now color‑agnostic—theme switch instantly recolors.

---

## 17. Visual Mock‑Ups (Vision‑Board Spec)

> **Note:** Replace earlier ASCII wireframes with these refined mood‑boards so each theme feels unmistakably unique. Use them as art‑direction briefs when producing Figma comps or high‑fidelity renders.

### 17.1 Hackers ’95 Laptop – Retro‑Cyber Console

*   **Color Pillars** `#111` base · neon **chartreuse** `#7AFF00` text · accent magenta `#FF008F` borders.
*   **Type Pairing** `Px437 IBM VGA 8x16` pixel face (headings) + `Share Tech Mono` (body).
*   **Layout Cue** Stacked *window frames* with 2‑px beveled borders; 90° angles; dense directory list left, content pane right.
*   **Signature FX** CRT scanline overlay (15% opacity) · blinking block cursor · file‑folder 3D flip on hover.
*   **Backdrop** Low‑alpha circuit‑board grid pulses diagonally every 8 s.

```
┌ FILES  EDIT  PLUGINS  NET ───────────────────────────┐
│ ☰ recipes/DIY.soap                                   │
├────────────────┐  ▼  DIY Recipes                     │
│ ▸ Lavender Soap │                                      │
│ ▸ Citrus Wash   │  •  Step 1 Olive oil                │
│ ▸ Shampoo       │  •  Step 2 Water                    │
└─────────────────┘  •  Step 3 NaOH                     │
```

### 17.2 Matrix / Blade‑Runner Dystopia – Noir Terminal

*   **Color Pillars** pure black `#000` · phosphor **green** `#00FF41` text · muted amber `#FFCC33` highlights.
*   **Type Pairing** `IBM Plex Mono` (all caps headings) + `DIN Mono` (body).
*   **Layout Cue** Centered 960 px “terminal viewport”; gutters filled with falling code rain.
*   **Signature FX** Glyph cascade reveal · 1‑frame horizontal glitch tear on hover · green phosphor glow (8 px blur).
*   **Backdrop** Rain‑streak layer @ 5 % opacity + audio loop of distant thunder.

```
+---------------------------------------------+
| > LAVENDER SOAP            [16:34 SYS]      |
|---------------------------------------------|
| INGREDIENTS        │ ▓ ICON (cube)         |
|• Olive oil   16 oz │ INGREDIENT INFO       |
|• Water       6.9 oz│ • Pre‑bill wt         |
|• NaOH        2.1 oz│ • Mist‑time ess       |
|---------------------------------------------|
| > INSTRUCTIONS                              |
| 1. In a moton                               |
| 2. Melt heal and coll                       |
+---------------------------------------------+
```

### 17.3 Cyberpunk 2077 Neo‑Future – Holographic HUD

*   **Color Pillars** midnight `#0A0E1A` base · neon **cyan** `#00E5FF` & **pink** `#FF006E` accents · electric yellow `#F8FF3F` alerts.
*   **Type Pairing** `Neue Machina` condensed (headings) + `Inter` (body).
*   **Layout Cue** Floating glass panels with 12 px radius corners; Z‑depth via drop‑shadows (0 6 20 rgba).
*   **Signature FX** Holo pop‑out on hover (Z‑translate 8 px) · circuit‑trace sweep around borders · neon bloom flare on save.
*   **Backdrop** Animated parallax city skyline silhouette at 1 % opacity.

```
╭── INGREDIENTS  RECIPES  TOOLS ──╮   ⚙
│  LAVENDER SOAP (v7)             │
├─────────────────────────────────┤
│  INGREDIENT GRID                │  ▶ Live pH 7.3
│  • Water...........240 ml       │
│  • Castile...........30 ml      │
│  • NaOH...............2.1 g     │
│                                 │
│  STEP TRACKER 1/4 ▸             │
│  ▶ Heat oils to 45 °C           │
│  ▶ Blend until trace            │
╰─────────────────────────────────╯
```

#### Mobile Swipe Notes

*   Hackers: nav drawer slides from **left**, logs tray up, side‑info drawer absent.
*   Matrix: nav overlays viewport like VT100 pop‑up, swipe right to close.
*   Cyberpunk: both nav and side‑info slide in with **3D rotation** and holo glitch.

---

## 18. Accessibility & Motion Policy

[policy text retained]

---

## 19. Theme‑Specific Motion & SFX Catalog

[section retained]

---

## 20. Module On‑Boarding Blueprint

> Ensure every future module (e.g., Supplement Tracker, Meal Planner) docks into the console UI & theme system with minimal friction.

### 20.1 Grid Claim Protocol

1.  Each module exports a `meta.json` with a `sizeHint`: `"side" | "main" | "full"`.
2.  Console orchestrator reads hints and assigns grid areas at mount:\
    *`side`*\* → occupies `<aside>` by default; if busy, moves to dynamic tile.\*
3.  Modules signal priority via `data-priority` attr (0–2) so the orchestrator can decide which tile to evict on small screens.

### 20.2 Theme Compliance Checklist

| Requirement                                                  | How to verify                         |
| ------------------------------------------------------------ | ------------------------------------- |
| Uses semantic color utilities (`bg-surface`, `text-primary`) | Storybook theme toggle visual diff    |
| Animations reference motion tokens                           | `context7 validate --animations` lint |
| Synth interactions routed through `playSfx()`                | Jest mock ensures correct patch name  |

### 20.3 Accessibility Hooks

-   Module must expose `role="region" aria-label="<name>"` for landmark navigation.
-   Provide `focusWithin` outline override so keyboard users can cycle between tiles.

### 20.4 Boilerplate Snippet (non-code view)

*Modules embed a **`<ConsoleTile>`** wrapper so CSS grid rules apply automatically.*

---

## 21. Performance & QA Benchmarks

> Keep the console snappy as we layer themes, motion, and modules.

| Metric                           | Target                           | Measurement Tool                                             |
| -------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| First Contentful Paint (desktop) | < 1.8 s                          | Lighthouse CI in GitHub Actions                              |
| Main‑thread idle (10 s idle)     | ≥ 85 %                           | Chrome DevTools `Performance` + custom Jest puppeteer script |
| Animation frame drops            | < 2 drops per 30 s               | `web-vitals` `CLS` + RUM collector                           |
| JavaScript bundle (gzipped)      | ≤ 250 kB initial, lazy‑load rest | `webpack-bundle-analyzer` action                             |
| Audio context unlock time        | < 120 ms after user gesture      | Cypress e2e test                                             |

### QA Gates

1.  **Visual Regression** – Chromatic diff on theme toggle & reduced motion.
2.  **A11y Audit** – Axe-core zero criticals; color contrast AA.
3.  **Context7 Drift** – validate step shows zero deprecated API use.

---

## 22. Future Enhancement Backlog (High‑Level)

[backlog table retained]

---

## 23. Inventory Enrichment & AI Iteration System

[section content preserved]

---

## 24. Inventory UI & Interaction Flow

> High‑level screens (no pixel spec) showing how users add supplier links and review AI‑enriched data.

### 24.1 “Add Ingredient” Modal

| Step | Element              | Purpose                                                                                             |
| ---- | -------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | URL input (paste)    | Accept Amazon/e‑commerce link.                                                                      |
| 2    | “Fetch” button       | Triggers ingest workflow. Shows progress spinner.                                                   |
| 3    | Preview card         | Displays scraped name, image, pkg size, price.                                                      |
| 4    | Enrichment checklist | 🔄 icons show INCI, CAS, density, usage rate as they appear. Missing items get ✎ manual edit links. |
| 5    | “Add to Global” CTA  | Disabled until required fields complete.                                                            |

**Side panel**: AI chat snippet summarises ingredient function + recommended % usage.

### 24.2 Ingredient Card States

| Card Badge        | Meaning                                         |
| ----------------- | ----------------------------------------------- |
| ✅ “Complete”      | All chemMeta fields populated.                  |
| 🚧 “Needs Review” | AI confidence < 0.8 or manual override flagged. |
| ⚠️ “Price Alert”  | Supplier price increased > 15 % vs last cache.  |

### 24.3 Batch Iteration Drawer

Slides from right when “AI Draft” present. Shows side‑by‑side diff: **v7** vs **Draft v8** with inline comments (why each % changed). Accepting creates new recipe version.

---

## 25. Data Model Snapshot (Supabase)

| Table                | Key Columns                                                         | Notes                       |
| -------------------- | ------------------------------------------------------------------- | --------------------------- |
| `ingredients`        | `id`, `name`, `inci`, `category`, `chemMeta JSONB`                  | Global master list.         |
| `suppliers`          | `id`, `ingredient_id`, `url`, `price`, `package_size`, `last_check` | One‑to‑many per ingredient. |
| `recipes`            | `id`, `version`, `parent_id`, `feedback JSONB`                      | Version tree.               |
| `recipe_ingredients` | `recipe_id`, `ingredient_id`, `percentage`, `phase`                 | Join table.                 |
| `ai_suggestions`     | `recipe_id`, `suggestion JSONB`, `status`                           | Draft + rationale.          |

All tables RLS‑protected per user/org. JSONB columns store GPT output for traceability.

---

## 26. Module Backlog Integration Matrix

[section retained]

---

## 27. Roo Code Agent Orchestration Guidelines

> Optimize cost by maximizing low‑cost **ask** and **code** agent usage while delegating orchestration to higher‑tier models only when necessary.

### 27.1 Agent Roles & Cost Tier

| Agent          | Typical Model Tier | Intended Scope                                          |
| -------------- | ------------------ | ------------------------------------------------------- |
| **architect**  | $$$ (premium)      | High‑level design decisions, architecture trade‑offs. |
| **orchestrator** | $$                 | Task routing, context aggregation, progress logging.    |
| **debug**      | $$                 | Deep dives on failing tests, stack traces.              |
| **ask**        | $                  | Quick Q&A, doc lookup via Context 7, definition clarifications. |
| **code**       | $                  | Atomic code-gen or refactor diffs (< 50 LOC) with tests. |

### 27.2 Workflow Directives

1.  **Default to `ask` for any doc lookup or “how do I…?”**\
    *In‑prompt example*: `// @ask:tailwind – What is the syntax for new arbitrary variants?`
2.  **Use `code` for one‑shot deltas** – e.g., generate a Tailwind plugin snippet or add tests to a single file.\
    Orchestrator approves patch and commits.
3.  **Escalate to `debug` only when CI fails** and root‑cause is non‑trivial (requires stack trace reasoning).\
4.  **Reserve `architect` sessions** for quarterly refactor proposals, schema redesigns, or cross‑module dependency debates.
5.  **Orchestrator throttles expensive agents** – budget log: allow max 2 architect calls & 4 debug calls per sprint. Remaining tickets must use ask/code.
6.  **Agents report via comments** – ask/code append a `// @orchestrator: done (commit <hash>)` footer so orchestrator logs completion.

### 27.3 Template Snippets

```ts
// @ask:context7:supabase-js@latest – How to filter by foreign key?
```

```ts
// @code:patch
// file: src/lib/useRecipes.ts
// goal: add optimistic update with immer produce
```

---