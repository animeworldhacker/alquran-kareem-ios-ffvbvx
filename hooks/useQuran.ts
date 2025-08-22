
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
      
      console.log('Starting to load Quran data...');
      
      const [fullQuran, surahsList] = await Promise.all([
        quranService.getFullQuran(),
        quranService.getSurahs()
      ]);
      
      if (!fullQuran) {
        throw new Error('Failed to load Quran data');
      }
      
      if (!surahsList || surahsList.length === 0) {
        throw new Error('Failed to load Surahs list');
      }
      
      setQuranData(fullQuran);
      setSurahs(surahsList);
      console.log('Quran data loaded successfully:', surahsList.length, 'surahs');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Quran data';
      setError(errorMessage);
      console.error('Error loading Quran data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSurah = (surahNumber: number) => {
    if (!quranData || !quranData.surahs) {
      console.log('No Quran data available');
      return null;
    }
    
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      console.log('Invalid surah number:', surahNumber);
      return null;
    }
    
    return quranData.surahs.find(surah => surah.number === surahNumber);
  };

  const getAyah = (surahNumber: number, ayahNumber: number) => {
    const surah = getSurah(surahNumber);
    if (!surah || !surah.ayahs) {
      console.log('Surah not found or has no ayahs:', surahNumber);
      return null;
    }
    
    if (!ayahNumber || ayahNumber < 1) {
      console.log('Invalid ayah number:', ayahNumber);
      return null;
    }
    
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
