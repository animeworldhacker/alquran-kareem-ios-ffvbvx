
import { Audio } from 'expo-av';
import { Reciter } from '../types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private reciters: Reciter[] = [];

  async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async getReciters(): Promise<Reciter[]> {
    if (this.reciters.length > 0) {
      return this.reciters;
    }

    try {
      console.log('Fetching reciters...');
      const response = await fetch('https://mp3quran.net/api/v3/reciters');
      const data = await response.json();
      
      if (data.reciters) {
        this.reciters = data.reciters.slice(0, 10); // Get first 10 reciters
        console.log('Reciters fetched successfully');
        return this.reciters;
      } else {
        throw new Error('Failed to fetch reciters');
      }
    } catch (error) {
      console.error('Error fetching reciters:', error);
      // Return default reciters as fallback
      this.reciters = [
        {
          id: 1,
          name: 'عبد الباسط عبد الصمد',
          letter: 'أ',
          rewaya: 'حفص عن عاصم',
          count: 114,
          server: 'https://server8.mp3quran.net/abd_basit/Alafasy_128_kbps/'
        }
      ];
      return this.reciters;
    }
  }

  async playAyah(surahNumber: number, ayahNumber: number, reciterId: number = 1): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const paddedAyah = ayahNumber.toString().padStart(3, '0');
      
      // Using a reliable audio source
      const audioUrl = `https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/${paddedSurah}${paddedAyah}.mp3`;
      
      console.log(`Playing audio: ${audioUrl}`);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      console.log('Audio started playing');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('Audio stopped');
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        console.log('Audio paused');
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        console.log('Audio resumed');
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }
}

export const audioService = new AudioService();
