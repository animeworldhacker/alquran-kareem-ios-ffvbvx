
import { useState, useEffect } from 'react';
import { QuranData, Surah, Ayah } from '../types';
import { quranService } from '../services/quranService';

interface UseQuranReturn {
  quranData: QuranData | null;
  surahs: Surah[];
  loading: boolean;
  error: string | null;
  getSurah: (surahNumber: number) => Surah | null;
  getAyah: (surahNumber: number, ayahNumber: number) => Ayah | null;
  reload: () => Promise<void>;
}

export const useQuran = (): UseQuranReturn => {
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuranData().catch(err => {
      console.error('Error in useQuran effect:', err);
    });
  }, []);

  const loadQuranData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to load Quran data...');
      
      const [fullQuran, surahsList] = await Promise.all([
        quranService.getFullQuran(),
        quranService.getSurahs()
      ]);
      
      if (!fullQuran) {
        throw new Error('فشل في تحميل بيانات القرآن الكريم');
      }
      
      if (!surahsList || surahsList.length === 0) {
        throw new Error('فشل في تحميل قائمة السور');
      }
      
      setQuranData(fullQuran);
      setSurahs(surahsList);
      console.log('Quran data loaded successfully:', surahsList.length, 'surahs');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل بيانات القرآن الكريم';
      setError(errorMessage);
      console.error('Error loading Quran data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSurah = (surahNumber: number): Surah | null => {
    if (!quranData || !quranData.surahs) {
      console.log('No Quran data available');
      return null;
    }
    
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      console.log('Invalid surah number:', surahNumber);
      return null;
    }
    
    return quranData.surahs.find(surah => surah.number === surahNumber) || null;
  };

  const getAyah = (surahNumber: number, ayahNumber: number): Ayah | null => {
    const surah = getSurah(surahNumber);
    if (!surah || !surah.ayahs) {
      console.log('Surah not found or has no ayahs:', surahNumber);
      return null;
    }
    
    if (!ayahNumber || ayahNumber < 1) {
      console.log('Invalid ayah number:', ayahNumber);
      return null;
    }
    
    return surah.ayahs.find(ayah => ayah.numberInSurah === ayahNumber) || null;
  };

  return {
    quranData,
    surahs,
    loading,
    error,
    getSurah,
    getAyah,
    reload: loadQuranData,
  };
};
