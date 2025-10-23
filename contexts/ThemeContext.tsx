
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
    emerald: string;
    gold: string;
    cream: string;
    darkBrown: string;
    mutedBrown: string;
    card: string;
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
      background: isDark ? '#1a1a1a' : '#F5EEE3',
      backgroundAlt: isDark ? '#2d2d2d' : '#F5EEE3',
      surface: isDark ? '#2d2d2d' : '#F5EEE3',
      primary: isDark ? '#1E5B4C' : '#1E5B4C',
      secondary: isDark ? '#8B7355' : '#6D6558',
      text: isDark ? '#F5EEE3' : '#2C2416',
      textSecondary: isDark ? '#B8B8B8' : '#6D6558',
      border: isDark ? '#D4AF37' : '#D4AF37',
      accent: isDark ? '#FF8A65' : '#FF6B6B',
      error: isDark ? '#EF5350' : '#C62828',
      success: isDark ? '#66BB6A' : '#2E7D32',
      warning: isDark ? '#FFA726' : '#F57C00',
      emerald: isDark ? '#1E5B4C' : '#1E5B4C',
      gold: '#D4AF37',
      cream: isDark ? '#3a3a3a' : '#F5EEE3',
      darkBrown: isDark ? '#F5EEE3' : '#2C2416',
      mutedBrown: isDark ? '#B8B8B8' : '#6D6558',
      card: isDark ? '#2d2d2d' : '#F5EEE3',
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
      arabic: baseSize + 10,
      ayah: baseSize + 12,
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
