
import { useState, useEffect, useCallback } from 'react';
import { AudioState } from '../types';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continuousPlayback, setContinuousPlayback] = useState(false);

  useEffect(() => {
    initializeAudio()
      .catch(error => {
        console.error('Error in audio initialization effect:', error);
        // Don't throw - allow component to continue
      });
  }, []);

  const initializeAudio = async () => {
    try {
      console.log('🎵 Initializing audio in hook...');
      await audioService.initializeAudio();
      console.log('✅ Audio hook initialized successfully');
      setError(null);
    } catch (error) {
      console.error('❌ Error initializing audio hook:', error);
      setError('فشل في تهيئة الصوت');
      // Don't show alert immediately - only when user tries to play
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
        continuousPlay,
        totalAyahs
      ).catch(error => {
        console.error('Error from audioService.playAyah:', error);
        throw error;
      });
      
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
        errorMessage + '\n\nالرجاء التحقق من:\n• اتصالك بالإنترنت\n• صحة رقم السورة والآية',
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
      await audioService.stopAudio().catch(error => {
        console.error('Error from audioService.stopAudio:', error);
        throw error;
      });
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
      await audioService.pauseAudio().catch(error => {
        console.error('Error from audioService.pauseAudio:', error);
        throw error;
      });
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
      await audioService.resumeAudio().catch(error => {
        console.error('Error from audioService.resumeAudio:', error);
        throw error;
      });
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      console.log('✅ Hook: Audio resumed successfully');
      setError(null);
    } catch (error) {
      console.error('❌ Hook: Error resuming audio:', error);
      setError('فشل في استئناف الصوت');
    }
  };

  const setOnAyahEnd = useCallback((callback: (surah: number, ayah: number) => void) => {
    try {
      audioService.setOnAyahEndCallback(callback);
    } catch (error) {
      console.error('Error setting ayah end callback:', error);
    }
  }, []);

  return {
    audioState,
    loading,
    error,
    continuousPlayback,
    playAyah,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setOnAyahEnd,
  };
};
