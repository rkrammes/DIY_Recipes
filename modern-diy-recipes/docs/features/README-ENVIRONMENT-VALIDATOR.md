# Environment Validator Implementation

This document explains the Environment Validator implementation in the Kraft AI application.

## Overview

The Environment Validator system provides a comprehensive approach to:

1. **Configuration Validation** - Ensure required environment variables are set correctly
2. **Feature Flag Management** - Centralized feature flag checking
3. **UI Mode Detection** - Consistent determination of the current UI mode
4. **Development Tools** - Development utilities for environment debugging

## Key Components

### 1. Core Validator Module

Location: `/src/lib/environmentValidator.ts`

This module is the heart of the validation system, providing:

- Environment variable validation
- Feature flag checking
- UI mode detection
- Environment status reporting

Key functions:
- `validateClientEnvironment()` - Validates client-side environment variables
- `validateServerEnvironment()` - Validates server-side environment variables
- `isFeatureEnabled(featureName)` - Checks if a feature flag is enabled
- `getEnvironmentStatus()` - Gets detailed environment information
- `getUiMode()` - Determines the current UI mode

### 2. Supabase Configuration

Location: `/src/lib/supabaseConfig.ts`

This module integrates with the environment validator for Supabase configuration:

- TypeScript implementation for better type safety
- Security checks for service role keys
- Feature detection for Supabase capabilities
- Fallback configuration for development

### 3. React Hook

Location: `/src/hooks/useEnvironment.ts`

This hook provides React components with access to environment configuration:

- Access to environment status
- Feature flag checking in components
- Environment validation
- UI mode and theme information

### 4. UI Components

- `/src/components/EnvironmentStatus.tsx` - Debug panel component
- `/src/Settings/components/SystemInfo.tsx` - System information including environment

### 5. CLI Tool

Location: `/scripts/check-env.js`

A command-line tool for validating the environment configuration:

- Validates all required environment variables
- Checks for feature flag conflicts
- Reports on enabled features
- Colorized output for better readability

### 6. API Endpoint

Location: `/src/app/api/environment/status/route.ts`

An API endpoint for checking environment status programmatically:

- Returns current environment status
- Validates configuration
- Only available in development mode

## Using the Environment Validator

### Checking Feature Flags

```typescript
import { isFeatureEnabled } from '@/lib/environmentValidator';

// Simple feature check
if (isFeatureEnabled('recipe-versioning')) {
  // Show recipe versioning UI
}

// Module-specific feature
if (isFeatureEnabled('settings:dark-mode')) {
  // Enable dark mode in settings
}
```

### Using the React Hook

```tsx
import { useEnvironment } from '@/hooks/useEnvironment';

function EnvironmentAwareComponent() {
  const env = useEnvironment();
  
  return (
    <div>
      <h1>Current Theme: {env.theme}</h1>
      
      {env.isFeatureEnabled('audio') && (
        <AudioControls />
      )}
      
      {env.isDevelopment && (
        <DevTools />
      )}
    </div>
  );
}
```

### Running the CLI Validator

```bash
# Run the environment validator
node scripts/check-env.js

# Run with the startup script for full validation
./start-with-environment-validator.sh
```

### Adding the Debug Panel

```tsx
import EnvironmentStatus from '@/components/EnvironmentStatus';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <EnvironmentStatus />
    </div>
  );
}
```

## Integration with Supabase

The environment validator is tightly integrated with the Supabase configuration:

1. **Security Checks**:
   - Detects if a service role key is accidentally used as an anon key
   - Warns about potential security issues

2. **Feature Detection**:
   - Determines which Supabase features are available based on configuration
   - Provides fallbacks in development mode

3. **Validation**:
   - Ensures that required Supabase configuration is present
   - Provides helpful error messages for misconfiguration

## Additional Features

### UI Mode Detection

The system can determine the current UI mode:

```typescript
import { getUiMode } from '@/lib/environmentValidator';

// Returns 'terminal', 'document', or 'standard'
const currentMode = getUiMode();
```

This is determined by:
1. First checking the `NEXT_PUBLIC_UI_MODE` environment variable
2. Then checking feature flags (terminal-ui, document-mode)
3. Falling back to 'standard' if nothing is specified

### Development Features

In development mode, the system provides:

1. **Fallbacks** for missing configuration
2. **Debug UI** for viewing environment status
3. **Validation** with helpful error messages
4. **API endpoint** for programmatic status checking

## Documentation

Comprehensive documentation is available in:

- `/docs/ENVIRONMENT_CONFIGURATION_GUIDE.md` - User guide for environment configuration
- `/docs/ENVIRONMENT_VALIDATOR_COMPLETED.md` - Technical implementation details
- `.env.example` - Example environment configuration with explanations

## Getting Started

To use the environment validator:

1. Copy `.env.example` to `.env.local` and update with your configuration
2. Run the validator: `node scripts/check-env.js`
3. Start the application with the validation script: `./start-with-environment-validator.sh`
4. Access the environment status panel in development mode

## Security Considerations

The environment validator helps improve security by:

1. Ensuring sensitive keys (like service role keys) are not exposed in client code
2. Validating that required security configuration is present
3. Providing clear warnings about potential security issues
4. Keeping sensitive configuration in server-side environments only