'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, LogOut } from 'lucide-react';

export default function AuthSettings() {
  const { user, isAuthenticated, signOut, signInWithMagicLink, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        setAuthError(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to send magic link');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
      setAuthError(err instanceof Error ? err.message : 'Failed to log out');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
        <p className="text-text-secondary">
          Manage your login details and security settings
        </p>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      {magicLinkSent && (
        <Alert className="bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Magic link sent!</AlertTitle>
          <AlertDescription>
            Check your email for a link to sign in. You can close this page once you click the link.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            {isAuthenticated 
              ? 'You are currently logged in' 
              : 'Sign in to save your settings across devices'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xl">{user?.user_metadata?.avatar || '👤'}</span>
                </div>
                <div>
                  <div className="font-medium">{user?.email}</div>
                  <div className="text-sm text-text-secondary">
                    {user?.user_metadata?.name || 'User'}
                    {user?.app_metadata?.role && (
                      <span className="ml-2 text-xs uppercase bg-accent/20 px-2 py-0.5 rounded">
                        {user.app_metadata.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout} className="mt-4">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading || magicLinkSent}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || magicLinkSent}
                className="w-full"
              >
                {loading ? 'Sending...' : magicLinkSent ? 'Link Sent' : 'Send Magic Link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-sm text-text-secondary">
          <p>
            Magic links are sent to your email and provide secure, passwordless access.
          </p>
        </CardFooter>
      </Card>

      {isAuthenticated && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
              <CardDescription>Recent account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">Last Sign In</div>
                    <div className="text-sm text-text-secondary">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex items-center h-fit dark:bg-green-900/30 dark:text-green-400">
                    Current Session
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>Manage linked accounts and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Supabase Integration</div>
                    <div className="text-sm text-text-secondary">
                      Database and authentication service
                    </div>
                  </div>
                  <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-400">
                    Connected
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}