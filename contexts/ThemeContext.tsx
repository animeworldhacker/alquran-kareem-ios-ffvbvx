
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { settingsService } from '../services/settingsService';

interface ThemeContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  colors: {
    background: string;
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

const defaultSettings: AppSettings = {
  textSize: 'medium',
  theme: 'light',
  showBanner: true,
  readingMode: 'scroll',
  squareAdjustment: 50,
  showTajweed: true, // Default to showing tajweed
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsService.getSettings();
      setSettings({ ...defaultSettings, ...savedSettings });
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await settingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.log('Error updating settings:', error);
    }
  };

  const getColors = () => {
    if (settings.theme === 'dark') {
      return {
        background: '#1a1a1a',
        surface: '#2d2d2d',
        primary: '#d4af37',
        secondary: '#8B4513',
        text: '#ffffff',
        textSecondary: '#cccccc',
        border: '#404040',
        accent: '#d4af37',
        error: '#ff6b6b',
        success: '#4ecdc4',
        warning: '#ffeaa7',
      };
    }
    
    return {
      background: '#ffffff',
      surface: '#f8f6f0',
      primary: '#d4af37',
      secondary: '#8B4513',
      text: '#2F4F4F',
      textSecondary: '#666666',
      border: '#e8e6e0',
      accent: '#d4af37',
      error: '#ff6b6b',
      success: '#4ecdc4',
      warning: '#ffeaa7',
    };
  };

  const getTextSizes = () => {
    const baseSize = settings.textSize === 'small' ? 14 : 
                    settings.textSize === 'large' ? 18 : 
                    settings.textSize === 'extra-large' ? 22 : 16;
    
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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
