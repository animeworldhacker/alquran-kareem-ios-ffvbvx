
import { QuranData, Surah, Ayah } from '../types';
import { processAyahText, validateTextProcessing } from '../utils/textProcessor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkUtils } from '../utils/networkUtils';

class QuranService {
  private baseUrl = 'https://api.alquran.cloud/v1';
  private cachedQuran: QuranData | null = null;
  private processingStats = {
    totalSurahs: 0,
    processedSurahs: 0,
    bismillahRemoved: 0,
    processingErrors: 0
  };
  private readonly QURAN_STORAGE_KEY = 'quran_full_data';
  private readonly QURAN_VERSION_KEY = 'quran_data_version';
  private readonly CURRENT_VERSION = '1.0';

  async getFullQuran(): Promise<QuranData> {
    if (this.cachedQuran) {
      console.log('Returning cached Quran data from memory');
      return this.cachedQuran;
    }

    try {
      // Try to load from local storage first
      console.log('Checking local storage for Quran data...');
      const storedData = await this.loadFromStorage();
      
      if (storedData) {
        console.log('✅ Loaded Quran data from local storage (offline mode)');
        this.cachedQuran = storedData;
        return this.cachedQuran;
      }

      // Check network connectivity before fetching
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        throw new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
      }

      // If not in storage, fetch from API
      console.log('Fetching Quran data from API...');
      const response = await this.fetchWithTimeout(`${this.baseUrl}/quran/quran-uthmani`, 30000);
      
      if (!response.ok) {
        throw new Error(`فشل في تحميل البيانات. رمز الخطأ: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        console.log('Processing Quran data to remove Bismillah from all first verses...');
        const processedData = this.processQuranData(data.data);
        this.cachedQuran = processedData;
        
        // Save to local storage for offline use
        await this.saveToStorage(processedData);
        
        console.log('Quran data processing completed:', this.processingStats);
        
        return this.cachedQuran;
      } else {
        throw new Error(`خطأ في البيانات المستلمة: ${data.status || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error fetching Quran:', error);
      
      // Try one more time to load from storage as fallback
      const fallbackData = await this.loadFromStorage();
      if (fallbackData) {
        console.log('⚠️ Using offline data as fallback');
        this.cachedQuran = fallbackData;
        return this.cachedQuran;
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في تحميل بيانات القرآن الكريم');
    }
  }

  private async fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
      }
      throw error;
    }
  }

  private async loadFromStorage(): Promise<QuranData | null> {
    try {
      const [storedData, storedVersion] = await Promise.all([
        AsyncStorage.getItem(this.QURAN_STORAGE_KEY),
        AsyncStorage.getItem(this.QURAN_VERSION_KEY)
      ]);

      if (storedData && storedVersion === this.CURRENT_VERSION) {
        const parsed = JSON.parse(storedData);
        console.log(`📦 Loaded Quran data from storage (${parsed.surahs?.length || 0} surahs)`);
        return parsed;
      } else if (storedData && storedVersion !== this.CURRENT_VERSION) {
        console.log('⚠️ Stored Quran data version mismatch, will fetch fresh data');
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading Quran from storage:', error);
      return null;
    }
  }

  private async saveToStorage(data: QuranData): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.QURAN_STORAGE_KEY, JSON.stringify(data)),
        AsyncStorage.setItem(this.QURAN_VERSION_KEY, this.CURRENT_VERSION)
      ]);
      console.log('💾 Saved Quran data to local storage for offline use');
    } catch (error) {
      console.error('Error saving Quran to storage:', error);
    }
  }

  async getSurah(surahNumber: number): Promise<any> {
    try {
      console.log(`Fetching individual Surah ${surahNumber}...`);
      
      if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
        throw new Error(`رقم سورة غير صحيح: ${surahNumber}`);
      }
      
      // Try to get from cached data first
      if (this.cachedQuran && this.cachedQuran.surahs) {
        const cachedSurah = this.cachedQuran.surahs.find(s => s.number === surahNumber);
        if (cachedSurah) {
          console.log(`Returning cached Surah ${surahNumber}`);
          return {
            number: cachedSurah.number,
            name: cachedSurah.name,
            englishName: cachedSurah.englishName,
            englishNameTranslation: cachedSurah.englishNameTranslation,
            numberOfAyahs: cachedSurah.numberOfAyahs,
            revelationType: cachedSurah.revelationType,
            ayahs: cachedSurah.ayahs
          };
        }
      }
      
      // Try to load full Quran from storage
      const storedQuran = await this.loadFromStorage();
      if (storedQuran && storedQuran.surahs) {
        const storedSurah = storedQuran.surahs.find(s => s.number === surahNumber);
        if (storedSurah) {
          console.log(`Returning Surah ${surahNumber} from storage (offline)`);
          return {
            number: storedSurah.number,
            name: storedSurah.name,
            englishName: storedSurah.englishName,
            englishNameTranslation: storedSurah.englishNameTranslation,
            numberOfAyahs: storedSurah.numberOfAyahs,
            revelationType: storedSurah.revelationType,
            ayahs: storedSurah.ayahs
          };
        }
      }
      
      // Check network connectivity before fetching
      const isConnected = await networkUtils.isConnected();
      if (!isConnected) {
        throw new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
      }
      
      // Fetch individual surah if not in cache or storage
      const response = await this.fetchWithTimeout(`${this.baseUrl}/surah/${surahNumber}/ar.asad`, 15000);
      
      if (!response.ok) {
        throw new Error(`فشل في تحميل السورة. رمز الخطأ: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const processedSurah = this.processSurahData(data.data, surahNumber);
        console.log(`Surah ${surahNumber} fetched and processed successfully`);
        return processedSurah;
      } else {
        throw new Error(`خطأ في البيانات المستلمة: ${data.status || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`فشل في تحميل السورة ${surahNumber}`);
    }
  }

  async getSurahs(): Promise<Surah[]> {
    try {
      const quranData = await this.getFullQuran();
      
      if (!quranData || !quranData.surahs || !Array.isArray(quranData.surahs)) {
        throw new Error('بيانات القرآن غير صحيحة');
      }
      
      return quranData.surahs.map(surah => ({
        number: surah.number || 0,
        name: surah.name || '',
        englishName: surah.englishName || '',
        englishNameTranslation: surah.englishNameTranslation || '',
        numberOfAyahs: surah.numberOfAyahs || 0,
        revelationType: surah.revelationType || '',
      }));
    } catch (error) {
      console.error('Error getting surahs:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في تحميل قائمة السور');
    }
  }

  private processQuranData(quranData: QuranData): QuranData {
    console.log('Processing Quran data to remove Bismillah from first verses and fix verse numbering...');
    
    this.processingStats = {
      totalSurahs: quranData.surahs.length,
      processedSurahs: 0,
      bismillahRemoved: 0,
      processingErrors: 0
    };
    
    const processedSurahs = quranData.surahs.map(surah => {
      try {
        this.processingStats.processedSurahs++;
        
        if (surah.ayahs && Array.isArray(surah.ayahs)) {
          const processedAyahs = surah.ayahs.map(ayah => {
            try {
              const originalText = ayah.text || '';
              const processedText = processAyahText(originalText, surah.number, ayah.numberInSurah);
              
              const validation = validateTextProcessing(originalText, processedText, surah.number, ayah.numberInSurah);
              
              if (ayah.numberInSurah === 1 && originalText !== processedText) {
                this.processingStats.bismillahRemoved++;
                console.log(`✓ Bismillah removed from Surah ${surah.number}:1`);
              }
              
              if (validation.hasIssues) {
                console.warn(`Processing issue in Surah ${surah.number}:${ayah.numberInSurah}: ${validation.details}`);
              }
              
              return {
                ...ayah,
                text: processedText
              };
            } catch (ayahError) {
              console.error(`Error processing ayah ${surah.number}:${ayah.numberInSurah}:`, ayahError);
              this.processingStats.processingErrors++;
              return ayah;
            }
          });
          
          const filteredAyahs = processedAyahs.filter(ayah => {
            const hasContent = ayah.text && ayah.text.trim().length > 0;
            if (!hasContent) {
              console.log(`Filtering out empty ayah ${surah.number}:${ayah.numberInSurah} after Bismillah removal`);
            }
            return hasContent;
          });
          
          const renumberedAyahs = filteredAyahs.map((ayah, index) => ({
            ...ayah,
            numberInSurah: index + 1
          }));
          
          const updatedSurah = {
            ...surah,
            ayahs: renumberedAyahs,
            numberOfAyahs: renumberedAyahs.length
          };
          
          console.log(`Surah ${surah.number}: ${surah.ayahs.length} → ${renumberedAyahs.length} ayahs after processing`);
          
          return updatedSurah;
        }
        
        return surah;
      } catch (surahError) {
        console.error(`Error processing Surah ${surah.number}:`, surahError);
        this.processingStats.processingErrors++;
        return surah;
      }
    });

    console.log(`Finished processing Quran data:`, {
      totalSurahs: this.processingStats.totalSurahs,
      processedSurahs: this.processingStats.processedSurahs,
      bismillahRemoved: this.processingStats.bismillahRemoved,
      processingErrors: this.processingStats.processingErrors,
      successRate: `${((this.processingStats.processedSurahs / this.processingStats.totalSurahs) * 100).toFixed(1)}%`
    });
    
    const expectedRemovals = this.processingStats.totalSurahs - 1;
    if (this.processingStats.bismillahRemoved < expectedRemovals) {
      console.warn(`Warning: Expected ${expectedRemovals} Bismillah removals, but only ${this.processingStats.bismillahRemoved} were processed`);
    }
    
    return {
      ...quranData,
      surahs: processedSurahs
    };
  }

  private processSurahData(surahData: any, surahNumber: number): any {
    console.log(`Processing individual Surah ${surahNumber} data to remove Bismillah and fix verse numbering...`);
    
    if (surahData.ayahs && Array.isArray(surahData.ayahs)) {
      const processedAyahs = surahData.ayahs.map((ayah: any) => {
        try {
          const originalText = ayah.text || '';
          const processedText = processAyahText(originalText, surahNumber, ayah.numberInSurah);
          
          const validation = validateTextProcessing(originalText, processedText, surahNumber, ayah.numberInSurah);
          
          if (validation.hasIssues) {
            console.warn(`Processing issue in individual Surah ${surahNumber}:${ayah.numberInSurah}: ${validation.details}`);
          }
          
          return {
            ...ayah,
            text: processedText
          };
        } catch (error) {
          console.error(`Error processing ayah ${surahNumber}:${ayah.numberInSurah}:`, error);
          return ayah;
        }
      });
      
      const filteredAyahs = processedAyahs.filter((ayah: any) => {
        const hasContent = ayah.text && ayah.text.trim().length > 0;
        if (!hasContent) {
          console.log(`Filtering out empty ayah ${surahNumber}:${ayah.numberInSurah} after Bismillah removal`);
        }
        return hasContent;
      });
      
      const renumberedAyahs = filteredAyahs.map((ayah: any, index: number) => ({
        ...ayah,
        numberInSurah: index + 1
      }));
      
      console.log(`Individual Surah ${surahNumber}: ${surahData.ayahs.length} → ${renumberedAyahs.length} ayahs after processing`);
      
      return {
        ...surahData,
        ayahs: renumberedAyahs,
        numberOfAyahs: renumberedAyahs.length
      };
    }
    
    return surahData;
  }

  async clearCache(): Promise<void> {
    try {
      console.log('Clearing Quran cache');
      this.cachedQuran = null;
      this.processingStats = {
        totalSurahs: 0,
        processedSurahs: 0,
        bismillahRemoved: 0,
        processingErrors: 0
      };
      
      await AsyncStorage.multiRemove([this.QURAN_STORAGE_KEY, this.QURAN_VERSION_KEY]);
      console.log('✅ Cleared Quran data from storage');
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('فشل في مسح ذاكرة التخزين المؤقت');
    }
  }

  isCached(): boolean {
    return this.cachedQuran !== null;
  }

  async isStoredOffline(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(this.QURAN_STORAGE_KEY);
      return stored !== null;
    } catch {
      return false;
    }
  }

  getProcessingStats() {
    return { ...this.processingStats };
  }

  async forceReprocess(): Promise<void> {
    console.log('Force reprocessing Quran data...');
    await this.clearCache();
    await this.getFullQuran();
  }

  async getAyahsByJuz(juzNumber: number): Promise<Ayah[]> {
    try {
      console.log(`Getting ayahs for Juz ${juzNumber}...`);
      const quranData = await this.getFullQuran();
      
      const ayahs: Ayah[] = [];
      for (const surah of quranData.surahs) {
        for (const ayah of surah.ayahs) {
          if (ayah.juz === juzNumber) {
            ayahs.push(ayah);
          }
        }
      }
      
      console.log(`Found ${ayahs.length} ayahs in Juz ${juzNumber}`);
      return ayahs;
    } catch (error) {
      console.error(`Error getting ayahs for Juz ${juzNumber}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`فشل في تحميل الجزء ${juzNumber}`);
    }
  }

  async getSurahNumberForAyah(ayahNumber: number): Promise<number> {
    try {
      const quranData = await this.getFullQuran();
      
      for (const surah of quranData.surahs) {
        for (const ayah of surah.ayahs) {
          if (ayah.number === ayahNumber) {
            return surah.number;
          }
        }
      }
      
      throw new Error(`الآية ${ayahNumber} غير موجودة`);
    } catch (error) {
      console.error(`Error getting surah number for ayah ${ayahNumber}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`فشل في العثور على الآية ${ayahNumber}`);
    }
  }
}

export const quranService = new QuranService();
