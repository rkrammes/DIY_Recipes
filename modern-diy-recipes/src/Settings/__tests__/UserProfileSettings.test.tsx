/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfileSettings from '../components/UserProfileSettings';
import { UserPreferencesProvider } from '../providers/UserPreferencesProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { vi } from 'vitest';

// Mock the hooks and Supabase
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {
        role: 'authenticated'
      }
    },
    isAuthenticated: true,
    loading: false
  })
}));

vi.mock('../providers/UserPreferencesProvider', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useUserPreferencesContext: () => ({
      preferences: {
        theme: 'hackers',
        audio_enabled: false,
        volume: 0.7,
        default_view: 'formulations',
        display_name: 'Test User',
        avatar: '👤',
        color: '#00FEFC'
      },
      updatePreferences: vi.fn().mockResolvedValue({}),
      loading: false,
      error: null,
      supabaseAvailable: true,
      theme: 'hackers',
      audioEnabled: false,
      volume: 0.7,
      debugMode: false,
      setTheme: vi.fn(),
      setAudioEnabled: vi.fn(),
      setVolume: vi.fn(),
      toggleTheme: vi.fn()
    })
  };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null })
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/test-image.jpg' } })
      })
    }
  }
}));

// Mock component wrapper
const AllTheProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        {children}
      </UserPreferencesProvider>
    </AuthProvider>
  );
};

describe('UserProfileSettings', () => {
  it('renders the component correctly', () => {
    render(<UserProfileSettings />, { wrapper: AllTheProviders });
    
    // Check if main sections are rendered
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('Interface Preferences')).toBeInTheDocument();
    
    // Check if display name input exists
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    
    // Check if avatar section is present
    expect(screen.getByText('Avatar')).toBeInTheDocument();
    
    // Check if accent color section is present
    expect(screen.getByText('Accent Color')).toBeInTheDocument();
    
    // Check if default view selector is present
    expect(screen.getByLabelText('Default View')).toBeInTheDocument();
  });

  it('allows changing display name', () => {
    render(<UserProfileSettings />, { wrapper: AllTheProviders });
    
    const displayNameInput = screen.getByLabelText('Display Name');
    fireEvent.change(displayNameInput, { target: { value: 'New Name' } });
    
    expect(displayNameInput).toHaveValue('New Name');
  });

  it('changes between emoji and upload tabs', async () => {
    render(<UserProfileSettings />, { wrapper: AllTheProviders });
    
    // Initial tab should be emoji
    expect(screen.getByText('Emoji Avatar')).toBeInTheDocument();
    
    // Click on Upload Image tab
    fireEvent.click(screen.getByText('Upload Image'));
    
    // Should show upload interface
    await waitFor(() => {
      expect(screen.getByText('Upload a profile image (JPG, PNG, GIF)')).toBeInTheDocument();
    });
    
    // Go back to emoji tab
    fireEvent.click(screen.getByText('Emoji Avatar'));
    
    // Should show emoji grid
    await waitFor(() => {
      const emojiButtons = screen.getAllByRole('button');
      // There should be at least a few emoji buttons
      expect(emojiButtons.length).toBeGreaterThan(5);
    });
  });

  it('shows save success message after saving', async () => {
    render(<UserProfileSettings />, { wrapper: AllTheProviders });
    
    // Click save button
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Profile saved successfully!')).toBeInTheDocument();
    });
  });

  it('resets form values when reset button is clicked', () => {
    render(<UserProfileSettings />, { wrapper: AllTheProviders });
    
    // Change display name
    const displayNameInput = screen.getByLabelText('Display Name');
    fireEvent.change(displayNameInput, { target: { value: 'Changed Name' } });
    
    // Click reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Check if display name is reset
    expect(displayNameInput).not.toHaveValue('Changed Name');
  });
});