
import { useState, useEffect } from 'react';
import { AudioState, Reciter } from '../types';
import { audioService } from '../services/audioService';

export const useAudio = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentAyah: null,
    currentSurah: null,
    duration: 0,
    position: 0,
  });
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAudio();
    loadReciters();
  }, []);

  const initializeAudio = async () => {
    try {
      await audioService.initializeAudio();
      console.log('Audio hook initialized successfully');
      setError(null);
    } catch (error) {
      console.error('Error initializing audio hook:', error);
      setError('فشل في تهيئة الصوت');
    }
  };

  const loadReciters = async () => {
    try {
      const recitersList = await audioService.getReciters();
      setReciters(recitersList);
      console.log('Reciters loaded in hook:', recitersList.length);
      setError(null);
    } catch (error) {
      console.error('Error loading reciters in hook:', error);
      setError('فشل في تحميل القراء');
    }
  };

  const playAyah = async (surahNumber: number, ayahNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }
      
      await audioService.playAyah(surahNumber, ayahNumber, selectedReciter);
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        currentSurah: surahNumber,
        currentAyah: ayahNumber,
      }));
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber} successfully`);
    } catch (error) {
      console.error('Error playing ayah:', error);
      setError('فشل في تشغيل الآية');
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentSurah: null,
        currentAyah: null,
      }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = async () => {
    try {
      await audioService.stopAudio();
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentSurah: null,
        currentAyah: null,
      }));
      console.log('Audio stopped in hook successfully');
      setError(null);
    } catch (error) {
      console.error('Error stopping audio in hook:', error);
      setError('فشل في إيقاف الصوت');
    }
  };

  const pauseAudio = async () => {
    try {
      await audioService.pauseAudio();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      console.log('Audio paused in hook successfully');
      setError(null);
    } catch (error) {
      console.error('Error pausing audio in hook:', error);
      setError('فشل في إيقاف الصوت مؤقتاً');
    }
  };

  const resumeAudio = async () => {
    try {
      await audioService.resumeAudio();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      console.log('Audio resumed in hook successfully');
      setError(null);
    } catch (error) {
      console.error('Error resuming audio in hook:', error);
      setError('فشل في استئناف الصوت');
    }
  };

  const changeReciter = (reciterId: number) => {
    try {
      if (!reciterId || reciterId < 1) {
        throw new Error(`Invalid reciter ID: ${reciterId}`);
      }
      
      setSelectedReciter(reciterId);
      console.log(`Reciter changed to ID: ${reciterId}`);
      setError(null);
    } catch (error) {
      console.error('Error changing reciter:', error);
      setError('فشل في تغيير القارئ');
    }
  };

  return {
    audioState,
    reciters,
    selectedReciter,
    loading,
    error,
    playAyah,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setSelectedReciter: changeReciter,
  };
};
