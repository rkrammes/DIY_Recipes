# Environment Configuration Guide

This guide explains how environment variables should be set up and used in the DIY Formulations application. It covers the new environment validation system which centralizes feature flag management and environment checking.

## Quick Start

1. Copy `.env.example` to `.env.local` in the project root
2. Fill in the actual values for your environment
3. Start the application with `npm run dev` or use a specialized start script

## Client-Side vs. Server-Side Variables

### Client-Side Variables

- Must be prefixed with `NEXT_PUBLIC_`
- Are accessible in the browser
- Should never contain sensitive information
- Example: `NEXT_PUBLIC_SUPABASE_URL`

### Server-Side Variables

- Not prefixed with `NEXT_PUBLIC_`
- Only accessible in server-side code (API routes, server components)
- Can contain sensitive information
- Example: `SUPABASE_SERVICE_ROLE_KEY`

## Required Environment Variables

### Supabase Configuration

| Variable | Required | Client/Server | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client | The URL of your Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client | Anon/public key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server | Service role key for admin operations |

### UI Configuration

| Variable | Required | Client/Server | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_UI_MODE` | No | Client | UI mode: `terminal`, `document`, etc. |
| `NEXT_PUBLIC_DEFAULT_THEME` | No | Client | Default theme: `hackers`, `dystopia`, `neotopia` |
| `NEXT_PUBLIC_AUDIO_ENABLED` | No | Client | Enable audio effects |

### Feature Flags

| Variable | Required | Client/Server | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_ENABLE_MODULES` | No | Client | Enable modular architecture |
| `NEXT_PUBLIC_ENABLE_RECIPE_VERSIONING` | No | Client | Enable recipe version tracking |
| `NEXT_PUBLIC_USE_FALLBACK_DATA` | No | Client | Use mock data when database unavailable |
| `NEXT_PUBLIC_AUDIO_ENABLED` | No | Client | Enable audio feedback and effects |
| `NEXT_PUBLIC_TERMINAL_UI_ENABLED` | No | Client | Enable terminal-style UI mode |
| `NEXT_PUBLIC_DOCUMENT_MODE_ENABLED` | No | Client | Enable document-centric interface |
| `NEXT_PUBLIC_ANIMATIONS_ENABLED` | No | Client | Enable UI animations |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | Client | Use mock data instead of real data |
| `NEXT_PUBLIC_DEBUG_MODE` | No | Client | Enable additional debug information |
| `NEXT_PUBLIC_MCP_ENABLED` | No | Client | Enable Context7 MCP integration |

### Development Settings

| Variable | Required | Client/Server | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_AUTO_DEV_LOGIN` | No | Client | Auto-login for development |
| `NEXT_PUBLIC_DEV_USER_EMAIL` | No | Client | Email for development user |

## Environment Loading

Environment variables are loaded in this order:

1. Next.js built-in environment variables
2. `.env` (shared environment)
3. `.env.local` (local overrides, not checked into git)
4. `.env.development` or `.env.production` (environment-specific)
5. `.env.development.local` or `.env.production.local` (local environment-specific)

## Development Mode

In development mode, the application provides fallback values when environment variables are missing. This helps developers start the application without setting up all variables. The new environment validator system helps properly manage these fallbacks.

However, these fallbacks:

1. Do not contain real credentials
2. Have limited functionality
3. May not work for all features
4. Should not be relied upon for testing

## Environment Validator System

The application now uses a centralized environment validator system in `src/lib/environmentValidator.ts`. Key features include:

1. **Feature Flag Management**: Use `isFeatureEnabled()` to check if features are enabled:

```typescript
import { isFeatureEnabled } from '@/lib/environmentValidator';

if (isFeatureEnabled('recipe-versioning')) {
  // Show recipe versioning UI
}
```

2. **Environment Status**: Get detailed information about the current environment:

```typescript
import { getEnvironmentStatus } from '@/lib/environmentValidator';

const status = getEnvironmentStatus();
console.log(`Running in ${status.environment} mode with theme ${status.theme}`);
```

3. **UI Mode Detection**: Determine the current UI mode (terminal, document, standard):

```typescript
import { getUiMode } from '@/lib/environmentValidator';

const uiMode = getUiMode();
// Returns 'terminal', 'document', or 'standard'
```

4. **Environment Validation**: Validate the environment configuration:

```typescript
import { validateClientEnvironment, validateFeatureFlags } from '@/lib/environmentValidator';

if (!validateClientEnvironment() || !validateFeatureFlags()) {
  // Show configuration error
}
```

## Best Practices

1. **Never commit `.env.local` to git**
   - It contains sensitive information
   - It's already in `.gitignore`

2. **Update `.env.example` when adding new variables**
   - Document the purpose of each variable
   - Use dummy values as examples

3. **Validate environment at runtime**
   - Check for required variables
   - Provide helpful error messages

4. **Use specific variable names**
   - Name variables clearly
   - Indicate their purpose and scope

5. **Document environment requirements**
   - List required variables in documentation
   - Explain when and how to set them

## Troubleshooting

### Missing Environment Variables

If you see errors like:

```
Error: Supabase URL and Anon Key are required
```

Check that you have:

1. Copied `.env.example` to `.env.local`
2. Filled in the actual values
3. Restarted the development server

### Environment Validation Tool

Use the included environment validation script to check your configuration:

```bash
node scripts/check-env.js
```

This will verify your environment setup and report any issues or conflicts.

### Debug Component

In development mode, you can use the EnvironmentStatus component to display environment information:

```tsx
import EnvironmentStatus from '@/components/EnvironmentStatus';

function MyLayout({ children }) {
  return (
    <div>
      {children}
      <EnvironmentStatus />
    </div>
  );
}
```

This adds a toggleable environment status panel in the corner of the screen.

### Supabase Connection Issues

If you see authentication errors:

1. Verify your Supabase URL and keys
2. Check that you're using the correct key type (anon vs service)
3. Ensure your Supabase project is active and accessible

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [12-Factor App: Config](https://12factor.net/config)
- [Feature Flags Best Practices](https://launchdarkly.com/blog/best-practices-feature-flags/)

## Related Project Files

- `src/lib/environmentValidator.ts` - Core environment validation system
- `src/lib/supabaseConfig.ts` - Supabase-specific configuration
- `src/lib/feature-flags.js` - Legacy feature flag system (used as fallback)
- `src/utils/environment-check.ts` - Environment checking utilities
- `src/components/EnvironmentStatus.tsx` - Debug UI for environment status
- `scripts/check-env.js` - CLI script to verify environment variables