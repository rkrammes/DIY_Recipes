'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeSettings from './components/ThemeSettings';
import AudioSettings from './components/AudioSettings';
import AuthSettings from './components/AuthSettings';
import UserProfileSettings from './components/UserProfileSettings';
import DeveloperSettings from './components/DeveloperSettings';
import SystemInfo from './components/SystemInfo';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferencesContext } from './providers/UserPreferencesProvider';
import { useEnvironment } from '@/hooks/useEnvironment';

export default function SettingsPanel() {
  const { isAuthenticated, user } = useAuth();
  const { preferences, loading } = useUserPreferencesContext();
  const { uiMode } = useEnvironment();

  // Only show developer settings for admin users
  const isAdmin = user?.role === 'admin';
  const isTerminal = uiMode === 'terminal';

  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="animate-pulse h-64 w-full bg-surface-2 rounded"></div>
      </div>
    );
  }

  // Terminal-specific styles
  const terminalStyles = {
    container: isTerminal ? 'p-0 w-full mx-0' : 'p-4 md:p-6 max-w-4xl mx-auto',
    header: isTerminal ? 'hidden' : 'flex justify-between items-center mb-6',
    tabs: isTerminal ? 'terminal-tabs' : 'w-full',
    tabsList: isTerminal
      ? 'grid grid-cols-3 md:grid-cols-6 mb-6 bg-surface-2 border border-border-subtle'
      : 'grid grid-cols-3 md:grid-cols-6 mb-6',
    tabsTrigger: isTerminal
      ? 'text-text-secondary hover:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent'
      : '',
    tabsContent: isTerminal
      ? 'p-0 border-0 rounded-none'
      : 'p-4 border rounded-md',
  };

  return (
    <div className={terminalStyles.container}>
      {/* Hide the header in terminal mode since it's already in the wrapper */}
      <div className={terminalStyles.header}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="text-sm text-text-secondary">
          {isAuthenticated ? 'Settings will be saved to your account' : 'Settings will be saved locally'}
        </div>
      </div>

      <Tabs defaultValue="theme" className={terminalStyles.tabs}>
        <TabsList className={terminalStyles.tabsList}>
          <TabsTrigger value="theme" className={terminalStyles.tabsTrigger}>Theme</TabsTrigger>
          <TabsTrigger value="audio" className={terminalStyles.tabsTrigger}>Audio</TabsTrigger>
          <TabsTrigger value="auth" className={terminalStyles.tabsTrigger}>Account</TabsTrigger>
          <TabsTrigger value="profile" className={terminalStyles.tabsTrigger}>Profile</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="developer" className={terminalStyles.tabsTrigger}>Developer</TabsTrigger>
          )}
          <TabsTrigger value="system" className={terminalStyles.tabsTrigger}>System</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className={terminalStyles.tabsContent}>
          <ThemeSettings />
        </TabsContent>

        <TabsContent value="audio" className={terminalStyles.tabsContent}>
          <AudioSettings />
        </TabsContent>

        <TabsContent value="auth" className={terminalStyles.tabsContent}>
          <AuthSettings />
        </TabsContent>

        <TabsContent value="profile" className={terminalStyles.tabsContent}>
          <UserProfileSettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="developer" className={terminalStyles.tabsContent}>
            <DeveloperSettings />
          </TabsContent>
        )}

        <TabsContent value="system" className={terminalStyles.tabsContent}>
          <SystemInfo />
        </TabsContent>
      </Tabs>
    </div>
  );
}