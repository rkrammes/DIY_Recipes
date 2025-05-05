/**
 * Context7 MCP Integration Component
 * 
 * This component demonstrates how to use the Context7 MCP for accessing
 * library documentation during development.
 */

'use client';

import { useState, useEffect } from 'react';
import useContext7Mcp from '../hooks/useContext7Mcp';
import { Button } from './ui/button';
import { DocumentationResult, SearchResult } from '../lib/mcp/adapters';

/**
 * Tab types for the example component
 */
type TabType = 'docs' | 'search' | 'examples' | 'validation';

/**
 * Context7 Integration Component
 */
export default function Context7Integration() {
  const [activeTab, setActiveTab] = useState<TabType>('docs');
  const [library, setLibrary] = useState('next');
  const [topic, setTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [documentation, setDocumentation] = useState<DocumentationResult | null>(null);
  const [examples, setExamples] = useState<any[] | null>(null);
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [availableLibraries, setAvailableLibraries] = useState<string[]>([]);
  
  const {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    getDocumentation,
    search,
    getExamples,
    validate,
    getLibraries
  } = useContext7Mcp({ autoConnect: true });
  
  // Fetch available libraries when connected
  useEffect(() => {
    if (isConnected) {
      getLibraries()
        .then(libraries => {
          setAvailableLibraries(libraries);
        })
        .catch(error => {
          console.error('Error fetching libraries:', error);
        });
    }
  }, [isConnected, getLibraries]);
  
  // Fetch documentation for the selected library
  const handleFetchDocumentation = async () => {
    try {
      const result = await getDocumentation(library, 'latest', topic);
      setDocumentation(result);
    } catch (error) {
      console.error('Error fetching documentation:', error);
    }
  };
  
  // Search for documentation
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    try {
      const result = await search(searchQuery, [library]);
      setSearchResults(result);
    } catch (error) {
      console.error('Error searching documentation:', error);
    }
  };
  
  // Fetch examples for the selected library
  const handleFetchExamples = async () => {
    try {
      const result = await getExamples(library, 'latest', topic || 'general');
      setExamples(result.examples);
    } catch (error) {
      console.error('Error fetching examples:', error);
    }
  };
  
  // Validate code against API documentation
  const handleValidateCode = async () => {
    if (!code) return;
    
    try {
      const result = await validate(code, library, 'latest');
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating code:', error);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Context7 MCP Integration</h2>
      
      {/* Connection status */}
      <div className="mb-4 flex items-center space-x-2">
        <div 
          className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
        <span className="font-medium">
          {isConnected ? 'Connected to Context7 MCP' : 'Disconnected from Context7 MCP'}
        </span>
        
        {!isConnected ? (
          <Button 
            onClick={connect} 
            disabled={isLoading}
            className="ml-2"
            size="sm"
          >
            Connect
          </Button>
        ) : (
          <Button 
            onClick={disconnect} 
            disabled={isLoading}
            className="ml-2"
            size="sm"
            variant="outline"
          >
            Disconnect
          </Button>
        )}
      </div>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
          Error: {error.message}
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b mb-4">
        <nav className="flex space-x-4">
          <button
            className={`py-2 px-4 ${activeTab === 'docs' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('docs')}
          >
            Documentation
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'examples' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('examples')}
          >
            Examples
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'validation' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('validation')}
          >
            Validation
          </button>
        </nav>
      </div>
      
      {/* Library selection (common to all tabs) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Library</label>
        <div className="flex space-x-2">
          <select
            className="border rounded-md p-2 w-full"
            value={library}
            onChange={(e) => setLibrary(e.target.value)}
          >
            {availableLibraries.length > 0 ? (
              availableLibraries.map((lib) => (
                <option key={lib} value={lib}>{lib}</option>
              ))
            ) : (
              <>
                <option value="next">Next.js</option>
                <option value="react">React</option>
                <option value="tailwind">Tailwind CSS</option>
                <option value="supabase-js">Supabase</option>
              </>
            )}
          </select>
        </div>
      </div>
      
      {/* Documentation tab */}
      {activeTab === 'docs' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Topic (optional)</label>
            <input
              type="text"
              className="border rounded-md p-2 w-full"
              value={topic || ''}
              onChange={(e) => setTopic(e.target.value || null)}
              placeholder="E.g., 'routing', 'hooks', 'components'"
            />
          </div>
          
          <Button onClick={handleFetchDocumentation} disabled={isLoading || !isConnected}>
            Get Documentation
          </Button>
          
          {isLoading && <div className="mt-4">Loading...</div>}
          
          {documentation && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                {documentation.library} v{documentation.version} Documentation
              </h3>
              
              {documentation.sections && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Available Sections</h4>
                  <ul className="list-disc pl-5">
                    {Object.keys(documentation.sections).map((section) => (
                      <li key={section}>{section}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {documentation.content && (
                <div>
                  <h4 className="font-medium mb-1">Content</h4>
                  <pre className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                    {JSON.stringify(documentation.content.slice(0, 3), null, 2)}
                    {documentation.content.length > 3 && '...'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Search tab */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search Query</label>
            <input
              type="text"
              className="border rounded-md p-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="E.g., 'routing', 'animation', 'authentication'"
            />
          </div>
          
          <Button onClick={handleSearch} disabled={isLoading || !isConnected || !searchQuery}>
            Search
          </Button>
          
          {isLoading && <div className="mt-4">Loading...</div>}
          
          {searchResults && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                Search Results for "{searchResults.query}"
              </h3>
              
              {searchResults.results.length > 0 ? (
                <ul className="divide-y">
                  {searchResults.results.slice(0, 5).map((result, index) => (
                    <li key={index} className="py-3">
                      <h4 className="font-medium">{result.title}</h4>
                      <p className="text-sm text-gray-500">
                        {result.library} v{result.version}
                      </p>
                      <p className="mt-1 text-sm">
                        {result.content.substring(0, 150)}
                        {result.content.length > 150 ? '...' : ''}
                      </p>
                    </li>
                  ))}
                  {searchResults.results.length > 5 && (
                    <li className="py-2 text-blue-500">
                      + {searchResults.results.length - 5} more results
                    </li>
                  )}
                </ul>
              ) : (
                <p>No results found.</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Examples tab */}
      {activeTab === 'examples' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              className="border rounded-md p-2 w-full"
              value={topic || ''}
              onChange={(e) => setTopic(e.target.value || null)}
              placeholder="E.g., 'auth', 'components', 'hooks'"
            />
          </div>
          
          <Button onClick={handleFetchExamples} disabled={isLoading || !isConnected}>
            Get Examples
          </Button>
          
          {isLoading && <div className="mt-4">Loading...</div>}
          
          {examples && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                {library} Examples
              </h3>
              
              {examples.length > 0 ? (
                <div className="space-y-4">
                  {examples.slice(0, 3).map((example, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded-md">
                      <h4 className="font-medium mb-1">{example.title || `Example ${index + 1}`}</h4>
                      <pre className="text-sm overflow-auto max-h-80">
                        {example.code || JSON.stringify(example, null, 2)}
                      </pre>
                    </div>
                  ))}
                  {examples.length > 3 && (
                    <p className="text-blue-500">
                      + {examples.length - 3} more examples
                    </p>
                  )}
                </div>
              ) : (
                <p>No examples found.</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Validation tab */}
      {activeTab === 'validation' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code to Validate</label>
            <textarea
              className="border rounded-md p-2 w-full h-40 font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Enter ${library} code to validate\n// For example: for React, enter JSX; for Tailwind, enter HTML with Tailwind classes`}
            />
          </div>
          
          <Button onClick={handleValidateCode} disabled={isLoading || !isConnected || !code}>
            Validate Code
          </Button>
          
          {isLoading && <div className="mt-4">Loading...</div>}
          
          {validationResult && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                Validation Results
              </h3>
              
              <div className={`p-3 rounded-md ${validationResult.valid ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="font-medium">
                  {validationResult.valid ? '✅ Code is valid' : '❌ Code is invalid'}
                </p>
                
                {validationResult.warnings && validationResult.warnings.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium">Warnings:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium">Errors:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}