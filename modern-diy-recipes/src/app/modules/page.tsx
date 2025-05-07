"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModules } from '@/lib/modules';
import { initializeModules } from '@/modules';

/**
 * Modules Page - The main entry point for the modular system
 * 
 * This page displays all available modules and allows navigation to them.
 */
export default function ModulesPage() {
  const router = useRouter();
  const { enabledModules, isModuleEnabled } = useModules();
  
  // Initialize modules when the page loads
  useEffect(() => {
    initializeModules();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">DIY Formulations Platform</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the modular platform for DIY Formulations
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Modules</h2>
        
        {enabledModules.length === 0 ? (
          <div className="bg-gray-50 border rounded-lg p-8 text-center">
            <p className="text-gray-500">No modules have been enabled yet.</p>
            <Link 
              href="/module-system"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Manage Modules
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabledModules.map(module => (
              <div 
                key={module.id}
                className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {typeof module.icon === 'string' ? module.icon : '📦'}
                    </span>
                    <h3 className="text-lg font-semibold">{module.name}</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-600 mb-4">
                    {module.description || 'No description provided'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {module.navigationItems.map(item => (
                      <Link
                        key={item.id}
                        href={item.path || '#'}
                        className={`inline-flex items-center px-3 py-1 text-sm ${
                          item.path 
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                            : 'bg-gray-100 text-gray-500'
                        } rounded`}
                      >
                        {typeof item.icon === 'string' && (
                          <span className="mr-1">{item.icon}</span>
                        )}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/module-${module.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Open {module.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Back to Classic UI
        </Link>
        
        <Link 
          href="/module-system"
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Module System Settings
        </Link>
      </div>
    </div>
  );
}