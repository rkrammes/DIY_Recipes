# Current State Backup - DIY Recipes Application

## Captured: January 22, 2025

### Server Configuration
- **Running on**: http://localhost:3000/
- **Process**: Next.js v15.3.0 (PID: 24212)
- **Start Script**: `verified-start-3000.sh`
- **Environment**:
  - `NEXT_PUBLIC_SUPABASE_URL`: https://bzudglfxxywugesncjnz.supabase.co
  - `NEXT_PUBLIC_USE_MOCK_DATA`: false
  - `NEXT_PUBLIC_SUPABASE_NO_MOCK_DATA`: true

### Available Routes (All returning HTTP 200)
- `/` - Main page
- `/terminal` - Terminal interface
- `/recipes` - Recipe listing
- `/settings` - Settings page
- `/formula-database` - Formula database

### Current Issues
- Server-side rendering failing with "BAILOUT_TO_CLIENT_SIDE_RENDERING" error
- This is due to next/dynamic imports with MCP SDK on client side
- Despite SSR errors, the app is functioning on client side

### Theme System
- Three themes available: `hackers`, `dystopia`, `neotopia`
- Theme is stored in localStorage
- Theme script runs before React hydration to prevent FOUC

### Font Loading
- Preloading fonts: JetBrainsMono, IBM VGA, Share Tech Mono
- Custom font server configuration in place

### Key Features to Preserve
1. **Multi-interface support**: Terminal and Document interfaces
2. **Theme switching**: Three distinct themes with proper persistence
3. **Recipe management**: Full CRUD operations
4. **Settings panel**: Configuration options
5. **Formula database**: Advanced recipe formulation
6. **Supabase integration**: Real data access (not mock data)

### Critical Files Not to Break
- `src/providers/ThemeProvider.tsx` - Theme management
- `src/providers/AuthProvider.tsx` - Authentication
- `src/hooks/useSupabase.ts` - Database access
- Routes in `src/app/*` - All page components

### Next Steps
Before making any changes:
1. ✅ Server is running and accessible
2. ✅ All routes are functional
3. ✅ Theme system is working
4. ✅ Supabase is connected with real data
5. ⚠️ SSR is broken due to MCP client imports (needs fixing)

This backup serves as a reference point. Any changes should maintain or improve upon this functionality.