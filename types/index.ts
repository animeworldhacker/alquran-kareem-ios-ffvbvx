
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranData {
  surahs: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    ayahs: Ayah[];
  }[];
}

export interface TafsirVerse {
  id: number;
  surah_id: number;
  ayah_number: number;
  text: string;
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  rewaya: string;
  count: number;
  server: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentAyah: number | null;
  currentSurah: number | null;
  duration: number;
  position: number;
}
