"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase'; 

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useDevLogin = isDevelopment && process.env.NEXT_PUBLIC_AUTO_DEV_LOGIN === 'true';

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for stored session first
        const { data: { session: storedSession }, error: sessionError } = await supabase.auth.getSession();
        
        // Handle development auto-login if enabled
        if (!storedSession && useDevLogin) {
          // Use a development mock user instead of trying to authenticate with Supabase
          console.log('Development mode: Using mock user authentication');
          
          // Create a mock session
          const mockUser = {
            id: 'dev-user-id-123',
            email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@example.com',
            role: 'authenticated',
            aud: 'authenticated',
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString()
          };
          
          const mockSession = {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: mockUser as User
          };
          
          // Use the mock session directly
          handleSession(mockSession as Session);
        } else {
          // Normal session handling
          handleSession(storedSession);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const handleSession = (currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);
    };

    initAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`Auth state changed: ${event}`, newSession?.user?.email);
      handleSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [useDevLogin]);

  const signInWithMagicLink = async (email: string): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: window.location.origin,
        }
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      console.error("Error sending magic link:", err);
      return { error: err instanceof Error ? err : new Error('Unknown error sending magic link') };
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      console.error("Error signing in with password:", err);
      return { error: err instanceof Error ? err : new Error('Unknown error signing in') };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      console.error("Error signing out:", err);
      return { error: err instanceof Error ? err : new Error('Unknown error signing out') };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signInWithMagicLink, 
      signInWithPassword, 
      signOut, 
      loading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};