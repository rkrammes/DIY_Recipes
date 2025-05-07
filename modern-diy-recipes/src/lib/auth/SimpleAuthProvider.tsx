'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_FAMILY_MEMBERS, FamilyMember } from './familyAuth';

/**
 * User interface for simplified authentication
 */
export interface AuthUser {
  id: string;
  name: string;
  displayName: string;
  email?: string;
  role: 'admin' | 'parent' | 'child' | 'guest';
  avatar?: string;
  color?: string;
  preferences?: Record<string, any>;
  allowedModules?: string[];
  metadata?: Record<string, any>;
}

/**
 * SimpleAuth context interface
 */
export interface SimpleAuthContextType {
  user: AuthUser | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  login: (emailOrId: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginAsFamilyMember: (memberId: string) => void;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  
  // Preference methods
  getPreference: <T = any>(key: string, defaultValue?: T) => T;
  setPreference: <T = any>(key: string, value: T) => void;
  
  // Access control
  hasAccessToModule: (moduleId: string) => boolean;
  
  // Development utils
  isDevelopment: boolean;
  enableDevMode: () => void;
  disableDevMode: () => void;
}

// Create context with default values
export const SimpleAuthContext = createContext<SimpleAuthContextType>({
  user: null,
  users: [],
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  login: async () => ({ success: false, error: 'Not implemented' }),
  loginWithMagicLink: async () => ({ success: false, error: 'Not implemented' }),
  loginAsFamilyMember: () => {},
  loginAsGuest: () => {},
  logout: async () => {},
  switchUser: () => {},
  
  getPreference: () => null as any,
  setPreference: () => {},
  
  hasAccessToModule: () => false,
  
  isDevelopment: false,
  enableDevMode: () => {},
  disableDevMode: () => {}
});

// Convert FamilyMember to AuthUser
function familyMemberToAuthUser(member: FamilyMember): AuthUser {
  return {
    id: member.id,
    name: member.name,
    displayName: member.displayName,
    role: member.role,
    avatar: member.avatar,
    color: member.color,
    preferences: member.preferences,
    allowedModules: member.allowedModules
  };
}

// Create a default guest user
const GUEST_USER: AuthUser = {
  id: 'guest',
  name: 'guest',
  displayName: 'Guest',
  role: 'guest',
  avatar: '👤',
  color: '#a7a06d',
  allowedModules: ['formulations'],
  preferences: {
    theme: 'dystopia',
    soundEffects: false,
    autoSave: false
  }
};

/**
 * SimpleAuthProvider props
 */
interface SimpleAuthProviderProps {
  children: ReactNode;
  initialFamilyMembers?: FamilyMember[];
  enableDevMode?: boolean;
}

/**
 * SimpleAuthProvider - Unified authentication provider
 * 
 * This provider consolidates multiple authentication approaches:
 * 1. Supabase auth for email/password and magic link
 * 2. Family member selection for family-friendly mode
 * 3. Guest mode for quick access
 * 4. Development mode for testing
 */
export function SimpleAuthProvider({ 
  children,
  initialFamilyMembers = DEFAULT_FAMILY_MEMBERS,
  enableDevMode: initialDevMode = false
}: SimpleAuthProviderProps) {
  // Core state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(
    process.env.NODE_ENV === 'development' || initialDevMode
  );
  const [isDevMode, setIsDevMode] = useState(initialDevMode);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convert family members to users
        const familyUsers = initialFamilyMembers.map(familyMemberToAuthUser);
        setUsers(familyUsers);
        
        // Check browser storage for current user
        if (typeof window !== 'undefined') {
          // Check for family member login
          const storedMemberId = localStorage.getItem('current_member_id');
          if (storedMemberId) {
            const familyUser = familyUsers.find(u => u.id === storedMemberId);
            if (familyUser) {
              setUser(familyUser);
              setIsLoading(false);
              return;
            }
          }
          
          // Check for stored Supabase session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (!sessionError && session) {
            // Convert Supabase user to AuthUser
            const supabaseUser = session.user;
            const authUser: AuthUser = {
              id: supabaseUser.id,
              name: supabaseUser.email?.split('@')[0] || 'user',
              displayName: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
              email: supabaseUser.email,
              role: supabaseUser.user_metadata?.role || 'admin',
              avatar: supabaseUser.user_metadata?.avatar || '👩‍💻',
              allowedModules: ['formulations', 'ingredients', 'settings', 'admin'],
              preferences: supabaseUser.user_metadata?.preferences || {
                theme: 'neotopia',
                soundEffects: true,
                autoSave: true
              },
              metadata: supabaseUser.user_metadata
            };
            
            setUser(authUser);
            
            // Add to users list if not there
            if (!users.some(u => u.id === authUser.id)) {
              setUsers(prev => [...prev, authUser]);
            }
            
            setIsLoading(false);
            return;
          }
          
          // Check for dev mode
          if (isDevMode) {
            const devUser: AuthUser = {
              id: 'dev-user',
              name: 'developer',
              displayName: 'Developer',
              email: 'dev@example.com',
              role: 'admin',
              avatar: '👩‍💻',
              color: '#6c5ce7',
              allowedModules: ['formulations', 'ingredients', 'settings', 'admin'],
              preferences: {
                theme: 'hackers',
                soundEffects: true,
                autoSave: true
              }
            };
            
            setUser(devUser);
            
            // Add to users list if not there
            if (!users.some(u => u.id === 'dev-user')) {
              setUsers(prev => [...prev, devUser]);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'Unknown authentication error');
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Set up auth state change listener for Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // Convert Supabase user to AuthUser
        const supabaseUser = session.user;
        const authUser: AuthUser = {
          id: supabaseUser.id,
          name: supabaseUser.email?.split('@')[0] || 'user',
          displayName: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email,
          role: supabaseUser.user_metadata?.role || 'admin',
          avatar: supabaseUser.user_metadata?.avatar || '👩‍💻',
          allowedModules: ['formulations', 'ingredients', 'settings', 'admin'],
          preferences: supabaseUser.user_metadata?.preferences || {
            theme: 'neotopia',
            soundEffects: true,
            autoSave: true
          },
          metadata: supabaseUser.user_metadata
        };
        
        setUser(authUser);
        
        // Add to users list if not there
        setUsers(prev => {
          if (!prev.some(u => u.id === authUser.id)) {
            return [...prev, authUser];
          }
          return prev;
        });
      } else if (event === 'SIGNED_OUT') {
        // Only clear if not using family member or dev mode
        if (
          !user || 
          (user.id !== 'dev-user' && 
          !initialFamilyMembers.some(m => m.id === user.id))
        ) {
          setUser(null);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [initialFamilyMembers, isDevMode]);
  
  // Login with email and password
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if this is a family member ID
      const familyMember = initialFamilyMembers.find(m => m.id === email);
      if (familyMember) {
        loginAsFamilyMember(email);
        return { success: true };
      }
      
      // Login with Supabase
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }
      } else {
        // Try magic link if no password
        return loginWithMagicLink(email);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown login error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login with magic link
  const loginWithMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown login error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login as a family member
  const loginAsFamilyMember = (memberId: string) => {
    const member = initialFamilyMembers.find(m => m.id === memberId);
    if (!member) {
      setError(`Family member with ID ${memberId} not found`);
      return;
    }
    
    const familyUser = familyMemberToAuthUser(member);
    setUser(familyUser);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_member_id', memberId);
      // Clear any Supabase session to avoid conflicts
      supabase.auth.signOut({ scope: 'local' });
    }
    
    setError(null);
  };
  
  // Login as guest
  const loginAsGuest = () => {
    setUser(GUEST_USER);
    setError(null);
    
    // Add to users list if not there
    setUsers(prev => {
      if (!prev.some(u => u.id === GUEST_USER.id)) {
        return [...prev, GUEST_USER];
      }
      return prev;
    });
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_login', 'true');
      // Clear any Supabase session to avoid conflicts
      supabase.auth.signOut({ scope: 'local' });
    }
  };
  
  // Logout
  const logout = async () => {
    // Clear all auth state
    setUser(null);
    setError(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_member_id');
      localStorage.removeItem('guest_login');
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
  };
  
  // Switch to another user
  const switchUser = (userId: string) => {
    // Check if user is a family member
    const familyMember = initialFamilyMembers.find(m => m.id === userId);
    if (familyMember) {
      loginAsFamilyMember(userId);
      return;
    }
    
    // Check if user is in users list
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setError(null);
    } else {
      setError(`User with ID ${userId} not found`);
    }
  };
  
  // Get a preference for the current user
  const getPreference = <T = any>(key: string, defaultValue?: T): T => {
    if (!user || !user.preferences) {
      return defaultValue as T;
    }
    
    return (user.preferences[key] ?? defaultValue) as T;
  };
  
  // Set a preference for the current user
  const setPreference = <T = any>(key: string, value: T) => {
    if (!user) return;
    
    // Create a new user object with updated preferences
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        [key]: value
      }
    };
    
    // Update current user
    setUser(updatedUser);
    
    // Update user in the users list
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    
    // Store in localStorage for family members
    if (initialFamilyMembers.some(m => m.id === user.id) && typeof window !== 'undefined') {
      const updatedMembers = initialFamilyMembers.map(m => {
        if (m.id === user.id) {
          return {
            ...m,
            preferences: {
              ...m.preferences,
              [key]: value
            }
          };
        }
        return m;
      });
      
      localStorage.setItem('family_members', JSON.stringify(updatedMembers));
    }
    
    // For Supabase users, update their metadata
    if (user.email && supabase.auth.getUser) {
      supabase.auth.updateUser({
        data: { 
          preferences: {
            ...user.preferences,
            [key]: value
          }
        }
      });
    }
  };
  
  // Check if the current user has access to a module
  const hasAccessToModule = (moduleId: string): boolean => {
    if (!user || !user.allowedModules) {
      return false;
    }
    
    // Admins and parents have access to everything
    if (user.role === 'admin' || user.role === 'parent') {
      return true;
    }
    
    // Check if the module is in the allowed modules list
    return user.allowedModules.includes(moduleId);
  };
  
  // Enable dev mode
  const enableDevMode = () => {
    setIsDevMode(true);
    
    // Create and set dev user
    const devUser: AuthUser = {
      id: 'dev-user',
      name: 'developer',
      displayName: 'Developer',
      email: 'dev@example.com',
      role: 'admin',
      avatar: '👩‍💻',
      color: '#6c5ce7',
      allowedModules: ['formulations', 'ingredients', 'settings', 'admin'],
      preferences: {
        theme: 'hackers',
        soundEffects: true,
        autoSave: true
      }
    };
    
    setUser(devUser);
    setError(null);
    
    // Add to users list if not there
    setUsers(prev => {
      if (!prev.some(u => u.id === 'dev-user')) {
        return [...prev, devUser];
      }
      return prev;
    });
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev_mode', 'true');
    }
  };
  
  // Disable dev mode
  const disableDevMode = () => {
    setIsDevMode(false);
    
    // Clear user if it's the dev user
    if (user && user.id === 'dev-user') {
      setUser(null);
    }
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev_mode');
    }
  };
  
  // Context value
  const contextValue: SimpleAuthContextType = {
    user,
    users,
    isAuthenticated: !!user,
    isLoading,
    error,
    
    login,
    loginWithMagicLink,
    loginAsFamilyMember,
    loginAsGuest,
    logout,
    switchUser,
    
    getPreference,
    setPreference,
    
    hasAccessToModule,
    
    isDevelopment,
    enableDevMode,
    disableDevMode
  };
  
  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

/**
 * Hook to use the simple authentication context
 */
export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}