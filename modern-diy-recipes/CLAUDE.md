# Project Memory for Claude Code

## Development Guidelines

1. Always use Context7 for documentation lookup before implementing features
2. Understand that Context7 is a development tool, not a runtime component
3. Use TodoWrite/TodoRead to track tasks consistently
4. Check documentation before implementing authentication features
5. Use environmentValidator for checking environment variables and feature flags

## Project Structure

- Context7 provides documentation access via useContext7Mcp hook
- Authentication is handled by the AuthProvider
- Feature flags are managed through the environmentValidator module

## Environment Configuration

The project uses a comprehensive environment validation system:

1. `/src/lib/environmentValidator.ts` - Core validation functionality
   - Validates environment variables
   - Provides feature flag checking
   - Integrates with existing feature-flags.js
   - Detects UI mode (terminal, document, standard)

2. `/src/lib/supabaseConfig.ts` - Configures Supabase connections
   - Uses environment validator for better error handling
   - Implements graceful fallbacks in development
   - TypeScript implementation for better type safety

3. Feature flags are controlled via:
   - Environment variables (NEXT_PUBLIC_* for client-side)
   - JavaScript configuration in feature-flags.js
   - TypeScript module-specific flags in modules/featureFlags.ts

4. Environment validation tools:
   - `/src/hooks/useEnvironment.ts` - React hook for environment state
   - `/src/components/EnvironmentStatus.tsx` - Debug panel component
   - `/scripts/check-env.js` - CLI validation tool
   - `/src/app/api/environment/status/route.ts` - API endpoint

## Environment Usage Examples

1. Feature flag checking:
```typescript
import { isFeatureEnabled } from '@/lib/environmentValidator';

if (isFeatureEnabled('recipe-versioning')) {
  // Show versioning UI
}
```

2. React hook usage:
```typescript
import { useEnvironment } from '@/hooks/useEnvironment';

function Component() {
  const env = useEnvironment();

  return env.isFeatureEnabled('audio')
    ? <AudioEnabledUI />
    : <StandardUI />;
}
```

3. Environment validation:
```typescript
import { validateClientEnvironment } from '@/lib/environmentValidator';

if (!validateClientEnvironment()) {
  console.error('Missing required environment variables');
}
```

## Security Best Practices

1. Never expose service role keys in client-side code
2. Use environment validator to ensure proper configuration
3. Implement graceful fallbacks in development mode only
4. Keep sensitive configuration in server-side environments only
5. Check feature flags before enabling security-sensitive features