# DIY Recipes Developer Guide

This guide provides information for developers maintaining or extending the modernized DIY Recipes system, built with Next.js, React, TypeScript, and Supabase.

## Project Setup

1.  **Clone Repository:**
    ```bash
    git clone <repository-url>
    cd DIY_Recipes/modern-diy-recipes # Assuming the Next.js project is here
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    -   Copy the example environment file: `cp .env.example .env.local`
    -   Populate `.env.local` with your Supabase project URL and anon key, and any other required credentials. Obtain these from your Supabase project settings.
    ```plaintext
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # Add other variables as needed
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:3000`.

## Tech Stack Overview

-   **Framework:** Next.js 15.3
-   **UI Library:** React 19
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS 4
-   **Backend & Auth:** Supabase (Postgres database, Authentication, APIs)
-   **MCP Servers:**
    -   GitHub (Official): Repository management, CI/CD integration.
    -   Supabase (Custom): Database interactions, specific backend tasks.
    -   (Potentially others like Next.js/TS, Vercel for scaffolding/deployment)

## Folder Structure (Key Directories)

```
/modern-diy-recipes
├── /src
│   ├── /app                 # Next.js App Router structure
│   ├── /components          # Reusable React components
│   │   └── /auth            # Authentication-specific components
│   ├── /hooks               # Custom React hooks (e.g., useAuth, useRecipes)
│   ├── /lib                 # Core libraries, utilities (e.g., supabase.ts)
│   ├── /providers           # React Context providers (e.g., AuthProvider, ThemeProvider)
│   └── /styles              # Global styles, Tailwind config
├── /public                # Static assets
├── /tests                 # Automated tests (e.g., Jest, RTL)
├── .env.local             # Local environment variables (DO NOT COMMIT)
├── .env.example           # Example environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```
*(Note: Structure might evolve. Refer to the actual codebase for the most current layout.)*

## Key Modules/Components

-   **Authentication:**
    -   Handled via Supabase Auth.
    -   `AuthProvider` (`/src/providers`): Manages auth state using React Context.
    -   `useAuth` (`/src/hooks`): Hook to access auth state and functions (login, logout, signup).
    -   Protected Routes: Implemented using Next.js Middleware (`middleware.ts` in root or `/src`).
    -   Auth UI: Components in `/src/components/auth`.
-   **Supabase Client:**
    -   Initialized in `/src/lib/supabase.ts`.
    -   Used by API routes and potentially client-side hooks for data fetching.
-   **API Layer:**
    -   Located in `/src/app/api` (using App Router route handlers).
    -   Handles requests from the frontend, interacts with Supabase.
    -   Strongly typed using TypeScript interfaces.
-   **UI Components:**
    -   Core components like `RecipeList`, `RecipeDetails`, `SettingsPanel` located in `/src/components`.
    -   Utilize Tailwind CSS for styling.
-   **Theming:**
    -   `ThemeProvider` (`/src/providers`): Manages light/dark mode state.
    -   Uses CSS variables and Tailwind's dark mode variant. Preference stored (e.g., in localStorage).

## State Management

-   **Authentication:** Managed globally via React Context (`AuthProvider`).
-   **UI State:** Primarily managed locally within components using `useState` and `useEffect`.
-   **Server Cache/Data Fetching:** Potentially using Next.js caching or libraries like SWR/React Query (check implementation details). Custom hooks (`useRecipes`, `useRecipe`) encapsulate data fetching logic.

## Testing Strategy

-   **Unit/Integration Tests:** Jest and React Testing Library are likely used (inferred from `/tests` and `__tests__` directories).
-   **Goal:** Increase test coverage across components, hooks, and API routes.
-   Refer to `TESTING.md` (if available) or existing test files for specific patterns.

## Deployment

-   **Platform:** Vercel (inferred from `vercel.json` and MCP server setup).
-   **Process:** Likely automated via Git push to the main branch, managed by Vercel's GitHub integration.
-   **Environment Variables:** Production environment variables must be configured in the Vercel project settings.
-   **MCP Integration:** The Vercel MCP server can potentially automate deployment tasks and status checks.

## MCP Server Integration

-   The project utilizes MCP servers for various development and operational tasks.
-   **GitHub:** Used for source control operations, potentially CI/CD triggers.
-   **Supabase (Custom):** Used for direct database interactions or management tasks not covered by the standard Supabase client.
-   Refer to `mcp-integration-plan.md` and `mcp-server-verification.md` for more details on setup and usage.