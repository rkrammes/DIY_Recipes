"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useModules } from '@/lib/modules/moduleContext';
import { useTheme } from '@/providers/FixedThemeProvider';
import { useAudio } from '@/hooks/useAudio';
import { NavigationItem, Module } from '@/lib/modules/registry';

// Navigation section groups
const SYSTEM_SECTIONS = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/modules' },
  { id: 'settings', name: 'Settings', icon: '⚙️', path: '/module-system' },
];

interface DynamicModuleNavigationProps {
  variant?: 'sidebar' | 'terminal' | 'minimal';
  showSystemItems?: boolean;
}

/**
 * DynamicModuleNavigation - Advanced navigation component that integrates with Module Registry
 * 
 * Features:
 * - Themed navigation based on the current theme (hackers, dystopia, neotopia)
 * - Collapsible sidebar with animation
 * - Sound effects on navigation
 * - Automatic loading of navigation items from module registry
 * - Visual indicators for active items
 * - System-level navigation items
 */
export default function DynamicModuleNavigation({
  variant = 'terminal',
  showSystemItems = true
}: DynamicModuleNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { enabledModules, navigationItems } = useModules();
  const { theme, audioEnabled } = useTheme();
  const { playSound } = useAudio();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  // Determine active module based on pathname
  useEffect(() => {
    if (!pathname) return;
    
    // Find the module that matches the current path
    const matchingModule = enabledModules.find(module => 
      module.routes.some(route => {
        const routePath = route.path.split(':')[0]; // Get base path without params
        return pathname.startsWith(routePath);
      }) ||
      module.navigationItems.some(item => 
        item.path && pathname.startsWith(item.path)
      )
    );
    
    if (matchingModule) {
      setActiveModule(matchingModule.id);
    } else {
      setActiveModule(null);
    }
  }, [pathname, enabledModules]);
  
  // Determine if a navigation item is active based on current path
  const isActive = (path: string | undefined) => {
    if (!path || !pathname) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  // Handle navigation item click
  const handleNavClick = () => {
    if (audioEnabled) playSound('click');
  };
  
  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (audioEnabled) playSound('click');
  };
  
  // Render a single navigation item
  const renderNavItem = (item: NavigationItem, moduleId?: string) => {
    const active = isActive(item.path);
    
    // Terminal-style navigation item
    if (variant === 'terminal') {
      return (
        <li key={item.id} className="mb-1">
          {item.path ? (
            <Link 
              href={item.path}
              onClick={handleNavClick}
              className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                active 
                  ? 'bg-accent/20 text-accent font-bold' 
                  : 'hover:bg-surface-2 text-text-secondary'
              }`}
            >
              <span className="mr-2 font-bold">{active ? '►' : ' '}</span>
              <span className="mr-2 text-lg">{typeof item.icon === 'string' ? item.icon : '📄'}</span>
              {!isCollapsed && (
                <>
                  <span className="uppercase">{item.name}</span>
                  {active && <span className="ml-2 animate-pulse">_</span>}
                </>
              )}
            </Link>
          ) : (
            <div className={`flex items-center px-3 py-2 text-text-secondary ${isCollapsed ? 'justify-center' : ''}`}>
              <span className="mr-2 text-lg">{typeof item.icon === 'string' ? item.icon : '📄'}</span>
              {!isCollapsed && <span className="uppercase">{item.name}</span>}
            </div>
          )}
          
          {/* Render children if any */}
          {item.children && item.children.length > 0 && !isCollapsed && (
            <ul className="ml-8 mt-1">
              {item.children.map(child => renderNavItem(child, moduleId))}
            </ul>
          )}
        </li>
      );
    }
    
    // Standard sidebar navigation item
    return (
      <li key={item.id} className="mb-1">
        {item.path ? (
          <Link 
            href={item.path}
            onClick={handleNavClick}
            className={`flex items-center px-4 py-2 rounded-md ${
              active 
                ? 'bg-blue-100 text-blue-900' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="mr-2">{typeof item.icon === 'string' ? item.icon : '📄'}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ) : (
          <div className={`flex items-center px-4 py-2 text-gray-500 font-medium ${isCollapsed ? 'justify-center' : ''}`}>
            <span className="mr-2">{typeof item.icon === 'string' ? item.icon : '📄'}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </div>
        )}
        
        {/* Render children if any */}
        {item.children && item.children.length > 0 && !isCollapsed && (
          <ul className="ml-6 mt-1">
            {item.children.map(child => renderNavItem(child, moduleId))}
          </ul>
        )}
      </li>
    );
  };
  
  // Render a module section (with header and navigation items)
  const renderModuleSection = (module: Module) => {
    if (variant === 'terminal') {
      return (
        <div key={module.id} className="mb-4">
          {!isCollapsed && (
            <div className="py-1 pl-2 text-xs uppercase text-accent bg-surface-2 border-b-2 border-border-subtle">
              ┌─────────────────────┐
              <br />
              │ {module.name.padEnd(19, ' ')} │
              <br />
              └─────────────────────┘
            </div>
          )}
          
          <ul className="mt-2">
            {module.navigationItems.map(item => renderNavItem(item, module.id))}
          </ul>
        </div>
      );
    }
    
    return (
      <div key={module.id} className="mb-6">
        {!isCollapsed && (
          <h2 className="px-4 mb-2 font-medium text-gray-600">
            {module.name}
          </h2>
        )}
        
        <ul className="space-y-1">
          {module.navigationItems.map(item => renderNavItem(item, module.id))}
        </ul>
      </div>
    );
  };
  
  // Render the system navigation items
  const renderSystemItems = () => {
    if (!showSystemItems) return null;
    
    if (variant === 'terminal') {
      return (
        <div className="mb-4">
          {!isCollapsed && (
            <div className="py-1 pl-2 text-xs uppercase text-accent bg-surface-2 border-b-2 border-border-subtle">
              ┌─────────────────────┐
              <br />
              │ SYSTEM              │
              <br />
              └─────────────────────┘
            </div>
          )}
          
          <ul className="mt-2">
            {SYSTEM_SECTIONS.map(item => (
              <li key={item.id} className="mb-1">
                <Link 
                  href={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                    isActive(item.path) 
                      ? 'bg-accent/20 text-accent font-bold' 
                      : 'hover:bg-surface-2 text-text-secondary'
                  }`}
                >
                  <span className="mr-2 font-bold">{isActive(item.path) ? '►' : ' '}</span>
                  <span className="mr-2 text-lg">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="uppercase">{item.name}</span>
                      {isActive(item.path) && <span className="ml-2 animate-pulse">_</span>}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    return (
      <div className="mb-6">
        {!isCollapsed && (
          <h2 className="px-4 mb-2 font-medium text-gray-600">
            System
          </h2>
        )}
        
        <ul className="space-y-1">
          {SYSTEM_SECTIONS.map(item => (
            <li key={item.id} className="mb-1">
              <Link 
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive(item.path) 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Terminal style navigation
  if (variant === 'terminal') {
    return (
      <nav className={`h-full bg-surface-1 border-r-2 border-border-subtle flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-52'
      }`}>
        {/* Header */}
        <div className="py-1 pl-2 text-xs uppercase text-accent bg-surface-2 border-b-2 border-border-subtle flex justify-between items-center">
          {!isCollapsed ? (
            <>
              ┌─────────────────────┐
              <br />
              │ DIRECTORIES         │
              <br />
              └─────────────────────┘
            </>
          ) : (
            <span className="w-full text-center text-xl">📁</span>
          )}
          <button 
            onClick={toggleCollapse}
            className="p-1 text-accent hover:text-accent-hover"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
        
        {/* Modules navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          {enabledModules.length === 0 ? (
            <div className="p-4 text-text-secondary text-xs">
              {!isCollapsed && 'NO MODULES FOUND'}
            </div>
          ) : (
            <>
              {renderSystemItems()}
              {enabledModules.map(renderModuleSection)}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-2 border-t-2 border-border-subtle text-text-secondary text-xs">
          <div>────────────────────────────</div>
          <div className="flex items-center justify-between px-2">
            <span>{!isCollapsed && 'MODULES:'}</span>
            <span className="text-accent font-bold">{enabledModules.length}</span>
          </div>
        </div>
      </nav>
    );
  }
  
  // Standard sidebar navigation
  return (
    <nav className={`h-full bg-white border-r transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && <h1 className="font-bold text-lg">DIY Formulations</h1>}
        <button 
          onClick={toggleCollapse}
          className="p-1 rounded hover:bg-gray-100"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      {/* Module sections */}
      <div className="py-4 overflow-y-auto h-[calc(100%-64px)]">
        {enabledModules.length === 0 ? (
          <div className="px-4 text-gray-500">
            {!isCollapsed && 'No modules enabled'}
          </div>
        ) : (
          <>
            {renderSystemItems()}
            {enabledModules.map(renderModuleSection)}
          </>
        )}
      </div>
    </nav>
  );
}