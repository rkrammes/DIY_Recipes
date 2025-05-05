'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useSimplifiedSupabaseMcp } from './useSimplifiedSupabaseMcp';
import { User, Session } from '../lib/mcp/adapters/simplifiedSupabaseMcpAdapter';

// Auth context type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isEditMode: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleEditMode: () => void;
  useDevelopmentUser: () => Promise<void>;
}

// Development user credentials
const DEV_USER_EMAIL = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@example.com';
const DEV_USER_PASSWORD = process.env.NEXT_PUBLIC_DEV_USER_PASSWORD || 'devpass123';

// Create the auth context
export const SimplifiedMcpAuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isEditMode: false,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  toggleEditMode: () => {},
  useDevelopmentUser: async () => {},
});

// Hook to use auth context
export const useSimplifiedMcpAuth = () => useContext(SimplifiedMcpAuthContext);

// Auth Provider Component
export function SimplifiedMcpAuthProvider({ children }: { children: ReactNode }) {
  const { adapter, isConnected, connect, authenticate } = useSimplifiedSupabaseMcp();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!adapter) {
        throw new Error('Authentication service not initialized');
      }
      
      if (!isConnected) {
        await connect();
      }
      
      const authData = await authenticate(email, password);
      
      if (!authData || !authData.user) {
        throw new Error('Authentication failed');
      }
      
      setUser(authData.user);
      setSession(authData);
      localStorage.setItem('auth_user', JSON.stringify(authData.user));
      localStorage.setItem('auth_session', JSON.stringify(authData));
      
      return authData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      console.error('Sign in error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [adapter, isConnected, connect, authenticate]);
  
  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      console.error('Sign out error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    const newValue = !isEditMode;
    setIsEditMode(newValue);
    
    // Store in localStorage to persist across refreshes
    if (newValue) {
      localStorage.setItem('mcp_edit_mode', 'true');
    } else {
      localStorage.removeItem('mcp_edit_mode');
    }
    
    console.log(`Edit mode ${newValue ? 'enabled' : 'disabled'}`);
  }, [isEditMode]);
  
  // Use development user
  const useDevelopmentUser = useCallback(async () => {
    if (!isDevelopment) {
      console.warn('Development user can only be used in development mode');
      return;
    }
    
    try {
      await signIn(DEV_USER_EMAIL, DEV_USER_PASSWORD);
      console.log('Development user signed in successfully');
    } catch (err) {
      console.error('Failed to sign in with development user:', err);
      
      // If authentication fails, create a mock user for development
      const mockUser = {
        id: 'dev-user-id',
        email: DEV_USER_EMAIL,
        user_metadata: { name: 'Development User' }
      };
      
      const mockSession = {
        access_token: 'mock-access-token',
        user: mockUser
      };
      
      setUser(mockUser);
      setSession(mockSession as Session);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_session', JSON.stringify(mockSession));
      
      console.log('Using mock development user');
    }
  }, [isDevelopment, signIn]);
  
  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check for existing user in localStorage
        const storedUser = localStorage.getItem('auth_user');
        const storedSession = localStorage.getItem('auth_session');
        
        // Check for edit mode in localStorage
        const storedEditMode = localStorage.getItem('mcp_edit_mode');
        if (storedEditMode === 'true') {
          setIsEditMode(true);
        }
        
        if (storedUser && storedSession) {
          setUser(JSON.parse(storedUser));
          setSession(JSON.parse(storedSession));
        } else if (isDevelopment) {
          // In development, automatically use the dev user if auto-login is enabled
          const autoLogin = process.env.NEXT_PUBLIC_AUTO_DEV_LOGIN === 'true';
          if (autoLogin) {
            await useDevelopmentUser();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [isDevelopment, useDevelopmentUser]);
  
  // Development mode warning
  useEffect(() => {
    if (isDevelopment && user) {
      console.log('Running in DEVELOPMENT mode with user:', user.email);
    }
  }, [isDevelopment, user]);
  
  const value = {
    user,
    session,
    isLoading,
    isEditMode,
    error,
    signIn,
    signOut,
    toggleEditMode,
    useDevelopmentUser
  };
  
  // Using createElement instead of JSX to avoid parsing issues
  return React.createElement(
    SimplifiedMcpAuthContext.Provider, 
    { value }, 
    children
  );
}