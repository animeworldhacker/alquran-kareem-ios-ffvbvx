
import { useState, useEffect } from 'react';
import { QuranData, Surah } from '../types';
import { quranService } from '../services/quranService';

export const useQuran = () => {
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuranData();
  }, []);

  const loadQuranData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [fullQuran, surahsList] = await Promise.all([
        quranService.getFullQuran(),
        quranService.getSurahs()
      ]);
      
      setQuranData(fullQuran);
      setSurahs(surahsList);
      console.log('Quran data loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Quran data';
      setError(errorMessage);
      console.error('Error loading Quran data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSurah = (surahNumber: number) => {
    if (!quranData) return null;
    return quranData.surahs.find(surah => surah.number === surahNumber);
  };

  const getAyah = (surahNumber: number, ayahNumber: number) => {
    const surah = getSurah(surahNumber);
    if (!surah) return null;
    return surah.ayahs.find(ayah => ayah.numberInSurah === ayahNumber);
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
