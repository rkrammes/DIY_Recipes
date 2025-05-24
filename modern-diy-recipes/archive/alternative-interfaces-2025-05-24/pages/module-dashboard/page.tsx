"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModules } from '@/lib/modules';
import EnhancedModularLayout from '@/components/layouts/EnhancedModularLayout';

/**
 * ModuleDashboard - Main entry point for the modular system
 * 
 * This dashboard provides an overview of all enabled modules and
 * allows quick access to module functionality.
 */
export default function ModuleDashboard() {
  const router = useRouter();
  const { modules, enabledModules, isModuleEnabled, setModuleEnabled } = useModules();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle module card click
  const handleModuleClick = (moduleId: string) => {
    router.push(`/module-${moduleId}`);
  };

  return (
    <EnhancedModularLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-3">Module Dashboard</h1>
          <p className="text-text-secondary">
            Welcome to the DIY Formulations platform. This dashboard provides access to all enabled modules.
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4 text-accent animate-pulse">Initializing module registry...</p>
          </div>
        ) : (
          <>
            {/* Module Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-1 p-4 rounded-lg border border-border-subtle">
                  <h3 className="text-lg font-medium mb-2">Modules</h3>
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-accent">{modules.length}</span>
                    <span className="ml-2 text-text-secondary">registered</span>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {enabledModules.length} enabled ({Math.round(enabledModules.length / modules.length * 100)}%)
                  </div>
                </div>
                
                <div className="bg-surface-1 p-4 rounded-lg border border-border-subtle">
                  <h3 className="text-lg font-medium mb-2">Navigation</h3>
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-accent">
                      {enabledModules.reduce((count, module) => count + module.navigationItems.length, 0)}
                    </span>
                    <span className="ml-2 text-text-secondary">items</span>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    from {enabledModules.length} enabled modules
                  </div>
                </div>
                
                <div className="bg-surface-1 p-4 rounded-lg border border-border-subtle">
                  <h3 className="text-lg font-medium mb-2">Routes</h3>
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-accent">
                      {enabledModules.reduce((count, module) => count + module.routes.length, 0)}
                    </span>
                    <span className="ml-2 text-text-secondary">available</span>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    across {enabledModules.length} modules
                  </div>
                </div>
              </div>
            </div>
            
            {/* Module Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Modules</h2>
              
              {modules.length === 0 ? (
                <div className="bg-surface-1 p-8 rounded-lg border border-border-subtle text-center">
                  <p className="text-text-secondary">No modules registered</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.map(module => (
                    <div 
                      key={module.id}
                      className={`rounded-lg overflow-hidden border transition-all ${
                        isModuleEnabled(module.id) 
                          ? 'border-accent bg-surface-1 cursor-pointer hover:shadow-md' 
                          : 'border-border-subtle bg-surface-0 opacity-60'
                      }`}
                      onClick={isModuleEnabled(module.id) ? () => handleModuleClick(module.id) : undefined}
                    >
                      <div className="bg-surface-2 border-b border-border-subtle px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {typeof module.icon === 'string' ? module.icon : '📦'}
                          </span>
                          <h3 className="text-lg font-semibold">{module.name}</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isModuleEnabled(module.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setModuleEnabled(module.id, !isModuleEnabled(module.id));
                            }}
                          />
                          <div className={`w-11 h-6 bg-gray-400 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent`}></div>
                        </label>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-text-secondary mb-4">
                          {module.description || 'No description provided'}
                        </p>
                        
                        {isModuleEnabled(module.id) && (
                          <>
                            {/* Quick actions */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {module.navigationItems.slice(0, 3).map(item => (
                                item.path ? (
                                  <button
                                    key={item.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(item.path || '#');
                                    }}
                                    className="px-3 py-1 text-sm bg-accent/10 text-accent hover:bg-accent/20 rounded"
                                  >
                                    {typeof item.icon === 'string' && (
                                      <span className="mr-1">{item.icon}</span>
                                    )}
                                    {item.name}
                                  </button>
                                ) : null
                              ))}
                            </div>
                            
                            {/* Module info */}
                            <div className="flex justify-between text-xs text-text-secondary">
                              <span>{module.routes.length} routes</span>
                              <span>{module.navigationItems.length} navigation items</span>
                            </div>
                          </>
                        )}
                        
                        {!isModuleEnabled(module.id) && (
                          <div className="text-center py-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModuleEnabled(module.id, true);
                              }}
                              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover"
                            >
                              Enable Module
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </EnhancedModularLayout>
  );
}