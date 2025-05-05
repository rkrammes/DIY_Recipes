'use client';

import { useDevAuth } from '@/hooks/useDevAuth';
import { useState } from 'react';

export default function McpAuthStatus() {
  const { user, isAuthenticated, isEditMode, logout, toggleEditMode, login } = useDevAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="relative">
      {isAuthenticated ? (
        <div className="flex items-center">
          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={`mr-4 px-3 py-1 rounded text-sm ${
              isEditMode 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isEditMode ? 'Edit Mode: ON' : 'Edit Mode: OFF'}
          </button>
          
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-surface-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
              {user?.email?.charAt(0) || 'D'}
            </div>
            <span className="text-text-secondary">{user?.email || 'Dev User'}</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-surface-1 border border-border-subtle rounded-md shadow-lg z-10">
              <div className="p-2 border-b border-border-subtle">
                <p className="text-sm font-medium text-text">{user?.email}</p>
                <p className="text-xs text-text-secondary truncate">
                  Role: {user?.role || 'Admin'}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-sm rounded-md hover:bg-surface-2 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={login}
            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Dev Login
          </button>
        </div>
      )}
    </div>
  );
}