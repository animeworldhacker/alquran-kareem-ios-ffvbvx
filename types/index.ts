
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

export interface TafsirResponse {
  tafsirs: {
    id: number;
    text: string;
    language_name: string;
    resource_name: string;
  }[];
}

export interface Reciter {
  id: number;
  name: string;
  letter: string;
  rewaya: string;
  count: number;
  server: string;
  recitationId?: number;
}

export interface AudioState {
  isPlaying: boolean;
  currentAyah: number | null;
  currentSurah: number | null;
  duration: number;
  position: number;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  ayahText: string;
  createdAt: Date;
  note?: string;
}

export interface AppSettings {
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  theme: 'light' | 'dark';
  showBanner: boolean;
  readingMode: 'scroll' | 'flip';
  squareAdjustment: number; // 0-100 for square size adjustment
  showTajweed: boolean;
}

export interface ReciterWithImage extends Reciter {
  image?: string;
  description?: string;
}
