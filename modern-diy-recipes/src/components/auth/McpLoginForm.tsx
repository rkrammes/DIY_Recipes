'use client';

import { useState } from 'react';
import { useMcpAuth } from '@/hooks/useMcpAuth';

export default function McpLoginForm() {
  const { signIn, error, isLoading, useDevelopmentUser } = useMcpAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-surface-1 rounded-lg shadow-md border border-border-subtle">
      <h2 className="text-2xl font-bold mb-6 text-center text-text">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1 text-text-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border-subtle rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-1 text-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary-500 text-white rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      {isDevelopment && (
        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border-subtle flex-grow"></div>
            <span className="mx-4 text-sm text-text-secondary">Development Mode</span>
            <div className="border-t border-border-subtle flex-grow"></div>
          </div>
          
          <button
            onClick={useDevelopmentUser}
            className="mt-4 w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Use Development Account
          </button>
        </div>
      )}
    </div>
  );
}