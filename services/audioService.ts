
import { Audio } from 'expo-av';
import { Reciter } from '../types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private reciters: Reciter[] = [];
  private isInitialized = false;

  async initializeAudio() {
    try {
      if (this.isInitialized) {
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      this.isInitialized = true;
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw new Error(`Failed to initialize audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReciters(): Promise<Reciter[]> {
    if (this.reciters.length > 0) {
      return this.reciters;
    }

    try {
      console.log('Fetching reciters...');
      
      // Try to fetch from the API
      const response = await fetch('https://quranapi.pages.dev/api/reciters', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        this.reciters = data.slice(0, 15).map((r: any, idx: number) => ({
          id: r.id ?? idx + 1,
          name: r.name ?? `قارئ ${idx + 1}`,
          letter: r.letter ?? '',
          rewaya: r.rewaya ?? '',
          count: r.count ?? 114,
          server: r.server ?? 'AbdulSamad_64kbps_QuranExplorer.Com',
        }));
        console.log('Reciters fetched successfully from API');
        return this.reciters;
      }
      
      throw new Error('Invalid reciters response from API');
    } catch (error) {
      console.error('Error fetching reciters from API, using fallback:', error);
      
      // Fallback: use known reciters
      this.reciters = [
        { id: 1, name: 'عبد الباسط عبد الصمد (مرتل)', letter: 'أ', rewaya: 'حفص عن عاصم', count: 114, server: 'Abdul_Basit_Murattal_192kbps' },
        { id: 2, name: 'مشارى راشد العفاسى', letter: 'م', rewaya: 'حفص عن عاصم', count: 114, server: 'Alafasy_64kbps' },
        { id: 3, name: 'الحصري (مرتل)', letter: 'ح', rewaya: 'حفص عن عاصم', count: 114, server: 'Husary_128kbps' },
        { id: 4, name: 'المنشاوي (مجود)', letter: 'م', rewaya: 'حفص عن عاصم', count: 114, server: 'Minshawy_Mujawwad_128kbps' },
        { id: 5, name: 'الغامدي', letter: 'غ', rewaya: 'حفص عن عاصم', count: 114, server: 'Ghamadi_40kbps' },
        { id: 6, name: 'ماهر المعيقلي', letter: 'م', rewaya: 'حفص عن عاصم', count: 114, server: 'MaherAlMuaiqly128kbps' },
        { id: 7, name: 'أحمد العجمي', letter: 'أ', rewaya: 'حفص عن عاصم', count: 114, server: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net' },
        { id: 8, name: 'محمد صديق المنشاوي', letter: 'م', rewaya: 'حفص عن عاصم', count: 114, server: 'Minshawy_Teacher_128kbps' },
        { id: 9, name: 'عبد الرحمن السديس', letter: 'ع', rewaya: 'حفص عن عاصم', count: 114, server: 'Abdurrahmaan_As-Sudais_192kbps' },
        { id: 10, name: 'سعود الشريم', letter: 'س', rewaya: 'حفص عن عاصم', count: 114, server: 'Saood_ash-Shuraym_128kbps' },
        { id: 11, name: 'ياسر الدوسري', letter: 'ي', rewaya: 'حفص عن عاصم', count: 114, server: 'Yasser_Ad-Dussary_128kbps' },
        { id: 12, name: 'عبد الله بصفر', letter: 'ع', rewaya: 'حفص عن عاصم', count: 114, server: 'Abdullah_Basfar_192kbps' },
        { id: 13, name: 'خالد الجليل', letter: 'خ', rewaya: 'حفص عن عاصم', count: 114, server: 'Khalid_Al-Jaleel_128kbps' },
        { id: 14, name: 'فارس عباد', letter: 'ف', rewaya: 'حفص عن عاصم', count: 114, server: 'Fares_Abbad_64kbps' },
        { id: 15, name: 'عبد الله عواد الجهني', letter: 'ع', rewaya: 'حفص عن عاصم', count: 114, server: 'Abdullah_Awad_Al-Juhani_128kbps' },
      ];
      
      return this.reciters;
    }
  }

  private buildEveryAyahUrl(folder: string, surahNumber: number, ayahNumber: number): string {
    try {
      if (!folder || !surahNumber || !ayahNumber) {
        throw new Error('Invalid parameters for building audio URL');
      }
      
      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const paddedAyah = ayahNumber.toString().padStart(3, '0');
      return `https://everyayah.com/data/${folder}/${paddedSurah}${paddedAyah}.mp3`;
    } catch (error) {
      console.error('Error building audio URL:', error);
      throw error;
    }
  }

  async playAyah(surahNumber: number, ayahNumber: number, reciterId: number = 1): Promise<void> {
    try {
      // Validate parameters
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }

      // Ensure audio is initialized
      if (!this.isInitialized) {
        await this.initializeAudio();
      }

      // Stop any currently playing audio
      if (this.sound) {
        try {
          await this.sound.unloadAsync();
        } catch (unloadError) {
          console.log('Error unloading previous sound:', unloadError);
        }
        this.sound = null;
      }

      // Get reciters if not loaded
      if (this.reciters.length === 0) {
        await this.getReciters();
      }

      let audioUrl = '';
      const reciter = this.reciters.find(r => r.id === reciterId);
      
      if (reciter && reciter.server) {
        if (reciter.server.startsWith('http')) {
          const paddedSurah = surahNumber.toString().padStart(3, '0');
          const paddedAyah = ayahNumber.toString().padStart(3, '0');
          audioUrl = `${reciter.server}/${paddedSurah}${paddedAyah}.mp3`;
        } else {
          audioUrl = this.buildEveryAyahUrl(reciter.server, surahNumber, ayahNumber);
        }
      } else {
        // Fallback to default reciter
        const fallbackFolder = 'AbdulSamad_64kbps_QuranExplorer.Com';
        audioUrl = this.buildEveryAyahUrl(fallbackFolder, surahNumber, ayahNumber);
      }

      console.log(`Playing audio: ${audioUrl}`);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        }
      );
      
      this.sound = sound;
      console.log('Audio started playing successfully');
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error(`Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('Audio stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw new Error(`Failed to stop audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        console.log('Audio paused successfully');
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw new Error(`Failed to pause audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        console.log('Audio resumed successfully');
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
      throw new Error(`Failed to resume audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAudioStatus() {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting audio status:', error);
      return null;
    }
  }
}

export const audioService = new AudioService();
