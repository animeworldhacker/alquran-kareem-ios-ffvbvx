
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TafsirCacheEntry {
  text: string;
  timestamp: number;
}

interface TafsirCache {
  [key: string]: TafsirCacheEntry;
}

class TafsirService {
  private quranComBaseUrl = 'https://api.quran.com/api/v4';
  private tafsirId: number | null = null;
  private tafsirCache: Map<string, string> = new Map();
  private loadingTafsirKeys: Set<string> = new Set();
  private errorTafsirKeys: Map<string, string> = new Map();
  private maxCacheSize = 100; // LRU cache size
  private cacheStorageKey = 'tafsir_cache';
  private tafsirIdStorageKey = 'tafsir_ibn_kathir_id';
  private requestQueue: Map<string, Promise<string>> = new Map();

  constructor() {
    this.initializeTafsirId();
    this.loadPersistentCache();
  }

  /**
   * Initialize and fetch the correct Arabic Ibn Kathir tafsir ID from Quran.com
   */
  private async initializeTafsirId(): Promise<void> {
    try {
      // Try to load from storage first
      const storedId = await AsyncStorage.getItem(this.tafsirIdStorageKey);
      if (storedId) {
        this.tafsirId = parseInt(storedId, 10);
        console.log(`Loaded cached Tafsir Ibn Kathir ID: ${this.tafsirId}`);
        return;
      }

      // Fetch from API
      console.log('Fetching tafsir editions from Quran.com...');
      const response = await this.fetchWithRetry(
        `${this.quranComBaseUrl}/resources/tafsirs`,
        3,
        5000
      );

      const data = await response.json();
      
      if (data && data.tafsirs && Array.isArray(data.tafsirs)) {
        // Find Arabic Ibn Kathir tafsir
        const ibnKathir = data.tafsirs.find((tafsir: any) => 
          tafsir.slug === 'ar-tafsir-ibn-kathir' ||
          (tafsir.name && tafsir.name.includes('Ibn Kathir') && tafsir.language_name === 'arabic')
        );

        if (ibnKathir) {
          this.tafsirId = ibnKathir.id;
          await AsyncStorage.setItem(this.tafsirIdStorageKey, this.tafsirId.toString());
          console.log(`Found and cached Tafsir Ibn Kathir ID: ${this.tafsirId}`);
        } else {
          // Default to ID 14 if not found
          this.tafsirId = 14;
          console.warn('Ibn Kathir tafsir not found in API, using default ID: 14');
        }
      } else {
        this.tafsirId = 14;
        console.warn('Invalid tafsir list response, using default ID: 14');
      }
    } catch (error) {
      console.error('Error initializing tafsir ID:', error);
      this.tafsirId = 14; // Fallback to known ID
    }
  }

  /**
   * Load persistent cache from AsyncStorage
   */
  private async loadPersistentCache(): Promise<void> {
    try {
      const cacheJson = await AsyncStorage.getItem(this.cacheStorageKey);
      if (cacheJson) {
        const cache: TafsirCache = JSON.parse(cacheJson);
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        // Load valid cache entries
        Object.entries(cache).forEach(([key, entry]) => {
          if (now - entry.timestamp < maxAge) {
            this.tafsirCache.set(key, entry.text);
          }
        });

        console.log(`Loaded ${this.tafsirCache.size} tafsir entries from persistent cache`);
      }
    } catch (error) {
      console.error('Error loading persistent cache:', error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async savePersistentCache(): Promise<void> {
    try {
      const cache: TafsirCache = {};
      const now = Date.now();

      this.tafsirCache.forEach((text, key) => {
        cache[key] = {
          text,
          timestamp: now,
        };
      });

      await AsyncStorage.setItem(this.cacheStorageKey, JSON.stringify(cache));
      console.log(`Saved ${Object.keys(cache).length} tafsir entries to persistent cache`);
    } catch (error) {
      console.error('Error saving persistent cache:', error);
    }
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry(
    url: string,
    retries: number = 3,
    timeout: number = 10000,
    backoffMultiplier: number = 2
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : Math.pow(backoffMultiplier, attempt) * 1000;
          
          console.log(`Rate limited, retrying after ${delay}ms (attempt ${attempt + 1}/${retries})`);
          await this.delay(delay);
          continue;
        }

        // Handle server errors
        if (response.status >= 500) {
          const delay = Math.pow(backoffMultiplier, attempt) * 1000;
          console.log(`Server error ${response.status}, retrying after ${delay}ms (attempt ${attempt + 1}/${retries})`);
          await this.delay(delay);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log(`Request timeout (attempt ${attempt + 1}/${retries})`);
        } else {
          console.log(`Request failed (attempt ${attempt + 1}/${retries}):`, error);
        }

        if (attempt < retries - 1) {
          const delay = Math.pow(backoffMultiplier, attempt) * 1000;
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Delay helper for exponential backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate cache key
   */
  private getCacheKey(surah: number, ayah: number): string {
    return `${this.tafsirId}:${surah}:${ayah}`;
  }

  /**
   * Implement LRU cache eviction
   */
  private evictLRUCache(): void {
    if (this.tafsirCache.size >= this.maxCacheSize) {
      // Remove oldest entry (first entry in Map)
      const firstKey = this.tafsirCache.keys().next().value;
      if (firstKey) {
        this.tafsirCache.delete(firstKey);
        console.log(`Evicted cache entry: ${firstKey}`);
      }
    }
  }

  /**
   * Clean and format tafsir HTML/text
   */
  private cleanTafsirText(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove HTML tags but preserve paragraph breaks
    cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
    cleaned = cleaned.replace(/<\/p>/gi, '\n\n');
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    // Normalize whitespace
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\n\s+/g, '\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Main method to fetch tafsir for a specific ayah
   */
  async getTafsir(surah: number, ayah: number): Promise<string> {
    // Validate input
    if (!surah || !ayah || surah < 1 || surah > 114 || ayah < 1) {
      throw new Error(`Invalid parameters: surah ${surah}, ayah ${ayah}`);
    }

    // Wait for tafsir ID to be initialized
    if (this.tafsirId === null) {
      await this.initializeTafsirId();
    }

    const cacheKey = this.getCacheKey(surah, ayah);

    // Check cache first
    if (this.tafsirCache.has(cacheKey)) {
      console.log(`Cache hit for ${surah}:${ayah}`);
      return this.tafsirCache.get(cacheKey)!;
    }

    // Check if already loading (debounce)
    if (this.requestQueue.has(cacheKey)) {
      console.log(`Request already in progress for ${surah}:${ayah}, waiting...`);
      return this.requestQueue.get(cacheKey)!;
    }

    // Check if previous error
    if (this.errorTafsirKeys.has(cacheKey)) {
      const errorMsg = this.errorTafsirKeys.get(cacheKey)!;
      console.log(`Previous error for ${surah}:${ayah}: ${errorMsg}`);
    }

    // Create new request
    const requestPromise = this.fetchTafsirFromAPI(surah, ayah);
    this.requestQueue.set(cacheKey, requestPromise);
    this.loadingTafsirKeys.add(cacheKey);

    try {
      const tafsirText = await requestPromise;
      
      // Cache the result
      this.evictLRUCache();
      this.tafsirCache.set(cacheKey, tafsirText);
      this.errorTafsirKeys.delete(cacheKey);
      
      // Save to persistent storage (debounced)
      this.debouncedSaveCache();

      console.log(`Successfully fetched and cached tafsir for ${surah}:${ayah}`);
      return tafsirText;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.errorTafsirKeys.set(cacheKey, errorMsg);
      console.error(`Error fetching tafsir for ${surah}:${ayah}:`, error);
      throw error;
    } finally {
      this.loadingTafsirKeys.delete(cacheKey);
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Fetch tafsir from Quran.com API
   */
  private async fetchTafsirFromAPI(surah: number, ayah: number): Promise<string> {
    const url = `${this.quranComBaseUrl}/tafsirs/${this.tafsirId}/by_ayah/${surah}:${ayah}`;
    
    console.log(`Fetching tafsir from: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, 3, 10000);
      const data = await response.json();

      if (data && data.tafsir && data.tafsir.text) {
        const cleanedText = this.cleanTafsirText(data.tafsir.text);
        
        if (!cleanedText || cleanedText.length < 10) {
          throw new Error('Tafsir text is too short or empty');
        }

        return cleanedText;
      } else {
        throw new Error('Invalid tafsir response format');
      }
    } catch (error) {
      console.error(`Failed to fetch tafsir from API for ${surah}:${ayah}:`, error);
      throw new Error('تعذّر تحميل التفسير');
    }
  }

  /**
   * Debounced cache save
   */
  private saveTimeout: NodeJS.Timeout | null = null;
  private debouncedSaveCache(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.savePersistentCache();
    }, 5000); // Save after 5 seconds of inactivity
  }

  /**
   * Check if tafsir is loading
   */
  isLoading(surah: number, ayah: number): boolean {
    const cacheKey = this.getCacheKey(surah, ayah);
    return this.loadingTafsirKeys.has(cacheKey);
  }

  /**
   * Check if tafsir has error
   */
  hasError(surah: number, ayah: number): string | null {
    const cacheKey = this.getCacheKey(surah, ayah);
    return this.errorTafsirKeys.get(cacheKey) || null;
  }

  /**
   * Clear error for specific ayah
   */
  clearError(surah: number, ayah: number): void {
    const cacheKey = this.getCacheKey(surah, ayah);
    this.errorTafsirKeys.delete(cacheKey);
  }

  /**
   * Prefetch tafsir for a range of ayahs (for optimization)
   */
  async prefetchTafsirRange(surah: number, startAyah: number, endAyah: number): Promise<void> {
    console.log(`Prefetching tafsir for ${surah}:${startAyah}-${endAyah}`);
    
    const promises: Promise<string>[] = [];
    
    for (let ayah = startAyah; ayah <= endAyah; ayah++) {
      const cacheKey = this.getCacheKey(surah, ayah);
      
      // Only prefetch if not already cached or loading
      if (!this.tafsirCache.has(cacheKey) && !this.loadingTafsirKeys.has(cacheKey)) {
        promises.push(
          this.getTafsir(surah, ayah).catch(error => {
            console.log(`Prefetch failed for ${surah}:${ayah}:`, error);
            return ''; // Don't fail the whole prefetch
          })
        );
        
        // Add delay between requests to avoid rate limiting
        await this.delay(200);
      }
    }

    await Promise.all(promises);
    console.log(`Prefetch completed for ${surah}:${startAyah}-${endAyah}`);
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    this.tafsirCache.clear();
    this.errorTafsirKeys.clear();
    this.loadingTafsirKeys.clear();
    this.requestQueue.clear();
    
    try {
      await AsyncStorage.removeItem(this.cacheStorageKey);
      console.log('Tafsir cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    cacheSize: number;
    maxCacheSize: number;
    loadingCount: number;
    errorCount: number;
  } {
    return {
      cacheSize: this.tafsirCache.size,
      maxCacheSize: this.maxCacheSize,
      loadingCount: this.loadingTafsirKeys.size,
      errorCount: this.errorTafsirKeys.size,
    };
  }

  /**
   * Refresh tafsir (force refetch)
   */
  async refreshTafsir(surah: number, ayah: number): Promise<string> {
    const cacheKey = this.getCacheKey(surah, ayah);
    
    // Remove from cache
    this.tafsirCache.delete(cacheKey);
    this.errorTafsirKeys.delete(cacheKey);
    
    // Fetch fresh
    return this.getTafsir(surah, ayah);
  }
}

export const tafsirService = new TafsirService();
