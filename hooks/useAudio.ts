
import { useState, useEffect, useCallback } from 'react';
import { AudioState, Reciter } from '../types';
import { audioService } from '../services/audioService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_RECITER_KEY = 'selectedReciter';

// Static list of reciters with correct Quran.com recitation IDs
const STATIC_RECITERS: Reciter[] = [
  {
    id: 2,
    name: 'عبد الباسط عبد الصمد',
    letter: 'ع',
    rewaya: 'حفص عن عاصم - مرتل',
    count: 114,
    server: 'https://verses.quran.com/2/',
    recitationId: 2,
  },
  {
    id: 7,
    name: 'علي جابر',
    letter: 'ع',
    rewaya: 'حفص عن عاصم',
    count: 114,
    server: 'https://verses.quran.com/7/',
    recitationId: 7,
  },
  {
    id: 11,
    name: 'ياسر الدوسري',
    letter: 'ي',
    rewaya: 'حفص عن عاصم',
    count: 114,
    server: 'https://verses.quran.com/11/',
    recitationId: 11,
  },
  {
    id: 9,
    name: 'سعود الشريم',
    letter: 'س',
    rewaya: 'حفص عن عاصم',
    count: 114,
    server: 'https://verses.quran.com/9/',
    recitationId: 9,
  },
];

interface UseAudioReturn {
  audioState: AudioState;
  loading: boolean;
  error: string | null;
  continuousPlayback: boolean;
  reciters: Reciter[];
  selectedReciter: number;
  loadingReciters: boolean;
  setSelectedReciter: (reciterId: number) => Promise<void>;
  playAyah: (surahNumber: number, ayahNumber: number, continuousPlay?: boolean, totalAyahs?: number) => Promise<void>;
  stopAudio: () => Promise<void>;
  pauseAudio: () => Promise<void>;
  resumeAudio: () => Promise<void>;
  setOnAyahEnd: (callback: (surah: number, ayah: number) => void) => void;
}

export const useAudio = (): UseAudioReturn => {
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
  const [reciters] = useState<Reciter[]>(STATIC_RECITERS);
  const [selectedReciter, setSelectedReciterState] = useState<number>(2); // Default to Abdulbasit
  const [loadingReciters] = useState(false);

  const initializeAudio = useCallback(async (): Promise<void> => {
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
  }, []);

  const loadSelectedReciter = useCallback(async (): Promise<void> => {
    try {
      const saved = await AsyncStorage.getItem(SELECTED_RECITER_KEY);
      if (saved) {
        const reciterId = parseInt(saved);
        setSelectedReciterState(reciterId);
        audioService.setRecitationId(reciterId);
        console.log('✅ Loaded selected reciter:', reciterId);
      } else {
        // Set default reciter (Abdulbasit)
        audioService.setRecitationId(2);
        console.log('✅ Set default reciter: Abdulbasit (2)');
      }
    } catch (error) {
      console.error('Error loading selected reciter:', error);
    }
  }, []);

  useEffect(() => {
    initializeAudio().catch(error => {
      console.error('Error in audio initialization effect:', error);
    });
    loadSelectedReciter().catch(error => {
      console.error('Error loading selected reciter:', error);
    });
  }, [initializeAudio, loadSelectedReciter]);

  const setSelectedReciter = async (reciterId: number): Promise<void> => {
    try {
      setSelectedReciterState(reciterId);
      audioService.setRecitationId(reciterId);
      await AsyncStorage.setItem(SELECTED_RECITER_KEY, reciterId.toString());
      console.log('✅ Selected reciter:', reciterId);
      
      // Show confirmation
      const reciter = reciters.find(r => r.id === reciterId);
      if (reciter) {
        Alert.alert(
          'تم اختيار القارئ',
          `تم اختيار ${reciter.name} بنجاح`,
          [{ text: 'حسناً' }]
        );
      }
    } catch (error) {
      console.error('Error setting selected reciter:', error);
      Alert.alert(
        'خطأ',
        'فشل في حفظ اختيار القارئ',
        [{ text: 'حسناً' }]
      );
    }
  };

  const playAyah = async (
    surahNumber: number, 
    ayahNumber: number, 
    continuousPlay: boolean = false,
    totalAyahs: number = 0
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`\n🎵 Hook: Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
      console.log(`🎙️ Using reciter ID: ${audioService.getRecitationId()}`);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`معاملات غير صحيحة: سورة ${surahNumber}, آية ${ayahNumber}`);
      }
      
      setContinuousPlayback(continuousPlay);
      
      await audioService.playAyah(
        surahNumber, 
        ayahNumber, 
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
        errorMessage + '\n\nالرجاء التحقق من:\n• اتصالك بالإنترنت\n• صحة رقم السورة والآية',
        [{ text: 'حسناً' }]
      );
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = async (): Promise<void> => {
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

  const pauseAudio = async (): Promise<void> => {
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

  const resumeAudio = async (): Promise<void> => {
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

  const setOnAyahEnd = useCallback((callback: (surah: number, ayah: number) => void): void => {
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
    reciters,
    selectedReciter,
    loadingReciters,
    setSelectedReciter,
    playAyah,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setOnAyahEnd,
  };
};
