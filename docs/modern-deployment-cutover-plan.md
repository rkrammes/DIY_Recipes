# Modern DIY Recipes - Vercel Production Cutover Plan

**Status:** Deferred - To be executed *only* when `modern-diy-recipes` development is complete and ready for production.

**Goal:** Replace the currently deployed old Express.js application with the new Next.js application (`modern-diy-recipes`) on the production Vercel environment.

## Pre-requisites

*   `modern-diy-recipes` application code is finalized, tested (via preview deployments or locally), and ready for production.
*   The code is merged into the Git branch designated for production deployments (e.g., `main`).

## Cutover Steps

1.  **Update Vercel Project Settings:**
    *   Access the Vercel project dashboard for DIY Recipes.
    *   Navigate to **Settings > General**.
    *   Change **Root Directory** to `DIY_Recipes/modern-diy-recipes`.
    *   Verify **Framework Preset** automatically updates to "Next.js".
    *   Confirm **Build Command** (e.g., `next build`) and **Output Directory** (`.next`) are correct.
    *   Save changes.

2.  **Verify Production Environment Variables:**
    *   Navigate to **Settings > Environment Variables**.
    *   Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` have the correct values specifically for the **Production** environment.
    *   Remove any legacy environment variables no longer needed by the new application from the Production scope.

3.  **Trigger Production Deployment:**
    *   Ensure the final, approved code is present in the production branch (e.g., `main`).
    *   The push to this branch (or a manual re-deploy triggered after settings changes) will initiate the production build using the new configuration.

4.  **Monitor and Verify:**
    *   Monitor the deployment progress in the Vercel dashboard.
    *   Once the deployment state is `READY`, access the production domain.
    *   Perform essential checks: application loads, login works, core features are functional, no console errors.