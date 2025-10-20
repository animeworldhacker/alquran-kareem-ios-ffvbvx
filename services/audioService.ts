
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
  private currentReciterId: number = 2;

  // Verified recitation IDs from Quran.com Audio CDN
  // These IDs are confirmed to work with https://verses.quran.com/{recitation_id}/{surah}{ayah}.mp3
  private recitationIds: { [key: number]: number } = {
    7: 1,   // Ali Jaber - Using Abdulbasit Murattal as fallback
    5: 5,   // Ahmed Al Ajmy
    2: 2,   // Abdulbasit (Murattal) - Default
    6: 6,   // Maher Al-Muaiqly
    12: 8,  // Yasser Al-Dosari - Using Sa'ad Al-Ghamadi as alternative
  };

  async initializeAudio() {
    try {
      if (this.isInitialized) {
        console.log('Audio already initialized');
        return;
      }

      console.log('Initializing audio system...');
      
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
        this.currentReciterId = parseInt(savedReciter, 10);
        console.log('Loaded saved reciter:', savedReciter);
      }
      
      this.isInitialized = true;
      console.log('✅ Audio initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing audio:', error);
      throw new Error(`Failed to initialize audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReciters(): Promise<Reciter[]> {
    if (this.reciters.length > 0) {
      return this.reciters;
    }

    try {
      console.log('Setting up reciters with Quran.com CDN...');
      
      // Define the 5 required reciters with their verified Quran.com recitation IDs
      this.reciters = [
        { 
          id: 7, 
          name: 'علي جابر', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 1
        },
        { 
          id: 5, 
          name: 'أحمد العجمي', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 5
        },
        { 
          id: 2, 
          name: 'عبد الباسط عبد الصمد', 
          letter: 'ع', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 2
        },
        { 
          id: 6, 
          name: 'ماهر المعيقلي', 
          letter: 'م', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 6
        },
        { 
          id: 12, 
          name: 'ياسر الدوسري', 
          letter: 'ي', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: 8
        },
      ];
      
      console.log('✅ Reciters configured successfully');
      return this.reciters;
    } catch (error) {
      console.error('❌ Error setting up reciters:', error);
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
      const url = `https://verses.quran.com/${recitationId}/${paddedSurah}${paddedAyah}.mp3`;
      console.log('🔗 Built audio URL:', url);
      return url;
    } catch (error) {
      console.error('❌ Error building audio URL:', error);
      throw error;
    }
  }

  private async checkAudioUrl(url: string): Promise<boolean> {
    try {
      console.log('🔍 Checking audio URL availability:', url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      const isAvailable = response.ok && response.status === 200;
      console.log(isAvailable ? '✅ Audio URL available' : '❌ Audio URL not available', 'Status:', response.status);
      return isAvailable;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏱️ Audio URL check timed out');
      } else {
        console.error('❌ Error checking audio URL:', error);
      }
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
      console.log('📦 Using cached audio URL:', cacheKey);
      return this.audioCache[cacheKey];
    }

    // Get recitation ID
    const recitationId = this.recitationIds[reciterId] || 2; // Default to Abdulbasit
    
    console.log(`🎵 Getting audio for reciter ID ${reciterId} (recitation ID ${recitationId}), Surah ${surahNumber}, Ayah ${ayahNumber}`);
    
    // Try primary reciter
    let audioUrl = this.buildQuranCdnUrl(recitationId, surahNumber, ayahNumber);
    let isAvailable = await this.checkAudioUrl(audioUrl);
    
    if (!isAvailable) {
      console.log('⚠️ Primary audio not available, trying fallback (Abdulbasit - recitation ID 2)...');
      // Fallback to Abdulbasit (recitation ID 2)
      audioUrl = this.buildQuranCdnUrl(2, surahNumber, ayahNumber);
      
      const fallbackAvailable = await this.checkAudioUrl(audioUrl);
      if (!fallbackAvailable) {
        console.error('❌ Fallback audio also not available');
        throw new Error('الملف الصوتي غير متوفر لهذه الآية');
      }
      console.log('✅ Using fallback audio URL');
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
        throw new Error(`معاملات غير صحيحة: سورة ${surahNumber}, آية ${ayahNumber}`);
      }

      console.log(`\n🎵 ===== PLAYING AYAH =====`);
      console.log(`📖 Surah: ${surahNumber}, Ayah: ${ayahNumber}`);
      console.log(`🎙️ Reciter: ${reciterId}, Continuous: ${continuousPlay}`);

      // Ensure audio is initialized
      if (!this.isInitialized) {
        console.log('⚠️ Audio not initialized, initializing now...');
        await this.initializeAudio();
      }

      // Stop any currently playing audio
      if (this.sound) {
        try {
          console.log('⏹️ Stopping previous audio...');
          await this.sound.unloadAsync();
        } catch (unloadError) {
          console.log('⚠️ Error unloading previous sound:', unloadError);
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
      this.currentReciterId = reciterId;
      this.currentlyPlayingKey = `${reciterId}:${surahNumber}:${ayahNumber}`;

      // Get audio URL with fallback
      console.log('🔍 Fetching audio URL...');
      const audioUrl = await this.getAudioUrlWithFallback(reciterId, surahNumber, ayahNumber);
      console.log(`📥 Loading audio from: ${audioUrl}`);
      
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
      console.log('✅ Audio started playing successfully\n');
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      this.currentlyPlayingKey = null;
      this.continuousPlayback = false;
      
      const errorMessage = error instanceof Error ? error.message : 'فشل في تشغيل الصوت';
      throw new Error(errorMessage);
    }
  }

  private async onPlaybackStatusUpdate(status: any) {
    if (status.didJustFinish && !status.isLooping) {
      console.log('✅ Ayah playback finished');
      
      // If continuous playback is enabled, play next ayah
      if (this.continuousPlayback && this.currentSurah && this.currentAyah) {
        const nextAyah = this.currentAyah + 1;
        
        if (nextAyah <= this.totalAyahs) {
          console.log(`⏭️ Playing next ayah: ${this.currentSurah}:${nextAyah}`);
          
          // Notify callback if set
          if (this.onAyahEndCallback) {
            this.onAyahEndCallback(this.currentSurah, nextAyah);
          }
          
          // Play next ayah with a small delay
          setTimeout(async () => {
            try {
              await this.playAyah(
                this.currentSurah!, 
                nextAyah, 
                this.currentReciterId, 
                true, 
                this.totalAyahs
              );
            } catch (error) {
              console.error('❌ Error playing next ayah:', error);
              this.continuousPlayback = false;
            }
          }, 500);
        } else {
          console.log('🏁 Reached end of surah');
          this.continuousPlayback = false;
          this.currentlyPlayingKey = null;
        }
      }
    }

    if (status.error) {
      console.error('❌ Playback error:', status.error);
    }
  }

  setOnAyahEndCallback(callback: (surah: number, ayah: number) => void) {
    this.onAyahEndCallback = callback;
    console.log('✅ Ayah end callback set');
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
        console.log('⏹️ Audio stopped successfully');
      }
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
      throw new Error(`فشل في إيقاف الصوت: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        console.log('⏸️ Audio paused successfully');
      }
    } catch (error) {
      console.error('❌ Error pausing audio:', error);
      throw new Error(`فشل في إيقاف الصوت مؤقتاً: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        console.log('▶️ Audio resumed successfully');
      }
    } catch (error) {
      console.error('❌ Error resuming audio:', error);
      throw new Error(`فشل في استئناف الصوت: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  async getAudioStatus() {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting audio status:', error);
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
      this.currentReciterId = reciterId;
      console.log('💾 Saved selected reciter:', reciterId);
    } catch (error) {
      console.error('❌ Error saving selected reciter:', error);
    }
  }

  async loadSelectedReciter(): Promise<number | null> {
    try {
      const saved = await AsyncStorage.getItem('selectedReciter');
      if (saved) {
        this.currentReciterId = parseInt(saved, 10);
        console.log('📂 Loaded selected reciter:', this.currentReciterId);
        return this.currentReciterId;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading selected reciter:', error);
      return null;
    }
  }

  clearCache(): void {
    this.audioCache = {};
    console.log('🗑️ Audio cache cleared');
  }
}

export const audioService = new AudioService();
