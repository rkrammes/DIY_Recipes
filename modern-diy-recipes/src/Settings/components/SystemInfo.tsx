'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { useAuth } from '@/hooks/useAuth';
import { useEnvironment } from '@/hooks/useEnvironment';

export default function SystemInfo() {
  const { preferences, loading, error, supabaseAvailable } = useUserPreferencesContext();
  const { isAuthenticated, user } = useAuth();
  const env = useEnvironment();
  const [uptime, setUptime] = useState(0);
  const [memory, setMemory] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  // Simulate system metrics
  useEffect(() => {
    // Initial values
    setMemory(Math.floor(Math.random() * 20) + 70); // 70-90%
    setCpu(Math.floor(Math.random() * 15) + 5); // 5-20%
    setLastSync(new Date().toISOString());
    
    // Simulate uptime counter
    const startTime = Date.now();
    const uptimeInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setUptime(elapsedSeconds);
    }, 1000);
    
    // Simulate changing metrics
    const metricsInterval = setInterval(() => {
      setMemory(Math.floor(Math.random() * 20) + 70); // 70-90%
      setCpu(Math.floor(Math.random() * 15) + 5); // 5-20%
    }, 5000);
    
    return () => {
      clearInterval(uptimeInterval);
      clearInterval(metricsInterval);
    };
  }, []);
  
  // Format uptime as hh:mm:ss
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">System Information</h2>
        <p className="text-text-secondary">
          View system status and diagnostic information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current application status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-text-secondary">{memory}%</span>
                </div>
                <Progress value={memory} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-text-secondary">{cpu}%</span>
                </div>
                <Progress value={cpu} className="h-2" />
              </div>
              
              <div className="pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-mono">{formatUptime(uptime)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Last Sync</span>
                  <span className="text-sm">{formatDate(lastSync)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Theme</span>
                  <span className="text-sm">
                    {preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Status</CardTitle>
            <CardDescription>Account and authentication information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="font-medium">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">User ID</span>
                    <span className="text-sm font-mono">{user.id.substring(0, 8)}...</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Email</span>
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {user.app_metadata?.role && (
                    <div className="flex justify-between">
                      <span className="text-sm">Role</span>
                      <span className="text-sm uppercase">{user.app_metadata.role}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm">Preferences</span>
                    <span className="text-sm">{supabaseAvailable ? "Synchronized" : "Local Only"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary mb-2">
                    Sign in to synchronize your settings across devices
                  </p>
                </div>
              )}

              {/* Always show Supabase status - regardless of authentication */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Supabase</span>
                  <span className="text-sm flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${supabaseAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {supabaseAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                {!supabaseAvailable && error && (
                  <div className="mt-2 text-xs text-red-500 border border-red-300 bg-red-50 dark:bg-red-950 p-2 rounded">
                    {error.message}
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm">Environment</span>
                  <span className="text-sm flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${env.isValid ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    {env.isValid ? "Valid" : "Warning"}
                  </span>
                </div>

                {!env.isValid && (
                  <div className="mt-2 text-xs text-amber-500 border border-amber-300 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                    Environment configuration has warnings. Check system logs for details.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
          <CardDescription>Details about the current environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Software</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span>1.0.2</span>
                </div>
                <div className="flex justify-between">
                  <span>Build</span>
                  <span>{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>React</span>
                  <span>18.x</span>
                </div>
                <div className="flex justify-between">
                  <span>Next.js</span>
                  <span>13.x</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Environment</span>
                  <span>{env.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>UI Mode</span>
                  <span className="capitalize">{env.uiMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Theme</span>
                  <span className="capitalize">{env.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio</span>
                  <span>{preferences.audio_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {env.isDevelopment && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-2">Feature Flags</h4>
              <p className="text-sm text-text-secondary mb-2">
                Current feature flag status (development mode only)
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {env.enabledFeatures.map(feature => (
                  <div key={feature} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    <span>{feature}</span>
                  </div>
                ))}
                {env.disabledFeatures.slice(0, 4).map(feature => (
                  <div key={feature} className="flex items-center text-text-secondary">
                    <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-2">Support</h4>
            <p className="text-sm text-text-secondary mb-2">
              If you need assistance, please contact support or visit our documentation.
            </p>
            <div className="flex space-x-2">
              <a
                href="/docs"
                className="text-sm underline text-accent hover:text-accent-hover"
              >
                Documentation
              </a>
              <span className="text-text-secondary">•</span>
              <a
                href="/support"
                className="text-sm underline text-accent hover:text-accent-hover"
              >
                Support
              </a>
              <span className="text-text-secondary">•</span>
              <a
                href="/feedback"
                className="text-sm underline text-accent hover:text-accent-hover"
              >
                Feedback
              </a>
              {env.isDevelopment && (
                <>
                  <span className="text-text-secondary">•</span>
                  <a
                    href="/environment-status"
                    className="text-sm underline text-accent hover:text-accent-hover"
                  >
                    Environment Status
                  </a>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}