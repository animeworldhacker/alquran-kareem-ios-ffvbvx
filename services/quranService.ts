
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
      const data = await response.json();
      
      if (data.code === 200) {
        this.cachedQuran = data.data;
        console.log('Quran data fetched successfully');
        return this.cachedQuran;
      } else {
        throw new Error('Failed to fetch Quran data');
      }
    } catch (error) {
      console.error('Error fetching Quran:', error);
      throw error;
    }
  }

  async getSurah(surahNumber: number): Promise<any> {
    try {
      console.log(`Fetching Surah ${surahNumber}...`);
      const response = await fetch(`${this.baseUrl}/surah/${surahNumber}/ar.asad`);
      const data = await response.json();
      
      if (data.code === 200) {
        console.log(`Surah ${surahNumber} fetched successfully`);
        return data.data;
      } else {
        throw new Error(`Failed to fetch Surah ${surahNumber}`);
      }
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      throw error;
    }
  }

  async getSurahs(): Promise<Surah[]> {
    try {
      const quranData = await this.getFullQuran();
      return quranData.surahs.map(surah => ({
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        numberOfAyahs: surah.numberOfAyahs,
        revelationType: surah.revelationType,
      }));
    } catch (error) {
      console.error('Error getting surahs:', error);
      throw error;
    }
  }
}

export const quranService = new QuranService();
