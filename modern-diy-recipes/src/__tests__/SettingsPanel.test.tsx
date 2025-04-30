import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from '../components/SettingsPanel';
import '@testing-library/jest-dom';
import { useSettings } from '../../providers/SettingsProvider'; // Corrected import path

// Mock the useSettings hook with more control
jest.mock('../../providers/SettingsProvider'); // Corrected mock path

const mockUseSettings = useSettings as jest.Mock;

describe('SettingsPanel', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseSettings.mockReset();
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

    // Check for theme setting (assuming a select or radio group)
    // This might need adjustment based on the actual implementation of the theme setting
    expect(screen.getByLabelText('Theme')).toHaveValue('dark');

    // Check for notifications setting (assuming a checkbox)
    expect(screen.getByLabelText('Enable Notifications')).not.toBeChecked();
  });

  it('calls updateSettings when theme setting is changed', () => {
    const mockUpdateSettings = jest.fn();
    mockUseSettings.mockReturnValue({
      settings: { theme: 'light', notifications: true },
      updateSettings: mockUpdateSettings,
    });
    render(<SettingsPanel />);

    // Assuming theme is controlled by a select element
    const themeSelect = screen.getByLabelText('Theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'dark', notifications: true });
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

  // Add tests for other settings if they exist
});