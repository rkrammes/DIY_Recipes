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
    <aside className="w-full sm:w-64 md:w-72 border-l border-[var(--border-subtle)] p-4 md:p-6 flex flex-col gap-6 h-full overflow-y-auto bg-[var(--surface-0)] text-[var(--text-primary)]"> {/* Responsive width, padding, full height, added theme styles */}
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>

      <section>
        <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Authentication</h3>
        {loading ? (
          <p className="text-[var(--text-secondary)]">Loading...</p>
        ) : user ? (
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-[var(--text-secondary)] truncate">{user.email}</Label> {/* Use Label, add truncate */}
            <Button variant="outline" onClick={() => signOut()} className="border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-1)]"> {/* Added theme styles */}
              Log Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="default" onClick={handleMagicLink} className="bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"> {/* Added theme styles */}
              Send Magic Link
            </Button>
            {error && <p className="text-[var(--error)]">{error}</p>}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Theme</h3>
        <Button variant="outline" onClick={toggleTheme} className="w-full justify-center border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-1)]"> {/* Make button full width, added theme styles */}
          Switch to {getNextThemeName(theme)}
        </Button>
      </section>
    </aside>
  );
}