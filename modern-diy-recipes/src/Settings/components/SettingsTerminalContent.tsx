'use client';

import React from 'react';
import ThemeSettings from './ThemeSettings';
import AudioSettings from './AudioSettings';
import AuthSettings from './AuthSettings';
import UserProfileSettings from './UserProfileSettings';
import DeveloperSettings from './DeveloperSettings';
import SystemInfo from './SystemInfo';
import { useAuth } from '@/hooks/useAuth';
import typography from '@/lib/typography';

interface SettingsTerminalContentProps {
  category: string;
}

/**
 * SettingsTerminalContent - Component that displays the appropriate settings content
 * based on the selected category in the terminal interface
 */
export default function SettingsTerminalContent({ category }: SettingsTerminalContentProps) {
  const { user } = useAuth();
  // Default to true if user is undefined (when offline) to ensure settings are accessible
  const isAdmin = user?.role === 'admin' || !user;

  // Map category to the appropriate component
  const renderContent = () => {
    try {
      switch (category) {
        case 'theme':
          return <ThemeSettings />;
        case 'audio':
          return <AudioSettings />;
        case 'account':
          return <AuthSettings />;
        case 'profile':
          return <UserProfileSettings />;
        case 'developer':
          return isAdmin ? <DeveloperSettings /> : <NotAuthorized />;
        case 'system':
          return <SystemInfo />;
        default:
          return <NoCategory />;
      }
    } catch (error) {
      console.error("Error rendering settings content:", error);
      return (
        <div className="p-4 border border-red-500 bg-red-500/10 rounded">
          <h3 className="text-[1.25rem] font-bold text-red-500 mb-2">Error Loading Settings</h3>
          <p className="text-[1.125rem] text-text-secondary">
            There was an error loading the settings component. This might be due to a database connection issue.
          </p>
          <pre className="mt-2 p-2 bg-surface-2 text-[0.875rem] overflow-auto max-h-40">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      );
    }
  };
  
  return (
    <div className="p-4">
      {renderContent()}
    </div>
  );
}

// Component to show when no category is selected
function NoCategory() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h2 className="text-[1.75rem] font-bold mb-3 text-accent">Select a Settings Category</h2>
      <p className="text-[1.25rem] text-text-secondary mb-6">
        Choose a category from the list on the left to configure your settings.
      </p>
      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="border border-border-subtle p-4 rounded">
          <h3 className="text-[1.25rem] font-bold mb-2 flex items-center">
            <span className="mr-2">🎨</span> Theme
          </h3>
          <p className="text-[1rem] text-text-secondary">
            Change the visual appearance of the terminal interface.
          </p>
        </div>
        <div className="border border-border-subtle p-4 rounded">
          <h3 className="text-[1.25rem] font-bold mb-2 flex items-center">
            <span className="mr-2">🔊</span> Audio
          </h3>
          <p className="text-[1rem] text-text-secondary">
            Configure sound effects and audio preferences.
          </p>
        </div>
        <div className="border border-border-subtle p-4 rounded">
          <h3 className="text-[1.25rem] font-bold mb-2 flex items-center">
            <span className="mr-2">👤</span> Account
          </h3>
          <p className="text-[1rem] text-text-secondary">
            Manage your user account and authentication.
          </p>
        </div>
        <div className="border border-border-subtle p-4 rounded">
          <h3 className="text-[1.25rem] font-bold mb-2 flex items-center">
            <span className="mr-2">🖥️</span> System
          </h3>
          <p className="text-[1rem] text-text-secondary">
            View system information and diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
}

// Component to show when user doesn't have permission
function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h2 className="text-[1.75rem] font-bold mb-3 text-red-500">Access Denied</h2>
      <p className="text-[1.25rem] text-text-secondary mb-4">
        You do not have permission to access developer settings.
      </p>
      <div className="border border-red-500/30 p-4 bg-red-500/10 rounded text-red-500 max-w-md text-[1.125rem]">
        This section requires administrator privileges. Please contact your system administrator if you need access.
      </div>
    </div>
  );
}