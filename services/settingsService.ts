
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';
import { supabase } from '../app/integrations/supabase/client';

class SettingsService {
  private storageKey = 'app_settings';

  private async isUserAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  async getSettings(): Promise<Partial<AppSettings>> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        // Get from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return this.getLocalSettings();

        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading settings from Supabase:', error);
          return this.getLocalSettings();
        }

        if (!data) return this.getLocalSettings();

        return {
          textSize: data.text_size as AppSettings['textSize'],
          theme: data.theme as AppSettings['theme'],
          showBanner: data.show_banner,
          readingMode: data.reading_mode as AppSettings['readingMode'],
          squareAdjustment: data.square_adjustment,
          showTajweed: data.show_tajweed,
          autoExpandTafsir: data.auto_expand_tafsir,
        };
      } else {
        return this.getLocalSettings();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getLocalSettings();
    }
  }

  private async getLocalSettings(): Promise<Partial<AppSettings>> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.storageKey);
      if (settingsJson) {
        const parsed = JSON.parse(settingsJson);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      }
      return {};
    } catch (error) {
      console.error('Error loading local settings:', error);
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
        'autoExpandTafsir'
      ];
      
      for (const prop of requiredProps) {
        if (settings[prop] === undefined || settings[prop] === null) {
          throw new Error(`Missing required setting: ${prop}`);
        }
      }

      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        // Save to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            text_size: settings.textSize,
            theme: settings.theme,
            show_banner: settings.showBanner,
            reading_mode: settings.readingMode,
            square_adjustment: settings.squareAdjustment,
            show_tajweed: settings.showTajweed,
            auto_expand_tafsir: settings.autoExpandTafsir,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        console.log('Settings saved to Supabase successfully');
      }

      // Always save to AsyncStorage as backup
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(settings));
      console.log('Settings saved locally successfully');
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
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_settings')
            .delete()
            .eq('user_id', user.id);
        }
      }

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
      autoExpandTafsir: false,
    };
  }

  // Sync local settings to Supabase when user logs in
  async syncLocalToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const localSettings = await this.getLocalSettings();
      if (Object.keys(localSettings).length === 0) return;

      console.log('Syncing local settings to Supabase...');

      const defaultSettings = this.getDefaultSettings();
      const mergedSettings = { ...defaultSettings, ...localSettings };

      await supabase.from('user_settings').upsert({
        user_id: user.id,
        text_size: mergedSettings.textSize,
        theme: mergedSettings.theme,
        show_banner: mergedSettings.showBanner,
        reading_mode: mergedSettings.readingMode,
        square_adjustment: mergedSettings.squareAdjustment,
        show_tajweed: mergedSettings.showTajweed,
        auto_expand_tafsir: mergedSettings.autoExpandTafsir,
      });

      console.log('Local settings synced to Supabase');
    } catch (error) {
      console.error('Error syncing settings:', error);
    }
  }
}

export const settingsService = new SettingsService();
