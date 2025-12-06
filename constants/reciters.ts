
// Reciters list with their Quran.com recitation IDs
// These IDs are used directly in the audio service to construct CDN URLs

export interface ReciterInfo {
  id: number;
  name: string;
  nameEn: string;
  rewaya?: string;
}

export const RECITERS: ReciterInfo[] = [
  { 
    id: 2, 
    name: 'عبد الباسط عبد الصمد', 
    nameEn: 'Abdulbasit Abdulsamad',
    rewaya: 'حفص عن عاصم - مرتل'
  },
  { 
    id: 7, 
    name: 'علي جابر', 
    nameEn: 'Ali Jaber',
    rewaya: 'حفص عن عاصم'
  },
  { 
    id: 11, 
    name: 'ياسر الدوسري', 
    nameEn: 'Yasser Ad-Dussary',
    rewaya: 'حفص عن عاصم'
  },
  { 
    id: 9, 
    name: 'سعود الشريم', 
    nameEn: "Sa'ud ash-Shuraym",
    rewaya: 'حفص عن عاصم'
  },
];

// Default reciter ID (Abdulbasit)
export const DEFAULT_RECITER_ID = 2;

// AsyncStorage key for persisting the selected reciter
export const RECITER_STORAGE_KEY = 'current_recitation_id';
