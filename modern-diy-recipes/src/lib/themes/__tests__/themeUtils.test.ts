import { 
  AVAILABLE_THEMES,
  DARK_THEMES,
  THEME_COLORS,
  LEGACY_THEME_MAP,
  isValidTheme,
  getNormalizedTheme,
  getSystemPreferredTheme,
  isDarkTheme,
  getThemeColors,
  getNextTheme
} from '../themeUtils';

describe('Theme Utils', () => {
  describe('AVAILABLE_THEMES', () => {
    it('should contain the expected themes', () => {
      expect(AVAILABLE_THEMES).toContain('hackers');
      expect(AVAILABLE_THEMES).toContain('dystopia');
      expect(AVAILABLE_THEMES).toContain('neotopia');
    });
  });
  
  describe('DARK_THEMES', () => {
    it('should contain the expected dark themes', () => {
      expect(DARK_THEMES).toContain('hackers');
      expect(DARK_THEMES).toContain('dystopia');
      expect(DARK_THEMES).not.toContain('neotopia');
    });
  });
  
  describe('THEME_COLORS', () => {
    it('should define colors for each theme', () => {
      expect(THEME_COLORS.hackers).toBeDefined();
      expect(THEME_COLORS.dystopia).toBeDefined();
      expect(THEME_COLORS.neotopia).toBeDefined();
    });
    
    it('should have all required color properties', () => {
      const requiredColors = ['background', 'text', 'accent', 'surface', 'border'];
      
      for (const theme of AVAILABLE_THEMES) {
        for (const color of requiredColors) {
          expect(THEME_COLORS[theme][color]).toBeDefined();
        }
      }
    });
  });
  
  describe('LEGACY_THEME_MAP', () => {
    it('should map legacy themes to correct new themes', () => {
      expect(LEGACY_THEME_MAP.hackers).toBe('hackers');
      expect(LEGACY_THEME_MAP.terminal).toBe('hackers');
      expect(LEGACY_THEME_MAP.dark).toBe('dystopia');
      expect(LEGACY_THEME_MAP.light).toBe('neotopia');
      expect(LEGACY_THEME_MAP.default).toBe('hackers');
    });
  });
  
  describe('isValidTheme', () => {
    it('should return true for valid themes', () => {
      expect(isValidTheme('hackers')).toBe(true);
      expect(isValidTheme('dystopia')).toBe(true);
      expect(isValidTheme('neotopia')).toBe(true);
    });
    
    it('should return false for invalid themes', () => {
      expect(isValidTheme('invalid')).toBe(false);
      expect(isValidTheme('hacker')).toBe(false); // missing 's'
    });
  });
  
  describe('getNormalizedTheme', () => {
    it('should return the theme if it is valid', () => {
      expect(getNormalizedTheme('hackers')).toBe('hackers');
      expect(getNormalizedTheme('dystopia')).toBe('dystopia');
      expect(getNormalizedTheme('neotopia')).toBe('neotopia');
    });
    
    it('should normalize legacy theme names', () => {
      expect(getNormalizedTheme('terminal')).toBe('hackers');
      expect(getNormalizedTheme('dark')).toBe('dystopia');
      expect(getNormalizedTheme('light')).toBe('neotopia');
    });
    
    it('should return default theme for invalid themes', () => {
      expect(getNormalizedTheme('invalid')).toBe('hackers');
    });
    
    it('should return default theme for null or undefined', () => {
      expect(getNormalizedTheme(null)).toBe('hackers');
      expect(getNormalizedTheme(undefined)).toBe('hackers');
    });
  });
  
  describe('getSystemPreferredTheme', () => {
    // Mock matchMedia for testing
    const originalMatchMedia = window.matchMedia;
    
    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });
    
    it('should return dystopia for dark mode preference', () => {
      window.matchMedia = jest.fn().mockImplementation(query => {
        return {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
        };
      });
      
      expect(getSystemPreferredTheme()).toBe('dystopia');
    });
    
    it('should return neotopia for light mode preference', () => {
      window.matchMedia = jest.fn().mockImplementation(query => {
        return {
          matches: query !== '(prefers-color-scheme: dark)',
          media: query,
        };
      });
      
      expect(getSystemPreferredTheme()).toBe('neotopia');
    });
    
    it('should return hackers if matchMedia is not available', () => {
      // @ts-ignore - Intentionally removing matchMedia for testing
      delete window.matchMedia;
      
      expect(getSystemPreferredTheme()).toBe('hackers');
    });
  });
  
  describe('isDarkTheme', () => {
    it('should return true for dark themes', () => {
      expect(isDarkTheme('hackers')).toBe(true);
      expect(isDarkTheme('dystopia')).toBe(true);
    });
    
    it('should return false for light themes', () => {
      expect(isDarkTheme('neotopia')).toBe(false);
    });
  });
  
  describe('getThemeColors', () => {
    it('should return colors for a valid theme', () => {
      const hackersColors = getThemeColors('hackers');
      expect(hackersColors.background).toBe('#121212');
      expect(hackersColors.text).toBe('#33ff33');
      
      const dystopiaColors = getThemeColors('dystopia');
      expect(dystopiaColors.background).toBe('#0a0a0f');
      
      const neotopiaColors = getThemeColors('neotopia');
      expect(neotopiaColors.background).toBe('#ffffff');
    });
    
    it('should return fallback colors for invalid theme', () => {
      // @ts-ignore - Intentionally passing invalid theme for testing
      const colors = getThemeColors('invalid');
      expect(colors).toEqual(THEME_COLORS.hackers);
    });
  });
  
  describe('getNextTheme', () => {
    it('should cycle to the next theme', () => {
      const firstIndex = AVAILABLE_THEMES.indexOf('hackers');
      const secondIndex = (firstIndex + 1) % AVAILABLE_THEMES.length;
      const thirdIndex = (secondIndex + 1) % AVAILABLE_THEMES.length;
      
      const secondTheme = AVAILABLE_THEMES[secondIndex];
      const thirdTheme = AVAILABLE_THEMES[thirdIndex];
      const firstTheme = AVAILABLE_THEMES[firstIndex];
      
      expect(getNextTheme('hackers')).toBe(secondTheme);
      expect(getNextTheme(secondTheme)).toBe(thirdTheme);
      expect(getNextTheme(thirdTheme)).toBe(firstTheme);
    });
    
    it('should return the first theme for invalid theme', () => {
      // @ts-ignore - Intentionally passing invalid theme for testing
      expect(getNextTheme('invalid')).toBe(AVAILABLE_THEMES[0]);
    });
  });
});