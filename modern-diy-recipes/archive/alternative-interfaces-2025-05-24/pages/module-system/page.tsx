"use client";

import React, { useState } from 'react';
import { useModules } from '@/lib/modules';
import ModularLayout from '@/components/layouts/ModularLayout';

/**
 * ModuleSystem Page - Demo page for the module system
 * 
 * This page provides an overview of the module registry system
 * and displays information about registered modules.
 */
export default function ModuleSystemPage() {
  const { modules, enabledModules, setModuleEnabled } = useModules();
  const [showDetails, setShowDetails] = useState<string | null>(null);

  return (
    <ModularLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Module Registry System</h1>
          <p className="text-text-secondary">
            This page demonstrates the Module Registry System and allows you to 
            enable/disable modules and view module details.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Module Status</h2>
          <div className="bg-surface-1 p-4 rounded-lg border border-border-subtle">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-surface-2 rounded-md">
                <div className="text-2xl font-bold">{modules.length}</div>
                <div className="text-text-secondary">Total Modules</div>
              </div>
              <div className="p-3 bg-surface-2 rounded-md">
                <div className="text-2xl font-bold">{enabledModules.length}</div>
                <div className="text-text-secondary">Enabled Modules</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Registered Modules</h2>
          <div className="space-y-4">
            {modules.map(module => (
              <div 
                key={module.id}
                className="bg-surface-1 p-4 rounded-lg border border-border-subtle"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">
                      {typeof module.icon === 'string' ? module.icon : '📦'}
                    </span>
                    <h3 className="text-lg font-semibold">{module.name}</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowDetails(showDetails === module.id ? null : module.id)}
                      className="px-3 py-1 text-sm rounded hover:bg-surface-2"
                    >
                      {showDetails === module.id ? 'Hide Details' : 'Show Details'}
                    </button>
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-2 text-text-secondary">Enabled</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={module.isEnabled}
                          onChange={() => setModuleEnabled(module.id, !module.isEnabled)}
                        />
                        <div className={`w-10 h-5 rounded-full transition ${
                          module.isEnabled ? 'bg-accent' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                          module.isEnabled ? 'transform translate-x-5' : ''
                        }`}></div>
                      </div>
                    </label>
                  </div>
                </div>

                {showDetails === module.id && (
                  <div className="border-t border-border-subtle pt-3 mt-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-text-secondary">{module.description || 'No description provided'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Navigation Items</h4>
                      {module.navigationItems.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-2 text-text-secondary">
                          {module.navigationItems.map(item => (
                            <li key={item.id} className="flex items-center">
                              <span className="mr-1 text-xs">{typeof item.icon === 'string' ? item.icon : '•'}</span>
                              <span>{item.name}</span>
                              {item.path && <span className="ml-1 text-text-tertiary text-xs">({item.path})</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-text-tertiary">No navigation items</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Routes</h4>
                      {module.routes.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-1 text-text-secondary">
                          {module.routes.map((route, index) => (
                            <li key={index}>
                              <code className="text-xs bg-surface-2 px-1 py-0.5 rounded">{route.path}</code>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-text-tertiary">No routes defined</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Components</h4>
                      <ul className="grid grid-cols-2 gap-2 text-text-secondary">
                        {Object.keys(module.components).map(key => (
                          <li key={key}>
                            <code className="text-xs bg-surface-2 px-1 py-0.5 rounded">{key}</code>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Settings</h4>
                      {Object.keys(module.settings || {}).length > 0 ? (
                        <ul className="grid grid-cols-2 gap-2 text-text-secondary">
                          {Object.entries(module.settings || {}).map(([key, value]) => (
                            <li key={key} className="flex items-center justify-between">
                              <span className="text-xs">{key}:</span>
                              <span className="font-mono text-xs bg-surface-2 px-1 py-0.5 rounded">
                                {typeof value === 'boolean' 
                                  ? value ? 'true' : 'false'
                                  : String(value)
                                }
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-text-tertiary">No settings defined</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {modules.length === 0 && (
              <div className="bg-surface-1 p-6 rounded-lg border border-border-subtle text-center">
                <p className="text-text-secondary">No modules registered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModularLayout>
  );
}