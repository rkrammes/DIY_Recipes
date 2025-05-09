# Settings Module

This module provides a comprehensive settings system for the application, with persistent preferences stored in Supabase.

## Features

- **Theme Settings**: Choose between Hackers, Dystopia (Matrix), and Neotopia (TRON) themes
- **Audio Settings**: Toggle sound effects and adjust volume
- **Authentication Settings**: Manage user login and account security
- **User Profile Settings**: Customize avatar, display name, and color
- **Developer Options**: Debug mode and experimental features (admin only)
- **System Information**: View application status and diagnostics

## Database Integration

User preferences are stored in the `user_preferences` table in Supabase, with automatic synchronization between devices when the user is authenticated. When not authenticated, preferences fall back to localStorage.

## Setup

1. Create the `user_preferences` table in Supabase by running:

```bash
node src/Settings/setup-preferences-table.js
```

2. Add the UserPreferencesProvider to your application:

```jsx
// In your app layout or main component
import { UserPreferencesProvider } from '@/Settings/providers/UserPreferencesProvider';

export default function AppLayout({ children }) {
  return (
    <UserPreferencesProvider>
      {children}
    </UserPreferencesProvider>
  );
}
```

3. Use the settings components:

```jsx
import SettingsPanel from '@/Settings';

export default function SettingsPage() {
  return <SettingsPanel />;
}
```

## Authentication Integration

The settings module uses the existing `useAuth` hook to access user information and status. Settings are automatically tied to the currently authenticated user when logged in.

## Theme Hook Usage

Access the theme and other preferences from any component:

```jsx
import { useUserPreferencesContext } from '@/Settings/providers/UserPreferencesProvider';

function MyComponent() {
  const { theme, audioEnabled, setTheme, setAudioEnabled } = useUserPreferencesContext();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('hackers')}>Switch to Hackers Theme</button>
      <button onClick={() => setAudioEnabled(!audioEnabled)}>
        {audioEnabled ? 'Disable' : 'Enable'} Sound
      </button>
    </div>
  );
}
```

## Database Schema

The `user_preferences` table has the following schema:

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Theme preferences
  theme TEXT DEFAULT 'hackers',
  audio_enabled BOOLEAN DEFAULT false,
  volume DECIMAL DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1),
  
  -- User preferences
  default_view TEXT DEFAULT 'formulations',
  avatar TEXT,
  display_name TEXT,
  color TEXT,
  
  -- Developer options
  debug_mode BOOLEAN DEFAULT false,
  show_experimental BOOLEAN DEFAULT false,
  
  -- Create a unique constraint to ensure only one preferences record per user
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);
```

## Adding New Settings

To add new preferences:

1. Add the new field to the `user_preferences` table schema
2. Update the `UserPreferences` interface in `useUserPreferences.ts`
3. Create a new component or update an existing one to manage the preference
4. Use the `updatePreferences` function to save changes

## Performance Considerations

- Preferences are cached locally for performance and offline access
- Real-time subscription is used to keep preferences in sync across tabs/devices
- Default values are used when preferences are not yet set

## Security

- Row-Level Security (RLS) policies ensure users can only access their own preferences
- Admin access to all preferences is handled through server-side API endpoints