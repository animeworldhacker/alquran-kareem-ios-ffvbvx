
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../app/integrations/supabase/client';

const PROGRESS_KEY = 'quran_reading_progress';

export interface ReadingProgress {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  lastReadAt: Date;
}

class ReadingProgressService {
  private async isUserAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  async getProgress(surahNumber: number): Promise<ReadingProgress | null> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return this.getLocalProgress(surahNumber);

        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('surah_number', surahNumber)
          .single();

        if (error || !data) {
          return this.getLocalProgress(surahNumber);
        }

        return {
          id: data.id,
          surahNumber: data.surah_number,
          ayahNumber: data.ayah_number,
          lastReadAt: new Date(data.last_read_at),
        };
      } else {
        return this.getLocalProgress(surahNumber);
      }
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return this.getLocalProgress(surahNumber);
    }
  }

  private async getLocalProgress(surahNumber: number): Promise<ReadingProgress | null> {
    try {
      const progressJson = await AsyncStorage.getItem(PROGRESS_KEY);
      if (!progressJson) return null;

      const allProgress = JSON.parse(progressJson);
      const progress = allProgress.find((p: any) => p.surahNumber === surahNumber);

      if (!progress) return null;

      return {
        ...progress,
        lastReadAt: new Date(progress.lastReadAt),
      };
    } catch (error) {
      console.error('Error getting local progress:', error);
      return null;
    }
  }

  async getAllProgress(): Promise<ReadingProgress[]> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return this.getLocalAllProgress();

        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('last_read_at', { ascending: false });

        if (error) {
          return this.getLocalAllProgress();
        }

        return data.map(p => ({
          id: p.id,
          surahNumber: p.surah_number,
          ayahNumber: p.ayah_number,
          lastReadAt: new Date(p.last_read_at),
        }));
      } else {
        return this.getLocalAllProgress();
      }
    } catch (error) {
      console.error('Error getting all progress:', error);
      return this.getLocalAllProgress();
    }
  }

  private async getLocalAllProgress(): Promise<ReadingProgress[]> {
    try {
      const progressJson = await AsyncStorage.getItem(PROGRESS_KEY);
      if (!progressJson) return [];

      const allProgress = JSON.parse(progressJson);
      return allProgress.map((p: any) => ({
        ...p,
        lastReadAt: new Date(p.lastReadAt),
      }));
    } catch (error) {
      console.error('Error getting local all progress:', error);
      return [];
    }
  }

  async updateProgress(surahNumber: number, ayahNumber: number): Promise<void> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          await this.updateLocalProgress(surahNumber, ayahNumber);
          return;
        }

        const { error } = await supabase
          .from('reading_progress')
          .upsert({
            user_id: user.id,
            surah_number: surahNumber,
            ayah_number: ayahNumber,
            last_read_at: new Date().toISOString(),
          });

        if (error) throw error;
        console.log('Reading progress updated in Supabase');
      } else {
        await this.updateLocalProgress(surahNumber, ayahNumber);
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
      await this.updateLocalProgress(surahNumber, ayahNumber);
    }
  }

  private async updateLocalProgress(surahNumber: number, ayahNumber: number): Promise<void> {
    try {
      const allProgress = await this.getLocalAllProgress();
      const existingIndex = allProgress.findIndex(p => p.surahNumber === surahNumber);

      const newProgress: ReadingProgress = {
        id: `${surahNumber}-${Date.now()}`,
        surahNumber,
        ayahNumber,
        lastReadAt: new Date(),
      };

      if (existingIndex >= 0) {
        allProgress[existingIndex] = newProgress;
      } else {
        allProgress.push(newProgress);
      }

      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
      console.log('Reading progress updated locally');
    } catch (error) {
      console.error('Error updating local progress:', error);
    }
  }

  async syncLocalToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const localProgress = await this.getLocalAllProgress();
      if (localProgress.length === 0) return;

      console.log(`Syncing ${localProgress.length} reading progress entries to Supabase...`);

      for (const progress of localProgress) {
        try {
          await supabase.from('reading_progress').upsert({
            user_id: user.id,
            surah_number: progress.surahNumber,
            ayah_number: progress.ayahNumber,
            last_read_at: progress.lastReadAt.toISOString(),
          });
        } catch (error) {
          console.error('Error syncing progress:', error);
        }
      }

      await AsyncStorage.removeItem(PROGRESS_KEY);
      console.log('Local reading progress synced and cleared');
    } catch (error) {
      console.error('Error syncing reading progress:', error);
    }
  }
}

export const readingProgressService = new ReadingProgressService();
