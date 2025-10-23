
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
    card: string;
    error: string;
    success: string;
    warning: string;
    gold: string;
    emerald: string;
    cream: string;
    darkBrown: string;
    mutedBrown: string;
    frostedGlass: string;
    verseNumberBg: string;
    verseNumberBorder: string;
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
    
    if (isDark) {
      return {
        background: '#1a1a1a',
        backgroundAlt: '#2d2d2d',
        surface: '#2d2d2d',
        primary: '#42A5F5',
        secondary: '#9E9E9E',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#404040',
        accent: '#FF6B6B',
        card: '#2d2d2d',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800',
        gold: '#D4AF37',
        emerald: '#50C878',
        cream: '#FFFDD0',
        darkBrown: '#654321',
        mutedBrown: '#8B7355',
        frostedGlass: 'rgba(45, 45, 45, 0.85)',
        verseNumberBg: '#D4AF37',
        verseNumberBorder: '#50C878',
      };
    }
    
    // Light theme with gold and emerald
    return {
      background: '#F5F5DC',
      backgroundAlt: '#FFFEF0',
      surface: '#1E5B4C',
      primary: '#1E5B4C',
      secondary: '#D4AF37',
      text: '#2C2416',
      textSecondary: '#5C4A2F',
      border: '#D4AF37',
      accent: '#D4AF37',
      card: '#FFFEF0',
      error: '#C62828',
      success: '#2E7D32',
      warning: '#F57C00',
      gold: '#D4AF37',
      emerald: '#1E5B4C',
      cream: '#FFFEF0',
      darkBrown: '#2C2416',
      mutedBrown: '#5C4A2F',
      frostedGlass: 'rgba(255, 254, 240, 0.85)',
      verseNumberBg: '#D4AF37',
      verseNumberBorder: '#1E5B4C',
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
