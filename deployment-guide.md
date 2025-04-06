# DIY Recipes Vercel Deployment Guide

## Overview
This guide details deploying the DIY Recipes app (Express.js + Supabase) on Vercel, ensuring correct routing and environment configuration.

---

## Environment Variables
Set these in Vercel Dashboard under **Project > Settings > Environment Variables**:

- `SUPABASE_URL` — Your Supabase project URL (e.g., `https://xyzcompany.supabase.co`)
- `SUPABASE_KEY` — Your Supabase service role or anon key

Optional:
- `PORT` — Typically ignored by Vercel but can be set to `3000`

---

## Deployment Steps

1. **Connect Repository**
   - Link your GitHub/GitLab repo to Vercel.
2. **Configure Environment Variables**
   - Add the variables listed above.
3. **Check Build Settings**
   - No build command needed (`@vercel/node` handles serverless build).
   - Output directory: leave empty.
4. **Custom Domains**
   - Add domains like `symbolkraft.com`.
   - Ensure DNS is configured per Vercel instructions.
5. **Trigger Deployment**
   - Push to the `main` branch or deploy manually.

---

## Routing Behavior

- `/api/*` routes proxy to Express server.
- Static assets (`/js/*`, `/public/*`, `/favicon.ico`) served as static files.
- All other routes fallback to Express for SSR or SPA routing.
- 404s on valid routes indicate misconfigured rewrites or missing assets.

---

## Deployment Checklist

- [ ] Supabase credentials added to environment variables
- [ ] Custom domains configured and verified
- [ ] Static files load correctly (CSS, JS, images)
- [ ] API endpoints respond as expected
- [ ] SPA navigation works without 404s
- [ ] SSL active on all domains
- [ ] No console errors on initial page load

---

## Troubleshooting

- **404 errors:** Check rewrites in `vercel.json` and ensure routes are handled by Express.
- **Supabase errors:** Verify environment variables.
- **Static assets missing:** Confirm files exist in `/public` or `/js` directories.

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.io/docs)