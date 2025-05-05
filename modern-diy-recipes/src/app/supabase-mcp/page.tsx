'use client';

import { useState, useEffect } from 'react';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';

export default function SupabaseMcpPage() {
  const {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    fetchRecipes,
    fetchIngredients,
    executeQuery
  } = useSupabaseMcp();

  const [recipes, setRecipes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM recipes LIMIT 10');
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients' | 'query'>('recipes');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Handle connection to MCP server
  const handleConnect = async () => {
    setConnectionStatus('connecting');
    try {
      await connect();
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Failed to connect to MCP server:', err);
      setConnectionStatus('disconnected');
    }
  };

  // Handle disconnection from MCP server
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnectionStatus('disconnected');
    } catch (err) {
      console.error('Failed to disconnect from MCP server:', err);
    }
  };

  // Fetch recipes using MCP
  const handleFetchRecipes = async () => {
    try {
      const data = await fetchRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    }
  };

  // Fetch ingredients using MCP
  const handleFetchIngredients = async () => {
    try {
      const data = await fetchIngredients();
      setIngredients(data);
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
    }
  };

  // Execute custom SQL query using MCP
  const handleExecuteQuery = async () => {
    try {
      const data = await executeQuery(sqlQuery);
      setQueryResult(data);
    } catch (err) {
      console.error('Failed to execute query:', err);
    }
  };

  // Connect to MCP server on page load
  useEffect(() => {
    handleConnect();

    // Disconnect when component unmounts
    return () => {
      handleDisconnect();
    };
  }, []);

  // Display connection status
  const renderConnectionStatus = () => {
    if (connectionStatus === 'connecting' || isLoading) {
      return <p className="text-yellow-500">Connecting to Supabase MCP server...</p>;
    } else if (connectionStatus === 'connected' && isConnected) {
      return <p className="text-green-500">Connected to Supabase MCP server</p>;
    } else {
      return <p className="text-red-500">Disconnected from Supabase MCP server</p>;
    }
  };

  // Display error if there is one
  const renderError = () => {
    if (error) {
      return <div className="p-4 bg-red-100 text-red-800 rounded mb-4">{error}</div>;
    }
    return null;
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'recipes':
        return (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Recipes</h2>
              <button
                onClick={handleFetchRecipes}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!isConnected}
              >
                Fetch Recipes
              </button>
            </div>
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border p-4 rounded shadow">
                    <h3 className="font-bold">{recipe.title}</h3>
                    <p className="text-gray-600">{recipe.description || 'No description'}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(recipe.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recipes found. Click "Fetch Recipes" to load recipes.</p>
            )}
          </div>
        );
      case 'ingredients':
        return (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Ingredients</h2>
              <button
                onClick={handleFetchIngredients}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!isConnected}
              >
                Fetch Ingredients
              </button>
            </div>
            {ingredients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="border p-4 rounded shadow">
                    <h3 className="font-bold">{ingredient.name}</h3>
                    <p className="text-gray-600">{ingredient.description || 'No description'}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(ingredient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No ingredients found. Click "Fetch Ingredients" to load ingredients.</p>
            )}
          </div>
        );
      case 'query':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Custom SQL Query</h2>
            <div className="mb-4">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <button
              onClick={handleExecuteQuery}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
              disabled={!isConnected}
            >
              Execute Query
            </button>
            {queryResult.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      {Object.keys(queryResult[0]).map((key) => (
                        <th key={key} className="border p-2 text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="border p-2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No results. Execute a query to see results.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase MCP Integration</h1>
      
      {/* Connection Status */}
      <div className="mb-4">
        {renderConnectionStatus()}
        {renderError()}
        <div className="mt-2">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
            disabled={isConnected || isLoading}
          >
            Connect
          </button>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={!isConnected || isLoading}
          >
            Disconnect
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b mb-4">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`py-2 px-4 ${
              activeTab === 'recipes'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`py-2 px-4 ${
              activeTab === 'ingredients'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ingredients
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`py-2 px-4 ${
              activeTab === 'query'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Custom Query
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}