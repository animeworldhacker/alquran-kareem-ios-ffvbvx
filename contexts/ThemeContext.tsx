
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { settingsService } from '../services/settingsService';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  colors: {
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceElevated: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    gold: string;
    goldDark: string;
    goldLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    divider: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
    ayahNumber: string;
    selectedAyah: string;
    overlay: string;
    shadow: string;
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
  isDark: boolean;
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
  const systemColorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    textSize: 'medium',
    theme: 'dark',
    showBanner: true,
    readingMode: 'scroll',
    squareAdjustment: 100,
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
    // Determine if we should use dark mode
    const shouldUseDark = settings.theme === 'dark' || 
                         (settings.theme === 'auto' && systemColorScheme === 'dark');
    
    if (shouldUseDark) {
      // Dark mode - iQuran inspired
      return {
        background: '#0F1419',
        backgroundAlt: '#1A2027',
        surface: '#1E2732',
        surfaceElevated: '#2A3441',
        primary: '#1B5E20',
        primaryDark: '#0D3D13',
        primaryLight: '#2E7D32',
        gold: '#D4AF37',
        goldDark: '#B8941F',
        goldLight: '#E5C158',
        text: '#E8E6E3',
        textSecondary: '#B0ADA8',
        textMuted: '#6B6B6B',
        border: '#2A3441',
        divider: '#3A4451',
        accent: '#D4AF37',
        error: '#EF5350',
        success: '#66BB6A',
        warning: '#FFA726',
        ayahNumber: '#D4AF37',
        selectedAyah: 'rgba(212, 175, 55, 0.15)',
        overlay: 'rgba(0, 0, 0, 0.6)',
        shadow: '#000000',
      };
    } else {
      // Light mode - iQuran inspired
      return {
        background: '#F5F5F0',
        backgroundAlt: '#FAFAF5',
        surface: '#FFFFFF',
        surfaceElevated: '#F8F8F3',
        primary: '#1B5E20',
        primaryDark: '#0D3D13',
        primaryLight: '#2E7D32',
        gold: '#D4AF37',
        goldDark: '#B8941F',
        goldLight: '#E5C158',
        text: '#2C2C2C',
        textSecondary: '#757575',
        textMuted: '#9E9E9E',
        border: '#E0E0D8',
        divider: '#D5D5CC',
        accent: '#D4AF37',
        error: '#EF5350',
        success: '#66BB6A',
        warning: '#FFA726',
        ayahNumber: '#D4AF37',
        selectedAyah: 'rgba(212, 175, 55, 0.15)',
        overlay: 'rgba(0, 0, 0, 0.3)',
        shadow: '#000000',
      };
    }
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
      ayah: baseSize + 10,
    };
  };

  const isDark = settings.theme === 'dark' || 
                (settings.theme === 'auto' && systemColorScheme === 'dark');

  const value: ThemeContextType = {
    settings,
    updateSettings,
    colors: getColors(),
    textSizes: getTextSizes(),
    isLoading,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
