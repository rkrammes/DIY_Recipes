'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import { useAudio } from '@/hooks/useAudio';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import FormulationDetails from './FormulationDetails';
import IngredientDetails from './IngredientDetails';
import { EnhancedTerminalFooter } from './EnhancedTerminalFooter';
import { ThemeIconCSS } from './ThemeIconsCSS';
import ErrorBoundary from './ErrorBoundary';

// Navigation sections for the first column
const SECTIONS = [
  { id: 'formulations', name: 'FORMULATIONS', iconType: 'formulations' },
  { id: 'ingredients', name: 'INGREDIENTS', iconType: 'ingredients' },
  { id: 'tools', name: 'TOOLS', iconType: 'tools' },
  { id: 'library', name: 'LIBRARY', iconType: 'library' },
  { id: 'settings', name: 'SETTINGS', iconType: 'settings' }
];

export default function TripleColumnLayoutClean() {
  const { theme, setTheme, audioEnabled, setAudioEnabled } = useTheme();
  const { playSound } = useAudio();
  const { recipes: formulations, loading: formulationsLoading, error: formulationsError } = useRecipes();
  const { ingredients, loading: ingredientsLoading, error: ingredientsError } = useIngredients();
  
  const [activeSection, setActiveSection] = useState('formulations');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Keyboard navigation state
  const [focusedColumn, setFocusedColumn] = useState(0); // 0: directories, 1: items, 2: details
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 8));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = getItemsForSection();
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedColumn > 0) {
            setFocusedColumn(focusedColumn - 1);
            setFocusedIndex(0);
            if (audioEnabled) playSound('click');
          }
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          if (focusedColumn < 2 && (focusedColumn === 0 || items.length > 0)) {
            setFocusedColumn(focusedColumn + 1);
            setFocusedIndex(0);
            if (audioEnabled) playSound('click');
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (focusedColumn === 0) {
            const newIndex = Math.max(0, focusedIndex - 1);
            if (newIndex !== focusedIndex) {
              setFocusedIndex(newIndex);
              if (audioEnabled) playSound('click');
            }
          } else if (focusedColumn === 1) {
            const newIndex = Math.max(0, focusedIndex - 1);
            if (newIndex !== focusedIndex) {
              setFocusedIndex(newIndex);
              if (audioEnabled) playSound('click');
            }
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (focusedColumn === 0) {
            const newIndex = Math.min(SECTIONS.length - 1, focusedIndex + 1);
            if (newIndex !== focusedIndex) {
              setFocusedIndex(newIndex);
              if (audioEnabled) playSound('click');
            }
          } else if (focusedColumn === 1) {
            const newIndex = Math.min(items.length - 1, focusedIndex + 1);
            if (newIndex !== focusedIndex) {
              setFocusedIndex(newIndex);
              if (audioEnabled) playSound('click');
            }
          }
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedColumn === 0) {
            handleSectionSelect(SECTIONS[focusedIndex].id);
          } else if (focusedColumn === 1 && items[focusedIndex]) {
            handleItemSelect(items[focusedIndex].id);
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          // Exit keyboard navigation mode or go back
          if (focusedColumn > 0) {
            setFocusedColumn(0);
            setFocusedIndex(0);
            setSelectedItemId(null);
          }
          break;
          
        case 'F4':
          e.preventDefault();
          // Cycle through themes
          const themes = ['dystopia', 'hackers', 'neotopia'];
          const currentIndex = themes.indexOf(theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex]);
          if (audioEnabled) playSound('click');
          break;
      }
      
      // Alt + number shortcuts for quick section navigation
      if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 1 && parseInt(e.key) <= 5) {
        e.preventDefault();
        const sectionIndex = parseInt(e.key) - 1;
        if (sectionIndex < SECTIONS.length) {
          handleSectionSelect(SECTIONS[sectionIndex].id);
          setFocusedColumn(0);
          setFocusedIndex(sectionIndex);
          if (audioEnabled) playSound('click');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedColumn, focusedIndex, activeSection]);

  const handleSectionSelect = (sectionId: string) => {
    if (sectionId === 'settings') {
      // Settings should open within the terminal UI, not navigate away
      setActiveSection(sectionId);
      setSelectedItemId(null);
    } else {
      setActiveSection(sectionId);
      setSelectedItemId(null);
    }
    // Clear search when switching sections
    setSearchQuery('');
    if (audioEnabled) playSound('click');
  };

  const handleItemSelect = (id: string | null) => {
    setSelectedItemId(id);
    if (id !== null && audioEnabled) {
      playSound('click');
    }
  };

  const getSectionLoadingState = () => {
    switch (activeSection) {
      case 'formulations':
        return { loading: formulationsLoading, error: formulationsError };
      case 'ingredients':
        return { loading: ingredientsLoading, error: ingredientsError };
      default:
        return { loading: false, error: null };
    }
  };

  const getItemsForSection = () => {
    switch (activeSection) {
      case 'formulations':
        return formulations || [];
      case 'ingredients':
        return ingredients || [];
      case 'tools':
        return [
          { id: 'converter', title: 'Unit Converter', description: 'Convert between different units of measurement' },
          { id: 'timer', title: 'Formulation Timer', description: 'Keep track of processing times' },
          { id: 'calculator', title: 'Scaling Calculator', description: 'Scale formulation quantities up or down' }
        ];
      case 'library':
        return [
          { id: 'techniques', title: 'Processing Techniques', description: 'Reference for common processing techniques' },
          { id: 'substitutions', title: 'Ingredient Substitutions', description: 'Find alternatives for ingredients' },
          { id: 'measurements', title: 'Measurement Guide', description: 'Standard measurement conversions' }
        ];
      case 'settings':
        return [
          { id: 'theme', title: 'Theme Settings', description: 'Change the visual appearance of the terminal' },
          { id: 'audio', title: 'Audio Settings', description: 'Configure sound effects and volume' },
          { id: 'account', title: 'Account Settings', description: 'Manage your user account' },
          { id: 'profile', title: 'User Profile', description: 'Edit your profile information' },
          { id: 'system', title: 'System Information', description: 'View system status and diagnostics' }
        ];
      default:
        return [];
    }
  };

  const renderSettingsPanel = () => {
    const settingItem = items.find(item => item.id === selectedItemId);
    
    if (!settingItem) {
      return (
        <div className="settings-panel p-6">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p className="text-text-secondary">Select a settings category from the list.</p>
        </div>
      );
    }

    // Simple inline settings for now
    switch (settingItem.id) {
      case 'theme':
        return (
          <div className="settings-panel p-6">
            <h2 className="text-2xl font-bold mb-4">{settingItem.title}</h2>
            <p className="text-text-secondary mb-6">{settingItem.description}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Theme</label>
                <select 
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value as any);
                    if (audioEnabled) playSound('click');
                  }}
                  className="w-full px-3 py-2 bg-surface-1 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="hackers">Hackers - Cyan/Magenta</option>
                  <option value="dystopia">Dystopia - Green Terminal</option>
                  <option value="neotopia">Neotopia - Light Mode</option>
                </select>
              </div>
              <div className="text-sm text-text-secondary">
                Current theme: <span className="text-accent font-bold">{theme.toUpperCase()}</span>
              </div>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="settings-panel p-6">
            <h2 className="text-2xl font-bold mb-4">{settingItem.title}</h2>
            <p className="text-text-secondary mb-6">{settingItem.description}</p>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={audioEnabled}
                    onChange={(e) => {
                      setAudioEnabled(e.target.checked);
                      if (e.target.checked) playSound('click');
                    }}
                    className="w-4 h-4 text-accent bg-surface-1 border-border-subtle rounded focus:ring-accent"
                  />
                  <span>Enable sound effects</span>
                </label>
              </div>
              <div className="text-sm text-text-secondary">
                Audio is currently: <span className="text-accent font-bold">{audioEnabled ? 'ENABLED' : 'DISABLED'}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="settings-panel p-6">
            <h2 className="text-2xl font-bold mb-4">{settingItem.title}</h2>
            <p className="text-text-secondary mb-6">{settingItem.description}</p>
            <div className="bg-surface-1 p-4 rounded-md">
              <p className="text-text-secondary">This feature is coming soon! 🚧</p>
            </div>
          </div>
        );
    }
  };

  const allItems = getItemsForSection();
  const { loading, error } = getSectionLoadingState();
  
  // Filter items based on search query
  const items = allItems.filter(item => 
    !searchQuery || 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedItem = allItems.find(item => item.id === selectedItemId);

  return (
    <div className="kraft-terminal-container">
      {/* Header */}
      <header className="terminal-header">
        <div className="header-content">
          <div className="header-left">
            <span className="terminal-title">&gt;KRAFT_AI TERMINAL_</span>
            <span className="header-info">
              <span className="version">v1.0.2</span>
              <span className="module-status">MODULE_SYSTEM: ACTIVE</span>
              <span className="system-status">STATUS: ONLINE</span>
            </span>
          </div>
          <div className="header-right">
            <span className="time">{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="terminal-content">
        {/* First Column - Directories */}
        <div className={`column directories-column ${focusedColumn === 0 ? 'focused' : ''}`}>
          <div className="column-header">DIRECTORIES</div>
          <div className="column-content">
            {SECTIONS.map((section, index) => (
              <div
                key={section.id}
                className={`directory-item ${activeSection === section.id ? 'active' : ''} ${focusedColumn === 0 && focusedIndex === index ? 'focused' : ''}`}
                onClick={() => handleSectionSelect(section.id)}
              >
                <span className="icon">
                  <ThemeIconCSS type={section.iconType} size={16} />
                </span>
                <span className="name">{section.name}</span>
              </div>
            ))}
          </div>
          <div className="column-footer">
            <div className="status-indicator">● SYSTEM READY</div>
          </div>
        </div>

        {/* Second Column - Items List */}
        <div className={`column items-column ${focusedColumn === 1 ? 'focused' : ''}`}>
          <div className="column-header">{activeSection.toUpperCase()}</div>
          
          {/* Search Input */}
          {activeSection !== 'settings' && (
            <div className="search-container px-2 py-1 border-b border-border-subtle">
              <div className="relative">
                <span className="absolute left-1 top-1 text-text-secondary text-xs">&gt;</span>
                <input
                  type="text"
                  placeholder={`Search ${activeSection}...`}
                  className="w-full px-5 py-1 bg-surface-0 border border-accent text-xs font-mono text-text-primary placeholder-text-secondary focus:outline-none focus:border-text-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery && (
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-text-secondary">MATCHING: {items.length} ITEMS</span>
                  <span className="text-accent">SEARCHING...</span>
                </div>
              )}
            </div>
          )}
          
          <div className="column-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <div>LOADING {activeSection.toUpperCase()}...</div>
                <div className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            ) : error ? (
              <div className="error-state">
                <div>⚠️ CONNECTION ERROR</div>
                <div className="error-message">{error}</div>
                <div className="error-note">Check database connection and try again.</div>
              </div>
            ) : items.length === 0 ? (
              <div className="no-items">
                {searchQuery ? (
                  <>
                    <div>NO MATCHES FOUND</div>
                    <div className="no-items-note">Try a different search term or clear the search.</div>
                  </>
                ) : (
                  <>
                    {activeSection === 'formulations' && (
                      <>
                        <div>No formulations Available</div>
                        <div className="no-items-note">Database connected, but no formulations found.</div>
                      </>
                    )}
                    {activeSection === 'ingredients' && 'NO INGREDIENTS'}
                    {activeSection === 'tools' && 'NO TOOLS AVAILABLE'}
                    {activeSection === 'library' && 'LIBRARY EMPTY'}
                  </>
                )}
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className={`item-entry ${selectedItemId === item.id ? 'active' : ''} ${focusedColumn === 1 && focusedIndex === index ? 'focused' : ''}`}
                  onClick={() => handleItemSelect(item.id)}
                >
                  <span className="item-number">{index + 1}.</span>
                  <span className="item-name">{item.name || item.title}</span>
                </div>
              ))
            )}
          </div>
          <div className="column-footer">
            <span>{items.length}{searchQuery ? ` OF ${allItems.length}` : ''} ITEMS</span>
            <span>{selectedItemId ? 'SELECTION' : 'NO SELECTION'}</span>
          </div>
        </div>

        {/* Third Column - Details */}
        <div className={`column details-column ${focusedColumn === 2 ? 'focused' : ''}`}>
          <div className="column-content">
            {activeSection === 'settings' ? (
              <ErrorBoundary fallback={
                <div className="p-4 text-accent">
                  <div>⚠️ Error loading settings</div>
                  <div className="text-xs text-text-secondary mt-2">Settings panel encountered an error.</div>
                </div>
              }>
                {renderSettingsPanel()}
              </ErrorBoundary>
            ) : !selectedItem ? (
              <div className="empty-state">
                <div className="select-item-header">SELECT AN ITEM</div>
                <div className="empty-icon">
                  <ThemeIconCSS type="file" size={64} />
                </div>
                <h2>SELECT A {activeSection.slice(0, -1).toUpperCase()} TO VIEW</h2>
                <p>Choose an item from the list on the left to view and edit its details in this panel.</p>
              </div>
            ) : activeSection === 'formulations' ? (
              <ErrorBoundary fallback={
                <div className="p-4 text-accent">
                  <div>⚠️ Error loading formulation details</div>
                  <div className="text-xs text-text-secondary mt-2">Please try selecting a different item.</div>
                </div>
              }>
                <FormulationDetails recipe={selectedItem} />
              </ErrorBoundary>
            ) : activeSection === 'ingredients' ? (
              <ErrorBoundary fallback={
                <div className="p-4 text-accent">
                  <div>⚠️ Error loading ingredient details</div>
                  <div className="text-xs text-text-secondary mt-2">Please try selecting a different item.</div>
                </div>
              }>
                <IngredientDetails ingredient={selectedItem} />
              </ErrorBoundary>
            ) : null}
          </div>
        </div>
      </div>

      {/* Enhanced Terminal Footer */}
      <EnhancedTerminalFooter 
        systemStatus="online"
        databaseStats={{
          formulations: formulations?.length || 0,
          ingredients: ingredients?.length || 0,
          tools: 0,
          library: 0
        }}
        lastSyncTime={new Date()}
      />
    </div>
  );
}