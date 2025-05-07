"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useModules } from '@/lib/modules/moduleContext';
import { NavigationItem } from '@/lib/modules/registry';

/**
 * ModuleNavigation - Dynamic navigation component based on module registry
 * 
 * This component renders navigation items from all enabled modules in the registry
 */
export default function ModuleNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { navigationItems, enabledModules } = useModules();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Determine if a navigation item is active based on current path
  const isActive = (path: string | undefined) => {
    if (!path) return false;
    
    // Consider a nav item active if the current path starts with the item's path
    // This allows sub-pages to still highlight the parent navigation item
    return pathname?.startsWith(path);
  };
  
  // Render a single navigation item
  const renderNavItem = (item: NavigationItem) => {
    const active = isActive(item.path);
    
    return (
      <li key={item.id} className="mb-1">
        {item.path ? (
          <Link 
            href={item.path}
            className={`flex items-center px-4 py-2 rounded-md ${
              active 
                ? 'bg-blue-100 text-blue-900' 
                : 'hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{typeof item.icon === 'string' ? item.icon : ''}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ) : (
          <div className="flex items-center px-4 py-2 text-gray-500 font-medium">
            <span className="mr-2">{typeof item.icon === 'string' ? item.icon : ''}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </div>
        )}
        
        {/* Render children if any */}
        {item.children && item.children.length > 0 && !isCollapsed && (
          <ul className="ml-6 mt-1 space-y-1">
            {item.children.map(child => (
              <li key={child.id}>
                {child.path ? (
                  <Link 
                    href={child.path}
                    className={`flex items-center px-4 py-1 rounded-md text-sm ${
                      isActive(child.path) 
                        ? 'bg-blue-50 text-blue-800' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {typeof child.icon === 'string' && (
                      <span className="mr-2 text-xs">{child.icon}</span>
                    )}
                    <span>{child.name}</span>
                  </Link>
                ) : (
                  <div className="flex items-center px-4 py-1 text-gray-500 font-medium text-sm">
                    {typeof child.icon === 'string' && (
                      <span className="mr-2 text-xs">{child.icon}</span>
                    )}
                    <span>{child.name}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };
  
  return (
    <nav className={`h-full bg-white border-r ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && <h1 className="font-bold text-lg">DIY Formulations</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-100"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      {/* Module sections */}
      <div className="py-4">
        {enabledModules.length === 0 ? (
          <div className="px-4 text-gray-500">
            {!isCollapsed && 'No modules enabled'}
          </div>
        ) : (
          <div>
            {enabledModules.map(module => (
              <div key={module.id} className="mb-6">
                {/* Module header */}
                {!isCollapsed && (
                  <h2 className="px-4 mb-2 font-medium text-gray-600">
                    {module.name}
                  </h2>
                )}
                
                {/* Module navigation items */}
                <ul className="space-y-1">
                  {module.navigationItems.map(renderNavItem)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <Link 
          href="/settings"
          className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100"
        >
          <span className="mr-2">⚙️</span>
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </nav>
  );
}