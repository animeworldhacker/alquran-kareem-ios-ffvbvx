
import { QuranData, Surah, Ayah } from '../types';
import { processAyahText } from '../utils/textProcessor';

class QuranService {
  private baseUrl = 'https://api.alquran.cloud/v1';
  private cachedQuran: QuranData | null = null;

  async getFullQuran(): Promise<QuranData> {
    if (this.cachedQuran) {
      return this.cachedQuran;
    }

    try {
      console.log('Fetching Quran data...');
      const response = await fetch(`${this.baseUrl}/quran/quran-uthmani`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        // Process the Quran data to remove Bismillah from first verses
        const processedData = this.processQuranData(data.data);
        this.cachedQuran = processedData;
        console.log('Quran data fetched and processed successfully');
        return this.cachedQuran;
      } else {
        throw new Error(`API error: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching Quran:', error);
      throw new Error(`Failed to fetch Quran data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSurah(surahNumber: number): Promise<any> {
    try {
      console.log(`Fetching Surah ${surahNumber}...`);
      
      if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
        throw new Error(`Invalid surah number: ${surahNumber}`);
      }
      
      const response = await fetch(`${this.baseUrl}/surah/${surahNumber}/ar.asad`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        // Process the surah data to remove Bismillah from first verse
        const processedSurah = this.processSurahData(data.data, surahNumber);
        console.log(`Surah ${surahNumber} fetched and processed successfully`);
        return processedSurah;
      } else {
        throw new Error(`API error: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      throw new Error(`Failed to fetch Surah ${surahNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSurahs(): Promise<Surah[]> {
    try {
      const quranData = await this.getFullQuran();
      
      if (!quranData || !quranData.surahs || !Array.isArray(quranData.surahs)) {
        throw new Error('Invalid Quran data structure');
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
      throw new Error(`Failed to get surahs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private processQuranData(quranData: QuranData): QuranData {
    console.log('Processing Quran data to remove Bismillah from first verses...');
    
    // Process each surah to remove Bismillah from first verses
    const processedSurahs = quranData.surahs.map(surah => {
      if (surah.ayahs && Array.isArray(surah.ayahs)) {
        const processedAyahs = surah.ayahs.map(ayah => {
          // Process the text to remove Bismillah from first verse
          const processedText = processAyahText(ayah.text || '', surah.number, ayah.numberInSurah);
          return {
            ...ayah,
            text: processedText
          };
        });
        
        return {
          ...surah,
          ayahs: processedAyahs
        };
      }
      
      return surah;
    });

    console.log('Finished processing Quran data');
    return {
      ...quranData,
      surahs: processedSurahs
    };
  }

  private processSurahData(surahData: any, surahNumber: number): any {
    console.log(`Processing individual Surah ${surahNumber} data to remove Bismillah...`);
    
    // Process individual surah data to remove Bismillah from first verse
    if (surahData.ayahs && Array.isArray(surahData.ayahs)) {
      const processedAyahs = surahData.ayahs.map((ayah: any) => {
        // Process the text to remove Bismillah from first verse
        const processedText = processAyahText(ayah.text || '', surahNumber, ayah.numberInSurah);
        return {
          ...ayah,
          text: processedText
        };
      });
      
      console.log(`Finished processing Surah ${surahNumber} data`);
      return {
        ...surahData,
        ayahs: processedAyahs
      };
    }
    
    return surahData;
  }
}

export const quranService = new QuranService();
