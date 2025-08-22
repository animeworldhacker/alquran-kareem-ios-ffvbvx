
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
      // Attempt to fetch from the provided API docs host (may redirect or serve JSON)
      const response = await fetch('https://quranapi.pages.dev/api/reciters');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Normalize if needed
        this.reciters = data.slice(0, 5).map((r: any, idx: number) => ({
          id: r.id ?? idx + 1,
          name: r.name ?? `قارئ ${idx + 1}`,
          letter: r.letter ?? '',
          rewaya: r.rewaya ?? '',
          count: r.count ?? 114,
          server: r.server ?? 'AbdulSamad_64kbps_QuranExplorer.Com',
        }));
        console.log('Reciters fetched successfully from pages.dev');
        return this.reciters;
      }
      throw new Error('Invalid reciters response');
    } catch (error) {
      console.error('Error fetching reciters from pages.dev, using fallback:', error);
      // Fallback: include 5 known reciters (folders from EveryAyah per-ayah)
      this.reciters = [
        { id: 1, name: 'عبد الباسط عبد الصمد (مرتل)', letter: 'أ', rewaya: 'حفص عن عاصم', count: 114, server: 'Abdul_Basit_Murattal_192kbps' },
        { id: 2, name: 'مشارى راشد العفاسى', letter: 'م', rewaya: 'حفص عن عاصم', count: 114, server: 'Alafasy_64kbps' },
        { id: 3, name: 'الحصري (مرتل)', letter: 'ح', rewaya: 'حفص عن عاصم', count: 114, server: 'Husary_128kbps' },
        { id: 4, name: 'المنشاوي (مجود)', letter: 'م', rewaya: 'حفص عن عاصم', count: 114, server: 'Minshawy_Mujawwad_128kbps' },
        { id: 5, name: 'الغامدي', letter: 'غ', rewaya: 'حفص عن عاصم', count: 114, server: 'Ghamadi_40kbps' },
      ];
      return this.reciters;
    }
  }

  private buildEveryAyahUrl(folder: string, surahNumber: number, ayahNumber: number) {
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    return `https://everyayah.com/data/${folder}/${paddedSurah}${paddedAyah}.mp3`;
  }

  async playAyah(surahNumber: number, ayahNumber: number, reciterId: number = 1): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      let audioUrl = '';
      const reciter = this.reciters.find(r => r.id === reciterId);
      if (reciter) {
        if ((reciter.server || '').startsWith('http')) {
          const paddedSurah = surahNumber.toString().padStart(3, '0');
          const paddedAyah = ayahNumber.toString().padStart(3, '0');
          audioUrl = `${reciter.server}/${paddedSurah}${paddedAyah}.mp3`;
        } else {
          audioUrl = this.buildEveryAyahUrl(reciter.server, surahNumber, ayahNumber);
        }
      } else {
        const fallbackFolder = 'AbdulSamad_64kbps_QuranExplorer.Com';
        audioUrl = this.buildEveryAyahUrl(fallbackFolder, surahNumber, ayahNumber);
      }

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
