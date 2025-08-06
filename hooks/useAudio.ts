
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

  useEffect(() => {
    initializeAudio();
    loadReciters();
  }, []);

  const initializeAudio = async () => {
    try {
      await audioService.initializeAudio();
      console.log('Audio hook initialized');
    } catch (error) {
      console.error('Error initializing audio hook:', error);
    }
  };

  const loadReciters = async () => {
    try {
      const recitersList = await audioService.getReciters();
      setReciters(recitersList);
      console.log('Reciters loaded in hook');
    } catch (error) {
      console.error('Error loading reciters in hook:', error);
    }
  };

  const playAyah = async (surahNumber: number, ayahNumber: number) => {
    try {
      setLoading(true);
      await audioService.playAyah(surahNumber, ayahNumber, selectedReciter);
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        currentSurah: surahNumber,
        currentAyah: ayahNumber,
      }));
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
    } catch (error) {
      console.error('Error playing ayah:', error);
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
      console.log('Audio stopped in hook');
    } catch (error) {
      console.error('Error stopping audio in hook:', error);
    }
  };

  const pauseAudio = async () => {
    try {
      await audioService.pauseAudio();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      console.log('Audio paused in hook');
    } catch (error) {
      console.error('Error pausing audio in hook:', error);
    }
  };

  const resumeAudio = async () => {
    try {
      await audioService.resumeAudio();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      console.log('Audio resumed in hook');
    } catch (error) {
      console.error('Error resuming audio in hook:', error);
    }
  };

  return {
    audioState,
    reciters,
    selectedReciter,
    loading,
    playAyah,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setSelectedReciter,
  };
};
