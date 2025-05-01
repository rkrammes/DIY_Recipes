"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching session:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error sending magic link:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error signing out:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signInWithMagicLink, signOut, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};