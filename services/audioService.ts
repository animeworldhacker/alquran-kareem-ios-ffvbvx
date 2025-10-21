
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioCache {
  [key: string]: string;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private isInitialized = false;
  private audioCache: AudioCache = {};
  private currentlyPlayingKey: string | null = null;
  private continuousPlayback = false;
  private currentSurah: number | null = null;
  private currentAyah: number | null = null;
  private totalAyahs: number = 0;
  private onAyahEndCallback: ((surah: number, ayah: number) => void) | null = null;
  
  // Using Abdulbasit (recitation ID 2) as the single working reciter
  private readonly RECITATION_ID = 2;

  async initializeAudio() {
    try {
      if (this.isInitialized) {
        console.log('Audio already initialized');
        return;
      }

      console.log('🎵 Initializing audio system...');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load audio URL cache from localStorage
      await this.loadAudioCache();
      
      this.isInitialized = true;
      console.log('✅ Audio initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing audio:', error);
      throw new Error(`Failed to initialize audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async loadAudioCache() {
    try {
      const cached = await AsyncStorage.getItem('audioUrlCache');
      if (cached) {
        this.audioCache = JSON.parse(cached);
        console.log('📦 Loaded audio URL cache:', Object.keys(this.audioCache).length, 'entries');
      }
    } catch (error) {
      console.error('⚠️ Error loading audio cache:', error);
      this.audioCache = {};
    }
  }

  private async saveAudioCache() {
    try {
      await AsyncStorage.setItem('audioUrlCache', JSON.stringify(this.audioCache));
      console.log('💾 Saved audio URL cache');
    } catch (error) {
      console.error('⚠️ Error saving audio cache:', error);
    }
  }

  private buildQuranCdnUrl(surahNumber: number, ayahNumber: number): string {
    try {
      if (!surahNumber || !ayahNumber) {
        throw new Error('Invalid parameters for building audio URL');
      }
      
      // Zero-pad to 3 digits as per Quran.com CDN format
      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const paddedAyah = ayahNumber.toString().padStart(3, '0');
      const url = `https://verses.quran.com/${this.RECITATION_ID}/${paddedSurah}${paddedAyah}.mp3`;
      
      return url;
    } catch (error) {
      console.error('❌ Error building audio URL:', error);
      throw error;
    }
  }

  private normalizeAudioUrl(url: string): string {
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path, prepend the Quran.com CDN base URL
    const baseUrl = 'https://verses.quran.com/';
    
    // Remove leading slash if present
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    
    return baseUrl + cleanPath;
  }

  private async fetchWithTimeout(url: string, options: { timeout?: number; method?: string } = {}): Promise<Response> {
    const { timeout = 10000, method = 'GET' } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        method,
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  private async checkAudioUrlWithRetry(url: string, retries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Checking audio URL (attempt ${attempt}/${retries}):`, url);
        
        const response = await this.fetchWithTimeout(url, { 
          method: 'HEAD',
          timeout: 10000 
        });
        
        const isAvailable = response.ok && response.status === 200;
        
        if (isAvailable) {
          console.log('✅ Audio URL available');
          return true;
        } else {
          console.log(`❌ Audio URL returned status ${response.status}`);
          if (response.status === 404) {
            // Don't retry on 404
            return false;
          }
        }
      } catch (error) {
        console.error(`⚠️ Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
        
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log('❌ All retry attempts failed');
    return false;
  }

  private async getAudioUrlFromApi(surahNumber: number, ayahNumber: number): Promise<string | null> {
    try {
      console.log(`🌐 Fetching audio URL from API for ${surahNumber}:${ayahNumber}...`);
      
      const apiUrl = `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?audio=${this.RECITATION_ID}`;
      
      const response = await this.fetchWithTimeout(apiUrl, { timeout: 10000 });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Try multiple possible paths in the response
      let audioUrl = null;
      
      if (data?.verse?.audio?.url) {
        audioUrl = data.verse.audio.url;
      } else if (data?.audio?.url) {
        audioUrl = data.audio.url;
      } else if (data?.audio_files && data.audio_files.length > 0) {
        audioUrl = data.audio_files[0].url;
      } else if (data?.verse?.audio_files && data.verse.audio_files.length > 0) {
        audioUrl = data.verse.audio_files[0].url;
      }
      
      if (audioUrl) {
        // Normalize the URL (convert relative to absolute if needed)
        const normalizedUrl = this.normalizeAudioUrl(audioUrl);
        console.log('✅ Got audio URL from API:', normalizedUrl);
        return normalizedUrl;
      } else {
        console.warn('⚠️ No audio URL in API response');
        console.log('API response structure:', JSON.stringify(data, null, 2));
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
      return null;
    }
  }

  private async getAudioUrlWithFallback(
    surahNumber: number, 
    ayahNumber: number
  ): Promise<string> {
    const cacheKey = `${this.RECITATION_ID}:${surahNumber}:${ayahNumber}`;
    
    // Check cache first
    if (this.audioCache[cacheKey]) {
      console.log('📦 Using cached audio URL:', cacheKey);
      
      // Verify cached URL is still valid
      const isValid = await this.checkAudioUrlWithRetry(this.audioCache[cacheKey], 1);
      if (isValid) {
        return this.audioCache[cacheKey];
      } else {
        console.log('⚠️ Cached URL is no longer valid, removing from cache');
        delete this.audioCache[cacheKey];
        await this.saveAudioCache();
      }
    }
    
    console.log(`\n🎵 Resolving audio URL for Surah ${surahNumber}, Ayah ${ayahNumber}`);
    
    // Step 1: Try CDN URL
    console.log('📍 Step 1: Trying CDN URL...');
    let audioUrl = this.buildQuranCdnUrl(surahNumber, ayahNumber);
    let isAvailable = await this.checkAudioUrlWithRetry(audioUrl, 2);
    
    if (isAvailable) {
      console.log('✅ CDN URL works!');
      this.audioCache[cacheKey] = audioUrl;
      await this.saveAudioCache();
      return audioUrl;
    }
    
    // Step 2: Try API fallback
    console.log('📍 Step 2: CDN failed, trying API fallback...');
    const apiUrl = await this.getAudioUrlFromApi(surahNumber, ayahNumber);
    
    if (apiUrl) {
      const apiUrlValid = await this.checkAudioUrlWithRetry(apiUrl, 2);
      if (apiUrlValid) {
        console.log('✅ API URL works!');
        this.audioCache[cacheKey] = apiUrl;
        await this.saveAudioCache();
        return apiUrl;
      }
    }
    
    // All attempts failed
    console.error('❌ All audio URL resolution attempts failed');
    throw new Error('تعذّر تشغيل الآية. الملف الصوتي غير متوفر حالياً.');
  }

  async playAyah(
    surahNumber: number, 
    ayahNumber: number, 
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
      console.log(`🎙️ Continuous: ${continuousPlay}`);

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

      // Set continuous playback state
      this.continuousPlayback = continuousPlay;
      this.currentSurah = surahNumber;
      this.currentAyah = ayahNumber;
      this.totalAyahs = totalAyahsInSurah;
      this.currentlyPlayingKey = `${this.RECITATION_ID}:${surahNumber}:${ayahNumber}`;

      // Get audio URL with fallback chain
      console.log('🔍 Resolving audio URL...');
      const audioUrl = await this.getAudioUrlWithFallback(surahNumber, ayahNumber);
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
      
      const errorMessage = error instanceof Error ? error.message : 'تعذّر تشغيل الآية';
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

  async clearCache(): Promise<void> {
    this.audioCache = {};
    await AsyncStorage.removeItem('audioUrlCache');
    console.log('🗑️ Audio cache cleared');
  }
}

export const audioService = new AudioService();
