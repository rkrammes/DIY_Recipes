"use client";

import React, { useEffect, useState } from 'react';
import type { Recipe } from '../../types/models';
import { useTheme } from '../../providers/ConsolidatedThemeProvider';
import { supabase } from '@/lib/supabase';

// Import our retro terminal styles - properly integrated with the app's theme system
import '../../styles/terminal-module.css';

/**
 * Formula Database Page - Retro Sci-Fi Terminal UI
 * 
 * Transforms the recipe management into a retro sci-fi "Formula Database"
 * with terminal styling and a three-column layout featuring:
 * - Command Terminal (top bar with system time and command input)
 * - Navigation Matrix (left column with formula database entries)
 * - Primary Workspace (center column with formula details and properties)
 * - Action Panel (right column with system operations and status)
 * 
 * Design Features:
 * - CRT scanlines and flicker effects
 * - Terminal-style typography and syntax
 * - Grid background with terminal aesthetics
 * - Animated text reveals and loading sequences
 * - Retro terminal color scheme with monospace fonts
 * 
 * This component is integrated with the app's layout system and theme provider.
 */
export default function FormulaDatabase() {
  // Access the app's theme context
  const { value: themeContext } = useTheme();
  // State for recipes (formulas)
  const [formulas, setFormulas] = useState<Recipe[] | null>(null);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFormula, setLoadingFormula] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for terminal display
  const [terminalTime, setTerminalTime] = useState<string>('--:--:--');
  const [commandInput, setCommandInput] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<string>('READY');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const [terminalTheme, setTerminalTheme] = useState<string>('green'); // green, amber, blue, white
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [systemMessages, setSystemMessages] = useState<string[]>([
    'FORMULA DATABASE v2.3.4 INITIALIZED',
    'ELEMENT CATALOG INDEXED',
    'LABORATORY SYSTEMS ONLINE'
  ]);

  // Map app theme to terminal theme
  useEffect(() => {
    if (themeContext?.theme === 'dystopia') {
      setTerminalTheme('amber');
    } else if (themeContext?.theme === 'neotopia') {
      setTerminalTheme('blue');
    } else {
      setTerminalTheme('green'); // Default for hackers theme
    }
  }, [themeContext?.theme]);
  
  // Initialize terminal time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTerminalTime(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Simulate loading sequence
  useEffect(() => {
    // Update page title
    const originalTitle = document.title;
    document.title = 'Formula Database | DIY.SYS';
    
    // Simulate loading sequence
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Remove loading overlay after delay
        setTimeout(() => {
          setShowLoading(false);
        }, 500);
      }
      setLoadingProgress(progress);
    }, 200);
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      document.title = originalTitle;
      
      // Add a message to the system console
      addSystemMessage('FORMULA DATABASE SESSION TERMINATED');
    };
  }, []);
  
  // Fetch formulas (recipes) from Supabase
  useEffect(() => {
    async function fetchFormulas() {
      setLoading(true);
      try {
        // Fetch from Supabase
        const { data, error: fetchError } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) {
          throw new Error(fetchError.message);
        }
        
        setFormulas(data);
        if (data && data.length > 0) {
          setSelectedFormulaId(data[0].id);
        }
        setError(null);
      } catch (err: any) {
        setError(`Database connection error: ${err.message}`);
        setFormulas(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFormulas();
  }, []);
  
  // Fetch selected formula details from Supabase
  useEffect(() => {
    if (!selectedFormulaId) return;
    
    async function fetchFormulaDetails() {
      setLoadingFormula(true);
      try {
        // Fetch recipe data
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', selectedFormulaId)
          .single();
        
        if (recipeError) {
          throw new Error(recipeError.message);
        }
        
        // Fetch ingredients for this recipe
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select(`
            id,
            quantity,
            unit,
            notes,
            ingredients:ingredient_id (id, name, description)
          `)
          .eq('recipe_id', selectedFormulaId);
        
        if (ingredientsError) {
          console.error('Error fetching ingredients:', ingredientsError.message);
        }
        
        // Transform to expected format
        const transformedIngredients = ingredients?.map((item: any) => ({
          id: item.ingredients.id,
          name: item.ingredients.name,
          description: item.ingredients.description,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes
        })) || [];
        
        // Combine recipe with ingredients
        const completeRecipe = {
          ...recipeData,
          ingredients: transformedIngredients
        };
        
        setSelectedFormula(completeRecipe);
      } catch (err) {
        console.error('Error fetching formula details:', err);
        setSelectedFormula(null);
      } finally {
        setLoadingFormula(false);
      }
    }
    
    fetchFormulaDetails();
  }, [selectedFormulaId]);
  

  // Toggle terminal theme - respects the app's theme system
  const cycleTerminalTheme = () => {
    const themes = ['green', 'amber', 'blue', 'white'];
    const currentIndex = themes.indexOf(terminalTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    // Update local terminal theme
    setTerminalTheme(themes[nextIndex]);
    
    // Log theme change to console
    addSystemMessage(`DISPLAY MODE CHANGED: ${themes[nextIndex].toUpperCase()}`);
    
    // Map the terminal theme to the app theme when appropriate
    if (themes[nextIndex] === 'amber' && themeContext?.theme !== 'dystopia') {
      // Switch to dystopia theme
      themeContext?.setTheme('dystopia');
      addSystemMessage('SYSTEM THEME SYNCHRONIZED: DYSTOPIA');
    } else if (themes[nextIndex] === 'blue' && themeContext?.theme !== 'neotopia') {
      // Switch to neotopia theme
      themeContext?.setTheme('neotopia');
      addSystemMessage('SYSTEM THEME SYNCHRONIZED: NEOTOPIA');
    } else if (themes[nextIndex] === 'green' && themeContext?.theme !== 'hackers') {
      // Switch to hackers theme
      themeContext?.setTheme('hackers');
      addSystemMessage('SYSTEM THEME SYNCHRONIZED: HACKERS');
    }
  };
  
  // Add a system message
  const addSystemMessage = (message: string) => {
    setSystemMessages(prev => [...prev, message]);
  };
  
  // Handle command input
  const handleCommandInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    
    const command = commandInput.trim().toUpperCase();
    if (command === '') return;
    
    setCommandInput('');
    setSystemStatus('PROCESSING');
    setCommandHistory(prev => [...prev, command]); // Store in command history
    
    // Process commands
    setTimeout(() => {
      if (command === 'HELP' || command === '?') {
        addSystemMessage('SHOWING AVAILABLE COMMANDS');
        addSystemMessage('---------------------------');
        addSystemMessage('HELP     - Show available commands');
        addSystemMessage('STATUS   - Display system status');
        addSystemMessage('CLEAR    - Clear workspace');
        addSystemMessage('REFRESH  - Reload formula database');
        addSystemMessage('THEME    - Cycle display themes');
        addSystemMessage('LIST     - List all formulas');
        addSystemMessage('VERSION  - Show software version');
        addSystemMessage('---------------------------');
      } else if (command === 'STATUS') {
        addSystemMessage('SYSTEM STATUS: ALL SYSTEMS NOMINAL');
        addSystemMessage('---------------------------');
        addSystemMessage('FORMULA DATABASE: ONLINE');
        addSystemMessage('ELEMENT LIBRARY: ONLINE');
        addSystemMessage('LABORATORY SYSTEMS: OPERATIONAL');
        addSystemMessage(`CURRENT THEME: ${terminalTheme.toUpperCase()}`);
        addSystemMessage(`FORMULAS INDEXED: ${formulas?.length || 0}`);
        addSystemMessage('---------------------------');
      } else if (command === 'CLEAR') {
        setSelectedFormulaId(null);
        setSelectedFormula(null);
        addSystemMessage('PRIMARY WORKSPACE CLEARED');
      } else if (command === 'REFRESH') {
        addSystemMessage('RELOADING SYSTEM...');
        window.location.reload();
      } else if (command === 'THEME') {
        cycleTerminalTheme();
      } else if (command === 'LIST') {
        addSystemMessage('FORMULA INDEX:');
        addSystemMessage('---------------------------');
        formulas?.slice(0, 5).forEach((formula, i) => {
          addSystemMessage(`[${(i + 1).toString().padStart(3, '0')}] ${formula.title || 'UNTITLED'}`);
        });
        if ((formulas?.length || 0) > 5) {
          addSystemMessage(`... ${(formulas?.length || 0) - 5} MORE ENTRIES`);
        }
        addSystemMessage('---------------------------');
      } else if (command === 'VERSION') {
        addSystemMessage('DIY.SYS FORMULA DATABASE v2.3.4');
        addSystemMessage('© 2025 LABORATORY SYSTEMS');
        addSystemMessage('---------------------------');
        addSystemMessage('COMPONENTS:');
        addSystemMessage('UI FRAMEWORK: NEXT.JS 14.0.3');
        addSystemMessage('DATA LAYER: LOCAL STORAGE 1.0.0');
        addSystemMessage('TERMINAL INTERFACE: RETRO-TERM 1.2.1');
        addSystemMessage('---------------------------');
      } else {
        addSystemMessage(`ERROR: UNRECOGNIZED COMMAND "${command}"`);
        addSystemMessage('TYPE "HELP" FOR AVAILABLE COMMANDS');
      }
      
      setSystemStatus('READY');
    }, 500);
  };
  
  // Use a class based on the terminal theme
  const terminalThemeClass = `terminal-theme-${terminalTheme}`;

  return (
    <div className="p-4 w-full h-full">
      <div className={`terminal-ui terminal-scanlines ${terminalThemeClass} h-full rounded-lg border border-border-subtle overflow-hidden`}>
        {/* Loading overlay */}
        {showLoading && (
          <div className="terminal-loading-overlay">
            <div className="terminal-loading-logo terminal-flicker">DIY.SYS FORMULA DATABASE</div>
            <div className="terminal-progress" style={{ width: '300px' }}>
              <div className="terminal-progress-bar" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <div className="terminal-loading-status">
              {loadingProgress < 30 && 'INITIALIZING CORE SYSTEMS'}
              {loadingProgress >= 30 && loadingProgress < 50 && 'LOADING FORMULA DATABASE'}
              {loadingProgress >= 50 && loadingProgress < 70 && 'ESTABLISHING CONNECTIONS'}
              {loadingProgress >= 70 && loadingProgress < 90 && 'CALIBRATING INTERFACE'}
              {loadingProgress >= 90 && 'FINALIZING STARTUP'}
            </div>
          </div>
        )}
      
      <div className="terminal-layout">
        {/* Command Terminal (Top Bar) */}
        <header className="command-terminal">
          <div className="terminal-status-container">
            <span className="terminal-status-light terminal-status-active"></span>
            <span className="terminal-vga">DIY.SYS</span>
          </div>
          
          <div className="terminal-input-container" style={{ flex: 1, margin: '0 2rem' }}>
            <span className="terminal-vga" style={{ marginRight: '0.5rem' }}>></span>
            <input 
              type="text" 
              className="terminal-input" 
              placeholder="ENTER COMMAND" 
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleCommandInput}
              autoFocus
            />
          </div>
          
          <div className="terminal-status-container" style={{ marginLeft: 'auto' }}>
            <span className="terminal-vga terminal-flicker">{systemStatus}</span>
          </div>
          
          <div className="terminal-time">
            <span className="terminal-monospace">{terminalTime}</span>
          </div>
        </header>
        
        {/* Navigation Matrix (Left Column) */}
        <nav className="navigation-matrix">
          <div className="terminal-matrix">
            <div className="terminal-matrix-header">
              <h3 className="terminal-vga terminal-flicker">FORMULA DATABASE</h3>
            </div>
            
            {loading ? (
              <div className="terminal-loading">LOADING FORMULA DATABASE...</div>
            ) : error ? (
              <div className="terminal-error">DATABASE ERROR: {error}</div>
            ) : !formulas || formulas.length === 0 ? (
              <div className="terminal-empty">NO FORMULAS FOUND</div>
            ) : (
              <ul className="terminal-matrix-entries">
                {formulas.map((formula, index) => (
                  <li 
                    key={formula.id}
                    className={`matrix-entry ${formula.id === selectedFormulaId ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedFormulaId(formula.id);
                      addSystemMessage(`ACCESSING FORMULA: ${formula.title || 'UNTITLED'}`);
                    }}
                  >
                    <span className="entry-index">{(index + 1).toString().padStart(3, '0')}</span>
                    <span className="entry-name">{formula.title || 'UNTITLED FORMULA'}</span>
                    <span className="entry-indicator">
                      {formula.id === selectedFormulaId ? '▶' : '►'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="terminal-status-line">
              {formulas ? `${formulas.length} FORMULAS INDEXED` : 'DATABASE ERROR'} • SYSTEM READY
            </div>
          </div>
        </nav>
        
        {/* Primary Workspace (Center Column) */}
        <main className="primary-workspace terminal-grid-bg">
          {loadingFormula ? (
            <div className="terminal-loading">ACCESSING FORMULA DATABASE...</div>
          ) : !selectedFormula ? (
            <>
              <div className="terminal-panel">
                <div className="terminal-panel-title">FORMULA DATABASE</div>
                <div className="terminal-panel-content">
                  <div className="terminal-text-reveal">
                    Select a formula from the Navigation Matrix to view details.
                  </div>
                </div>
              </div>

              {/* System Console */}
              <div className="terminal-panel" style={{ marginTop: '1rem' }}>
                <div className="terminal-panel-title">SYSTEM CONSOLE</div>
                <div className="terminal-console">
                  {systemMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className="terminal-console-message terminal-text-reveal" 
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {msg}
                    </div>
                  ))}
                  <div className="terminal-console-message" style={{ color: 'var(--terminal-text-accent)' }}>
                    &gt; <span className="cursor-blink">_</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Formula header section */}
              <div className="terminal-formula-header">
                <div className="formula-id-block">
                  FORMULA ID: <span className="formula-id">{selectedFormula.id.substring(0, 8)}</span>
                </div>
                <h1 className="formula-title terminal-flicker">{selectedFormula.title || 'UNTITLED FORMULA'}</h1>
              </div>
              
              {/* Formula description */}
              <div className="terminal-formula-description">
                <div className="section-header">FORMULA DESCRIPTION</div>
                <div className="section-content description-content terminal-text-reveal">
                  {selectedFormula.description || 'NO DESCRIPTION AVAILABLE'}
                </div>
              </div>
              
              {/* Formula elements table */}
              <div className="terminal-formula-elements">
                <div className="section-header terminal-flicker">REQUIRED ELEMENTS</div>
                <table className="terminal-table">
                  <thead>
                    <tr>
                      <th>ELEMENT ID</th>
                      <th>QUANTITY</th>
                      <th>UNIT</th>
                      <th>PROPERTIES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFormula.ingredients && selectedFormula.ingredients.length > 0 ? (
                      selectedFormula.ingredients.map((ingredient, index) => (
                        <tr key={index} className={index % 2 === 0 ? '' : ''}>
                          <td>
                            <span className="element-code">E-{index.toString().padStart(3, '0')}</span> {ingredient.name}
                          </td>
                          <td>{ingredient.quantity || ''}</td>
                          <td>{ingredient.unit || ''}</td>
                          <td>{ingredient.notes || ''}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>NO ELEMENTS DEFINED</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                <div className="terminal-element-count">
                  TOTAL ELEMENTS: {selectedFormula.ingredients?.length || 0}
                </div>
              </div>
              
              {/* Formula notes */}
              {selectedFormula.notes && (
                <div className="terminal-formula-notes">
                  <div className="section-header">LABORATORY NOTES</div>
                  <div className="section-content notes-content terminal-text-reveal">
                    {selectedFormula.notes}
                  </div>
                </div>
              )}
              
              {/* Terminal status line */}
              <div className="terminal-workspace-status">
                <span className="terminal-flicker">FORMULA DATA LOADED</span> // SYSTEM READY
              </div>
            </>
          )}
        </main>
        
        {/* Action Panel (Right Column) */}
        <aside className="action-panel">
          <div className="terminal-panel">
            <div className="terminal-panel-title">SYSTEM OPERATIONS</div>
            <button 
              className="terminal-button" 
              style={{ width: '100%', marginBottom: '0.5rem' }}
              onClick={() => addSystemMessage('CREATE NEW FORMULA FUNCTION PENDING AUTHORIZATION')}
            >
              CREATE NEW FORMULA
            </button>
            <button 
              className="terminal-button" 
              style={{ width: '100%', marginBottom: '0.5rem' }}
              onClick={() => addSystemMessage('FORMULA SEARCH MODULE LOADING...')}
            >
              SEARCH DATABASE
            </button>
            <button 
              className="terminal-button" 
              style={{ width: '100%', marginBottom: '0.5rem' }}
              onClick={() => window.location.reload()}
            >
              SYSTEM REFRESH
            </button>
            <button 
              className="terminal-button" 
              style={{ width: '100%', marginBottom: '0.5rem' }}
              onClick={cycleTerminalTheme}
            >
              CYCLE DISPLAY MODE
            </button>
          </div>
          
          <div className="terminal-panel" style={{ marginTop: '1rem' }}>
            <div className="terminal-panel-title">SYSTEM STATUS</div>
            <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
              <span className="terminal-status-light terminal-status-active"></span>
              <span>FORMULA DATABASE</span>
            </div>
            <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
              <span className="terminal-status-light terminal-status-active"></span>
              <span>TERMINAL INTERFACE</span>
            </div>
            <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
              <span className="terminal-status-light terminal-status-standby"></span>
              <span>ELEMENT ANALYZER</span>
            </div>
            <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
              <span className="terminal-status-light terminal-status-active"></span>
              <span>DISPLAY MODE: {terminalTheme.toUpperCase()}</span>
              <span className="terminal-status-detail" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
                {themeContext?.theme.toUpperCase()}
              </span>
            </div>
          </div>
          
          {formulas && formulas.length > 0 && (
            <div className="terminal-panel" style={{ marginTop: '1rem' }}>
              <div className="terminal-panel-title">FORMULA STATISTICS</div>
              <div style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
                <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
                  <span className="terminal-monospace">TOTAL FORMULAS:</span>
                  <span className="terminal-monospace terminal-flicker" style={{ marginLeft: 'auto' }}>{formulas.length}</span>
                </div>
                <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
                  <span className="terminal-monospace">ELEMENT COUNT:</span>
                  <span className="terminal-monospace terminal-flicker" style={{ marginLeft: 'auto' }}>
                    {formulas.reduce((sum, formula) => sum + (formula.ingredients?.length || 0), 0)}
                  </span>
                </div>
                <div className="terminal-status-container" style={{ marginBottom: '0.5rem' }}>
                  <span className="terminal-monospace">DATABASE SIZE:</span>
                  <span className="terminal-monospace terminal-flicker" style={{ marginLeft: 'auto' }}>
                    {(Math.random() * 100).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {selectedFormula && (
            <div className="terminal-panel" style={{ marginTop: '1rem' }}>
              <div className="terminal-panel-title">FORMULA ACTIONS</div>
              <button 
                className="terminal-button" 
                style={{ width: '100%', marginBottom: '0.5rem' }}
                onClick={() => addSystemMessage(`EXPORTING FORMULA: ${selectedFormula.title || 'UNTITLED'}`)}
              >
                EXPORT FORMULA
              </button>
              <button 
                className="terminal-button" 
                style={{ width: '100%', marginBottom: '0.5rem' }}
                onClick={() => addSystemMessage('PRINT MODULE INITIALIZING...')}
              >
                PRINT FORMULA
              </button>
              <button 
                className="terminal-button" 
                style={{ width: '100%', marginBottom: '0.5rem' }}
                onClick={() => addSystemMessage(`ELEMENT INVENTORY: ${selectedFormula.ingredients?.length || 0} ELEMENTS ANALYZED`)}
              >
                ELEMENTS INVENTORY
              </button>
            </div>
          )}
        </aside>
      </div>
      </div>
    </div>
  );
}