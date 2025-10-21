
import { Audio } from 'expo-av';
import { Reciter } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioCache {
  [key: string]: string;
}

interface RecitationMapping {
  [key: string]: number;
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
  private recitationMapping: RecitationMapping = {};
  private isLoadingRecitations = false;

  // Target reciter names to match from Quran.com API
  private targetReciters = [
    'Ali Jaber',
    'Ahmed Al Ajmy',
    'Abdulbasit',
    'Maher Al-Muaiqly',
    'Yasser Al-Dosari'
  ];

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
      
      // Load cached reciter from localStorage
      const savedReciter = await AsyncStorage.getItem('selectedReciter');
      if (savedReciter) {
        this.currentReciterId = parseInt(savedReciter, 10);
        console.log('📂 Loaded saved reciter:', savedReciter);
      }

      // Load recitation mapping from cache or fetch
      await this.loadRecitationMapping();

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

  private normalizeReciterName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async loadRecitationMapping() {
    try {
      // Try to load from cache first
      const cached = await AsyncStorage.getItem('recitationMapping');
      if (cached) {
        this.recitationMapping = JSON.parse(cached);
        console.log('📦 Loaded recitation mapping from cache:', this.recitationMapping);
        return;
      }

      // If not cached, fetch from API
      await this.fetchRecitationMapping();
    } catch (error) {
      console.error('⚠️ Error loading recitation mapping:', error);
      // Use fallback mapping if fetch fails
      this.useFallbackMapping();
    }
  }

  private async fetchRecitationMapping() {
    if (this.isLoadingRecitations) {
      console.log('⏳ Already loading recitations, skipping...');
      return;
    }

    this.isLoadingRecitations = true;

    try {
      console.log('🌐 Fetching recitation IDs from Quran.com API...');
      
      const response = await this.fetchWithTimeout(
        'https://api.quran.com/api/v4/resources/recitations',
        { timeout: 10000 }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const recitations = data.recitations || [];

      console.log(`📋 Found ${recitations.length} recitations from API`);

      // Match target reciters
      const mapping: RecitationMapping = {};
      
      for (const targetName of this.targetReciters) {
        const normalized = this.normalizeReciterName(targetName);
        
        const match = recitations.find((r: any) => {
          const reciterName = this.normalizeReciterName(r.reciter_name || '');
          return reciterName.includes(normalized) || normalized.includes(reciterName);
        });

        if (match) {
          mapping[targetName] = match.id;
          console.log(`✅ Matched "${targetName}" -> ID ${match.id} (${match.reciter_name})`);
        } else {
          console.warn(`⚠️ No match found for "${targetName}"`);
        }
      }

      // Save mapping to cache
      this.recitationMapping = mapping;
      await AsyncStorage.setItem('recitationMapping', JSON.stringify(mapping));
      console.log('💾 Saved recitation mapping to cache');

    } catch (error) {
      console.error('❌ Error fetching recitation mapping:', error);
      this.useFallbackMapping();
    } finally {
      this.isLoadingRecitations = false;
    }
  }

  private useFallbackMapping() {
    console.log('⚠️ Using fallback recitation mapping');
    // Fallback IDs based on known working values
    this.recitationMapping = {
      'Ali Jaber': 9,
      'Ahmed Al Ajmy': 5,
      'Abdulbasit': 2,
      'Maher Al-Muaiqly': 6,
      'Yasser Al-Dosari': 8
    };
  }

  private getRecitationId(reciterId: number): number {
    // Map internal reciter IDs to Quran.com recitation IDs
    const reciterNameMap: { [key: number]: string } = {
      7: 'Ali Jaber',
      5: 'Ahmed Al Ajmy',
      2: 'Abdulbasit',
      6: 'Maher Al-Muaiqly',
      12: 'Yasser Al-Dosari'
    };

    const reciterName = reciterNameMap[reciterId];
    if (reciterName && this.recitationMapping[reciterName]) {
      return this.recitationMapping[reciterName];
    }

    // Default to Abdulbasit (recitation ID 2)
    console.warn(`⚠️ No recitation ID found for reciter ${reciterId}, using default (2)`);
    return 2;
  }

  async getReciters(): Promise<Reciter[]> {
    if (this.reciters.length > 0) {
      return this.reciters;
    }

    try {
      console.log('Setting up reciters...');
      
      // Ensure recitation mapping is loaded
      if (Object.keys(this.recitationMapping).length === 0) {
        await this.loadRecitationMapping();
      }

      // Define the 5 required reciters
      this.reciters = [
        { 
          id: 7, 
          name: 'علي جابر', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: this.getRecitationId(7)
        },
        { 
          id: 5, 
          name: 'أحمد العجمي', 
          letter: 'أ', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: this.getRecitationId(5)
        },
        { 
          id: 2, 
          name: 'عبد الباسط عبد الصمد', 
          letter: 'ع', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: this.getRecitationId(2)
        },
        { 
          id: 6, 
          name: 'ماهر المعيقلي', 
          letter: 'م', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: this.getRecitationId(6)
        },
        { 
          id: 12, 
          name: 'ياسر الدوسري', 
          letter: 'ي', 
          rewaya: 'حفص عن عاصم', 
          count: 114, 
          server: 'quran_cdn',
          recitationId: this.getRecitationId(12)
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
      
      // Zero-pad to 3 digits as per Quran.com CDN format
      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const paddedAyah = ayahNumber.toString().padStart(3, '0');
      const url = `https://verses.quran.com/${recitationId}/${paddedSurah}${paddedAyah}.mp3`;
      
      return url;
    } catch (error) {
      console.error('❌ Error building audio URL:', error);
      throw error;
    }
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

  private async getAudioUrlFromApi(recitationId: number, surahNumber: number, ayahNumber: number): Promise<string | null> {
    try {
      console.log(`🌐 Fetching audio URL from API for ${surahNumber}:${ayahNumber} with recitation ${recitationId}...`);
      
      const apiUrl = `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?audio=${recitationId}`;
      
      const response = await this.fetchWithTimeout(apiUrl, { timeout: 10000 });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      const audioUrl = data?.verse?.audio?.url || data?.audio?.url || data?.audio_files?.[0]?.url;
      
      if (audioUrl) {
        console.log('✅ Got audio URL from API:', audioUrl);
        return audioUrl;
      } else {
        console.warn('⚠️ No audio URL in API response');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
      return null;
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

    // Get recitation ID for this reciter
    const recitationId = this.getRecitationId(reciterId);
    
    console.log(`\n🎵 Resolving audio URL for reciter ${reciterId} (recitation ${recitationId}), Surah ${surahNumber}, Ayah ${ayahNumber}`);
    
    // Step 1: Try CDN URL
    console.log('📍 Step 1: Trying CDN URL...');
    let audioUrl = this.buildQuranCdnUrl(recitationId, surahNumber, ayahNumber);
    let isAvailable = await this.checkAudioUrlWithRetry(audioUrl, 3);
    
    if (isAvailable) {
      console.log('✅ CDN URL works!');
      this.audioCache[cacheKey] = audioUrl;
      await this.saveAudioCache();
      return audioUrl;
    }
    
    // Step 2: Try API fallback
    console.log('📍 Step 2: CDN failed, trying API fallback...');
    const apiUrl = await this.getAudioUrlFromApi(recitationId, surahNumber, ayahNumber);
    
    if (apiUrl) {
      const apiUrlValid = await this.checkAudioUrlWithRetry(apiUrl, 2);
      if (apiUrlValid) {
        console.log('✅ API URL works!');
        this.audioCache[cacheKey] = apiUrl;
        await this.saveAudioCache();
        return apiUrl;
      }
    }
    
    // Step 3: Final fallback to Mishary (recitation ID 1)
    if (recitationId !== 1) {
      console.log('📍 Step 3: Trying final fallback to Mishary Rashid (recitation ID 1)...');
      
      const misharyUrl = this.buildQuranCdnUrl(1, surahNumber, ayahNumber);
      const misharyAvailable = await this.checkAudioUrlWithRetry(misharyUrl, 2);
      
      if (misharyAvailable) {
        console.log('✅ Mishary fallback works!');
        // Don't cache Mishary fallback with original reciter key
        return misharyUrl;
      }
      
      // Try Mishary via API
      const misharyApiUrl = await this.getAudioUrlFromApi(1, surahNumber, ayahNumber);
      if (misharyApiUrl) {
        const misharyApiValid = await this.checkAudioUrlWithRetry(misharyApiUrl, 1);
        if (misharyApiValid) {
          console.log('✅ Mishary API fallback works!');
          return misharyApiUrl;
        }
      }
    }
    
    // All attempts failed
    console.error('❌ All audio URL resolution attempts failed');
    throw new Error('تعذّر تشغيل الآية. الملف الصوتي غير متوفر حالياً.');
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

      // Get audio URL with fallback chain
      console.log('🔍 Resolving audio URL...');
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

  async clearCache(): Promise<void> {
    this.audioCache = {};
    await AsyncStorage.removeItem('audioUrlCache');
    await AsyncStorage.removeItem('recitationMapping');
    this.recitationMapping = {};
    console.log('🗑️ Audio cache and recitation mapping cleared');
  }

  async refreshRecitationMapping(): Promise<void> {
    await AsyncStorage.removeItem('recitationMapping');
    this.recitationMapping = {};
    await this.fetchRecitationMapping();
  }
}

export const audioService = new AudioService();
