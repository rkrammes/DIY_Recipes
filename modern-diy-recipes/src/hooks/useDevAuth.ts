'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface DevUser {
  id: string;
  email: string;
  role: string;
}

interface DevAuthContext {
  user: DevUser | null;
  isAuthenticated: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  logout: () => void;
  login: () => void;
}

const defaultDevUser: DevUser = {
  id: 'dev-user-1',
  email: 'dev@example.com',
  role: 'admin'
};

const DevAuthContext = createContext<DevAuthContext>({
  user: null,
  isAuthenticated: false,
  isEditMode: false,
  toggleEditMode: () => {},
  logout: () => {},
  login: () => {}
});

export const useDevAuth = () => useContext(DevAuthContext);

export function DevAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DevUser | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Check localStorage on mount
  useEffect(() => {
    // Browser-only code
    if (typeof window === 'undefined') return;
    
    try {
      // Get stored user and edit mode from localStorage
      const storedUser = localStorage.getItem('dev_user');
      const storedEditMode = localStorage.getItem('dev_edit_mode');
      
      // Set user if exists in localStorage, otherwise use default in development
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (process.env.NODE_ENV === 'development') {
        setUser(defaultDevUser);
        localStorage.setItem('dev_user', JSON.stringify(defaultDevUser));
      }
      
      // Set edit mode if exists in localStorage
      if (storedEditMode === 'true') {
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Failed to initialize dev auth:', error);
    } finally {
      setInitialized(true);
    }
  }, []);
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (typeof window === 'undefined') return;
    
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    // Store in localStorage
    try {
      if (newEditMode) {
        localStorage.setItem('dev_edit_mode', 'true');
      } else {
        localStorage.removeItem('dev_edit_mode');
      }
    } catch (error) {
      console.error('Failed to toggle edit mode:', error);
    }
  };
  
  // Logout - clear user from state and localStorage
  const logout = () => {
    if (typeof window === 'undefined') return;
    
    setUser(null);
    try {
      localStorage.removeItem('dev_user');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  // Login - set default dev user
  const login = () => {
    if (typeof window === 'undefined') return;
    
    setUser(defaultDevUser);
    try {
      localStorage.setItem('dev_user', JSON.stringify(defaultDevUser));
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };
  
  const contextValue = {
    user,
    isAuthenticated: !!user,
    isEditMode,
    toggleEditMode,
    logout,
    login
  };
  
  return (
    <DevAuthContext.Provider value={contextValue}>
      {children}
    </DevAuthContext.Provider>
  );
}