
import { QuranData, Surah, Ayah } from '../types';

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
        this.cachedQuran = data.data;
        console.log('Quran data fetched successfully');
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
        console.log(`Surah ${surahNumber} fetched successfully`);
        return data.data;
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
}

export const quranService = new QuranService();
