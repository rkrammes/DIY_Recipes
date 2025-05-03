import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from '@/components/ui/button'; // Use alias
import { Label } from '@/components/ui/label'; // Use alias
import type { Theme } from '../providers/ThemeProvider'; // Import Theme from ThemeProvider

export default function SettingsPanel() {
  const { user, loading, error, signInWithMagicLink, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleMagicLink = async () => {
    const email = prompt('Enter your email for magic link login:');
    if (email) {
      await signInWithMagicLink(email);
    }
  };

  // Helper function to get the next theme name for the button text
  const getNextThemeName = (currentTheme: Theme) => {
    if (currentTheme === 'synthwave-noir') return 'Terminal Mono';
    if (currentTheme === 'terminal-mono') return 'Paper Ledger';
    return 'Synthwave Noir';
  };

  return (
    <aside className="w-full sm:w-64 md:w-72 border-l border-subtle p-4 md:p-6 flex flex-col gap-6 h-full overflow-y-auto bg-surface text-text">
      <h2 className="text-xl font-bold">Settings</h2>

      <section>
        <h3 className="font-semibold mb-2">Authentication</h3>
        {loading ? (
          <p className="text-text-secondary">Loading...</p>
        ) : user ? (
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-text-secondary truncate">{user.email}</Label>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="border-subtle hover:bg-surface-1"
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              onClick={handleMagicLink}
              className="bg-accent text-text-inverse hover:bg-accent-hover"
            >
              Send Magic Link
            </Button>
            {error && <p className="text-alert-red">{error}</p>}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold mb-2">Theme</h3>
        <Button
          variant="outline"
          onClick={toggleTheme}
          className="w-full justify-center border-subtle hover:bg-surface-1"
        >
          Switch to {getNextThemeName(theme)}
        </Button>
      </section>
    </aside>
  );
}