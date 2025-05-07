'use client';

import React, { useState } from 'react';
import { useSimpleAuth } from '@/lib/auth/SimpleAuthProvider';

interface SimpleLoginScreenProps {
  showFamilyLogin?: boolean;
  showGuestLogin?: boolean;
  redirectUrl?: string;
}

/**
 * SimpleLoginScreen - Unified login component
 * 
 * This component provides a simple login experience with multiple options:
 * 1. Email/password login
 * 2. Family member selection
 * 3. Guest access
 * 4. Development mode
 */
export default function SimpleLoginScreen({
  showFamilyLogin = true,
  showGuestLogin = true,
  redirectUrl = '/'
}: SimpleLoginScreenProps) {
  const { 
    login, 
    loginWithMagicLink, 
    loginAsFamilyMember, 
    loginAsGuest, 
    users,
    isAuthenticated,
    isLoading,
    error,
    isDevelopment,
    enableDevMode
  } = useSimpleAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'magiclink' | 'family'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // If already authenticated, redirect or show nothing
  if (isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    return null;
  }
  
  // Filter out family members from users for display
  const familyMembers = users.filter(user => 
    ['parent', 'child', 'guest'].includes(user.role) && 
    user.id !== 'guest' && 
    user.id !== 'dev-user'
  );
  
  // Handle email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!email) {
      setLocalError('Email is required');
      return;
    }
    
    if (loginMethod === 'password' && !password) {
      setLocalError('Password is required');
      return;
    }
    
    try {
      if (loginMethod === 'magiclink') {
        const result = await loginWithMagicLink(email);
        if (result.success) {
          setMagicLinkSent(true);
        } else {
          setLocalError(result.error || 'Error sending magic link');
        }
      } else {
        const result = await login(email, password);
        if (!result.success) {
          setLocalError(result.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error during login');
    }
  };
  
  // Handle family login
  const handleFamilyLogin = (memberId: string) => {
    setLocalError(null);
    loginAsFamilyMember(memberId);
  };
  
  // Handle guest login
  const handleGuestLogin = () => {
    setLocalError(null);
    loginAsGuest();
  };
  
  // Handle dev mode login
  const handleDevLogin = () => {
    setLocalError(null);
    enableDevMode();
  };
  
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to DIY Formulations</h1>
        
        {/* Error message */}
        {(error || localError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || localError}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}
        
        {/* Login method tabs */}
        <div className="flex mb-6 border-b border-border-subtle">
          <button
            className={`flex-1 py-2 px-4 ${loginMethod === 'password' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}
            onClick={() => setLoginMethod('password')}
          >
            Password
          </button>
          <button
            className={`flex-1 py-2 px-4 ${loginMethod === 'magiclink' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}
            onClick={() => setLoginMethod('magiclink')}
          >
            Magic Link
          </button>
          {showFamilyLogin && familyMembers.length > 0 && (
            <button
              className={`flex-1 py-2 px-4 ${loginMethod === 'family' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}
              onClick={() => setLoginMethod('family')}
            >
              Family
            </button>
          )}
        </div>
        
        {/* Password login form */}
        {loginMethod === 'password' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-border-subtle rounded"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-border-subtle rounded"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-accent text-white rounded hover:bg-accent-hover"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        
        {/* Magic link login form */}
        {loginMethod === 'magiclink' && (
          <>
            {magicLinkSent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-lg font-medium mb-2">Check your email</h3>
                <p className="text-text-secondary mb-4">
                  We've sent a magic link to <strong>{email}</strong>. Click the link in the email to log in.
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-accent hover:underline"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="magic-email">
                    Email
                  </label>
                  <input
                    id="magic-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-border-subtle rounded"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-accent text-white rounded hover:bg-accent-hover"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
            )}
          </>
        )}
        
        {/* Family login */}
        {loginMethod === 'family' && (
          <div className="space-y-4">
            <p className="text-center text-text-secondary mb-2">
              Choose who's using the app today:
            </p>
            
            <div className="grid gap-3">
              {familyMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleFamilyLogin(member.id)}
                  className="flex items-center p-3 rounded-lg border-2 border-transparent hover:border-accent transition-colors"
                  style={{ backgroundColor: `${member.color}30` }}
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-0 mr-3">
                    <span className="text-2xl" aria-hidden="true">
                      {member.avatar || '👤'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold">{member.displayName}</div>
                    <div className="text-sm text-text-secondary capitalize">{member.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional options */}
        <div className="mt-6 pt-4 border-t border-border-subtle">
          {showGuestLogin && (
            <button
              onClick={handleGuestLogin}
              className="w-full py-2 px-4 mb-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              disabled={isLoading}
            >
              Continue as Guest
            </button>
          )}
          
          {isDevelopment && (
            <button
              onClick={handleDevLogin}
              className="w-full py-2 px-4 mb-3 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              disabled={isLoading}
            >
              Developer Mode
            </button>
          )}
          
          {loginMethod !== 'family' && showFamilyLogin && familyMembers.length > 0 && (
            <button
              onClick={() => setLoginMethod('family')}
              className="w-full py-2 px-4 bg-green-100 text-green-800 rounded hover:bg-green-200"
              disabled={isLoading}
            >
              Family Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}