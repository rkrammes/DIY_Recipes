"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import { useAudio } from '@/hooks/useAudio';
import { initializeModules } from '@/modules';
import { useModules } from '@/lib/modules';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface KraftTerminalModularLayoutProps {
  children: ReactNode;
  className?: string;
  onItemSelected?: (id: string | null) => void;
}

/**
 * KraftTerminalModularLayout - Combines the original KRAFT_AI terminal look
 * with the modular architecture in a fixed-height three-column layout:
 * 1. First column: Top-level categories
 * 2. Second column: Items within the selected category
 * 3. Third column: Active document
 */
export default function KraftTerminalModularLayout({
  children,
  className = '',
  onItemSelected
}: KraftTerminalModularLayoutProps) {
  const { theme, setTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { playSound } = useAudio();
  const { enabledModules, navigationItems } = useModules();
  
  const [systemStatus, setSystemStatus] = useState('checking');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [databaseStats, setDatabaseStats] = useState({ formulations: 0, ingredients: 0, tools: 0, library: 0 });
  const [activeCategory, setActiveCategory] = useState<string>('formulations');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [formulations, setFormulations] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  
  // Sections for the first column
  const SECTIONS = [
    { id: 'formulations', name: 'Formulations', icon: '📋' },
    { id: 'ingredients', name: 'Ingredients', icon: '🧪' },
    { id: 'tools', name: 'Tools', icon: '🔧' },
    { id: 'library', name: 'Library', icon: '📚' }
  ];
  
  // Initialize modules and check database connection
  useEffect(() => {
    console.log('Initializing modules in KRAFT Terminal style...');
    initializeModules();
    
    // Check Supabase connection
    const checkDatabaseConnection = async () => {
      try {
        // Set system status to checking during the connection attempt
        setSystemStatus('checking');
        
        // First check if tables exist before trying to query them
        const checkTableExists = async (tableName) => {
          try {
            const { error } = await supabase.from(tableName).select('count').limit(1);
            return !error || !error.message.includes('does not exist');
          } catch (e) {
            return false;
          }
        };
        
        // Check which tables exist
        const tablesExist = {
          recipes: await checkTableExists('recipes'),
          ingredients: await checkTableExists('ingredients'),
          tools: await checkTableExists('tools'),
          library: await checkTableExists('library')
        };
        
        console.log('Table existence check:', tablesExist);

        // Fetch data only from tables that exist
        let formulationsData = [], ingredientsData = [], toolsData = [], libraryData = [];
        
        if (tablesExist.recipes) {
          const result = await supabase.from('recipes').select('*').limit(100);
          formulationsData = result.data || [];
          if (result.error) console.error('Error fetching recipes:', result.error);
        }
        
        if (tablesExist.ingredients) {
          const result = await supabase.from('ingredients').select('*').limit(100);
          ingredientsData = result.data || [];
          if (result.error) console.error('Error fetching ingredients:', result.error);
        }
        
        if (tablesExist.tools) {
          const result = await supabase.from('tools').select('*').limit(100);
          toolsData = result.data || [];
          if (result.error) console.error('Error fetching tools:', result.error);
        }
        
        if (tablesExist.library) {
          const result = await supabase.from('library').select('*').limit(100);
          libraryData = result.data || [];
          if (result.error) console.error('Error fetching library:', result.error);
        }

        // Check if minimum required tables exist (recipes and ingredients)
        if (!tablesExist.recipes || !tablesExist.ingredients) {
          const missingTables = [];
          if (!tablesExist.recipes) missingTables.push('recipes');
          if (!tablesExist.ingredients) missingTables.push('ingredients');
          throw new Error(`Missing essential tables: ${missingTables.join(', ')}. Please run init-db-tables.sql script.`);
        }
        
        // If we got here, at least the essential tables are accessible
        setSystemStatus('online');
        setLastSyncTime(new Date());

        // Always set data based on what was retrieved, including empty arrays for missing tables
        setFormulations(formulationsData || []);
        setIngredients(ingredientsData || []);
        setTools(toolsData || []);
        setLibraryItems(libraryData || []);
        
        // Update database stats with the actual counts
        setDatabaseStats({
          formulations: formulationsData?.length || 0,
          ingredients: ingredientsData?.length || 0,
          tools: toolsData?.length || 0,
          library: libraryData?.length || 0
        });
        
        // Update connection status based on which tables exist
        const missingTables = [];
        if (!tablesExist.tools) missingTables.push('tools');
        if (!tablesExist.library) missingTables.push('library');
        
        if (missingTables.length > 0) {
          console.warn(`Missing optional tables: ${missingTables.join(', ')}. Some features may be limited.`);
        }
        
        console.log('Database connection successful');
        setConnectionError(null);
      } catch (error) {
        console.error('Database connection error:', error);
        
        // Set system status to offline
        setSystemStatus('offline');
        
        // Store the error message for display
        setConnectionError(error instanceof Error ? error.message : 'Unknown database connection error');
        
        // Clear all data - we only use real data
        setFormulations([]);
        setIngredients([]);
        setTools([]);
        setLibraryItems([]);
        setDatabaseStats({ formulations: 0, ingredients: 0, tools: 0, library: 0 });
      }
    };
    
    // Execute the check
    checkDatabaseConnection();
  }, []);

  // Helper for selecting a category
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedItemId(null);
    if (audioEnabled) playSound('click');
  };
  
  // Helper for selecting an item
  const handleItemSelect = (id: string | null) => {
    setSelectedItemId(id);
    if (id !== null && audioEnabled) playSound('click');
    
    // Call the onItemSelected callback if provided
    if (onItemSelected) {
      onItemSelected(id);
    }
  };
  
  // Get items for the second column based on active section

  const getItemsForCategory = () => {
    // If system is offline, return connection error message
    if (systemStatus === 'offline') {
      return [{ id: 'error', title: 'Database Connection Error', description: connectionError || 'Unable to connect to database' }];
    }
    
    // If system is still checking, return loading state
    if (systemStatus === 'checking') {
      return [{ id: 'loading', title: 'Loading...', description: 'Connecting to database...' }];
    }
    
    // Check if the table for this category exists
    const checkTableExists = async (tableName) => {
      try {
        const { error } = await supabase.from(tableName).select('count').limit(1);
        return !error || !error.message.includes('does not exist');
      } catch (e) {
        return false;
      }
    };
    
    // Map category to table name
    const categoryToTable = {
      formulations: 'recipes',
      ingredients: 'ingredients',
      tools: 'tools',
      library: 'library'
    };
    
    switch (activeCategory) {
      case 'formulations':
        // Use real data from Supabase
        if (formulations.length > 0) {
          return formulations.map(form => ({
            id: form.id,
            title: form.title,
            description: form.description || 'No description available'
          }));
        }
        // Empty state with connection message
        return [{ id: 'empty', title: 'No Formulations Available', description: 'Database connected, but no formulations found.' }];
      
      case 'ingredients':
        // Use real data from Supabase
        if (ingredients.length > 0) {
          return ingredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            description: ing.description || 'No description available'
          }));
        }
        // Empty state with connection message
        return [{ id: 'empty', title: 'No Ingredients Available', description: 'Database connected, but no ingredients found.' }];
      
      case 'tools':
        // If tools array is empty, check if the table exists
        if (tools.length === 0) {
          // Show a more specific message if the table is missing
          if (connectionError && connectionError.includes('tools')) {
            return [{ 
              id: 'missing-table', 
              title: 'Tools Table Missing', 
              description: 'The tools table does not exist in the database. Run init-db-tables.sql to create it.' 
            }];
          }
          return [{ 
            id: 'empty-tools', 
            title: 'No Tools Available', 
            description: 'Database connected, but no tools found.' 
          }];
        }
        
        // Use real data from Supabase
        return tools.map(tool => ({
          id: tool.id,
          title: tool.title,
          description: tool.description || 'No description available'
        }));
          
      case 'library':
        // If library array is empty, check if the table exists
        if (libraryItems.length === 0) {
          // Show a more specific message if the table is missing
          if (connectionError && connectionError.includes('library')) {
            return [{ 
              id: 'missing-table', 
              title: 'Library Table Missing', 
              description: 'The library table does not exist in the database. Run init-db-tables.sql to create it.' 
            }];
          }
          return [{ 
            id: 'empty-library', 
            title: 'No Library Items Available', 
            description: 'Database connected, but no library items found.' 
          }];
        }
        
        // Use real data from Supabase
        return libraryItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || 'No description available'
        }));
      
      default:
        return [];
    }
  };
  
  // Client-only components for system metrics
  function MemoryUsage() {
    const [usage, setUsage] = useState('--');
    useEffect(() => {
      setUsage(`${Math.floor(Math.random() * 30) + 70}%`);
      const interval = setInterval(() => {
        setUsage(`${Math.floor(Math.random() * 30) + 70}%`);
      }, 5000);
      return () => clearInterval(interval);
    }, []);
    return <>{usage}</>;
  }

  function CpuUsage() {
    const [usage, setUsage] = useState('--');
    useEffect(() => {
      setUsage(`${Math.floor(Math.random() * 15) + 5}%`);
      const interval = setInterval(() => {
        setUsage(`${Math.floor(Math.random() * 15) + 5}%`);
      }, 2000);
      return () => clearInterval(interval);
    }, []);
    return <>{usage}</>;
  }

  function CacheHitRate() {
    const [rate, setRate] = useState('--');
    useEffect(() => {
      setRate(`${Math.floor(Math.random() * 20) + 80}%`);
      const interval = setInterval(() => {
        setRate(`${Math.floor(Math.random() * 20) + 80}%`);
      }, 10000);
      return () => clearInterval(interval);
    }, []);
    return <>{rate}</>;
  }

  function NetworkLatency() {
    const [latency, setLatency] = useState('--');
    useEffect(() => {
      setLatency(`${Math.floor(Math.random() * 100) + 50}ms`);
      const interval = setInterval(() => {
        setLatency(`${Math.floor(Math.random() * 100) + 50}ms`);
      }, 3000);
      return () => clearInterval(interval);
    }, []);
    return <>{latency}</>;
  }

  function CurrentTime() {
    const [time, setTime] = useState('--:--:--');
    useEffect(() => {
      setTime(new Date().toLocaleTimeString());
      const interval = setInterval(() => {
        setTime(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearInterval(interval);
    }, []);
    return <>{time}</>;
  }

  function LastSyncTime({ lastSyncTime }: { lastSyncTime: Date | null }) {
    const [formattedTime, setFormattedTime] = useState('--:--:--');
    useEffect(() => {
      if (lastSyncTime) {
        setFormattedTime(lastSyncTime.toLocaleTimeString());
      }
    }, [lastSyncTime]);
    return <>{formattedTime}</>;
  }

  return (
    // Fixed size container that doesn't scroll
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme} ${className}`}>
      {/* Retro Terminal Header - Fixed height */}
      <div className="bg-surface-1 border-b border-border-subtle py-1 px-2 font-mono flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {/* Advanced ASCII logo with system indicators */}
            <div className="font-bold text-base tracking-tight whitespace-nowrap">
              <div className="text-accent">
                ┌───────────────────────────┐<br />
                │ <span className="animate-pulse">></span>KRAFT_AI TERMINAL v1.0.2 │<br />
                └───────────────────────────┘
              </div>
              <div className="text-xs text-text-secondary mt-1">
                <div className="flex justify-between">
                  <span>USER: DEV</span>
                  <span>SESSION: {Math.floor(Math.random() * 9000) + 1000}</span>
                </div>
                <div className="flex justify-between">
                  <span>ACCESS: ADMIN</span>
                  <span>UPTIME: <CurrentTime /></span>
                </div>
              </div>
            </div>
            
            {/* System monitoring panel */}
            <div className="text-xs border border-border-subtle p-1 bg-surface-0">
              <div className="text-accent font-bold mb-1">╔═ SYSTEM METRICS ═╗</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">CPU:</span>
                  <span className="text-accent"><CpuUsage /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">MEM:</span>
                  <span className="text-accent"><MemoryUsage /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">CACHE:</span>
                  <span className="text-accent"><CacheHitRate /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">NET:</span>
                  <span className="text-accent"><NetworkLatency /></span>
                </div>
              </div>
              <div className="mt-1 text-text-secondary">
                <div className="flex items-center">
                  <div>STATUS:</div>
                  <div className="ml-1 flex items-center">
                    {systemStatus === 'checking' ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="ml-1 text-amber-500">CHECKING</span>
                      </>
                    ) : systemStatus === 'online' ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="ml-1 text-green-500">ONLINE</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="ml-1 text-red-500">OFFLINE</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-xs">
                    DB SYNC: {lastSyncTime ? <LastSyncTime lastSyncTime={lastSyncTime} /> : 'NEVER'}
                  </span>
                  <span className="text-xs animate-pulse">
                    {systemStatus === 'checking' ? (
                      <span className="text-amber-500">CONNECTING...</span>
                    ) : systemStatus === 'online' ? (
                      <span className="text-green-500">▀ ▄ ▀ ▄</span>
                    ) : (
                      <span className="text-red-500">_ _ _ _</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Terminal command controls */}
            <div className="border border-border-subtle p-1 bg-surface-0">
              <div className="text-accent font-bold text-xs mb-1">╔═ TERMINAL CONTROLS ═╗</div>
              
              {/* Theme selector with terminal style UI */}
              <div className="grid grid-cols-1 text-xs gap-y-1 mb-2">
                <div 
                  onClick={() => {
                    if (theme !== 'hackers') {
                      setTheme('hackers');
                      if (audioEnabled) playSound('click');
                    }
                  }}
                  data-theme="hackers"
                  className="flex items-center cursor-pointer group"
                >
                  <span className={`mr-1 font-bold ${theme === 'hackers' ? 'text-emerald-500 animate-pulse' : 'text-text-secondary'}`}>
                    {theme === 'hackers' ? '[X]' : '[ ]'}
                  </span>
                  <span className={`${theme === 'hackers' ? 'text-emerald-500' : 'text-text-secondary group-hover:text-accent'}`}>
                    HACKERS_TERMINAL
                  </span>
                </div>
                
                <div 
                  onClick={() => {
                    if (theme !== 'dystopia') {
                      setTheme('dystopia');
                      if (audioEnabled) playSound('click');
                    }
                  }}
                  data-theme="dystopia"
                  className="flex items-center cursor-pointer group"
                >
                  <span className={`mr-1 font-bold ${theme === 'dystopia' ? 'text-amber-500 animate-pulse' : 'text-text-secondary'}`}>
                    {theme === 'dystopia' ? '[X]' : '[ ]'}
                  </span>
                  <span className={`${theme === 'dystopia' ? 'text-amber-500' : 'text-text-secondary group-hover:text-accent'}`}>
                    DYSTOPIA_CONSOLE
                  </span>
                </div>
                
                <div 
                  onClick={() => {
                    if (theme !== 'neotopia') {
                      setTheme('neotopia');
                      if (audioEnabled) playSound('click');
                    }
                  }}
                  data-theme="neotopia"
                  className="flex items-center cursor-pointer group"
                >
                  <span className={`mr-1 font-bold ${theme === 'neotopia' ? 'text-blue-500 animate-pulse' : 'text-text-secondary'}`}>
                    {theme === 'neotopia' ? '[X]' : '[ ]'}
                  </span>
                  <span className={`${theme === 'neotopia' ? 'text-blue-500' : 'text-text-secondary group-hover:text-accent'}`}>
                    NEOTOPIA_INTERFACE
                  </span>
                </div>
              </div>
              
              {/* Audio toggle with vintage VU meter style */}
              <div 
                onClick={() => {
                  setAudioEnabled(!audioEnabled);
                  if (audioEnabled) playSound('click');
                }}
                className="flex items-center cursor-pointer"
              >
                <div className={`text-xs ${audioEnabled ? 'text-purple-500' : 'text-text-secondary'}`}>
                  <div className="flex items-center">
                    <span className="mr-1 font-bold">{audioEnabled ? '[SND:ON]' : '[SND:OFF]'}</span>
                    <span className={`${audioEnabled ? 'animate-pulse' : ''}`}>
                      {audioEnabled ? '▮▮▮▮▮▯▯▯' : '▯▯▯▯▯▯▯▯'}
                    </span>
                  </div>
                  <div className="mt-1 border border-border-subtle h-1.5 w-full bg-surface-2 relative">
                    <div 
                      className={`absolute top-0 left-0 h-full ${audioEnabled ? 'bg-purple-500 animate-pulse' : 'bg-text-secondary'}`}
                      style={{ width: audioEnabled ? '70%' : '10%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side advanced console panel */}
          <div className="flex flex-col border border-border-subtle p-1 bg-surface-0 w-96">
            <div className="text-xs text-accent font-bold mb-1 flex justify-between">
              <span>╔═ COMMAND INTERFACE ═╗</span>
              <span className="text-green-500 animate-pulse">READY</span>
            </div>
            
            {/* Terminal-style search command box */}
            <div className="bg-surface-2 border border-border-subtle p-1 mb-1">
              <div className="flex items-center mb-1">
                <span className="text-text-secondary text-xs mr-1">KAI_TERMINAL$</span>
                <span className="text-accent text-xs">search --scope={activeCategory}</span>
                <span className="text-accent animate-pulse ml-1">_</span>
              </div>
              
              <div className="relative">
                <span className="absolute left-1 top-1 text-text-secondary text-xs">&gt;</span>
                <input
                  type="text"
                  placeholder={`Enter search query for ${activeCategory}...`}
                  className="w-full px-5 py-1 bg-surface-0 border border-accent text-xs font-mono"
                />
              </div>
              
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-text-secondary">
                  {systemStatus === 'checking' 
                    ? 'DATABASE: CONNECTING...' 
                    : systemStatus === 'offline'
                      ? 'DATABASE: ERROR'
                      : `MATCHING: ${getItemsForCategory().length} ITEMS`
                  }
                </span>
                <span className={`
                  ${systemStatus === 'checking' ? 'text-amber-500 animate-pulse' : 
                    systemStatus === 'offline' ? 'text-red-500' : 'text-accent'}
                `}>
                  {systemStatus === 'checking' 
                    ? 'CONNECTING' 
                    : systemStatus === 'offline'
                      ? 'OFFLINE'
                      : 'READY'
                  }
                </span>
              </div>
            </div>
            
            {/* System logs panel */}
            <div className="bg-surface-2 border border-border-subtle p-1 text-xs h-16 overflow-y-auto flex-shrink-0">
              <div className="text-text-secondary">[{new Date().toISOString().split('T')[0]} <CurrentTime />] System initialized</div>
              
              {systemStatus === 'checking' && (
                <div className="text-amber-500 animate-pulse">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Attempting database connection...</div>
              )}
              
              {systemStatus === 'online' && (
                <>
                  <div className="text-green-500">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Database connection established</div>
                  <div className="text-text-secondary">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Loaded {databaseStats.formulations} formulations</div>
                  <div className="text-text-secondary">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Loaded {databaseStats.ingredients} ingredients</div>
                </>
              )}
              
              {systemStatus === 'offline' && (
                <div className="text-red-500">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Database connection failed: {connectionError || 'Connection error'}</div>
              )}
              
              <div className="text-accent">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Theme activated: {theme.toUpperCase()}</div>
              <div className="text-purple-500">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Audio system: {audioEnabled ? 'ENABLED' : 'DISABLED'}</div>
              <div className="text-amber-500 animate-pulse">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Ready for input _</div>
            </div>
            
            {/* ASCII-art status indicators */}
            <div className="flex justify-between text-xs mt-1">
              <div className="flex items-center space-x-2">
                <span className={`px-1 py-0.5 ${systemStatus === 'online' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                  {systemStatus.toUpperCase()}
                </span>
                
                <span className="text-text-secondary">
                  ITEMS: {databaseStats.formulations + databaseStats.ingredients}
                </span>
                
                <span className="text-text-secondary">
                  CACHE: <CacheHitRate />
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-xs text-text-secondary mr-2">SERVER:</span>
                <span className={`${systemStatus === 'online' ? 'text-green-500' : 'text-red-500'} animate-pulse`}>
                  {systemStatus === 'online' ? '▮▮▮▮▮▮' : '▯▯▯▯▯▯'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Three Column Layout with Retro Terminal UI - Flexible height */}
      <div className="flex flex-1 overflow-hidden font-mono">
        {/* First Column - Top-level Categories (Modules) */}
        <div className="w-48 bg-surface-1 border-r-2 border-border-subtle flex flex-col flex-shrink-0">
          <div className="py-1 pl-2 text-xs uppercase text-accent bg-surface-2 border-b-2 border-border-subtle">
            ┌─────────────────────┐
            <br />
            │ SYSTEM DIRECTORIES  │
            <br />
            └─────────────────────┘
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {SECTIONS.map(section => (
              <div
                key={section.id}
                data-category={section.id}
                className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                  activeCategory === section.id 
                    ? 'bg-accent/20 text-accent font-bold' 
                    : 'hover:bg-surface-2 text-text-secondary'
                }`}
                onClick={() => handleCategorySelect(section.id)}
              >
                <span className="mr-2 font-bold">{activeCategory === section.id ? '►' : ' '}</span>
                <span className="mr-2 text-lg">{section.icon}</span>
                <span className="uppercase">{section.name}</span>
                {activeCategory === section.id && <span className="ml-2 animate-pulse">_</span>}
              </div>
            ))}
          </div>
          
          {/* ASCII decorations */}
          <div className="mt-4 px-3 text-text-secondary text-xs">
            <div className="mb-2">
              ════════════════════
            </div>
            <div>
              {systemStatus === 'checking' ? (
                <>
                  <span className="text-amber-500 animate-pulse">● </span>CONNECTING...
                  <br />
                  <br />
                  DATABASE CONNECTION
                  <br />
                  IN PROGRESS
                  <br />
                  <span className="text-amber-500 animate-pulse">&gt; _</span>
                </>
              ) : systemStatus === 'online' ? (
                <>
                  <span className="text-green-500">● </span>SYSTEM READY
                  <br />
                  <br />
                  RAM: <MemoryUsage />
                  <br />
                  NET: <NetworkLatency />
                  <br />
                  <span className="text-accent animate-pulse">&gt; _</span>
                </>
              ) : (
                <>
                  <span className="text-red-500">● </span>CONNECTION ERROR
                  <br />
                  <br />
                  {connectionError ? (
                    <>
                      <div className="text-red-500">ERROR DETAILS:</div>
                      <div className="text-xs max-w-[120px] truncate">
                        {connectionError.length > 20 
                          ? `${connectionError.substring(0, 20)}...` 
                          : connectionError}
                      </div>
                    </>
                  ) : (
                    'AWAITING CONNECTION...'
                  )}
                  <br />
                  <span className="text-red-500 animate-pulse">...</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Column - Items for Selected Category */}
        <div className="w-64 border-r-2 border-border-subtle bg-surface-0 flex flex-col flex-shrink-0">
          <div className="p-2 border-b-2 border-border-subtle bg-surface-1">
            <div className="text-xs text-accent mb-1">┌──────────────────────────────┐</div>
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-bold text-accent">
                {SECTIONS.find(s => s.id === activeCategory)?.name.toUpperCase() || 'ITEMS'}
              </span>
              <button className="w-6 h-6 flex items-center justify-center text-accent hover:text-accent/80 text-lg">
                [+]
              </button>
            </div>
            <div className="text-xs text-accent">└──────────────────────────────┘</div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {getItemsForCategory().map((item, index) => (
              <div
                key={item.id}
                data-item={item.id}
                className={`px-3 py-1.5 cursor-pointer transition-colors border-b border-border-subtle ${
                  selectedItemId === item.id 
                    ? 'bg-accent/20 text-accent' 
                    : 'text-text-secondary hover:bg-surface-1 bg-surface-1'
                }`}
                onClick={() => handleItemSelect(item.id)}
              >
                <div className="flex items-center">
                  <span className="mr-2 font-bold">{selectedItemId === item.id ? '►' : `${index+1}.`}</span>
                  <div>
                    <div className="font-medium truncate">{item.title || item.name}</div>
                    {item.description && (
                      <div className="text-xs truncate opacity-80">{item.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* ASCII-art item counter */}
          <div className="p-2 border-t-2 border-border-subtle text-text-secondary text-xs">
            <div>────────────────────────────</div>
            <div className="flex justify-between px-2">
              <span>{getItemsForCategory().length} ITEMS</span>
              <span className="text-accent">{selectedItemId ? 'ITEM SELECTED' : 'NO SELECTION'}</span>
            </div>
          </div>
        </div>
        
        {/* Third Column - Detail View / Active Document */}
        <div className="flex-1 overflow-hidden">
          <div className="border-b-2 border-border-subtle p-1 bg-surface-1 sticky top-0 z-10">
            <div className="text-xs text-accent">┌──────────────────────────────────────────────────────────┐</div>
            <div className="px-2 text-sm text-accent font-bold">
              ACTIVE DOCUMENT: {selectedItemId ? (() => {
                // Get the active item's title
                const item = getItemsForCategory().find(i => i.id === selectedItemId);
                return item?.title || item?.name || 'SELECTED ITEM';
              })() : 'NONE SELECTED'}
            </div>
            <div className="text-xs text-accent">└──────────────────────────────────────────────────────────┘</div>
          </div>
          
          <div className="h-full overflow-auto">
            {/* Database connection error */}
            {systemStatus === 'offline' && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-6xl mb-6 text-red-500">⚠️</div>
                <h2 className="text-2xl font-bold mb-3 text-red-500">Database Connection Error</h2>
                <div className="border border-red-500 bg-red-500/10 p-4 mb-6 rounded text-left max-w-md">
                  <p className="text-red-500 font-bold mb-2">Error Details:</p>
                  <p className="text-text-secondary">
                    {connectionError || 'Unable to connect to the database. Please check your connection settings and try again.'}
                  </p>
                </div>
                <p className="text-text-secondary max-w-md">
                  The application is unable to connect to the Supabase database. This is required for 
                  accessing formulations and ingredients. No mock data is available as a fallback.
                </p>
              </div>
            )}
            
            {/* Database connection in progress */}
            {systemStatus === 'checking' && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-6xl mb-6 text-amber-500 animate-pulse">🔄</div>
                <h2 className="text-2xl font-bold mb-3 text-amber-500">Connecting to Database...</h2>
                <div className="w-64 h-2 bg-surface-2 rounded-full mb-6">
                  <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-text-secondary max-w-md">
                  Establishing connection to the Supabase database. This might take a few moments.
                </p>
              </div>
            )}
            
            {/* Normal operation */}
            {systemStatus === 'online' && (
              selectedItemId ? (
                children
              ) : (
                /* Otherwise show a placeholder */
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-6xl mb-6">
                    {activeCategory === 'formulations' ? '📋' : 
                     activeCategory === 'ingredients' ? '🧪' : 
                     activeCategory === 'tools' ? '🔧' : '📚'}
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Select a {activeCategory.slice(0, -1)} to view</h2>
                  <p className="text-text-secondary max-w-md">
                    Choose an item from the list on the left to view and edit its details in this panel.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Advanced Terminal Footer with Detailed Stats and Logs - Fixed height */}
      <div className="bg-surface-1 border-t-2 border-border-subtle py-1 px-4 font-mono text-xs flex-shrink-0">
        <div className="grid grid-cols-12 gap-2">
          {/* System Status Panel */}
          <div className="col-span-3 border border-border-subtle bg-surface-0 p-1">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span>SYS_STATUS</span>
              <span className={systemStatus === 'online' ? 'text-green-500' : 'text-red-500'}>
                [{systemStatus.toUpperCase()}]
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">UPTIME:</span>
                <span>{Math.floor(Math.random() * 24) + 1}h {Math.floor(Math.random() * 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">SESS_ID:</span>
                <span>#{Math.floor(Math.random() * 9000) + 1000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">DB_CONN:</span>
                <span className={systemStatus === 'online' ? 'text-green-500' : 'text-red-500'}>
                  {systemStatus === 'online' ? 'ACTIVE' : 'FAILED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">API:</span>
                <span className="text-green-500">READY</span>
              </div>
            </div>
            
            {/* System meters visualization */}
            <div className="mt-1 grid grid-cols-2 gap-x-1">
              <div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">CPU</span>
                  <span><CpuUsage /></span>
                </div>
                <div className="w-full bg-surface-2 border border-border-subtle h-1.5 mt-0.5">
                  <div className="bg-accent h-full" style={{ width: `${parseInt((Math.random() * 15 + 5).toString())}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">MEM</span>
                  <span><MemoryUsage /></span>
                </div>
                <div className="w-full bg-surface-2 border border-border-subtle h-1.5 mt-0.5">
                  <div className="bg-accent h-full" style={{ width: `${parseInt((Math.random() * 30 + 70).toString())}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Module Registry Stats Panel */}
          <div className="col-span-3 border border-border-subtle bg-surface-0 p-1">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span>MODULE_STATISTICS</span>
              <span className={`
                ${systemStatus === 'checking' ? 'text-amber-500 animate-pulse' : 
                  systemStatus === 'online' ? 'text-green-500' : 
                  'text-red-500'}
              `}>
                {systemStatus === 'checking' ? 'CONNECTING...' :
                  systemStatus === 'online' ? (
                    <LastSyncTime lastSyncTime={lastSyncTime} />
                  ) : 'DISCONNECTED'
                }
              </span>
            </div>
            
            <div className="mb-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-text-secondary">FORMULATIONS:</span>
                <span className="font-bold">{databaseStats.formulations}</span>
                <span className="text-text-secondary">TOTAL:</span>
                <span className="font-bold">
                  {systemStatus === 'online' ? databaseStats.formulations * 3 : '--'}
                </span>
              </div>
              <div className="w-full bg-surface-2 border border-border-subtle h-1">
                <div 
                  className={`${systemStatus === 'online' ? 'bg-emerald-500' : 
                            systemStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 
                            'bg-red-500'} h-full`} 
                  style={{ 
                    width: systemStatus === 'online' 
                      ? `${Math.min(databaseStats.formulations * 7, 100)}%` 
                      : systemStatus === 'checking' ? '30%' : '10%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="mb-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-text-secondary">INGREDIENTS:</span>
                <span className="font-bold">{databaseStats.ingredients}</span>
                <span className="text-text-secondary">USED:</span>
                <span className="font-bold">
                  {systemStatus === 'online' ? Math.floor(databaseStats.ingredients * 0.8) : '--'}
                </span>
              </div>
              <div className="w-full bg-surface-2 border border-border-subtle h-1">
                <div 
                  className={`${systemStatus === 'online' ? 'bg-blue-500' : 
                            systemStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 
                            'bg-red-500'} h-full`} 
                  style={{ 
                    width: systemStatus === 'online' 
                      ? `${Math.min(databaseStats.ingredients * 3, 100)}%` 
                      : systemStatus === 'checking' ? '50%' : '10%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="text-text-secondary">MODULES:</span>
                <span className="text-accent">3</span>
              </div>
              <div className="text-xs">
                <span className={`
                  ${systemStatus === 'checking' ? 'text-amber-500 animate-pulse' : 
                    systemStatus === 'online' ? 'text-green-500 animate-pulse' : 
                    'text-red-500'}
                `}>
                  {systemStatus === 'checking' ? '▮▮▯▯▯▯' : 
                   systemStatus === 'online' ? '▮▮▮▮▯▯' : 
                   '▯▯▯▯▯▯'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Live System Log Stream */}
          <div className="col-span-4 border border-border-subtle bg-surface-0 p-1">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span>LIVE_SYSTEM_LOG</span>
              <span className="text-green-500 animate-pulse">STREAMING</span>
            </div>
            
            <div className="h-16 overflow-y-auto bg-surface-2 p-1 font-mono text-[10px] leading-tight">
              <div className="text-text-secondary">[<CurrentTime />] System resources initialized successfully</div>
              <div className="text-text-secondary">[<CurrentTime />] Cache size optimized (64MB)</div>
              <div className="text-green-500">[<CurrentTime />] Database connection established to supabase.co</div>
              <div className="text-text-secondary">[<CurrentTime />] Auth provider initialized with DEV profile</div>
              <div className="text-text-secondary">[<CurrentTime />] Loaded formulation data ({databaseStats.formulations} entries)</div>
              <div className="text-text-secondary">[<CurrentTime />] Loaded ingredient data ({databaseStats.ingredients} entries)</div>
              <div className="text-accent">[<CurrentTime />] Theme activated: {theme.toUpperCase()}</div>
              <div className="text-accent">[<CurrentTime />] UI rendering complete (React hydration)</div>
              <div className="text-amber-500">[<CurrentTime />] Font loading completed with fallbacks</div>
              <div className="text-text-secondary">[<CurrentTime />] Audio system {audioEnabled ? 'enabled' : 'disabled'}</div>
              <div className="text-purple-500">[<CurrentTime />] Formulation processor initialized</div>
              <div className="text-green-500">[<CurrentTime />] Module System activated</div>
              <div className="text-amber-500 animate-pulse">[<CurrentTime />] Awaiting user input _</div>
            </div>
          </div>
          
          {/* Command & F-Key Bar */}
          <div className="col-span-2 border border-border-subtle bg-surface-0 p-1">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span>COMMANDS</span>
              <span className="text-amber-500">MODULE_SYS</span>
            </div>
            
            <div className="grid grid-cols-1 gap-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">F1:</span>
                <span className="text-accent">HELP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">F2:</span>
                <span className="text-accent">SAVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">F3:</span>
                <span className="text-accent">SEARCH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">F10:</span>
                <span className="text-accent animate-pulse">QUIT</span>
              </div>
            </div>
            
            <div className="mt-1 flex items-center justify-between">
              <span className="text-text-secondary">ACTIVE:</span>
              <span className="text-accent font-bold">MODULES</span>
            </div>
          </div>
          
          {/* System Branding */}
          <div className="cols-span-12 md:col-span-12 lg:col-span-12 flex justify-between items-end mt-1">
            <div className="flex items-center">
              <span className="text-text-secondary">
                KRAFT_AI_TERMINAL v1.0.2 | <span className="text-accent">MODULE_SYSTEM v2.0</span> | 
                <span className={systemStatus === 'online' ? 'text-green-500' : 'text-red-500'}>
                  {' '}{systemStatus.toUpperCase()}
                </span>
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-text-secondary">
                NET: <NetworkLatency />
              </div>
              <div>
                <span className={`${systemStatus === 'online' ? 'text-green-500' : 'text-red-500'} animate-pulse`}>
                  {systemStatus === 'online' ? '▀ ▄ ▀ ▄ ▀ ▄ ▀ ▄' : '_ _ _ _ _ _ _ _'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}