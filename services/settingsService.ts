
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

class SettingsService {
  private storageKey = 'app_settings';

  async getSettings(): Promise<Partial<AppSettings>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.storageKey);
      if (settingsJson) {
        const parsed = JSON.parse(settingsJson);
        
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        } else {
          console.log('Invalid settings format, returning defaults');
          return {};
        }
      }
      return {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      if (!settings || typeof settings !== 'object') {
        throw new Error('Invalid settings object');
      }
      
      const requiredProps: (keyof AppSettings)[] = [
        'textSize', 
        'theme', 
        'showBanner', 
        'readingMode', 
        'squareAdjustment', 
        'showTajweed',
        'showTajweedLegend',
        'autoExpandTafsir'
      ];
      
      for (const prop of requiredProps) {
        if (settings[prop] === undefined || settings[prop] === null) {
          throw new Error(`Missing required setting: ${prop}`);
        }
      }
      
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
      if (!key || value === undefined || value === null) {
        throw new Error(`Invalid setting update: ${key} = ${value}`);
      }
      
      const currentSettings = await this.getSettings();
      const defaultSettings = this.getDefaultSettings();
      
      const mergedSettings = { ...defaultSettings, ...currentSettings };
      const updatedSettings = { ...mergedSettings, [key]: value };
      
      await this.saveSettings(updatedSettings);
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

  getDefaultSettings(): AppSettings {
    return {
      textSize: 'medium',
      theme: 'light',
      showBanner: true,
      readingMode: 'scroll',
      squareAdjustment: 50,
      showTajweed: true,
      showTajweedLegend: true,
      autoExpandTafsir: false,
    };
  }
}

export const settingsService = new SettingsService();
