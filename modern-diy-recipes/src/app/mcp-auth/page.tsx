'use client';

import React from 'react';
import { useMcpAuth } from '@/hooks/useMcpAuth';
import McpLoginForm from '@/components/auth/McpLoginForm';
import McpNavigation from '@/components/McpNavigation';

export default function McpAuthPage() {
  const { user, isLoading, isEditMode } = useMcpAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-0">
        <McpNavigation />
        <div className="container mx-auto p-8">
          <div className="w-full h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <McpNavigation />
      <div className="container mx-auto p-8">
        {user ? (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-text">
              Welcome, {user.user_metadata?.name || user.email}
            </h1>
            
            {isEditMode && (
              <div className="mb-8 p-4 bg-blue-100 text-blue-800 rounded">
                <h2 className="text-xl font-bold mb-2">Edit Mode Active</h2>
                <p>You are currently in edit mode. Any changes you make will be saved.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-surface-1 rounded-lg shadow border border-border-subtle">
                <h2 className="text-xl font-bold mb-4 text-text">User Profile</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-text-secondary">Email:</span>
                    <span className="ml-2 text-text">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">User ID:</span>
                    <span className="ml-2 text-text">{user.id}</span>
                  </div>
                  {user.user_metadata && (
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-text">User Metadata</h3>
                      <pre className="p-3 bg-surface-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(user.user_metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-surface-1 rounded-lg shadow border border-border-subtle">
                <h2 className="text-xl font-bold mb-4 text-text">Development Features</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1 text-text">Edit Mode</h3>
                    <p className="text-text-secondary mb-2">
                      {isEditMode 
                        ? 'Edit mode is currently enabled. You can make changes to content.' 
                        : 'Edit mode is currently disabled. Toggle it in the navigation bar.'}
                    </p>
                    <div className={`p-3 rounded ${isEditMode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      Status: {isEditMode ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1 text-text">Environment</h3>
                    <p className="text-text-secondary mb-2">
                      Current execution environment
                    </p>
                    <div className="p-3 rounded bg-green-100 text-green-800">
                      NODE_ENV: {process.env.NODE_ENV}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-text">MCP Authentication</h1>
            <McpLoginForm />
          </div>
        )}
      </div>
    </div>
  );
}