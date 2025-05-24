"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/providers/FixedThemeProvider';
import { useAudio } from '@/hooks/useAudio';
import { initializeModules } from '@/modules';
import { useModules } from '@/lib/modules';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SettingsTerminalContent from '@/Settings/components/SettingsTerminalContent';
import typography from '@/lib/typography';
import { ThemeIconCSS as ThemeIcon } from '@/components/ThemeIconsCSS';

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
  const { user, isAuthenticated, signOut, signInWithPassword, signInWithApple, loading } = useAuth();
  
  // Family members
  const FAMILY_MEMBERS = [
    { id: 'ryan', name: 'Ryan', role: 'admin', email: 'ryan@kraftai.com', avatar: '👨‍💻' },
    { id: 'sonia', name: 'Sonia', role: 'admin', email: 'sonia@kraftai.com', avatar: '👩‍🔬' },
    { id: 'roman', name: 'Roman', role: 'child', email: 'roman@kraftai.com', avatar: '👦' },
    { id: 'sophia', name: 'Sophia', role: 'child', email: 'sophia@kraftai.com', avatar: '👧' }
  ];
  
  // Form state for login
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [useAppleLogin, setUseAppleLogin] = useState(true);
  
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
  
  // Sections for the first column with theme-specific icons
  const SECTIONS = [
    { id: 'formulations', name: 'Formulations', iconType: 'formulations' },
    { id: 'ingredients', name: 'Ingredients', iconType: 'ingredients' },
    { id: 'tools', name: 'Tools', iconType: 'tools' },
    { id: 'library', name: 'Library', iconType: 'library' },
    { id: 'settings', name: 'Settings', iconType: 'settings' }
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
          try {
            const result = await supabase.from('recipes').select('*').limit(100);
            formulationsData = result.data || [];
            if (result.error) {
              // Only log detailed errors in development if they contain actual error information
              if (process.env.NODE_ENV === 'development' && result.error.message) {
                console.error('Error fetching recipes:', result.error.message);
              } else {
                console.log('Non-critical recipe fetch issue - continuing operation');
              }
            }
          } catch (err) {
            console.error('Exception fetching recipes:', err);
            // Continue execution - we'll handle missing data through the UI
          }
        }

        if (tablesExist.ingredients) {
          try {
            const result = await supabase.from('ingredients').select('*').limit(100);
            ingredientsData = result.data || [];
            if (result.error) {
              // Only log detailed errors in development if they contain actual error information
              if (process.env.NODE_ENV === 'development' && result.error.message) {
                console.error('Error fetching ingredients:', result.error.message);
              } else {
                console.log('Non-critical ingredient fetch issue - continuing operation');
              }
            }
          } catch (err) {
            console.error('Exception fetching ingredients:', err);
            // Continue execution - we'll handle missing data through the UI
          }
        }

        if (tablesExist.tools) {
          try {
            const result = await supabase.from('tools').select('*').limit(100);
            toolsData = result.data || [];
            if (result.error) {
              // Only log detailed errors in development if they contain actual error information
              if (process.env.NODE_ENV === 'development' && result.error.message) {
                console.error('Error fetching tools:', result.error.message);
              } else {
                console.log('Non-critical tools fetch issue - continuing operation');
              }
            }
          } catch (err) {
            console.error('Exception fetching tools:', err);
            // Continue execution - we'll handle missing data through the UI
          }
        }

        if (tablesExist.library) {
          try {
            const result = await supabase.from('library').select('*').limit(100);
            libraryData = result.data || [];
            if (result.error) {
              // Only log detailed errors in development if they contain actual error information
              if (process.env.NODE_ENV === 'development' && result.error.message) {
                console.error('Error fetching library:', result.error.message);
              } else {
                console.log('Non-critical library fetch issue - continuing operation');
              }
            }
          } catch (err) {
            console.error('Exception fetching library:', err);
            // Continue execution - we'll handle missing data through the UI
          }
        }

        // Check for any database access
        let canContinue = false;

        // If we have at least some data, or the tables exist, we can continue
        if (formulationsData.length > 0 || ingredientsData.length > 0) {
          canContinue = true;
        }

        // If we have no data but tables exist, we can show empty state
        if (!canContinue && (tablesExist.recipes || tablesExist.ingredients)) {
          canContinue = true;
        }

        // If not even the minimum tables exist, show an error
        if (!canContinue) {
          const missingTables = [];
          if (!tablesExist.recipes) missingTables.push('recipes');
          if (!tablesExist.ingredients) missingTables.push('ingredients');
          console.warn(`Limited functionality: ${missingTables.join(', ')}. Some features will be unavailable.`);

          // Don't throw, just log the warning and continue with settings mode
          setConnectionError(`Missing tables: ${missingTables.join(', ')}. Please run init-db-tables.sql script.`);
        }

        // Even with problems, we can be online with limited functionality
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
    // If system is offline and not in settings, return connection error message
    if (systemStatus === 'offline' && activeCategory !== 'settings') {
      return [{ id: 'error', title: 'Database Connection Error', description: connectionError || 'Unable to connect to database' }];
    }

    // If system is still checking and not in settings, return loading state
    if (systemStatus === 'checking' && activeCategory !== 'settings') {
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
      case 'settings':
        // Return settings subcategories with theme-appropriate icons
        return [
          { id: 'theme', title: 'Theme Settings', description: 'Change the visual appearance of the terminal', iconType: 'settings' },
          { id: 'audio', title: 'Audio Settings', description: 'Configure sound effects and volume', iconType: 'settings' },
          { id: 'account', title: 'Account Settings', description: 'Manage your user account', iconType: 'settings' },
          { id: 'profile', title: 'User Profile', description: 'Edit your profile information', iconType: 'file' },
          isAuthenticated && user?.role === 'admin' ?
            { id: 'developer', title: 'Developer Settings', description: 'Advanced configuration options', iconType: 'tools' } :
            null,
          { id: 'system', title: 'System Information', description: 'View system status and diagnostics', iconType: 'settings' }
        ].filter(Boolean); // Filter out null values for non-admin users

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

  // No Apple login - removed functionality

  // Handle password-based login form submission
  const handleLogin = async (e: React.FormEvent | null = null) => {
    if (e) e.preventDefault();
    
    if (!selectedMember || (!password && !useAppleLogin)) {
      setAuthError('Please select a family member' + (!useAppleLogin ? ' and enter password' : ''));
      return;
    }
    
    if (useAppleLogin) {
      handleAppleLogin();
      return;
    }
    
    // Find the selected family member
    const member = FAMILY_MEMBERS.find(m => m.id === selectedMember);
    if (!member) {
      setAuthError('Invalid family member selected');
      return;
    }
    
    try {
      setAuthError(null);
      // Use the member's email and password for authentication
      const { error } = await signInWithPassword(member.email, password);
      if (error) {
        setAuthError(error.message);
      } else {
        // Clear form on success
        setPassword('');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  // State for keyboard navigation
  const [navState, setNavState] = useState({
    column: 0, // 0 = first column (categories), 1 = second column (items), 2 = third column (document)
    index: 0,  // Current selected index in the active column
    documentElement: null as HTMLElement | null, // Currently focused element in document
    focused: false // If keyboard navigation is active
  });
  
  // Handle keyboard events for function keys and keyboard navigation
  useEffect(() => {
    // Initialize first category as selected when component mounts
    if (SECTIONS.length > 0 && !activeCategory) {
      handleCategorySelect(SECTIONS[0].id);
      setNavState(prev => ({ ...prev, focused: true }));
    }

    // Create references to the current items in each column
    const categoryItems = SECTIONS;
    const selectedItems = getItemsForCategory();

    const handleKeyDown = (e) => {
      // Only handle keyboard navigation in this component when not in document view making mode
      // This prevents conflicts with DocumentCentricRecipe's own keyboard handler when in making mode
      const documentMakingMode = document.querySelector('.document-centric-recipe.making-mode');
      const isInMakingMode = documentMakingMode !== null;

      // Skip keyboard handling if we're in making mode and in document column
      if (isInMakingMode && navState.column === 2) {
        return;
      }
      // Function key handling
      if (e.key === 'F4') {
        e.preventDefault();
        // Cycle through themes
        const themes = ['hackers', 'dystopia', 'neotopia'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
        if (audioEnabled) playSound('click');
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (isAuthenticated) {
          if (confirm('Are you sure you want to logout?')) {
            signOut();
          }
        }
      }
      
      // Alt + number key shortcuts for categories
      if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 1 && parseInt(e.key) <= 4) {
        const categoryIndex = parseInt(e.key) - 1;
        if (SECTIONS[categoryIndex]) {
          handleCategorySelect(SECTIONS[categoryIndex].id);
          setNavState({ column: 0, index: categoryIndex, focused: true });
          if (audioEnabled) playSound('click');
        }
        return;
      }
      
      // If not already in keyboard navigation mode, enable it when arrow keys are pressed
      if (!navState.focused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'].includes(e.key)) {
        setNavState(prev => ({ ...prev, focused: true }));
      }
      
      // Skip keyboard navigation if not focused
      if (!navState.focused) return;
      
      // Handle keyboard navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (navState.column === 0) {
            // First column
            const newCategoryIndex = (navState.index - 1 + categoryItems.length) % categoryItems.length;
            setNavState(prev => ({
              ...prev,
              index: newCategoryIndex
            }));
            handleCategorySelect(SECTIONS[newCategoryIndex].id);
          } else if (navState.column === 1 && selectedItems.length > 0) {
            // Second column
            setNavState(prev => ({
              ...prev,
              index: (prev.index - 1 + selectedItems.length) % selectedItems.length
            }));
            // Don't select item yet, wait for Enter
          } else if (navState.column === 2) {
            // Third column - document area
            // Use a more robust selector to find the document area
            const documentColumn = document.querySelector('.document-centric-recipe, .document-content, .flex-1.overflow-hidden > div');
            if (documentColumn) {
              // Find and collect focusable elements
              const focusableElements = Array.from(documentColumn.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              )) as HTMLElement[];

              if (focusableElements.length > 0) {
                // Find the current element's index or start at the last element if none selected
                const currentIndex = navState.documentElement ?
                  focusableElements.indexOf(navState.documentElement) : 0;

                // Get the previous element, or loop to the end
                const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                const prevElement = focusableElements[prevIndex];

                setNavState(prev => ({
                  ...prev,
                  index: prevIndex,
                  documentElement: prevElement,
                  focused: true
                }));

                // Actually focus the element
                prevElement.focus();
              }
            }
          }
          if (audioEnabled) playSound('click');
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (navState.column === 0) {
            // First column
            const newCategoryIndex = (navState.index + 1) % categoryItems.length;
            setNavState(prev => ({
              ...prev,
              index: newCategoryIndex
            }));
            handleCategorySelect(SECTIONS[newCategoryIndex].id);
          } else if (navState.column === 1 && selectedItems.length > 0) {
            // Second column
            setNavState(prev => ({
              ...prev,
              index: (prev.index + 1) % selectedItems.length
            }));
            // Don't select item yet, wait for Enter
          } else if (navState.column === 2) {
            // Third column - document area
            // Use a more robust selector to find the document area
            const documentColumn = document.querySelector('.document-centric-recipe, .document-content, .flex-1.overflow-hidden > div');
            if (documentColumn) {
              // Find and collect focusable elements
              const focusableElements = Array.from(documentColumn.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              )) as HTMLElement[];

              if (focusableElements.length > 0) {
                // Find the current element's index or start at the first element if none selected
                const currentIndex = navState.documentElement ?
                  focusableElements.indexOf(navState.documentElement) : -1;

                // Get the next element, or loop to the beginning
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                const nextElement = focusableElements[nextIndex];

                setNavState(prev => ({
                  ...prev,
                  index: nextIndex,
                  documentElement: nextElement,
                  focused: true
                }));

                // Actually focus the element
                nextElement.focus();
              }
            }
          }
          if (audioEnabled) playSound('click');
          break;
          
        case 'ArrowRight':
        case 'Tab':
          e.preventDefault();
          if (navState.column === 0 && selectedItems.length > 0) {
            // Move from first to second column
            setNavState({ ...navState, column: 1, index: 0, focused: true });
            if (audioEnabled) playSound('click');
          } else if (navState.column === 1 && selectedItemId) {
            // Move from second to third column (document)
            console.log('Attempting to navigate to document column. Selected item ID:', selectedItemId);

            // Try different selectors to find document content and focusable elements
            const selectors = [
              '.document-centric-recipe',
              '.document-content',
              '.recipe-details',
              '.flex-1.overflow-hidden > div'
            ];

            // Try each selector until we find focusable elements
            let documentColumn = null;
            let foundElements = [];

            for (const selector of selectors) {
              const element = document.querySelector(selector);
              console.log(`Checking selector: ${selector}`, element ? 'found' : 'not found');

              if (element) {
                // Check for focusable elements
                const elements = Array.from(element.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ));

                console.log(`Selector ${selector} has ${elements.length} focusable elements`);

                if (elements.length > 0) {
                  documentColumn = element;
                  foundElements = elements;
                  break;
                }
              }
            }

            // If we didn't find any focusable elements through selectors, try the third column itself
            if (!documentColumn || foundElements.length === 0) {
              console.log('No focusable elements found through selectors. Trying third column...');

              // Get the third column itself
              const thirdColumn = document.querySelector('.flex-1.overflow-hidden');
              if (thirdColumn) {
                // Try to find buttons or other focusable elements
                foundElements = Array.from(thirdColumn.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ));

                if (foundElements.length > 0) {
                  documentColumn = thirdColumn;
                  console.log(`Found ${foundElements.length} focusable elements in third column`);
                } else {
                  // Make the column itself focusable as a last resort
                  console.log('Making third column focusable');
                  thirdColumn.setAttribute('tabindex', '0');
                  foundElements = [thirdColumn];
                  documentColumn = thirdColumn;
                }
              }
            }

            // Now that we have found elements, use the first one
            if (documentColumn && foundElements.length > 0) {
              const firstElement = foundElements[0] as HTMLElement;
              console.log('Focusing element:', firstElement.tagName, firstElement.className);

              setNavState(prev => ({
                ...prev,
                column: 2,
                index: 0,
                documentElement: firstElement,
                focused: true
              }));

              // Actually focus the element for accessibility
              firstElement.focus();

              if (audioEnabled) playSound('click');
              console.log('Successfully navigated to document column');
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (navState.column === 1) {
            // Move from second to first column
            setNavState({
              ...navState,
              column: 0,
              index: SECTIONS.findIndex(s => s.id === activeCategory),
              focused: true
            });
            if (audioEnabled) playSound('click');
          } else if (navState.column === 2) {
            // Move from third to second column
            setNavState({
              ...navState,
              column: 1,
              index: selectedItems.findIndex(item => item.id === selectedItemId),
              documentElement: null,
              focused: true
            });
            if (audioEnabled) playSound('click');
          }
          break;
          
        case 'Enter':
        case ' ': // Space
          e.preventDefault();
          if (navState.column === 0) {
            // Select the category
            handleCategorySelect(SECTIONS[navState.index].id);
          } else if (navState.column === 1 && selectedItems.length > 0) {
            // Select the item
            handleItemSelect(selectedItems[navState.index].id);
          } else if (navState.column === 2 && navState.documentElement) {
            // Activate the currently focused element in the document
            console.log('Activating document element:', navState.documentElement);

            // For different element types, handle activation differently
            if (navState.documentElement.tagName === 'INPUT' ||
                navState.documentElement.tagName === 'TEXTAREA' ||
                navState.documentElement.tagName === 'SELECT') {
              // For form elements, just focus them
              navState.documentElement.focus();
            } else {
              // For buttons and links, simulate a click
              try {
                navState.documentElement.click();
              } catch(e) {
                console.error('Error clicking element:', e);
              }
            }
          }
          if (audioEnabled) playSound('click');
          break;
          
        case 'Escape':
          // Exit keyboard navigation mode
          setNavState(prev => ({ ...prev, focused: false }));
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    theme,
    audioEnabled,
    isAuthenticated,
    signOut,
    playSound,
    navState,
    activeCategory,
    SECTIONS,
    getItemsForCategory
  ]);

  // Handle visual highlighting and focus for document elements
  useEffect(() => {
    // Remove any existing document highlight class from elements
    document.querySelectorAll('.retro-document-element-focus').forEach(el => {
      el.classList.remove('retro-document-element-focus');
      el.classList.remove('retro-box-selection');
    });

    // If we're in column 2 and have a document element, highlight it
    if (navState.column === 2 && navState.documentElement && navState.focused) {
      // Add highlight classes
      navState.documentElement.classList.add('retro-document-element-focus');
      navState.documentElement.classList.add('retro-box-selection');

      // Ensure element is visible (scroll into view if needed)
      navState.documentElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [navState.column, navState.documentElement, navState.focused, navState.index]);

  // Enhanced retro sci-fi movie terminal keyboard navigation styling
  const retroBoxAnimationStyle = `
    @keyframes terminalBlink {
      0%, 49.9% { opacity: 1; }
      50%, 99.9% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    @keyframes hackersFlicker {
      0%, 49.9% { opacity: 0.9; box-shadow: 0 0 5px 2px #7DF9FF, inset 0 0 3px 1px #7DF9FF; }
      50%, 99.9% { opacity: 1; box-shadow: 0 0 12px 4px #00FEFC, inset 0 0 8px 2px #00FEFC; }
      100% { opacity: 0.9; box-shadow: 0 0 5px 2px #7DF9FF, inset 0 0 3px 1px #7DF9FF; }
    }
    
    @keyframes matrixCodeRain {
      0%, 100% { background-position: 0 0; }
      50% { background-position: 0 100%; }
    }
    
    @keyframes tronCircuit {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }
    
    /* Base selection style */
    .retro-box-selection {
      position: relative;
      transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 5;
      overflow: hidden;
      animation: terminalBlink 0.5s infinite steps(1);
    }
    
    /* HACKERS (1995) - Authentic electric blue/cyan palette */
    .hackers .retro-box-selection {
      background-color: rgba(20, 40, 40, 0.85);
      color: #00FEFC; /* Neon Cyan from Hackers */
      text-shadow: 0 0 5px #7DF9FF;
      box-shadow: 0 0 12px 4px #00FEFC, inset 0 0 8px 2px #7DF9FF;
      border: 1px solid #00FEFC;
      border-top-width: 2px; 
      border-bottom-width: 2px;
    }
    
    .hackers .retro-box-selection::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        repeating-linear-gradient(
          0deg,
          rgba(0, 254, 252, 0.05) 1px,
          rgba(0, 254, 252, 0.03) 2px,
          transparent 3px,
          transparent 4px
        );
      z-index: 2;
      pointer-events: none;
    }
    
    .hackers .retro-box-selection::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(90deg, 
          rgba(125, 249, 255, 0.03) 1px, 
          transparent 1px
        ),
        linear-gradient(90deg, 
          transparent 50%, 
          rgba(125, 249, 255, 0.05) 50%
        );
      background-size: 4px 100%, 7px 100%;
      opacity: 0.5;
      z-index: 1;
      pointer-events: none;
    }
    
    /* DYSTOPIA (THE MATRIX) style - Classic Matrix code green */
    .dystopia .retro-box-selection {
      background-color: rgba(0, 20, 0, 0.8);
      color: #00FF00; /* Pure Matrix code green */
      text-shadow: 0 0 5px #00FF00;
      box-shadow: 0 0 10px 3px rgba(0, 255, 0, 0.7), inset 0 0 6px 2px rgba(0, 255, 0, 0.5);
      border: 1px solid #00FF00;
      border-left-width: 3px;
    }
    
    .dystopia .retro-box-selection::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(180deg, 
          rgba(0, 255, 0, 0.1) 0%,
          rgba(0, 255, 0, 0.05) 50%,
          rgba(0, 255, 0, 0.1) 100%
        );
      background-size: 100% 20px;
      animation: matrixCodeRain 4s linear infinite;
      z-index: 2;
      pointer-events: none;
    }
    
    .dystopia .retro-box-selection::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(0deg,
          transparent 0%,
          rgba(0, 255, 0, 0.1) 5%,
          rgba(0, 255, 0, 0.05) 10%,
          transparent 15%,
          transparent 85%,
          rgba(0, 255, 0, 0.05) 90%,
          rgba(0, 255, 0, 0.1) 95%,
          transparent 100%
        );
      opacity: 0.7;
      z-index: 1;
      pointer-events: none;
    }
    
    /* NEOTOPIA (TRON) style - Authentic TRON blue circuit */
    .neotopia .retro-box-selection {
      background-color: rgba(5, 15, 35, 0.9);
      color: #7DFDFE; /* Authentic TRON blue */
      text-shadow: 0 0 8px #7DFDFE;
      box-shadow: 
        0 0 15px 5px rgba(125, 253, 254, 0.8),
        inset 0 0 8px 2px rgba(125, 253, 254, 0.6);
      border: 2px solid #0EF8F8; /* Light cycle blue */
    }
    
    .neotopia .retro-box-selection::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(90deg,
          rgba(125, 253, 254, 0.1) 1px,
          transparent 1px
        ),
        linear-gradient(0deg,
          rgba(125, 253, 254, 0.1) 1px,
          transparent 1px
        );
      background-size: 20px 20px;
      z-index: 1;
      pointer-events: none;
    }
    
    .neotopia .retro-box-selection::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg,
          transparent 0%,
          rgba(125, 253, 254, 0.2) 10%,
          rgba(125, 253, 254, 0.1) 20%,
          transparent 30%,
          transparent 70%,
          rgba(125, 253, 254, 0.2) 80%,
          rgba(125, 253, 254, 0.1) 90%,
          transparent 100%
        );
      background-size: 200% 100%;
      animation: tronCircuit 10s linear infinite;
      opacity: 0.7;
      z-index: 2;
      pointer-events: none;
    }
    
    /* Ensure text is visible */
    .retro-box-selection span,
    .retro-box-selection div {
      color: inherit !important;
      position: relative;
      z-index: 3;
    }
  `;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme} ${className}`}>
      {/* Insert our CSS animation styling */}
      <style dangerouslySetInnerHTML={{ __html: retroBoxAnimationStyle }} />
      {/* Header with Left-Aligned Animated Title */}
      <div className="bg-surface-1 border-b-4 border-accent/40 font-mono flex-shrink-0 h-[100px] relative z-10 shadow-sm flex items-center">
        <div className="pl-8">
          <h1 className="text-[3rem] font-bold text-accent tracking-tight flex items-center">
            <span className="inline-block w-8 animate-pulse mr-2">&gt;</span>
            KRAFT_AI TERMINAL
            <span className="inline-block w-8 animate-[blink_1s_steps(1)_infinite] ml-2">_</span>
          </h1>
          <div className="text-[1rem] flex space-x-6 mt-1">
            <span data-system-element="version" className="server-info">v1.0.2</span>
            <span data-system-element="module" className="server-info">MODULE_SYSTEM: ACTIVE</span>
            <span
              data-system-element="status"
              className={systemStatus === 'online' ? 'value-positive' : 'error'}
            >
              STATUS: {systemStatus.toUpperCase()}
            </span>
          </div>
          <style jsx>{`
            @keyframes blink {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
          `}</style>
        </div>
      </div>
      
      {/* Main Three Column Layout with Retro Terminal UI - Flexible height */}
      <div className="flex-1 grid grid-cols-[200px_256px_1fr] overflow-hidden font-mono mt-2 pt-1 relative z-0 border-t border-border-subtle border-opacity-50">
        {/* First Column - Top-level Categories (Modules) */}
        <div data-file-browser="directory-column" className="bg-surface-1 border-r-2 border-border-subtle flex flex-col">
          <div data-file-browser="header" className="py-1 pl-2 text-[1.25rem] uppercase text-accent bg-surface-2 border-b-2 border-border-subtle font-medium">
            DIRECTORIES
          </div>

          <div className="flex-1 overflow-y-auto">
            {SECTIONS.map((section, index) => (
              <div
                key={section.id}
                data-category={section.id}
                data-file-browser="item"
                className={`flex items-center px-3 py-3 cursor-pointer transition-colors relative ${
                  activeCategory === section.id
                    ? 'file-active text-accent font-bold'
                    : 'hover:bg-surface-2 file-inactive'
                  } ${navState.focused && navState.column === 0 && navState.index === index ? 'retro-box-selection hackers-flashing-box' : ''}`
                }
                onClick={() => {
                  handleCategorySelect(section.id);
                  setNavState({ column: 0, index, focused: true });
                }}
              >
                <span className={`mr-2 font-bold file-icon ${theme === 'hackers' && activeCategory === section.id ? 'hackers-flashing-box' : ''}`}>
                  {activeCategory === section.id ? '►' : ' '}
                </span>
                <span className="mr-2 flex items-center justify-center w-8 h-8">
                  <ThemeIcon type={section.iconType} size={24} />
                </span>
                <span className="uppercase text-[1.125rem] file-name">{section.name}</span>
              </div>
            ))}
          </div>
          
          {/* System Status Indicator */}
          <div className="mt-4 px-3 text-text-secondary">
            <div className="mb-3 border-t border-border-subtle"></div>
            <div className="text-[1rem]">
              {systemStatus === 'checking' ? (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-amber-500 text-[1.25rem] animate-pulse mr-2">●</span>
                    <span className="text-amber-500 font-medium">CONNECTING...</span>
                  </div>
                  <div className="ml-2">
                    DATABASE CONNECTION<br />IN PROGRESS
                  </div>
                </>
              ) : systemStatus === 'online' ? (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-green-500 text-[1.25rem] mr-2">●</span>
                    <span className="text-green-500 font-medium">SYSTEM READY</span>
                  </div>
                  <div className="ml-2">
                    <div className="flex justify-between mb-1">
                      <span>THEME:</span>
                      <span className="text-accent">{theme.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TIME:</span>
                      <CurrentTime />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-red-500 text-[1.25rem] mr-2">●</span>
                    <span className="text-red-500 font-medium">CONNECTION ERROR</span>
                  </div>
                  <div className="ml-2">
                    {connectionError ? (
                      <>
                        <div className="text-red-500 font-medium">ERROR:</div>
                        <div className="text-[0.875rem] max-w-[130px] truncate">
                          {connectionError.length > 20
                            ? `${connectionError.substring(0, 20)}...`
                            : connectionError}
                        </div>
                      </>
                    ) : (
                      'AWAITING CONNECTION...'
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Column - Items for Selected Category */}
        <div data-file-browser="items-column" className="border-r-2 border-border-subtle bg-surface-0 flex flex-col">
          <div data-file-browser="header" className="p-2 border-b-2 border-border-subtle bg-surface-1">
            <div className="text-[1.25rem] text-accent font-medium uppercase px-2">
              {SECTIONS.find(s => s.id === activeCategory)?.name || 'ITEMS'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {getItemsForCategory().map((item, index) => (
              <div
                key={item.id}
                data-item={item.id}
                data-file-browser="item"
                className={`px-3 py-2.5 cursor-pointer transition-colors border-b border-border-subtle relative ${
                  selectedItemId === item.id
                    ? 'item-active text-accent'
                    : 'item-inactive hover:bg-surface-1 bg-surface-1'
                } ${navState.focused && navState.column === 1 && navState.index === index ? 'retro-box-selection hackers-flashing-box' : ''}`}
                onClick={() => {
                  handleItemSelect(item.id);
                  setNavState({ column: 1, index, focused: true });
                }}
              >
                <div className="flex items-center">
                  <span className={`mr-2 font-bold text-[1rem] item-prefix ${theme === 'hackers' && selectedItemId === item.id ? 'hackers-flashing-box' : ''}`}>
                    {selectedItemId === item.id ? '►' : `${index+1}.`}
                  </span>
                  {item.iconType ? (
                    <span className="mr-2 flex items-center justify-center w-6 h-6 item-icon">
                      <ThemeIcon type={item.iconType} size={16} />
                    </span>
                  ) : item.icon ? (
                    <span className="mr-2 opacity-90 item-icon">
                      {item.icon}
                    </span>
                  ) : null}
                  <div>
                    <div className="font-medium truncate text-[1rem] item-title">{item.title || item.name}</div>
                    {item.description && (
                      <div className="text-[0.875rem] truncate opacity-80 item-description">{item.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple item counter */}
          <div className="p-2 border-t-2 border-border-subtle text-text-secondary text-[0.875rem]">
            <div className="flex justify-between px-2">
              <span>{getItemsForCategory().length} ITEMS</span>
              <span className="text-accent">{selectedItemId ? 'ITEM SELECTED' : 'NO SELECTION'}</span>
            </div>
          </div>
        </div>
        
        {/* Third Column - Detail View / Active Document */}
        <div data-terminal="content-area" className="flex-1 overflow-hidden">
          <div data-terminal="header" className="border-b-2 border-border-subtle py-2 px-3 bg-surface-1 sticky top-0 z-10">
            <div className="text-[1.5rem] text-accent font-bold terminal-title">
              {selectedItemId ? (() => {
                // Get the active item's title
                const item = getItemsForCategory().find(i => i.id === selectedItemId);
                return item?.title || item?.name || 'SELECTED ITEM';
              })() : 'SELECT AN ITEM'}
            </div>
          </div>

          <div data-terminal="content" className="h-full overflow-auto">
            {/* Settings content always shows regardless of database connection */}
            {activeCategory === 'settings' && selectedItemId ? (
              <SettingsTerminalContent category={selectedItemId} />
            ) : (
              <>
                {/* Database connection error - only for non-settings categories */}
                {systemStatus === 'offline' && (
                  <div data-terminal="error-screen" className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="mb-6">
                      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12" y2="16" />
                      </svg>
                    </div>
                    <h2 className="text-[2rem] font-bold mb-3 error-title">Database Connection Error</h2>
                    <div className="border border-red-500 bg-red-500/10 p-4 mb-6 rounded text-left max-w-md error-box">
                      <p className="text-[1.25rem] error-heading font-bold mb-2">Error Details:</p>
                      <p className="text-[1.125rem] error-message">
                        {connectionError || 'Unable to connect to the database. Please check your connection settings and try again.'}
                      </p>
                    </div>
                    <p className="text-[1.125rem] terminal-text max-w-md">
                      The application is unable to connect to the Supabase database. This is required for
                      accessing formulations and ingredients. No mock data is available as a fallback.
                      <br /><br />
                      <span className="text-accent font-bold highlight-text">Tip: Try accessing the Settings section while database issues are being resolved.</span>
                    </p>
                  </div>
                )}

                {/* Database connection in progress - only for non-settings categories */}
                {systemStatus === 'checking' && (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="mb-6">
                      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#FFB000" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round" className="animate-spin">
                        <circle cx="12" cy="12" r="10" strokeDasharray="1,3" />
                        <circle cx="12" cy="12" r="6" strokeDasharray="1,2" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <h2 className="text-[2rem] font-bold mb-3 text-amber-500">Connecting to Database...</h2>
                    <div className="w-64 h-3 bg-surface-2 rounded-full mb-6">
                      <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-[1.125rem] text-text-secondary max-w-md">
                      Establishing connection to the Supabase database. This might take a few moments.
                      <br /><br />
                      <span className="text-accent font-bold">Tip: You can still access the Settings section while waiting for the database connection.</span>
                    </p>
                  </div>
                )}

                {/* Normal operation */}
                {systemStatus === 'online' && (
                  selectedItemId ? children : (
                    /* Otherwise show a placeholder */
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="mb-6 flex justify-center items-center">
                        <ThemeIcon type={activeCategory} size={96} />
                      </div>
                      <h2 className="text-[2rem] font-bold mb-3">Select a {activeCategory === 'settings' ? 'settings category' : activeCategory.slice(0, -1)} to view</h2>
                      <p className="text-[1.25rem] text-text-secondary max-w-md">
                        Choose an item from the list on the left to view and edit its details in this panel.
                      </p>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Advanced Terminal Footer with Detailed Stats and Logs */}
      <div data-terminal="footer" className="bg-surface-1 border-t-4 border-accent/40 py-4 px-4 font-mono flex-shrink-0 shadow-sm relative z-10 h-[140px]">
        <div className="grid grid-cols-12 gap-2">
          {/* System Status Panel */}
          <div data-terminal="stats-panel" data-panel="sys-status" className="col-span-3 border border-border-subtle bg-surface-0 p-1 kraftTerminalPanel">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span className="text-[1rem] terminal-heading" data-text="SYS_STATUS" data-panel="sys-status">SYS_STATUS</span>
              <span className={`text-[1rem] ${systemStatus === 'online' ? 'value-positive' : 'error'}`}>
                [{systemStatus.toUpperCase()}]
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[0.875rem]">
              <div className="flex justify-between">
                <span className="text-text-secondary stats-label" data-label="uptime">UPTIME:</span>
                <span data-value="uptime" className="value-text">{Math.floor(Math.random() * 24) + 1}h {Math.floor(Math.random() * 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">SESS_ID:</span>
                <span className="value-text">#{Math.floor(Math.random() * 9000) + 1000}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary stats-label" data-label="db_conn">DB_CONN:</span>
                <span className={systemStatus === 'online' ? 'text-green-500' : 'text-red-500'}>
                  {systemStatus === 'online' ? 'ACTIVE' : 'FAILED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary stats-label" data-label="api">API:</span>
                <span className="text-green-500">READY</span>
              </div>
            </div>

            {/* System meters visualization */}
            <div className="mt-1 grid grid-cols-2 gap-x-1 text-[0.875rem]">
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
          <div data-panel="module-statistics" className="col-span-3 border border-border-subtle bg-surface-0 p-1 kraftTerminalPanel">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span className="text-[1rem] terminal-heading" data-text="MODULE_STATISTICS" data-panel="module-statistics">MODULE_STATISTICS</span>
              <span className={`text-[0.875rem]
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

            <div className="mb-1 text-[0.875rem]">
              <div className="flex justify-between mb-0.5">
                <span className="text-text-secondary stats-label" data-label="formulations">FORMULATIONS:</span>
                <span className="font-bold value-text" data-value="formulations">{databaseStats.formulations}</span>
                <span className="text-text-secondary accent-text" data-value="total">TOTAL:</span>
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

            <div className="mb-1 text-[0.875rem]">
              <div className="flex justify-between mb-0.5">
                <span className="text-text-secondary stats-label" data-label="ingredients">INGREDIENTS:</span>
                <span className="font-bold value-text" data-value="ingredients">{databaseStats.ingredients}</span>
                <span className="text-text-secondary accent-text" data-value="used">USED:</span>
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

            <div className="flex justify-between items-center text-[0.875rem]">
              <div className="flex space-x-1">
                <span className="text-text-secondary stats-label" data-label="modules">MODULES:</span>
                <span className="text-accent value-text" data-value="modules">3</span>
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
          <div data-terminal="log-panel" data-panel="live-system-log" className="col-span-4 border border-border-subtle bg-surface-0 p-1 kraftTerminalPanel">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span className="text-[1rem] terminal-heading" data-text="LIVE_SYSTEM_LOG" data-panel="live-system-log">LIVE_SYSTEM_LOG</span>
              <span className="value-positive animate-pulse text-[0.875rem]">STREAMING</span>
            </div>

            <div data-terminal="log-window" className="h-16 overflow-y-auto bg-surface-2 p-1 font-mono text-[0.75rem] leading-tight">
              <div className="log-standard">[<CurrentTime />] System resources initialized successfully</div>
              <div className="log-standard">[<CurrentTime />] Cache size optimized (64MB)</div>
              <div className="log-success">[<CurrentTime />] Database connection established to supabase.co</div>
              <div className="log-standard">[<CurrentTime />] Auth provider initialized with DEV profile</div>
              <div className="log-standard">[<CurrentTime />] Loaded formulation data ({databaseStats.formulations} entries)</div>
              <div className="log-standard">[<CurrentTime />] Loaded ingredient data ({databaseStats.ingredients} entries)</div>
              <div className="log-highlight">[<CurrentTime />] Theme activated: {theme.toUpperCase()}</div>
              <div className="log-highlight">[<CurrentTime />] UI rendering complete (React hydration)</div>
              <div className="log-warning">[<CurrentTime />] Font loading completed with fallbacks</div>
              <div className="log-standard">[<CurrentTime />] Audio system {audioEnabled ? 'enabled' : 'disabled'}</div>
              <div className="log-network">[<CurrentTime />] Formulation processor initialized</div>
              <div className="log-success">[<CurrentTime />] Module System activated</div>
              <div className="log-active animate-pulse">[<CurrentTime />] Awaiting user input _</div>
            </div>
          </div>

          {/* Command & F-Key Bar */}
          <div data-panel="commands" className="col-span-2 border border-border-subtle bg-surface-0 p-1 kraftTerminalPanel">
            <div className="flex justify-between text-accent font-bold mb-1">
              <span className="text-[1rem] terminal-heading" data-text="COMMANDS" data-panel="commands">COMMANDS</span>
              <span className="text-amber-500 text-[0.875rem]">MODULE_SYS</span>
            </div>

            <div className="grid grid-cols-1 gap-y-1 text-[0.875rem]">
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

            <div className="mt-1 flex items-center justify-between text-[0.875rem]">
              <span className="text-text-secondary">ACTIVE:</span>
              <span className="text-accent font-bold">MODULES</span>
            </div>
          </div>

          {/* System Branding */}
          <div className="cols-span-12 md:col-span-12 lg:col-span-12 flex justify-between items-end mt-1 text-[0.875rem]">
            <div className="flex items-center">
              <span className="text-text-secondary">
                KRAFT_AI_TERMINAL v1.0.2 | <span className="text-accent">MODULE_SYSTEM v2.0</span> |
                <span className={systemStatus === 'online' ? 'text-green-500' : 'text-red-500'}>
                  {' '}{systemStatus.toUpperCase()}
                </span>
                {navState.focused && (
                  <span className="ml-2 text-accent animate-pulse">
                    [KEYBOARD NAV: {
                      navState.column === 0 ? 'DIRECTORIES' :
                      navState.column === 1 ? 'ITEMS' :
                      'DOCUMENT'
                    } | ↑↓←→ TO NAVIGATE | ENTER TO SELECT]
                  </span>
                )}
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

// Helper function for Apple login (will be replaced in real implementation)
function handleAppleLogin() {
  console.log('Apple login not implemented');
}