
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { settingsService } from '../services/settingsService';

interface ThemeContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  colors: any;
  textSizes: any;
}

const lightColors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  accent: '#FFD700',
  background: '#F5F5DC',
  backgroundAlt: '#FFFFFF',
  text: '#3E2723',
  textSecondary: '#5D4037',
  grey: '#9E9E9E',
  card: '#FFFFFF',
  shadow: '#000000',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  border: '#E0E0E0',
};

const darkColors = {
  primary: '#4CAF50',
  secondary: '#66BB6A',
  accent: '#FFD700',
  background: '#121212',
  backgroundAlt: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  grey: '#757575',
  card: '#2C2C2C',
  shadow: '#000000',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  border: '#404040',
};

const textSizeMap = {
  'small': {
    title: 18,
    subtitle: 14,
    body: 12,
    arabic: 16,
    caption: 10,
  },
  'medium': {
    title: 20,
    subtitle: 16,
    body: 14,
    arabic: 18,
    caption: 12,
  },
  'large': {
    title: 24,
    subtitle: 18,
    body: 16,
    arabic: 22,
    caption: 14,
  },
  'extra-large': {
    title: 28,
    subtitle: 20,
    body: 18,
    arabic: 26,
    caption: 16,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    textSize: 'medium',
    theme: 'light',
    showBanner: true,
    readingMode: 'scroll',
    squareAdjustment: 50,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await settingsService.getSettings();
      setSettings(loadedSettings);
      console.log('Settings loaded:', loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await settingsService.updateSettings(newSettings);
      setSettings(updated);
      console.log('Settings updated in context:', updated);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const textSizes = textSizeMap[settings.textSize];

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, colors, textSizes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
