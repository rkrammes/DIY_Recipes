'use client';

import { useState, useEffect } from 'react';
import { useSimplifiedMcpAuth } from '../../hooks/useSimplifiedMcpAuth';
import { useSimplifiedSupabaseMcp } from '../../hooks/useSimplifiedSupabaseMcp';

export default function SupabaseMcpTestPage() {
  const { user, isLoading, isEditMode, error, signIn, signOut, toggleEditMode, useDevelopmentUser } = useSimplifiedMcpAuth();
  const { isConnected, connect, executeQuery } = useSimplifiedSupabaseMcp();
  
  const [query, setQuery] = useState<string>('SELECT * FROM recipes LIMIT 5');
  const [queryResult, setQueryResult] = useState<string>('// Results will appear here');
  const [isRunningQuery, setIsRunningQuery] = useState<boolean>(false);
  
  // Function to check connection
  const checkConnection = async () => {
    try {
      const result = await connect();
      console.log('Connection result:', result);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };
  
  // Function to run a query
  const runQuery = async () => {
    if (!query) {
      alert('Please enter an SQL query');
      return;
    }
    
    setIsRunningQuery(true);
    setQueryResult('Running query...');
    
    try {
      const result = await executeQuery(query);
      setQueryResult(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Query failed:', err);
      setQueryResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunningQuery(false);
    }
  };
  
  // Check connection on mount
  useEffect(() => {
    if (!isConnected) {
      checkConnection();
    }
  }, [isConnected]);
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {isEditMode && (
        <div className="fixed top-0 left-0 right-0 p-2 bg-green-500 text-white text-center font-bold z-50">
          EDIT MODE ACTIVE
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-6 pb-2 border-b border-gray-300">Supabase MCP Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        
        {isLoading ? (
          <p>Loading authentication state...</p>
        ) : (
          <div>
            {user ? (
              <div className="mb-4">
                <p className="font-bold">Logged in as: {user.email}</p>
                <p>User ID: {user.id}</p>
              </div>
            ) : (
              <p className="mb-4">Not logged in</p>
            )}
            
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded mb-4">
                Error: {error}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {!user ? (
                <button
                  onClick={() => useDevelopmentUser()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={isLoading}
                >
                  Login as Dev User
                </button>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Logout
                </button>
              )}
              
              <button
                onClick={() => toggleEditMode()}
                className={`px-4 py-2 rounded ${
                  isEditMode ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
              >
                {isEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Connection Status</h2>
        <div className="flex items-center mb-4">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
          <span>{isConnected ? 'Connected' : 'Not connected'}</span>
        </div>
        
        <button
          onClick={checkConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={isConnected}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Run SQL Query</h2>
        
        <div className="mb-4">
          <label htmlFor="sql-query" className="block mb-2 font-medium">SQL Query:</label>
          <textarea
            id="sql-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded h-32 font-mono"
          ></textarea>
        </div>
        
        <button
          onClick={runQuery}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          disabled={isRunningQuery || !isConnected}
        >
          {isRunningQuery ? 'Running...' : 'Run Query'}
        </button>
        
        <h3 className="font-bold mb-2">Result:</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 font-mono text-sm">
          {queryResult}
        </pre>
      </div>
    </div>
  );
}