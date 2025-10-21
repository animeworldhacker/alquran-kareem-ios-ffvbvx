
import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioState, Reciter } from '../types';
import { audioService } from '../services/audioService';
import { Alert } from 'react-native';

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
  
  // Debounce timer for reciter changes
  const reciterChangeTimer = useRef<NodeJS.Timeout | null>(null);

  const loadSavedReciter = useCallback(async () => {
    try {
      const saved = await audioService.loadSelectedReciter();
      if (saved) {
        setSelectedReciterState(saved);
        console.log('✅ Loaded saved reciter:', saved);
      } else {
        console.log('ℹ️ No saved reciter, using default:', selectedReciter);
      }
    } catch (error) {
      console.error('❌ Error loading saved reciter:', error);
    }
  }, [selectedReciter]);

  useEffect(() => {
    initializeAudio();
    loadReciters();
    loadSavedReciter();
  }, [loadSavedReciter]);

  const initializeAudio = async () => {
    try {
      console.log('🎵 Initializing audio in hook...');
      await audioService.initializeAudio();
      console.log('✅ Audio hook initialized successfully');
      setError(null);
    } catch (error) {
      console.error('❌ Error initializing audio hook:', error);
      setError('فشل في تهيئة الصوت');
      Alert.alert(
        'خطأ في الصوت',
        'فشل في تهيئة نظام الصوت. يرجى التحقق من اتصالك بالإنترنت وإعادة تشغيل التطبيق.',
        [{ text: 'حسناً' }]
      );
    }
  };

  const loadReciters = async () => {
    try {
      console.log('📋 Loading reciters in hook...');
      const recitersList = await audioService.getReciters();
      setReciters(recitersList);
      console.log('✅ Reciters loaded in hook:', recitersList.length);
      setError(null);
    } catch (error) {
      console.error('❌ Error loading reciters in hook:', error);
      setError('فشل في تحميل القراء');
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
      
      console.log(`\n🎵 Hook: Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`معاملات غير صحيحة: سورة ${surahNumber}, آية ${ayahNumber}`);
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
      
      console.log(`✅ Hook: Playing Surah ${surahNumber}, Ayah ${ayahNumber} successfully`);
    } catch (error) {
      console.error('❌ Hook: Error playing ayah:', error);
      const errorMessage = error instanceof Error ? error.message : 'تعذّر تشغيل الآية';
      setError(errorMessage);
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentSurah: null,
        currentAyah: null,
      }));
      
      // Show user-friendly error with specific guidance
      Alert.alert(
        'خطأ في التشغيل',
        errorMessage + '\n\nالرجاء التحقق من:\n• اتصالك بالإنترنت\n• صحة رقم السورة والآية\n\nإذا استمرت المشكلة، جرب قارئاً آخر.',
        [{ text: 'حسناً' }]
      );
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = async () => {
    try {
      console.log('⏹️ Hook: Stopping audio...');
      await audioService.stopAudio();
      setContinuousPlayback(false);
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentSurah: null,
        currentAyah: null,
      }));
      console.log('✅ Hook: Audio stopped successfully');
      setError(null);
    } catch (error) {
      console.error('❌ Hook: Error stopping audio:', error);
      setError('فشل في إيقاف الصوت');
    }
  };

  const pauseAudio = async () => {
    try {
      console.log('⏸️ Hook: Pausing audio...');
      await audioService.pauseAudio();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      console.log('✅ Hook: Audio paused successfully');
      setError(null);
    } catch (error) {
      console.error('❌ Hook: Error pausing audio:', error);
      setError('فشل في إيقاف الصوت مؤقتاً');
    }
  };

  const resumeAudio = async () => {
    try {
      console.log('▶️ Hook: Resuming audio...');
      await audioService.resumeAudio();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      console.log('✅ Hook: Audio resumed successfully');
      setError(null);
    } catch (error) {
      console.error('❌ Hook: Error resuming audio:', error);
      setError('فشل في استئناف الصوت');
    }
  };

  const changeReciter = async (reciterId: number) => {
    try {
      console.log(`🎙️ Hook: Changing reciter to ID ${reciterId}...`);
      
      if (!reciterId || reciterId < 1) {
        throw new Error(`معرف قارئ غير صحيح: ${reciterId}`);
      }

      // Clear any pending reciter change
      if (reciterChangeTimer.current) {
        clearTimeout(reciterChangeTimer.current);
      }

      const wasPlaying = audioState.isPlaying;
      const currentSurah = audioState.currentSurah;
      const currentAyah = audioState.currentAyah;
      
      setSelectedReciterState(reciterId);
      await audioService.saveSelectedReciter(reciterId);
      
      // If currently playing, debounce the switch to avoid rapid changes
      if (wasPlaying && currentSurah && currentAyah) {
        console.log('🔄 Debouncing reciter switch during playback...');
        
        reciterChangeTimer.current = setTimeout(async () => {
          try {
            console.log('🔄 Executing reciter switch...');
            await audioService.stopAudio();
            
            // Small delay before playing with new reciter
            await new Promise(resolve => setTimeout(resolve, 300));
            
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
            
            console.log('✅ Reciter switched successfully');
          } catch (error) {
            console.error('❌ Error switching reciter:', error);
            setError('فشل في تبديل القارئ');
            Alert.alert(
              'خطأ',
              'فشل في تبديل القارئ. يرجى المحاولة مرة أخرى.\n\nتأكد من اتصالك بالإنترنت.',
              [{ text: 'حسناً' }]
            );
          }
        }, 500); // 500ms debounce
      }
      
      console.log(`✅ Hook: Reciter changed to ID: ${reciterId}`);
      setError(null);
    } catch (error) {
      console.error('❌ Hook: Error changing reciter:', error);
      setError('فشل في تغيير القارئ');
    }
  };

  const setOnAyahEnd = (callback: (surah: number, ayah: number) => void) => {
    audioService.setOnAyahEndCallback(callback);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reciterChangeTimer.current) {
        clearTimeout(reciterChangeTimer.current);
      }
    };
  }, []);

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
