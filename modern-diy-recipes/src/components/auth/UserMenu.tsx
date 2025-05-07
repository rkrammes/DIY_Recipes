'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimpleAuth } from '@/lib/auth/SimpleAuthProvider';
import { useModules } from '@/lib/modules';

interface UserMenuProps {
  variant?: 'full' | 'compact';
  showRole?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * UserMenu - User account menu and switcher
 * 
 * This component displays the current user and provides options to:
 * - View user information
 * - Switch between users
 * - Manage preferences
 * - Log out
 */
export default function UserMenu({
  variant = 'full',
  showRole = true,
  theme = 'system'
}: UserMenuProps) {
  const { 
    user, 
    users, 
    logout, 
    switchUser,
    isAuthenticated,
    isDevelopment,
    hasAccessToModule
  } = useSimpleAuth();
  
  const { modules } = useModules();
  
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter users to only show those the current user can switch to
  const availableUsers = users.filter(u => {
    // Admins can switch to anyone
    if (user?.role === 'admin') return true;
    
    // Parents can switch to children and guests
    if (user?.role === 'parent') {
      return ['child', 'guest'].includes(u.role);
    }
    
    // Others can only see themselves and guest
    return u.id === user?.id || u.id === 'guest';
  });
  
  // Get available modules for the current user
  const availableModules = modules.filter(module => 
    hasAccessToModule(module.id)
  );
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };
  
  // Handle user switch
  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setIsOpen(false);
  };
  
  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center p-1 rounded-full hover:bg-surface-2"
          aria-label="User menu"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-0">
            <span className="text-lg" aria-hidden="true">
              {user?.avatar || '👤'}
            </span>
          </div>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-surface-1 border border-border-subtle">
            {isAuthenticated && (
              <div className="p-3 border-b border-border-subtle">
                <div className="font-bold">{user?.displayName}</div>
                {showRole && user?.role && (
                  <div className="text-xs text-text-secondary capitalize">
                    {user.role}
                  </div>
                )}
              </div>
            )}
            
            <div className="py-1">
              {availableUsers.length > 1 && (
                <>
                  <div className="px-4 py-1 text-xs text-text-secondary">
                    Switch user
                  </div>
                  {availableUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-2 flex items-center ${
                        u.id === user?.id ? 'bg-surface-2' : ''
                      }`}
                    >
                      <span className="mr-2">{u.avatar || '👤'}</span>
                      {u.displayName}
                    </button>
                  ))}
                  <div className="border-t border-border-subtle my-1"></div>
                </>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 text-red-500"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Full variant
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 rounded-lg hover:bg-surface-2"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-0 mr-2"
             style={{ backgroundColor: user?.color ? `${user.color}30` : undefined }}>
          <span className="text-xl" aria-hidden="true">
            {user?.avatar || '👤'}
          </span>
        </div>
        <div className="text-left mr-1">
          <div className="font-medium">{user?.displayName || 'Guest'}</div>
          {showRole && user?.role && (
            <div className="text-xs text-text-secondary capitalize">
              {user.role}
            </div>
          )}
        </div>
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-surface-1 border border-border-subtle overflow-hidden">
          {/* Header */}
          {isAuthenticated && (
            <div className="p-4 border-b border-border-subtle">
              <div className="flex items-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-0 mr-3"
                     style={{ backgroundColor: user?.color ? `${user.color}30` : undefined }}>
                  <span className="text-2xl" aria-hidden="true">
                    {user?.avatar || '👤'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-lg">{user?.displayName}</div>
                  {user?.email && (
                    <div className="text-sm text-text-secondary">{user.email}</div>
                  )}
                  {!user?.email && showRole && user?.role && (
                    <div className="text-sm text-text-secondary capitalize">
                      {user.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Available modules */}
          {availableModules.length > 0 && (
            <div className="p-3 border-b border-border-subtle">
              <div className="text-xs font-medium text-text-secondary mb-2">
                YOUR MODULES
              </div>
              <div className="flex flex-wrap gap-2">
                {availableModules.map(module => (
                  <a
                    key={module.id}
                    href={module.navigationItems[0]?.path || '#'}
                    className="px-3 py-1 rounded-md text-sm bg-surface-2 hover:bg-surface-3 flex items-center"
                  >
                    <span className="mr-1.5">{typeof module.icon === 'string' ? module.icon : '📦'}</span>
                    {module.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* User switching */}
          {availableUsers.length > 1 && (
            <div className="p-3 border-b border-border-subtle">
              <div className="text-xs font-medium text-text-secondary mb-2">
                SWITCH USER
              </div>
              <div className="grid gap-1.5">
                {availableUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchUser(u.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-surface-2 flex items-center ${
                      u.id === user?.id ? 'bg-surface-2 font-medium' : ''
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-0 mr-2"
                          style={{ backgroundColor: u.color ? `${u.color}30` : undefined }}>
                      <span className="text-sm" aria-hidden="true">
                        {u.avatar || '👤'}
                      </span>
                    </span>
                    <span className="flex-1">{u.displayName}</span>
                    {u.id === user?.id && (
                      <span className="ml-1 text-xs text-accent">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Menu items */}
          <div className="p-3">
            <a
              href="/settings"
              className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm hover:bg-surface-2"
            >
              <span className="mr-2">⚙️</span>
              Settings
            </a>
            
            {isDevelopment && (
              <a
                href="/dev"
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm hover:bg-surface-2"
              >
                <span className="mr-2">🛠️</span>
                Developer Tools
              </a>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm hover:bg-surface-2 text-red-500"
            >
              <span className="mr-2">🚪</span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}