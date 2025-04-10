import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../providers/ThemeProvider';

export default function SettingsPanel() {
  const { user, loading, error, signInWithMagicLink, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleMagicLink = async () => {
    const email = prompt('Enter your email for magic link login:');
    if (email) {
      await signInWithMagicLink(email);
    }
  };

  return (
    <aside className="w-full max-w-xs border-l border-gray-300 dark:border-gray-700 p-4 flex flex-col gap-6">
      <h2 className="text-lg font-bold">Settings</h2>

      <section>
        <h3 className="font-semibold mb-2">Authentication</h3>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex flex-col gap-2">
            <span>{user.email}</span>
            <button className="btn border p-2 rounded" onClick={() => signOut()}>
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button className="btn border p-2 rounded" onClick={handleMagicLink}>
              Send Magic Link
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold mb-2">Theme</h3>
        <button className="btn border p-2 rounded" onClick={toggleTheme}>
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </section>
    </aside>
  );
}