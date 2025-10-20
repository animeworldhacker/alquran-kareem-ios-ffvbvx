
import { Audio } from 'expo-av';
import { Reciter } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioCache {
  [key: string]: string;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private reciters: Reciter[] = [];
  private isInitialized = false;
  private audioCache: AudioCache = {};
  private currentlyPlayingKey: string | null = null;
  private continuousPlayback = false;
  private currentSurah: number | null = null;
  private currentAyah: number | null = null;
  private totalAyahs: number = 0;
  private onAyahEndCallback: ((surah: number, ayah: number) => void) | null = null;

  // Recitation IDs for Quran.com CDN
  private recitationIds: { [key: string]: number } = {
    'Ali Jaber': 7,
    'Ahmed Al Ajmy': 3,
    'Abdulbasit (Murattal)': 2,
    'Maher Al-Muaiqly': 4,
    'Yasser Al-Dosari': 8,
    'Mishary Rashid': 1, // Fallback
  };

  async initializeAudio() {
    try {
      if (this.isInitialized) {
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Load cached reciter from localStorage
      const savedReciter = await AsyncStorage.getItem('selectedReciter');
      if (savedReciter) {
        console.log('Loaded saved reciter:', savedReciter);
      }
      
      this.isInitialized = true;
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw new Error(`Failed to initialize audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReciters(): Promise<Reciter[]> {
    if (this.reciters.length > 0) {
      return this.reciters;
    }

    try {
      console.log('Setting up reciters with Quran.com CDN...');
      
      // Define the 5 required reciters with their Quran.com recitation IDs
      this.reciters = [
        { 
          id: 7, 
          name: 'Ali Jaber', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 7
        },
        { 
          id: 3, 
          name: 'Ahmed Al Ajmy', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 3
        },
        { 
          id: 2, 
          name: 'Abdulbasit (Murattal)', 
          letter: 'ع', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 2
        },
        { 
          id: 4, 
          name: 'Maher Al-Muaiqly', 
          letter: 'م', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 4
        },
        { 
          id: 8, 
          name: 'Yasser Al-Dosari', 
          letter: 'ي', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 8
        },
      ];
      
      console.log('Reciters configured successfully');
      return this.reciters;
    } catch (error) {
      console.error('Error setting up reciters:', error);
      throw error;
    }
  }

  private buildQuranCdnUrl(recitationId: number, surahNumber: number, ayahNumber: number): string {
    try {
      if (!recitationId || !surahNumber || !ayahNumber) {
        throw new Error('Invalid parameters for building audio URL');
      }
      
      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const paddedAyah = ayahNumber.toString().padStart(3, '0');
      return `https://verses.quran.com/${recitationId}/${paddedSurah}${paddedAyah}.mp3`;
    } catch (error) {
      console.error('Error building audio URL:', error);
      throw error;
    }
  }

  private async checkAudioUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking audio URL:', error);
      return false;
    }
  }

  private async getAudioUrlWithFallback(
    reciterId: number, 
    surahNumber: number, 
    ayahNumber: number
  ): Promise<string> {
    const cacheKey = `${reciterId}:${surahNumber}:${ayahNumber}`;
    
    // Check cache first
    if (this.audioCache[cacheKey]) {
      console.log('Using cached audio URL:', cacheKey);
      return this.audioCache[cacheKey];
    }

    // Get reciter info
    const reciter = this.reciters.find(r => r.id === reciterId);
    const recitationId = reciter?.recitationId || reciterId;
    
    // Try primary reciter
    let audioUrl = this.buildQuranCdnUrl(recitationId, surahNumber, ayahNumber);
    console.log('Trying primary audio URL:', audioUrl);
    
    const isAvailable = await this.checkAudioUrl(audioUrl);
    
    if (!isAvailable) {
      console.log('Primary audio not available, trying fallback (Mishary Rashid)...');
      // Fallback to Mishary Rashid (recitation ID 1)
      audioUrl = this.buildQuranCdnUrl(1, surahNumber, ayahNumber);
      
      const fallbackAvailable = await this.checkAudioUrl(audioUrl);
      if (!fallbackAvailable) {
        throw new Error('Audio file not available for this ayah');
      }
    }
    
    // Cache the URL
    this.audioCache[cacheKey] = audioUrl;
    return audioUrl;
  }

  async playAyah(
    surahNumber: number, 
    ayahNumber: number, 
    reciterId: number = 2,
    continuousPlay: boolean = false,
    totalAyahsInSurah: number = 0
  ): Promise<void> {
    try {
      // Validate parameters
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }

      // Ensure audio is initialized
      if (!this.isInitialized) {
        await this.initializeAudio();
      }

      // Stop any currently playing audio
      if (this.sound) {
        try {
          await this.sound.unloadAsync();
        } catch (unloadError) {
          console.log('Error unloading previous sound:', unloadError);
        }
        this.sound = null;
      }

      // Get reciters if not loaded
      if (this.reciters.length === 0) {
        await this.getReciters();
      }

      // Set continuous playback state
      this.continuousPlayback = continuousPlay;
      this.currentSurah = surahNumber;
      this.currentAyah = ayahNumber;
      this.totalAyahs = totalAyahsInSurah;
      this.currentlyPlayingKey = `${reciterId}:${surahNumber}:${ayahNumber}`;

      // Get audio URL with fallback
      const audioUrl = await this.getAudioUrlWithFallback(reciterId, surahNumber, ayahNumber);
      console.log(`Playing audio: ${audioUrl}`);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );
      
      this.sound = sound;
      console.log('Audio started playing successfully');
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error(`Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async onPlaybackStatusUpdate(status: any) {
    if (status.didJustFinish && !status.isLooping) {
      console.log('Ayah playback finished');
      
      // If continuous playback is enabled, play next ayah
      if (this.continuousPlayback && this.currentSurah && this.currentAyah) {
        const nextAyah = this.currentAyah + 1;
        
        if (nextAyah <= this.totalAyahs) {
          console.log(`Playing next ayah: ${this.currentSurah}:${nextAyah}`);
          
          // Notify callback if set
          if (this.onAyahEndCallback) {
            this.onAyahEndCallback(this.currentSurah, nextAyah);
          }
          
          // Get current reciter ID from playing key
          const reciterId = this.currentlyPlayingKey 
            ? parseInt(this.currentlyPlayingKey.split(':')[0]) 
            : 2;
          
          // Play next ayah
          await this.playAyah(
            this.currentSurah, 
            nextAyah, 
            reciterId, 
            true, 
            this.totalAyahs
          );
        } else {
          console.log('Reached end of surah');
          this.continuousPlayback = false;
          this.currentlyPlayingKey = null;
        }
      }
    }
  }

  setOnAyahEndCallback(callback: (surah: number, ayah: number) => void) {
    this.onAyahEndCallback = callback;
  }

  async stopAudio(): Promise<void> {
    try {
      this.continuousPlayback = false;
      this.currentlyPlayingKey = null;
      this.currentSurah = null;
      this.currentAyah = null;
      
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('Audio stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw new Error(`Failed to stop audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        console.log('Audio paused successfully');
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw new Error(`Failed to pause audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        console.log('Audio resumed successfully');
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
      throw new Error(`Failed to resume audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAudioStatus() {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting audio status:', error);
      return null;
    }
  }

  getCurrentlyPlayingKey(): string | null {
    return this.currentlyPlayingKey;
  }

  isContinuousPlayback(): boolean {
    return this.continuousPlayback;
  }

  async saveSelectedReciter(reciterId: number): Promise<void> {
    try {
      await AsyncStorage.setItem('selectedReciter', reciterId.toString());
      console.log('Saved selected reciter:', reciterId);
    } catch (error) {
      console.error('Error saving selected reciter:', error);
    }
  }

  async loadSelectedReciter(): Promise<number | null> {
    try {
      const saved = await AsyncStorage.getItem('selectedReciter');
      if (saved) {
        return parseInt(saved, 10);
      }
      return null;
    } catch (error) {
      console.error('Error loading selected reciter:', error);
      return null;
    }
  }

  clearCache(): void {
    this.audioCache = {};
    console.log('Audio cache cleared');
  }
}

export const audioService = new AudioService();
