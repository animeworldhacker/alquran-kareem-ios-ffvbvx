
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = 'app_settings';

const defaultSettings: AppSettings = {
  textSize: 'medium',
  theme: 'light',
  showBanner: true,
  readingMode: 'scroll',
  squareAdjustment: 50,
};

class SettingsService {
  async getSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      console.log('Settings updated:', updated);
      return updated;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async resetSettings(): Promise<AppSettings> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      console.log('Settings reset to defaults');
      return defaultSettings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
