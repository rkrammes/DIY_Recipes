'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferencesContext } from '../providers/UserPreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [color, setColor] = useState(preferences.color || '#00FEFC');
  const [defaultView, setDefaultView] = useState(preferences.default_view || 'formulations');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarTab, setAvatarTab] = useState<'emoji' | 'upload'>(
    preferences.avatar?.startsWith('http') ? 'upload' : 'emoji'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when preferences or user changes
  useEffect(() => {
    if (preferences) {
      setDisplayName(preferences.display_name || user?.email?.split('@')[0] || 'User');

      if (preferences.avatar) {
        if (preferences.avatar.startsWith('http')) {
          setProfileImage(preferences.avatar);
          setAvatarTab('upload');
        } else {
          setAvatar(preferences.avatar);
          setAvatarTab('emoji');
        }
      } else {
        setAvatar('👤');
      }

      setColor(preferences.color || '#00FEFC');
      setDefaultView(preferences.default_view || 'formulations');
    }
  }, [preferences, user]);

  // Handle file selection for profile image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 2MB');
      return;
    }

    // Show file preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload profile image to Supabase Storage
  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!user || !isAuthenticated) return null;

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      setUploadProgress(0);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (event) => {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      // Process image upload if there's a file in the input
      let avatarValue = avatarTab === 'emoji' ? avatar : profileImage;

      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0];
        try {
          // Upload the image and get the public URL
          const imageUrl = await uploadProfileImage(file);
          if (imageUrl) {
            avatarValue = imageUrl;
          }
        } catch (error) {
          console.error('Error uploading profile image:', error);
          throw new Error('Failed to upload profile image. Please try again.');
        }
      }

      // Update preferences with new values
      await updatePreferences({
        display_name: displayName,
        avatar: avatarValue,
        color,
        default_view: defaultView,
      });

      // If user is authenticated, also update user metadata
      if (isAuthenticated && user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: displayName,
            avatar: avatarValue,
            color,
          }
        });

        if (error) throw error;
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadProgress(0);
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
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl overflow-hidden"
              style={{ backgroundColor: `${color}30` }}
            >
              {avatarTab === 'emoji' ? (
                avatar
              ) : profileImage ? (
                <img
                  src={profileImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                '👤'
              )}
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
              <Tabs value={avatarTab} onValueChange={(value) => setAvatarTab(value as 'emoji' | 'upload')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="emoji">Emoji Avatar</TabsTrigger>
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                </TabsList>

                <TabsContent value="emoji">
                  <div className="grid grid-cols-7 gap-2">
                    {AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setAvatar(emoji);
                          setProfileImage(null);
                        }}
                        className={`w-10 h-10 flex items-center justify-center text-lg rounded
                          ${avatar === emoji && avatarTab === 'emoji'
                            ? `ring-2 ring-accent ring-offset-2 bg-${color}10`
                            : 'hover:bg-surface-2'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    {profileImage ? (
                      <div className="space-y-4">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
                          <img
                            src={profileImage}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProfileImage(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl mb-2 text-text-secondary">🖼️</div>
                        <p className="text-sm text-text-secondary mb-4">
                          Upload a profile image (JPG, PNG, GIF)
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Select Image
                        </Button>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <div className="text-xs text-text-secondary mt-1 text-center">
                        Uploading: {uploadProgress}%
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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