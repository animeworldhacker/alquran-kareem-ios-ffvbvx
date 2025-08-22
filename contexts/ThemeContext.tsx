
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
  showTajweed: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const savedSettings = await settingsService.getSettings();
      
      // Merge with defaults to ensure all required properties exist
      const mergedSettings: AppSettings = {
        ...defaultSettings,
        ...savedSettings,
      };
      
      setSettings(mergedSettings);
      console.log('Settings loaded successfully:', mergedSettings);
    } catch (error) {
      console.error('Error loading settings, using defaults:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Validate settings before saving
      if (!updatedSettings.textSize || !updatedSettings.theme || !updatedSettings.readingMode) {
        throw new Error('Invalid settings provided');
      }
      
      await settingsService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      console.log('Settings updated successfully:', updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const getColors = () => {
    try {
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
    } catch (error) {
      console.error('Error getting colors, using light theme:', error);
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
    }
  };

  const getTextSizes = () => {
    try {
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
    } catch (error) {
      console.error('Error getting text sizes, using defaults:', error);
      return {
        small: 12,
        body: 16,
        title: 20,
        heading: 24,
        caption: 12,
        arabic: 22,
      };
    }
  };

  // Don't render children until settings are loaded
  if (isLoading) {
    return null;
  }

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
