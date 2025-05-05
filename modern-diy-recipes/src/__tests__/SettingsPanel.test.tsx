import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from '../components/SettingsPanel';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../providers/ConsolidatedThemeProvider'; // Import consolidated ThemeProvider
import { useSettings } from '@providers/SettingsProvider'; // Keep useSettings mock for other tests

// Mock the useSettings hook for tests not related to theme switching
jest.mock('@providers/SettingsProvider');
const mockUseSettings = useSettings as jest.Mock;

// Mock localStorage for theme tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SettingsPanel - Other Settings', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseSettings.mockReset();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('renders without crashing', () => {
    mockUseSettings.mockReturnValue({
      settings: { theme: 'light', notifications: true },
      updateSettings: jest.fn(),
    });
    render(<SettingsPanel />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays the current settings', () => {
    mockUseSettings.mockReturnValue({
      settings: { theme: 'dark', notifications: false },
      updateSettings: jest.fn(),
    });
    render(<SettingsPanel />);

    // Check for notifications setting (assuming a checkbox)
    expect(screen.getByLabelText('Enable Notifications')).not.toBeChecked();
  });

  it('calls updateSettings when notifications setting is toggled', () => {
    const mockUpdateSettings = jest.fn();
    mockUseSettings.mockReturnValue({
      settings: { theme: 'light', notifications: true },
      updateSettings: mockUpdateSettings,
    });
    render(<SettingsPanel />);

    // Assuming notifications is controlled by a checkbox
    const notificationsCheckbox = screen.getByLabelText('Enable Notifications');
    fireEvent.click(notificationsCheckbox);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'light', notifications: false });
  });
});

describe('SettingsPanel - Theme Switching', () => {
  beforeEach(() => {
    // Clear localStorage mock before each theme test
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    // Ensure a default theme is set in localStorage for these tests
    localStorageMock.getItem.mockReturnValue('synthwave-noir');
    // Mock useSettings for theme tests, providing a dummy updateSettings
    mockUseSettings.mockReturnValue({
      settings: { theme: 'synthwave-noir', notifications: true },
      updateSettings: jest.fn(),
    });
    // Reset the data-theme attribute before each test
    document.documentElement.setAttribute('data-theme', '');
  });

  it('updates data-theme attribute and localStorage when theme is toggled', () => {
    render(
      <ThemeProvider>
        <SettingsPanel />
      </ThemeProvider>
    );

    const themeToggleButton = screen.getByRole('button', { name: /Switch to/i });

    // Initial theme check (should be set by ThemeProvider useEffect)
    expect(document.documentElement).toHaveAttribute('data-theme', 'synthwave-noir');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'synthwave-noir');

    // Toggle to terminal-mono
    fireEvent.click(themeToggleButton);
    expect(document.documentElement).toHaveAttribute('data-theme', 'terminal-mono');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'terminal-mono');
    expect(themeToggleButton).toHaveTextContent('Switch to Paper Ledger');

    // Toggle to paper-ledger
    fireEvent.click(themeToggleButton);
    expect(document.documentElement).toHaveAttribute('data-theme', 'paper-ledger');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'paper-ledger');
    expect(themeToggleButton).toHaveTextContent('Switch to Synthwave Noir');

    // Toggle back to synthwave-noir
    fireEvent.click(themeToggleButton);
    expect(document.documentElement).toHaveAttribute('data-theme', 'synthwave-noir');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'synthwave-noir');
    expect(themeToggleButton).toHaveTextContent('Switch to Terminal Mono');
  });

  it('initializes theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('terminal-mono'); // Simulate stored theme

    render(
      <ThemeProvider>
        <SettingsPanel />
      </ThemeProvider>
    );

    // ThemeProvider useEffect should set the initial theme from localStorage
    expect(document.documentElement).toHaveAttribute('data-theme', 'terminal-mono');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    const themeToggleButton = screen.getByRole('button', { name: /Switch to/i });
    expect(themeToggleButton).toHaveTextContent('Switch to Paper Ledger');
  });
});