
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

export interface TajweedVerse {
  verse_key: string;
  text_uthmani_tajweed: string;
}

export interface VerseMetadata {
  id: number;
  verse_key: string;
  verse_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  sajdah?: {
    id: number;
    sajdah_number: number;
    recommended: boolean;
    obligatory: boolean;
  } | boolean;
  text_uthmani: string;
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
  squareAdjustment: number;
  showTajweed: boolean;
  showTajweedLegend: boolean;
  autoExpandTafsir: boolean;
}

export interface ReciterWithImage extends Reciter {
  image?: string;
  description?: string;
}

export interface TajweedRule {
  name: string;
  arabicName: string;
  color: string;
  className: string;
}
