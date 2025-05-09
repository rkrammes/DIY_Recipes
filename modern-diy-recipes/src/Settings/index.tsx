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

export default function SettingsPanel() {
  const { isAuthenticated, user } = useAuth();
  const { preferences, loading } = useUserPreferencesContext();
  
  // Only show developer settings for admin users
  const isAdmin = user?.role === 'admin';
  
  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="animate-pulse h-64 w-full bg-surface-2 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="text-sm text-text-secondary">
          {isAuthenticated ? 'Settings will be saved to your account' : 'Settings will be saved locally'}
        </div>
      </div>
      
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="auth">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="developer">Developer</TabsTrigger>
          )}
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme" className="p-4 border rounded-md">
          <ThemeSettings />
        </TabsContent>
        
        <TabsContent value="audio" className="p-4 border rounded-md">
          <AudioSettings />
        </TabsContent>
        
        <TabsContent value="auth" className="p-4 border rounded-md">
          <AuthSettings />
        </TabsContent>
        
        <TabsContent value="profile" className="p-4 border rounded-md">
          <UserProfileSettings />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="developer" className="p-4 border rounded-md">
            <DeveloperSettings />
          </TabsContent>
        )}
        
        <TabsContent value="system" className="p-4 border rounded-md">
          <SystemInfo />
        </TabsContent>
      </Tabs>
    </div>
  );
}