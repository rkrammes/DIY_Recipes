'use client';

import React, { useEffect, useState } from 'react';
import SettingsPanel from '@/Settings';
import { UserPreferencesProvider } from '@/Settings/providers/UserPreferencesProvider';
import TerminalSettingsWrapper from '@/Settings/components/TerminalSettingsWrapper';
import { useEnvironment } from '@/hooks/useEnvironment';

export default function SettingsPage() {
  const { uiMode } = useEnvironment();
  const [mounted, setMounted] = useState(false);

  // Use useEffect to handle the client-side detection of UI mode
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a basic loading UI until we can determine the UI mode on the client
  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-accent">Loading settings...</div>
      </div>
    );
  }

  // Render with the appropriate wrapper based on UI mode
  return (
    <UserPreferencesProvider>
      {uiMode === 'terminal' ? (
        <TerminalSettingsWrapper>
          <SettingsPanel />
        </TerminalSettingsWrapper>
      ) : (
        <SettingsPanel />
      )}
    </UserPreferencesProvider>
  );
}