import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedThemeProvider from '../UnifiedThemeProvider';
import { useTheme } from '../themeContext';

// Mock localStorage
const mockLocalStorage = (function() {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock document.documentElement
const mockSetAttribute = jest.fn();
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: mockSetAttribute,
    getAttribute: jest.fn(),
    style: {},
  },
  writable: true,
});

// Create a test component that uses the theme context
function TestComponent() {
  const { theme, setTheme, toggleTheme, audioEnabled, setAudioEnabled } = useTheme();
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="audio">{audioEnabled ? 'on' : 'off'}</div>
      <button data-testid="set-theme" onClick={() => setTheme('dystopia')}>Set Theme</button>
      <button data-testid="toggle-theme" onClick={toggleTheme}>Toggle Theme</button>
      <button data-testid="toggle-audio" onClick={() => setAudioEnabled(!audioEnabled)}>Toggle Audio</button>
    </div>
  );
}

describe('UnifiedThemeProvider', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should provide default theme values', async () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );
    
    // Wait for component to initialize
    await screen.findByTestId('theme');
    
    // Check that default theme is provided
    expect(screen.getByTestId('theme')).toHaveTextContent('hackers');
    expect(screen.getByTestId('audio')).toHaveTextContent('off');
  });
  
  it('should load theme from localStorage', async () => {
    // Set theme in localStorage
    mockLocalStorage.setItem('theme', 'dystopia');
    mockLocalStorage.setItem('audioEnabled', 'true');
    
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );
    
    // Wait for component to initialize
    await screen.findByTestId('theme');
    
    // Check that theme was loaded from localStorage
    expect(screen.getByTestId('theme')).toHaveTextContent('dystopia');
    expect(screen.getByTestId('audio')).toHaveTextContent('on');
  });
  
  it('should set theme correctly', async () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );
    
    // Wait for component to initialize
    await screen.findByTestId('theme');
    
    // Set theme to dystopia
    fireEvent.click(screen.getByTestId('set-theme'));
    
    // Check that theme was changed
    expect(screen.getByTestId('theme')).toHaveTextContent('dystopia');
    
    // Check that theme was applied to document
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dystopia');
    
    // Check that theme was saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dystopia');
  });
  
  it('should toggle theme correctly', async () => {
    // Set initial theme
    mockLocalStorage.setItem('theme', 'hackers');
    
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );
    
    // Wait for component to initialize
    await screen.findByTestId('theme');
    
    // Toggle theme
    fireEvent.click(screen.getByTestId('toggle-theme'));
    
    // Check that theme was toggled (hackers -> dystopia is the expected sequence)
    expect(screen.getByTestId('theme')).toHaveTextContent('dystopia');
    
    // Check that theme was applied to document
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dystopia');
    
    // Check that theme was saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dystopia');
  });
  
  it('should toggle audio correctly', async () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );
    
    // Wait for component to initialize
    await screen.findByTestId('audio');
    
    // Check initial state (should be off by default)
    expect(screen.getByTestId('audio')).toHaveTextContent('off');
    
    // Toggle audio
    fireEvent.click(screen.getByTestId('toggle-audio'));
    
    // Check that audio was toggled
    expect(screen.getByTestId('audio')).toHaveTextContent('on');
    
    // Check that audio setting was saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('audioEnabled', 'true');
  });
  
  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw an error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // This should not throw an error
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );
    
    // Wait for component to initialize
    await screen.findByTestId('theme');
    
    // Should use default theme when localStorage fails
    expect(screen.getByTestId('theme')).toHaveTextContent('hackers');
  });
});