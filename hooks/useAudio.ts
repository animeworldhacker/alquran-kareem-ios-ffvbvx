
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
  const [selectedReciter, setSelectedReciterState] = useState<number>(2); // Default to Abdulbasit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continuousPlayback, setContinuousPlayback] = useState(false);

  useEffect(() => {
    initializeAudio();
    loadReciters();
    loadSavedReciter();
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

  const loadSavedReciter = async () => {
    try {
      const saved = await audioService.loadSelectedReciter();
      if (saved) {
        setSelectedReciterState(saved);
        console.log('Loaded saved reciter:', saved);
      }
    } catch (error) {
      console.error('Error loading saved reciter:', error);
    }
  };

  const playAyah = async (
    surahNumber: number, 
    ayahNumber: number, 
    continuousPlay: boolean = false,
    totalAyahs: number = 0
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }
      
      setContinuousPlayback(continuousPlay);
      
      await audioService.playAyah(
        surahNumber, 
        ayahNumber, 
        selectedReciter,
        continuousPlay,
        totalAyahs
      );
      
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        currentSurah: surahNumber,
        currentAyah: ayahNumber,
      }));
      
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber} successfully`);
    } catch (error) {
      console.error('Error playing ayah:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل في تشغيل الآية';
      setError(errorMessage);
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
      setContinuousPlayback(false);
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

  const changeReciter = async (reciterId: number) => {
    try {
      if (!reciterId || reciterId < 1) {
        throw new Error(`Invalid reciter ID: ${reciterId}`);
      }
      
      const wasPlaying = audioState.isPlaying;
      const currentSurah = audioState.currentSurah;
      const currentAyah = audioState.currentAyah;
      
      setSelectedReciterState(reciterId);
      await audioService.saveSelectedReciter(reciterId);
      
      // If currently playing, switch to the new reciter for the current ayah
      if (wasPlaying && currentSurah && currentAyah) {
        console.log('Switching reciter during playback...');
        await audioService.stopAudio();
        
        // Small delay before playing with new reciter
        setTimeout(async () => {
          try {
            await audioService.playAyah(
              currentSurah,
              currentAyah,
              reciterId,
              continuousPlayback,
              0
            );
            
            setAudioState(prev => ({
              ...prev,
              isPlaying: true,
              currentSurah: currentSurah,
              currentAyah: currentAyah,
            }));
          } catch (error) {
            console.error('Error switching reciter:', error);
            setError('فشل في تبديل القارئ');
          }
        }, 300);
      }
      
      console.log(`Reciter changed to ID: ${reciterId}`);
      setError(null);
    } catch (error) {
      console.error('Error changing reciter:', error);
      setError('فشل في تغيير القارئ');
    }
  };

  const setOnAyahEnd = (callback: (surah: number, ayah: number) => void) => {
    audioService.setOnAyahEndCallback(callback);
  };

  return {
    audioState,
    reciters,
    selectedReciter,
    loading,
    error,
    continuousPlayback,
    playAyah,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setSelectedReciter: changeReciter,
    setOnAyahEnd,
  };
};
