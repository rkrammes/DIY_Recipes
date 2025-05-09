'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

// Avatar options
const AVATARS = ['👤', '👨‍💻', '👩‍💻', '🧙', '🦸', '🦹', '🕵️', '🧑‍🔬', '👨‍🚀', '👩‍🚀', '🤖', '👾', '👽'];

// Accent color options
const COLORS = [
  { name: 'Cyan', value: '#00FEFC' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Blue', value: '#0066FF' },
  { name: 'Purple', value: '#A020F0' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Orange', value: '#FF8C00' },
  { name: 'Yellow', value: '#FFFF00' },
];

// Default view options
const DEFAULT_VIEWS = [
  { id: 'formulations', name: 'Formulations' },
  { id: 'ingredients', name: 'Ingredients' },
  { id: 'tools', name: 'Tools' },
  { id: 'library', name: 'Library' },
];

export default function UserProfileSettings() {
  const { user, isAuthenticated } = useAuth();
  const { preferences, updatePreferences, loading } = useUserPreferencesContext();
  
  const [displayName, setDisplayName] = useState(preferences.display_name || user?.email?.split('@')[0] || 'User');
  const [avatar, setAvatar] = useState(preferences.avatar || '👤');
  const [color, setColor] = useState(preferences.color || '#00FEFC');
  const [defaultView, setDefaultView] = useState(preferences.default_view || 'formulations');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update form when preferences or user changes
  useEffect(() => {
    if (preferences) {
      setDisplayName(preferences.display_name || user?.email?.split('@')[0] || 'User');
      setAvatar(preferences.avatar || '👤');
      setColor(preferences.color || '#00FEFC');
      setDefaultView(preferences.default_view || 'formulations');
    }
  }, [preferences, user]);

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    setErrorMessage(null);
    
    try {
      await updatePreferences({
        display_name: displayName,
        avatar,
        color,
        default_view: defaultView,
      });
      
      // If user is authenticated, also update user metadata
      if (isAuthenticated && user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: displayName,
            avatar,
            color,
          }
        });
        
        if (error) throw error;
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">User Profile</h2>
        <p className="text-text-secondary">
          Customize your profile and preferences
        </p>
      </div>

      {saveStatus === 'error' && errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'success' && (
        <Alert>
          <AlertDescription>Profile saved successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Customize how you appear in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${color}30` }}
            >
              {avatar}
            </div>
            <div className="flex-1">
              <div className="font-medium text-lg">{displayName}</div>
              {user?.email && (
                <div className="text-sm text-text-secondary">{user.email}</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div className="space-y-1">
              <Label>Avatar</Label>
              <div className="grid grid-cols-7 gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 flex items-center justify-center text-lg rounded
                      ${avatar === emoji 
                        ? `ring-2 ring-accent ring-offset-2 bg-${color}10` 
                        : 'hover:bg-surface-2'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`w-10 h-10 rounded-full
                      ${color === colorOption.value ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interface Preferences</CardTitle>
          <CardDescription>
            Set your default view and other preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="default-view">Default View</Label>
            <Select 
              value={defaultView} 
              onValueChange={setDefaultView}
            >
              <SelectTrigger id="default-view">
                <SelectValue placeholder="Select default view" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_VIEWS.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-text-secondary mt-1">
              Choose which section loads by default when you open the application
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            setDisplayName(user?.email?.split('@')[0] || 'User');
            setAvatar('👤');
            setColor('#00FEFC');
            setDefaultView('formulations');
          }}>
            Reset
          </Button>
          <Button 
            onClick={handleSaveProfile}
            disabled={loading || saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}