
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { settingsService } from '../services/settingsService';

interface ThemeContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
  };
  textSizes: {
    small: number;
    body: number;
    title: number;
    heading: number;
    caption: number;
    arabic: number;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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
      const savedSettings = await settingsService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await settingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const getColors = () => {
    const isDark = settings.theme === 'dark';
    
    return {
      background: isDark ? '#1a1a1a' : '#ffffff',
      backgroundAlt: isDark ? '#2d2d2d' : '#f5f5f5',
      surface: isDark ? '#2d2d2d' : '#ffffff',
      primary: '#d4af37', // Gold
      secondary: '#8B4513', // Brown
      text: isDark ? '#ffffff' : '#2F4F4F',
      textSecondary: isDark ? '#cccccc' : '#666666',
      border: isDark ? '#404040' : '#e0e0e0',
      accent: '#FF6B6B',
      error: '#f44336',
      success: '#4caf50',
      warning: '#ff9800',
    };
  };

  const getTextSizes = () => {
    const baseSize = {
      small: 14,
      medium: 16,
      large: 18,
      'extra-large': 20,
    }[settings.textSize];

    return {
      small: baseSize - 2,
      body: baseSize,
      title: baseSize + 4,
      heading: baseSize + 8,
      caption: baseSize - 4,
      arabic: baseSize + 6,
    };
  };

  const value: ThemeContextType = {
    settings,
    updateSettings,
    colors: getColors(),
    textSizes: getTextSizes(),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
