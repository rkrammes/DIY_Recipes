'use client';

import React, { useState } from 'react';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function DeveloperSettings() {
  const { preferences, updatePreferences } = useUserPreferencesContext();
  const { user } = useAuth();
  const [databaseStatus, setDatabaseStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  const handleDebugModeToggle = (checked: boolean) => {
    updatePreferences({ debug_mode: checked });
  };

  const handleExperimentalFeaturesToggle = (checked: boolean) => {
    updatePreferences({ show_experimental: checked });
  };

  const fetchDatabaseInfo = async () => {
    setDatabaseStatus('checking');
    setDatabaseError(null);
    
    try {
      // Get table counts
      const tables = ['recipes', 'ingredients', 'recipe_ingredients', 'iterations', 'user_preferences'];
      const counts: Record<string, number> = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count', { count: 'exact', head: true });
            
          if (error) {
            console.warn(`Error fetching ${table} count:`, error);
            counts[table] = -1; // Error indicator
          } else {
            counts[table] = data || 0;
          }
        } catch (err) {
          console.warn(`Error checking ${table}:`, err);
          counts[table] = -1;
        }
      }
      
      // Get Supabase connection info
      const connectionInfo = {
        url: supabase.supabaseUrl,
        version: 'v1',
        authenticated: !!user,
        userId: user?.id,
        tables: counts,
        timestamp: new Date().toISOString(),
      };
      
      setDatabaseInfo(connectionInfo);
      setDatabaseStatus('success');
    } catch (err) {
      console.error('Error fetching database info:', err);
      setDatabaseError(err instanceof Error ? err.message : 'Unknown error fetching database info');
      setDatabaseStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Developer Settings</h2>
        <p className="text-text-secondary">
          Advanced settings for development and debugging
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Options</CardTitle>
          <CardDescription>
            Enable developer tools and debugging features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="debug-mode-toggle" className="font-medium">
                Debug Mode
              </Label>
              <p className="text-sm text-text-secondary">
                Enable detailed logging and developer tools
              </p>
            </div>
            <Switch
              id="debug-mode-toggle"
              checked={preferences.debug_mode}
              onCheckedChange={handleDebugModeToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="experimental-features-toggle" className="font-medium">
                Experimental Features
              </Label>
              <p className="text-sm text-text-secondary">
                Enable in-development features and experiments
              </p>
            </div>
            <Switch
              id="experimental-features-toggle"
              checked={preferences.show_experimental}
              onCheckedChange={handleExperimentalFeaturesToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Diagnostics</CardTitle>
          <CardDescription>
            Tools for inspecting and testing database connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fetchDatabaseInfo}
            disabled={databaseStatus === 'checking'}
            variant="outline"
          >
            {databaseStatus === 'checking' ? 'Checking...' : 'Check Database Connection'}
          </Button>
          
          {databaseStatus === 'success' && databaseInfo && (
            <div className="mt-4 space-y-2">
              <Alert>
                <AlertTitle>Database Connection Successful</AlertTitle>
                <AlertDescription>
                  Connected to Supabase at {databaseInfo.url}
                </AlertDescription>
              </Alert>
              
              <div className="bg-surface-1 p-4 rounded-md font-mono text-xs overflow-auto mt-2">
                <pre>{JSON.stringify(databaseInfo, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {databaseStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>Database Connection Error</AlertTitle>
              <AlertDescription>
                {databaseError || 'Failed to connect to database'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="text-xs text-text-secondary">
          <p>
            These tools are intended for development and debugging purposes only.
            Database credentials are never exposed to the client.
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>
            Details about the current environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Environment:</span>
              <span>{process.env.NODE_ENV || 'development'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Build Mode:</span>
              <span>{process.env.NEXT_PUBLIC_VERCEL_ENV || 'local'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Client Time:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">User Agent:</span>
              <span className="truncate max-w-[200px]">
                {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 30) + '...' : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}