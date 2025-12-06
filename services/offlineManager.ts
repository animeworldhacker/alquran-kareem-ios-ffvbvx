
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quranService } from './quranService';
import { tafsirService } from './tafsirService';
import { audioService } from './audioService';
import { networkUtils } from '../utils/networkUtils';

interface OfflineStatus {
  quranData: {
    downloaded: boolean;
    size: string;
    lastUpdated: string | null;
  };
  tafsirData: {
    cachedAyahs: number;
    size: string;
  };
  audioData: {
    totalAyahs: number;
    size: string;
    surahs: number[];
  };
  totalSize: string;
  isFullyOffline: boolean;
}

interface DownloadProgress {
  type: 'quran' | 'tafsir' | 'audio';
  current: number;
  total: number;
  percentage: number;
  status: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;

class OfflineManager {
  private readonly OFFLINE_STATUS_KEY = 'offline_status';
  private readonly LAST_SYNC_KEY = 'last_sync_timestamp';

  /**
   * Get comprehensive offline status
   */
  async getOfflineStatus(): Promise<OfflineStatus> {
    try {
      // Check Quran data
      const quranStored = await quranService.isStoredOffline();
      const quranData = await AsyncStorage.getItem('quran_full_data');
      const quranSize = quranData ? (new Blob([quranData]).size / (1024 * 1024)).toFixed(2) : '0';
      const quranVersion = await AsyncStorage.getItem('quran_data_version');

      // Check Tafsir data
      const tafsirStats = tafsirService.getCacheStats();
      const tafsirData = await AsyncStorage.getItem('tafsir_cache');
      const tafsirSize = tafsirData ? (new Blob([tafsirData]).size / (1024 * 1024)).toFixed(2) : '0';

      // Check Audio data
      const audioStats = await audioService.getDownloadStats();

      // Calculate total size
      const totalSizeMB = parseFloat(quranSize) + parseFloat(tafsirSize) + parseFloat(audioStats.totalSize.replace(' MB', ''));

      // Get last sync time
      const lastSync = await AsyncStorage.getItem(this.LAST_SYNC_KEY);

      return {
        quranData: {
          downloaded: quranStored,
          size: `${quranSize} MB`,
          lastUpdated: lastSync,
        },
        tafsirData: {
          cachedAyahs: tafsirStats.cacheSize,
          size: `${tafsirSize} MB`,
        },
        audioData: {
          totalAyahs: audioStats.totalAyahs,
          size: audioStats.totalSize,
          surahs: audioStats.surahs,
        },
        totalSize: `${totalSizeMB.toFixed(2)} MB`,
        isFullyOffline: quranStored && tafsirStats.cacheSize > 0,
      };
    } catch (error) {
      console.error('Error getting offline status:', error);
      return {
        quranData: { downloaded: false, size: '0 MB', lastUpdated: null },
        tafsirData: { cachedAyahs: 0, size: '0 MB' },
        audioData: { totalAyahs: 0, size: '0 MB', surahs: [] },
        totalSize: '0 MB',
        isFullyOffline: false,
      };
    }
  }

  /**
   * Download all Quran data for offline use
   */
  async downloadQuranData(onProgress?: ProgressCallback): Promise<void> {
    try {
      console.log('📥 Starting Quran data download...');
      
      if (onProgress) {
        onProgress({
          type: 'quran',
          current: 0,
          total: 1,
          percentage: 0,
          status: 'جاري تحميل بيانات القرآن الكريم...',
        });
      }

      // Check network
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        throw new Error('لا يوجد اتصال بالإنترنت');
      }

      // Download full Quran
      await quranService.getFullQuran();

      if (onProgress) {
        onProgress({
          type: 'quran',
          current: 1,
          total: 1,
          percentage: 100,
          status: 'تم تحميل بيانات القرآن الكريم بنجاح',
        });
      }

      // Update last sync time
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());

      console.log('✅ Quran data downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading Quran data:', error);
      throw error;
    }
  }

  /**
   * Download Tafsir for all ayahs (or a specific range)
   */
  async downloadTafsirData(
    surahStart: number = 1,
    surahEnd: number = 114,
    onProgress?: ProgressCallback
  ): Promise<void> {
    try {
      console.log(`📥 Starting Tafsir download for Surahs ${surahStart}-${surahEnd}...`);

      // Check network
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        throw new Error('لا يوجد اتصال بالإنترنت');
      }

      // Get Quran data to know how many ayahs
      const quranData = await quranService.getFullQuran();
      
      let totalAyahs = 0;
      let processedAyahs = 0;

      // Calculate total ayahs in range
      for (let surahNum = surahStart; surahNum <= surahEnd; surahNum++) {
        const surah = quranData.surahs.find(s => s.number === surahNum);
        if (surah) {
          totalAyahs += surah.ayahs.length;
        }
      }

      console.log(`Total ayahs to download tafsir for: ${totalAyahs}`);

      // Download tafsir for each ayah
      for (let surahNum = surahStart; surahNum <= surahEnd; surahNum++) {
        const surah = quranData.surahs.find(s => s.number === surahNum);
        if (!surah) continue;

        for (const ayah of surah.ayahs) {
          try {
            await tafsirService.getTafsir(surahNum, ayah.numberInSurah);
            processedAyahs++;

            if (onProgress) {
              onProgress({
                type: 'tafsir',
                current: processedAyahs,
                total: totalAyahs,
                percentage: Math.round((processedAyahs / totalAyahs) * 100),
                status: `جاري تحميل التفسير... (${processedAyahs}/${totalAyahs})`,
              });
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to download tafsir for ${surahNum}:${ayah.numberInSurah}:`, error);
            // Continue with next ayah
          }
        }
      }

      console.log(`✅ Tafsir download completed: ${processedAyahs}/${totalAyahs} ayahs`);
    } catch (error) {
      console.error('❌ Error downloading Tafsir data:', error);
      throw error;
    }
  }

  /**
   * Download audio for specific surahs
   */
  async downloadAudioData(
    surahs: number[],
    onProgress?: ProgressCallback
  ): Promise<void> {
    try {
      console.log(`📥 Starting audio download for ${surahs.length} surahs...`);

      // Check network
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        throw new Error('لا يوجد اتصال بالإنترنت');
      }

      let totalAyahs = 0;
      let processedAyahs = 0;

      // Calculate total ayahs
      for (const surahNum of surahs) {
        const surah = await quranService.getSurah(surahNum);
        if (surah) {
          totalAyahs += surah.ayahs.length;
        }
      }

      console.log(`Total ayahs to download audio for: ${totalAyahs}`);

      // Download audio for each ayah
      for (const surahNum of surahs) {
        const surah = await quranService.getSurah(surahNum);
        if (!surah) continue;

        for (const ayah of surah.ayahs) {
          try {
            await audioService.downloadAyah(surahNum, ayah.numberInSurah);
            processedAyahs++;

            if (onProgress) {
              onProgress({
                type: 'audio',
                current: processedAyahs,
                total: totalAyahs,
                percentage: Math.round((processedAyahs / totalAyahs) * 100),
                status: `جاري تحميل التلاوات... (${processedAyahs}/${totalAyahs})`,
              });
            }

            // Add small delay to avoid overwhelming the network
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error(`Failed to download audio for ${surahNum}:${ayah.numberInSurah}:`, error);
            // Continue with next ayah
          }
        }
      }

      console.log(`✅ Audio download completed: ${processedAyahs}/${totalAyahs} ayahs`);
    } catch (error) {
      console.error('❌ Error downloading audio data:', error);
      throw error;
    }
  }

  /**
   * Download everything for complete offline access
   */
  async downloadAllData(onProgress?: ProgressCallback): Promise<void> {
    try {
      console.log('📥 Starting complete offline download...');

      // Step 1: Download Quran data
      await this.downloadQuranData(onProgress);

      // Step 2: Download Tafsir for all ayahs
      await this.downloadTafsirData(1, 114, onProgress);

      // Step 3: Download audio for all surahs
      const allSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
      await this.downloadAudioData(allSurahs, onProgress);

      console.log('✅ Complete offline download finished');
    } catch (error) {
      console.error('❌ Error in complete download:', error);
      throw error;
    }
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all offline data...');

      await Promise.all([
        quranService.clearCache(),
        tafsirService.clearCache(),
        audioService.clearCache(),
        audioService.clearDownloadedAudio(),
        AsyncStorage.removeItem(this.OFFLINE_STATUS_KEY),
        AsyncStorage.removeItem(this.LAST_SYNC_KEY),
      ]);

      console.log('✅ All offline data cleared');
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      throw error;
    }
  }

  /**
   * Check if app can work fully offline
   */
  async canWorkOffline(): Promise<boolean> {
    try {
      const status = await this.getOfflineStatus();
      return status.isFullyOffline;
    } catch (error) {
      console.error('Error checking offline capability:', error);
      return false;
    }
  }

  /**
   * Prefetch data for a specific surah (Quran + Tafsir + Audio)
   */
  async prefetchSurah(surahNumber: number, onProgress?: ProgressCallback): Promise<void> {
    try {
      console.log(`📥 Prefetching data for Surah ${surahNumber}...`);

      // Check network
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        throw new Error('لا يوجد اتصال بالإنترنت');
      }

      // Get surah data
      const surah = await quranService.getSurah(surahNumber);
      if (!surah) {
        throw new Error(`السورة ${surahNumber} غير موجودة`);
      }

      const totalSteps = surah.ayahs.length * 2; // Tafsir + Audio for each ayah
      let currentStep = 0;

      // Download Tafsir
      for (const ayah of surah.ayahs) {
        try {
          await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
          currentStep++;

          if (onProgress) {
            onProgress({
              type: 'tafsir',
              current: currentStep,
              total: totalSteps,
              percentage: Math.round((currentStep / totalSteps) * 100),
              status: `جاري تحميل التفسير... (${currentStep}/${totalSteps})`,
            });
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to prefetch tafsir for ${surahNumber}:${ayah.numberInSurah}:`, error);
        }
      }

      // Download Audio
      for (const ayah of surah.ayahs) {
        try {
          await audioService.downloadAyah(surahNumber, ayah.numberInSurah);
          currentStep++;

          if (onProgress) {
            onProgress({
              type: 'audio',
              current: currentStep,
              total: totalSteps,
              percentage: Math.round((currentStep / totalSteps) * 100),
              status: `جاري تحميل التلاوات... (${currentStep}/${totalSteps})`,
            });
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Failed to prefetch audio for ${surahNumber}:${ayah.numberInSurah}:`, error);
        }
      }

      console.log(`✅ Prefetch completed for Surah ${surahNumber}`);
    } catch (error) {
      console.error(`❌ Error prefetching Surah ${surahNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get estimated download size
   */
  async getEstimatedDownloadSize(): Promise<{
    quran: string;
    tafsir: string;
    audio: string;
    total: string;
  }> {
    return {
      quran: '~2 MB',
      tafsir: '~50 MB',
      audio: '~500 MB',
      total: '~552 MB',
    };
  }
}

export const offlineManager = new OfflineManager();
