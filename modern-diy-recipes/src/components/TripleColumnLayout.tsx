'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import { useAudio } from '@/hooks/useAudio';
import ThemeControls from './ThemeControls';
import { supabase } from '@/lib/supabase';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import RecipeDetails from './RecipeDetails';
import ErrorBoundary from './ErrorBoundary';

// Navigation sections for the first column
const SECTIONS = [
  { id: 'recipes', name: 'Recipes', icon: '📋' },
  { id: 'ingredients', name: 'Ingredients', icon: '🧪' },
  { id: 'tools', name: 'Tools', icon: '🔧' },
  { id: 'library', name: 'Library', icon: '📚' }
];

export default function TripleColumnLayout() {
  // Core state
  const { theme, setTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { playSound } = useAudio();
  const { recipes, loading: recipesLoading, error: recipesError } = useRecipes();
  const { ingredients, loading: ingredientsLoading } = useIngredients();
  
  // UI state
  const [activeSection, setActiveSection] = useState('recipes');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [systemStatus, setSystemStatus] = useState('online');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [databaseStats, setDatabaseStats] = useState({ recipes: 0, ingredients: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Check connection status on load
  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from('recipes').select('count', { count: 'exact', head: true });
        setSystemStatus(error ? 'offline' : 'online');
        setLastSyncTime(new Date());
      } catch (error) {
        setSystemStatus('offline');
      }
    }
    
    checkConnection();
    
    // Set interval to check connection every minute
    const interval = setInterval(checkConnection, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Update stats when data changes
  useEffect(() => {
    setDatabaseStats({
      recipes: recipes?.length || 0,
      ingredients: ingredients?.length || 0
    });
  }, [recipes, ingredients]);

  // Handle section selection
  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    setSelectedItemId(null);
    if (audioEnabled) playSound('click');
  };

  // Handle item selection in second column
  const handleItemSelect = (id: string | null) => {
    console.log(`Item selection changed: ${id === null ? 'null' : id}`);
    
    // Update the selected item ID
    setSelectedItemId(id);
    
    if (id !== null && audioEnabled) {
      playSound('click');
    }
    
    // For diagnostic purposes - track what happens during selection
    if (id === null) {
      console.log('Selection cleared temporarily - likely for refresh');
    } else if (id === selectedItemId) {
      console.log(`Re-selected same item: ${id} - this will refresh the details view`);
    } else {
      console.log(`New selection: ${id}`);
    }
  };

  // Get items for the second column based on active section
  const getItemsForSection = () => {
    switch (activeSection) {
      case 'recipes':
        return recipes || [];
      case 'ingredients':
        return ingredients || [];
      case 'tools':
        return [
          { id: 'converter', title: 'Unit Converter', description: 'Convert between different units of measurement' },
          { id: 'timer', title: 'Recipe Timer', description: 'Keep track of cooking times' },
          { id: 'calculator', title: 'Scaling Calculator', description: 'Scale recipe quantities up or down' }
        ];
      case 'library':
        return [
          { id: 'techniques', title: 'Cooking Techniques', description: 'Reference for common cooking techniques' },
          { id: 'substitutions', title: 'Ingredient Substitutions', description: 'Find alternatives for ingredients' },
          { id: 'measurements', title: 'Measurement Guide', description: 'Standard measurement conversions' }
        ];
      default:
        return [];
    }
  };

  // Filter items based on search query
  const filteredItems = getItemsForSection().filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render content for the third column
  const renderDetailContent = () => {
    if (!selectedItemId) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-6xl mb-6">
            {activeSection === 'recipes' ? '📋' : 
             activeSection === 'ingredients' ? '🧪' : 
             activeSection === 'tools' ? '🔧' : '📚'}
          </div>
          <h2 className="text-2xl font-bold mb-3">Select a {activeSection.slice(0, -1)} to view</h2>
          <p className="text-text-secondary max-w-md">
            Choose an item from the list on the left to view and edit its details in this panel.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case 'recipes':
        // If we have a selectedItemId but can't find the recipe in the list,
        // just pass the ID to let RecipeDetails fetch it from the API
        const selectedRecipe = recipes?.find(r => r.id === selectedItemId);
        console.log("Selected recipe:", selectedRecipe || { id: selectedItemId, message: "Recipe data not available in list" });
        
        // Generate a unique component key that changes whenever the ID changes
        // This ensures complete re-mounting of the component
        const componentKey = `recipe-details-${selectedItemId}-${Date.now()}`;
        
        // We'll force a log of the recipe data to help debug
        if (selectedRecipe) {
          console.log("Recipe details being passed to RecipeDetails component:", JSON.stringify({
            id: selectedRecipe.id,
            title: selectedRecipe.title,
            description: selectedRecipe.description,
            ingredients: selectedRecipe.ingredients ? `${selectedRecipe.ingredients.length} ingredients` : 'no ingredients'
          }, null, 2));
        }
        
        return (
          <ErrorBoundary fallback={
            <div className="p-4 bg-surface-1 rounded-lg border border-border-subtle">
              <h3 className="text-lg font-semibold mb-2">Error Loading Recipe</h3>
              <p className="text-text-secondary mb-4">
                There was a problem displaying the recipe details. 
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    // Force refresh by cycling the selection
                    setSelectedItemId(null);
                    setTimeout(() => setSelectedItemId(selectedItemId), 100);
                  }}
                  className="px-3 py-1 bg-accent text-white rounded hover:bg-accent-hover"
                >
                  Retry
                </button>
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="px-3 py-1 bg-surface-2 rounded hover:bg-surface-3"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          }>
            <RecipeDetails 
              key={componentKey} // Force re-render with a truly unique key
              recipeId={selectedItemId} 
              initialRecipeData={selectedRecipe}
            />
          </ErrorBoundary>
        );
      case 'ingredients':
        const ingredient = ingredients?.find(i => i.id === selectedItemId);
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{ingredient?.name || 'Ingredient Details'}</h2>
            <div className="bg-surface-1 p-4 rounded-md mb-4">
              <p><strong>Description:</strong> {ingredient?.description || 'No description available'}</p>
            </div>
            <h3 className="text-xl font-semibold mb-3">Used In Recipes</h3>
            <div className="bg-surface-1 p-4 rounded-md">
              {recipes?.filter(r => r.ingredients?.some(i => i.id === selectedItemId)).length 
                ? recipes?.filter(r => r.ingredients?.some(i => i.id === selectedItemId))
                   .map(recipe => (
                    <div key={recipe.id} className="mb-2 p-2 hover:bg-surface-2 rounded-md cursor-pointer"
                         onClick={() => {
                           setActiveSection('recipes');
                           setSelectedItemId(recipe.id);
                         }}>
                      {recipe.title}
                    </div>
                  ))
                : <p className="text-text-secondary">Not used in any recipes yet</p>
              }
            </div>
          </div>
        );
      case 'tools':
      case 'library':
        const item = getItemsForSection().find(i => i.id === selectedItemId);
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{item?.title}</h2>
            <p className="mb-6 text-text-secondary">{item?.description}</p>
            <div className="bg-surface-1 p-4 rounded-md">
              <p>This feature is coming soon! 🚧</p>
            </div>
          </div>
        );
      default:
        return <div>No content available</div>;
    }
  };

// Client-only components for system metrics
// These use useEffect and useState to avoid hydration mismatches
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

function IterationsCount() {
  const [count, setCount] = useState('--');

  useEffect(() => {
    setCount(`${Math.floor(Math.random() * 10) + 5}`);
  }, []);
  
  return <>{count}</>;
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
    // Set initial time
    setTime(new Date().toLocaleTimeString());
    
    // Update time every second
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

function SystemStatusIndicator({ status }: { status: string }) {
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    setIsOnline(status === 'online');
  }, [status]);
  
  return (
    <>
      <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
      <span>{isOnline ? 'DB Connected' : 'Offline'}</span>
    </>
  );
}

function SystemStatusText({ status }: { status: string }) {
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    setIsOnline(status === 'online');
  }, [status]);
  
  return (
    <span className={`font-medium ml-1 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
      {isOnline ? 'Connected' : 'Offline'}
    </span>
  );
}

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {/* Retro Terminal Header */}
      <div className="bg-surface-1 border-b border-border-subtle py-1 px-2 font-mono">
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
                    <span className={`inline-block w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="ml-1">{systemStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-xs">
                    DB SYNC: <LastSyncTime lastSyncTime={lastSyncTime} />
                  </span>
                  <span className="text-xs text-green-500 animate-pulse">
                    {systemStatus === 'online' ? '▀ ▄ ▀ ▄' : '_ _ _ _'}
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
                <span className="text-accent text-xs">search --scope={activeSection}</span>
                <span className="text-accent animate-pulse ml-1">_</span>
              </div>
              
              <div className="relative">
                <span className="absolute left-1 top-1 text-text-secondary text-xs">&gt;</span>
                <input
                  type="text"
                  placeholder={`Enter search query for ${activeSection}...`}
                  className="w-full px-5 py-1 bg-surface-0 border border-accent text-xs font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-text-secondary">MATCHING: {filteredItems.length} ITEMS</span>
                <span className="text-accent">{searchQuery ? 'SEARCHING...' : 'READY'}</span>
              </div>
            </div>
            
            {/* System logs panel */}
            <div className="bg-surface-2 border border-border-subtle p-1 text-xs h-16 overflow-y-auto">
              <div className="text-text-secondary">[{new Date().toISOString().split('T')[0]} <CurrentTime />] System initialized</div>
              <div className="text-green-500">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Database connection established</div>
              <div className="text-text-secondary">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Loaded {databaseStats.recipes} recipes</div>
              <div className="text-text-secondary">[{new Date().toISOString().split('T')[0]} <CurrentTime />] Loaded {databaseStats.ingredients} ingredients</div>
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
                  ITEMS: {databaseStats.recipes + databaseStats.ingredients}
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
      
      {/* Main Three Column Layout with Retro Terminal UI */}
      <div className="flex flex-1 overflow-hidden font-mono">
        {/* First Column - ASCII-styled Main Categories */}
        <div className="w-52 bg-surface-1 border-r-2 border-border-subtle flex flex-col">
          <div className="py-1 pl-2 text-xs uppercase text-accent bg-surface-2 border-b-2 border-border-subtle">
            ┌─────────────────────┐
            <br />
            │ SYSTEM DIRECTORIES  │
            <br />
            └─────────────────────┘
          </div>
          
          {SECTIONS.map(section => (
            <div
              key={section.id}
              className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                activeSection === section.id 
                  ? 'bg-accent/20 text-accent font-bold' 
                  : 'hover:bg-surface-2 text-text-secondary'
              }`}
              onClick={() => handleSectionSelect(section.id)}
            >
              <span className="mr-2 font-bold">{activeSection === section.id ? '►' : ' '}</span>
              <span className="mr-2 text-lg">{section.icon}</span>
              <span className="uppercase">{section.name}</span>
              {activeSection === section.id && <span className="ml-2 animate-pulse">_</span>}
            </div>
          ))}
          
          {/* ASCII decorations */}
          <div className="mt-4 px-3 text-text-secondary text-xs">
            <div className="mb-2">
              ════════════════════
            </div>
            <div>
              {systemStatus === 'online' ? (
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
                  AWAITING CONNECTION...
                  <br />
                  <span className="animate-pulse">...</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Column - Items List with ASCII art */}
        <div className="w-64 border-r-2 border-border-subtle bg-surface-0 flex flex-col">
          <div className="p-2 border-b-2 border-border-subtle bg-surface-1">
            <div className="text-xs text-accent mb-1">┌──────────────────────────────┐</div>
            <div className="flex justify-between items-center px-2">
              <span className="text-sm font-bold text-accent">
                {SECTIONS.find(s => s.id === activeSection)?.name.toUpperCase() || 'ITEMS'}
              </span>
              <button className="w-6 h-6 flex items-center justify-center text-accent hover:text-accent/80 text-lg">
                [+]
              </button>
            </div>
            <div className="text-xs text-accent">└──────────────────────────────┘</div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {(activeSection === 'recipes' && recipesLoading) || (activeSection === 'ingredients' && ingredientsLoading) ? (
              <div className="p-4 text-accent text-xs animate-pulse">
                LOADING DATA...
                <br />
                <br />
                PLEASE WAIT.
                <br />
                ▄■■■■■■▄
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-text-secondary text-xs">
                NO ITEMS FOUND
                <br />
                <br />
                USE [+] TO CREATE NEW ENTRY
              </div>
            ) : (
              <div>
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`px-3 py-1.5 cursor-pointer transition-colors border-b border-border-subtle ${
                      selectedItemId === item.id 
                        ? 'bg-accent/20 text-accent' 
                        : 'text-text-secondary hover:bg-surface-1 bg-surface-1'
                    }`}
                    onClick={() => {
                      console.log(`Clicked on recipe: ${item.id} - ${item.title || item.name}`);
                      handleItemSelect(item.id);
                    }}
                  >
                    <div className="flex items-center" data-testid="recipe-card">
                      <span className="mr-2 font-bold">{selectedItemId === item.id ? '►' : `${index+1}.`}</span>
                      <div>
                        <div className="font-medium truncate" data-testid="recipe-title">{item.title || item.name}</div>
                        {item.description && (
                          <div className="text-xs truncate opacity-80">{item.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* ASCII-art item counter */}
          <div className="p-2 border-t-2 border-border-subtle text-text-secondary text-xs">
            <div>────────────────────────────</div>
            <div className="flex justify-between px-2">
              <span>{filteredItems.length} ITEMS</span>
              <span className="text-accent">{selectedItemId ? 'ITEM SELECTED' : 'NO SELECTION'}</span>
            </div>
          </div>
        </div>
        
        {/* Third Column - Detail View / ASCII-styled Working Area */}
        <div className="flex-1 bg-surface-0 overflow-y-auto border-l border-border-subtle">
          <div className="border-b-2 border-border-subtle p-1 bg-surface-1">
            <div className="text-xs text-accent">┌──────────────────────────────────────────────────────────┐</div>
            <div className="px-2 text-sm text-accent font-bold">
              ACTIVE DOCUMENT: {selectedItemId ? (() => {
                // Force re-evaluation of title each time by getting latest data
                const item = filteredItems.find(i => i.id === selectedItemId);
                return item?.title || item?.name || 'SELECTED ITEM';
              })() : 'NONE SELECTED'}
            </div>
            <div className="text-xs text-accent">└──────────────────────────────────────────────────────────┘</div>
          </div>
          
          <div className="p-2">
            {renderDetailContent()}
          </div>
        </div>
      </div>
      
      {/* Advanced Terminal Footer with Detailed Stats and Logs */}
      <div className="bg-surface-1 border-t-2 border-border-subtle py-1 px-4 font-mono text-xs">
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
          
          {/* Database Stats Panel */}
          <div className="col-span-3 border border-border-subtle bg-surface-0 p-1">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span>DB_STATISTICS</span>
              <span className="text-green-500">
                <LastSyncTime lastSyncTime={lastSyncTime} />
              </span>
            </div>
            
            <div className="mb-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-text-secondary">RECIPES:</span>
                <span className="font-bold">{databaseStats.recipes}</span>
                <span className="text-text-secondary">REFS:</span>
                <span className="font-bold">{databaseStats.recipes * 3}</span>
              </div>
              <div className="w-full bg-surface-2 border border-border-subtle h-1">
                <div className="bg-emerald-500 h-full" style={{ width: `${databaseStats.recipes * 10}%` }}></div>
              </div>
            </div>
            
            <div className="mb-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-text-secondary">INGREDIENTS:</span>
                <span className="font-bold">{databaseStats.ingredients}</span>
                <span className="text-text-secondary">USED:</span>
                <span className="font-bold">{Math.floor(databaseStats.ingredients * 0.8)}</span>
              </div>
              <div className="w-full bg-surface-2 border border-border-subtle h-1">
                <div className="bg-blue-500 h-full" style={{ width: `${databaseStats.ingredients * 5}%` }}></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="text-text-secondary">CACHE HIT:</span>
                <span className="text-accent"><CacheHitRate /></span>
              </div>
              <div className="text-xs">
                <span className={`${systemStatus === 'online' ? 'text-green-500' : 'text-red-500'} animate-pulse`}>
                  {systemStatus === 'online' ? '▮▮▮▮▯▯' : '▯▯▯▯▯▯'}
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
              <div className="text-text-secondary">[<CurrentTime />] Loaded recipe data ({databaseStats.recipes} entries)</div>
              <div className="text-text-secondary">[<CurrentTime />] Loaded ingredient data ({databaseStats.ingredients} entries)</div>
              <div className="text-accent">[<CurrentTime />] Theme activated: {theme.toUpperCase()}</div>
              <div className="text-accent">[<CurrentTime />] UI rendering complete (React hydration)</div>
              <div className="text-amber-500">[<CurrentTime />] Font loading completed with fallbacks</div>
              <div className="text-text-secondary">[<CurrentTime />] Audio system {audioEnabled ? 'enabled' : 'disabled'}</div>
              <div className="text-purple-500">[<CurrentTime />] Recipe processor initialized</div>
              <div className="text-green-500">[<CurrentTime />] All systems nominal</div>
              <div className="text-amber-500 animate-pulse">[<CurrentTime />] Awaiting user input _</div>
            </div>
          </div>
          
          {/* Command & F-Key Bar */}
          <div className="col-span-2 border border-border-subtle bg-surface-0 p-1">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span>COMMANDS</span>
              <span className="text-amber-500">{activeSection.toUpperCase()}</span>
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
              <span className="text-accent font-bold">{selectedItemId ? 'ITEM_SEL' : 'BROWSE'}</span>
            </div>
          </div>
          
          {/* System Branding */}
          <div className="cols-span-12 md:col-span-12 lg:col-span-12 flex justify-between items-end mt-1">
            <div className="flex items-center">
              <span className="text-text-secondary">
                KRAFT_AI_TERMINAL v1.0.2 | <span className="text-accent">ADMIN</span> | 
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
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
             onClick={(e) => {
               if (e.target === e.currentTarget) {
                 setShowSettings(false);
               }
             }}>
          <ThemeControls onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
}