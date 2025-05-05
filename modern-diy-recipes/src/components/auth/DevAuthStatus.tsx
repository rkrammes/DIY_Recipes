'use client';

import { useDevAuth } from '../../hooks/devAuthContext';

export default function DevAuthStatus() {
  const { user, isAuthenticated, isEditMode, toggleEditMode, logout, login } = useDevAuth();

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      {isEditMode && (
        <div className="mb-2 p-1 bg-green-100 text-green-800 text-sm font-medium rounded">
          Edit Mode Active
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          {isAuthenticated ? (
            <div className="text-sm">
              <span className="font-medium">Dev User:</span> {user?.email}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Not logged in</div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={toggleEditMode}
            className={`px-3 py-1 text-xs rounded ${
              isEditMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
          </button>
          
          {isAuthenticated ? (
            <button 
              onClick={logout}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={login}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Dev Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}