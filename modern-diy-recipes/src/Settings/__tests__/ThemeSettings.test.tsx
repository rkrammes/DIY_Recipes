/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeSettings from '../components/ThemeSettings';
import { UserPreferencesProvider } from '../providers/UserPreferencesProvider';
import { vi } from 'vitest';

// Mock the settings context
vi.mock('../providers/UserPreferencesProvider', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useUserPreferencesContext: () => ({
      theme: 'hackers',
      setTheme: vi.fn(),
      preferences: {
        theme: 'hackers'
      }
    })
  };
});

describe('ThemeSettings', () => {
  it('renders the component correctly', () => {
    render(<ThemeSettings />);
    
    // Check if main heading is present
    expect(screen.getByText('Visual Theme')).toBeInTheDocument();
    
    // Check if all theme options are present
    expect(screen.getByText('Hackers Terminal')).toBeInTheDocument();
    expect(screen.getByText('Dystopian Noir')).toBeInTheDocument();
    expect(screen.getByText('Neotopia Light')).toBeInTheDocument();
    
    // Check if advanced options section is present
    expect(screen.getByText('Advanced Theme Options')).toBeInTheDocument();
  });
  
  it('displays correct details for the selected theme', () => {
    render(<ThemeSettings />);
    
    // Default theme is 'hackers', so should show its characteristics
    expect(screen.getByText('Electric blue and cyan color palette')).toBeInTheDocument();
    expect(screen.getByText('Scan line effects for authentic CRT look')).toBeInTheDocument();
    expect(screen.getByText('Digital noise patterns and subtle phosphor glow')).toBeInTheDocument();
  });
  
  it('has the hackers theme selected by default', () => {
    const { container } = render(<ThemeSettings />);
    
    // Find the hackers theme radio item
    const hackersRadio = container.querySelector('input[value="hackers"]');
    expect(hackersRadio).toBeChecked();
  });
  
  it('calls setTheme when a different theme is selected', () => {
    const mockSetTheme = vi.fn();
    vi.mocked(useUserPreferencesContext).mockReturnValue({
      theme: 'hackers',
      setTheme: mockSetTheme,
      preferences: {
        theme: 'hackers'
      }
    });
    
    render(<ThemeSettings />);
    
    // Find the Dystopia theme option and click it
    const dystopiaOption = screen.getByText('Dystopian Noir').closest('label');
    fireEvent.click(dystopiaOption);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dystopia');
  });
  
  it('changes the displayed features when theme selection changes', async () => {
    // Start with hackers theme
    let mockSetTheme = vi.fn();
    vi.mocked(useUserPreferencesContext).mockReturnValue({
      theme: 'hackers',
      setTheme: mockSetTheme,
      preferences: {
        theme: 'hackers'
      }
    });
    
    const { rerender } = render(<ThemeSettings />);
    
    // Check hackers features
    expect(screen.getByText('Electric blue and cyan color palette')).toBeInTheDocument();
    
    // Now simulate changing to dystopia theme
    vi.mocked(useUserPreferencesContext).mockReturnValue({
      theme: 'dystopia',
      setTheme: mockSetTheme,
      preferences: {
        theme: 'dystopia'
      }
    });
    
    rerender(<ThemeSettings />);
    
    // Check dystopia features
    await waitFor(() => {
      expect(screen.getByText('Matrix-inspired code green palette')).toBeInTheDocument();
    });
  });
});