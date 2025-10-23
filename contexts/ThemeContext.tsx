
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
    ayah: number;
  };
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    textSize: 'medium',
    theme: 'light',
    showBanner: true,
    readingMode: 'scroll',
    squareAdjustment: 50,
    showTajweed: true,
    showTajweedLegend: true,
    autoExpandTafsir: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = await settingsService.getSettings();
      const defaultSettings = settingsService.getDefaultSettings();
      
      const mergedSettings = { ...defaultSettings, ...savedSettings };
      setSettings(mergedSettings);
      console.log('Settings loaded successfully:', mergedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(settingsService.getDefaultSettings());
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      console.log('Updating settings:', newSettings);
      const updatedSettings = { ...settings, ...newSettings };
      
      await settingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      console.log('Settings updated successfully:', updatedSettings);
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
      primary: '#d4af37',
      secondary: '#8B4513',
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
      ayah: baseSize + 8,
    };
  };

  const value: ThemeContextType = {
    settings,
    updateSettings,
    colors: getColors(),
    textSizes: getTextSizes(),
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
