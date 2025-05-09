'use client';

import React from 'react';
import SettingsPanel from '@/Settings';
import { UserPreferencesProvider } from '@/Settings/providers/UserPreferencesProvider';

export default function SettingsPage() {
  return (
    <UserPreferencesProvider>
      <SettingsPanel />
    </UserPreferencesProvider>
  );
}