/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn()
      })
    })
  }
}));

// Mock Auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 'test-user-id' },
    isAuthenticated: true
  })
}));

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useUserPreferences hook', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should return default preferences initially', () => {
    // Mock successful empty response from Supabase
    (supabase.single as jest.Mock).mockResolvedValueOnce({ data: null, error: null });
    
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences).toEqual({
      theme: 'hackers',
      audio_enabled: false,
      volume: 0.7,
      default_view: 'formulations',
      debug_mode: false,
      show_experimental: false
    });
  });

  it('should fetch preferences from Supabase when user is authenticated', async () => {
    // Mock successful response from Supabase
    const mockPreferences = {
      theme: 'dystopia',
      audio_enabled: true,
      volume: 0.5,
      default_view: 'ingredients',
      debug_mode: true,
      show_experimental: false
    };
    
    (supabase.single as jest.Mock).mockResolvedValueOnce({ 
      data: mockPreferences, 
      error: null 
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    
    // Wait for the hook to complete its async operations
    await waitForNextUpdate();
    
    expect(result.current.preferences).toEqual(mockPreferences);
  });

  it('should update preferences in Supabase when user is authenticated', async () => {
    // Mock initial fetch
    (supabase.single as jest.Mock).mockResolvedValueOnce({ 
      data: { theme: 'hackers' }, 
      error: null 
    });
    
    // Mock check if preference record exists
    (supabase.maybeSingle as jest.Mock).mockResolvedValueOnce({
      data: { id: 'pref-id' },
      error: null
    });
    
    // Mock update
    (supabase.eq as jest.Mock).mockResolvedValueOnce({
      error: null
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    
    // Wait for initial fetch
    await waitForNextUpdate();
    
    // Update preferences
    await act(async () => {
      await result.current.updatePreferences({ theme: 'dystopia' });
    });
    
    expect(result.current.preferences.theme).toBe('dystopia');
    expect(localStorageMock.getItem('theme')).toBe('dystopia');
  });

  it('should fall back to localStorage when Supabase fetch fails', async () => {
    // Set initial local storage values
    localStorageMock.setItem('theme', 'neotopia');
    localStorageMock.setItem('audioEnabled', 'true');
    
    // Mock failed Supabase response
    (supabase.single as jest.Mock).mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Database error' } 
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    
    // Wait for the hook to complete its async operations
    await waitForNextUpdate();
    
    // Should fall back to localStorage values
    expect(result.current.preferences.theme).toBe('neotopia');
    expect(result.current.preferences.audio_enabled).toBe(true);
  });
});