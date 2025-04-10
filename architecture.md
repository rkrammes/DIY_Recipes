## Phase 4: Component Migration Planning

This phase focuses on migrating the existing UI components and application logic from the current JavaScript/jQuery-based implementation into a modular, maintainable React + Next.js + TypeScript architecture.

### Migration Approach

- **Incremental Rewrite** inside the new Next.js app, instead of a direct port.
- Prioritize **core features** needed for personal use first (viewing, searching, editing DIY recipes).
- Use **temporary adapters** if necessary to reuse existing plain JS logic during transition.
- Leverage **TypeScript** for better safety, but allow gradual adoption (`allowJs: true`).
- Use **Supabase client** for data fetching, replacing any old AJAX calls.

### Component Breakdown Plan

| Legacy File(s)                | New React Component(s)                          | Notes                                                                                     |
|-------------------------------|-------------------------------------------------|-------------------------------------------------------------------------------------------|
| `index.html`                  | `app/page.tsx` + layout                        | Initial landing page layout                                                               |
| `recipe-renderer.js`          | `<RecipeDetails />`                            | Displays full DIY recipe details                                                          |
| `recipe-list-ui.js`           | `<RecipeList />`                               | List/search/filter of recipes                                                             |
| `recipe-iteration.js`         | `<RecipeVersionHistory />`                     | (Optional) Version history for a recipe                                                   |
| `recipe-actions.js`           | Supabase mutations/hooks                       | Replace imperative JS functions with React hooks + Supabase                               |
| `ui.js`, `main.js`            | Various components, app layout, and hooks      | Break into smaller components and hooks                                                   |
| `settings-ui.js`              | `<SettingsPanel />`                            | User preferences/settings                                                                 |
| `auth-ui.js`, `auth.js`       | `<AuthForm />`, use Supabase Auth hooks        | Supabase Auth integration                                                                 |
| `app-store.js`                | Zustand or React Context store                 | Replace global JS state with modern React state management                                |
| `error-handler.js`, `ui-error-boundary.js` | `<ErrorBoundary />`                      | React error boundaries                                                                    |

### State Management

- Use **Zustand** or **React Context** for centralized app state (user session, selected recipe, UI state).
- Avoid Redux complexity for this personal tool.
- Replace `app-store.js` with idiomatic hooks.

### API Integration

- Replace all `fetch`/AJAX calls with **Supabase client** methods.
- Encapsulate API logic in **custom React hooks** (e.g., `useRecipes`, `useRecipe`, `useUserSession`).

### Styling

- Use **Tailwind CSS** for all new components.
- Gradually port or rewrite existing CSS as Tailwind classes.
- Avoid jQuery DOM manipulation; rely on React state and props.

### Testing

- Write **unit tests** for components and hooks using React Testing Library.
- Adapt existing Jest tests where feasible.
- (Optional) Maintain or rewrite Puppeteer tests for E2E flows.

### Migration Sequence

1. Scaffold Next.js app and set up environment (done in Phase 3).
2. Create **basic layout** and **routing** (`app/layout.tsx`, `app/page.tsx`).
3. Migrate **authentication** (Supabase Auth).
4. Migrate **recipe list** view.
5. Migrate **recipe detail** view.
6. Migrate **editing/creation** flows.
7. Migrate **settings** panel.
8. Migrate **version history** (optional).
9. Clean up legacy code and remove adapters.

---

*(Further architectural details and migration notes will be added as needed.)*
