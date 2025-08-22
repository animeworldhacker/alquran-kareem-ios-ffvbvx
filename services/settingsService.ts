
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

class SettingsService {
  private storageKey = 'app_settings';

  async getSettings(): Promise<Partial<AppSettings>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.storageKey);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(settings));
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, [key]: value };
      await this.saveSettings(updatedSettings as AppSettings);
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  }

  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      console.log('Settings reset successfully');
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  // Default settings
  getDefaultSettings(): AppSettings {
    return {
      textSize: 'medium',
      theme: 'light',
      showBanner: true,
      readingMode: 'scroll',
      squareAdjustment: 50,
      showTajweed: true,
    };
  }
}

export const settingsService = new SettingsService();
