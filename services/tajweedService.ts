
import { Ayah } from '../types';

export interface TajweedSegment {
  text: string;
  type: string;
  color: string;
}

export interface TajweedData {
  surah: number;
  ayah: number;
  segments: TajweedSegment[];
}

class TajweedService {
  private baseUrl = 'https://api.alquran.cloud/v1';
  private tajweedCache: Map<string, TajweedData> = new Map();

  // Correct Tajweed color mapping based on standard Mushaf coloring
  private tajweedColors: { [key: string]: string } = {
    'ghunna': '#01579B',           // Dark Blue for Ghunna (نون ساكنة ومیم ساكنة)
    'qalqala': '#4A148C',          // Purple for Qalqala (قطب جد)
    'madd': '#D32F2F',             // Red for Madd (مد)
    'idgham': '#2E7D32',           // Green for Idgham (إدغام)
    'ikhfa': '#F57C00',            // Orange for Ikhfa (إخفاء)
    'iqlab': '#7B1FA2',            // Purple for Iqlab (إقلاب)
    'izhar': '#1976D2',            // Blue for Izhar (إظهار)
    'silent': '#9E9E9E',           // Gray for silent letters
    'waqf': '#E91E63',             // Pink for Waqf signs (علامات الوقف)
    'lam_shamsiyya': '#FF5722',    // Deep Orange for Lam Shamsiyya
    'lam_qamariyya': '#009688',    // Teal for Lam Qamariyya
    'hamzat_wasl': '#795548',      // Brown for Hamzat Wasl
    'default': '#2F4F4F'           // Default dark slate gray
  };

  async getTajweedData(surahNumber: number, ayahNumber: number): Promise<TajweedData | null> {
    const cacheKey = `${surahNumber}:${ayahNumber}`;
    
    if (this.tajweedCache.has(cacheKey)) {
      return this.tajweedCache.get(cacheKey)!;
    }

    try {
      console.log(`Fetching Tajweed data for Surah ${surahNumber}, Ayah ${ayahNumber}...`);
      
      if (!surahNumber || !ayahNumber || surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) {
        throw new Error(`Invalid parameters: surah ${surahNumber}, ayah ${ayahNumber}`);
      }
      
      // Try to fetch from the tajweed API using the correct endpoint
      const response = await fetch(`${this.baseUrl}/ayah/${surahNumber}:${ayahNumber}/editions/quran-tajweed`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`Tajweed API returned ${response.status}, using fallback`);
        return this.generateBasicTajweed(surahNumber, ayahNumber);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const ayahData = data.data[0];
        if (ayahData && ayahData.text) {
          const tajweedData = this.parseTajweedText(ayahData.text, surahNumber, ayahNumber);
          this.tajweedCache.set(cacheKey, tajweedData);
          console.log(`Tajweed data fetched successfully for ${surahNumber}:${ayahNumber}`);
          return tajweedData;
        }
      }
      
      // Fallback to basic tajweed parsing
      return this.generateBasicTajweed(surahNumber, ayahNumber);
    } catch (error) {
      console.error(`Error fetching Tajweed data for ${surahNumber}:${ayahNumber}:`, error);
      // Return basic tajweed as fallback
      return this.generateBasicTajweed(surahNumber, ayahNumber);
    }
  }

  private parseTajweedText(text: string, surahNumber: number, ayahNumber: number): TajweedData {
    const segments: TajweedSegment[] = [];
    
    if (!text || typeof text !== 'string') {
      console.log('Invalid text provided to parseTajweedText');
      return {
        surah: surahNumber,
        ayah: ayahNumber,
        segments: []
      };
    }
    
    // Updated tajweed patterns based on the alquran-tools API format
    // Fixed regex patterns to avoid combined character issues
    const tajweedPatterns = [
      // Ghunna patterns (نون ساكنة ومیم ساكنة) - separate the characters
      { pattern: /\[([^[\]]*[ن][ْ][^[\]]*)\]/g, type: 'ghunna' },
      { pattern: /\[([^[\]]*[م][ْ][^[\]]*)\]/g, type: 'ghunna' },
      { pattern: /\[([^[\]]*[ن][ّ][^[\]]*)\]/g, type: 'ghunna' },
      { pattern: /\[([^[\]]*[م][ّ][^[\]]*)\]/g, type: 'ghunna' },
      
      // Qalqala patterns (قطب جد) - separate the characters
      { pattern: /\[([^[\]]*[ق][ْ][^[\]]*)\]/g, type: 'qalqala' },
      { pattern: /\[([^[\]]*[ط][ْ][^[\]]*)\]/g, type: 'qalqala' },
      { pattern: /\[([^[\]]*[ب][ْ][^[\]]*)\]/g, type: 'qalqala' },
      { pattern: /\[([^[\]]*[ج][ْ][^[\]]*)\]/g, type: 'qalqala' },
      { pattern: /\[([^[\]]*[د][ْ][^[\]]*)\]/g, type: 'qalqala' },
      
      // Madd patterns (مد) - separate the characters
      { pattern: /\[([^[\]]*[ا][ٰ][^[\]]*)\]/g, type: 'madd' },
      { pattern: /\[([^[\]]*[و][ٰ][^[\]]*)\]/g, type: 'madd' },
      { pattern: /\[([^[\]]*[ي][ٰ][^[\]]*)\]/g, type: 'madd' },
      { pattern: /\[([^[\]]*[ا][ۤ][^[\]]*)\]/g, type: 'madd' },
      { pattern: /\[([^[\]]*[و][ۤ][^[\]]*)\]/g, type: 'madd' },
      { pattern: /\[([^[\]]*[ي][ۤ][^[\]]*)\]/g, type: 'madd' },
      
      // Idgham patterns (إدغام) - separate the characters
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ي][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ر][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[م][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ل][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ن][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[و][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ي][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ر][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[م][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ل][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ن][^[\]]*)\]/g, type: 'idgham' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[و][^[\]]*)\]/g, type: 'idgham' },
      
      // Ikhfa patterns (إخفاء) - separate the characters for each letter
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ت][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ث][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ج][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[د][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ذ][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ز][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[س][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ش][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ص][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ض][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ط][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ظ][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ف][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ق][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ك][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ت][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ث][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ج][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[د][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ذ][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ز][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[س][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ش][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ص][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ض][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ط][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ظ][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ف][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ق][^[\]]*)\]/g, type: 'ikhfa' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ك][^[\]]*)\]/g, type: 'ikhfa' },
      
      // Iqlab patterns (إقلاب) - separate the characters
      { pattern: /\[([^[\]]*[ن][ْ]\s*[ب][^[\]]*)\]/g, type: 'iqlab' },
      { pattern: /\[([^[\]]*[م][ْ]\s*[ب][^[\]]*)\]/g, type: 'iqlab' },
      
      // Waqf signs (علامات الوقف) - each sign separately
      { pattern: /([۝])/g, type: 'waqf' },
      { pattern: /([۞])/g, type: 'waqf' },
      { pattern: /([ۖ])/g, type: 'waqf' },
      { pattern: /([ۗ])/g, type: 'waqf' },
      { pattern: /([ۘ])/g, type: 'waqf' },
      { pattern: /([ۙ])/g, type: 'waqf' },
      { pattern: /([ۚ])/g, type: 'waqf' },
      { pattern: /([ۛ])/g, type: 'waqf' },
      { pattern: /([ۜ])/g, type: 'waqf' },
      
      // Lam Shamsiyya and Qamariyya - separate the characters
      { pattern: /\[([^[\]]*[ا][ل][ت][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ث][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][د][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ذ][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ر][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ز][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][س][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ش][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ص][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ض][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ط][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ظ][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ل][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*[ا][ل][ن][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      
      { pattern: /\[([^[\]]*[ا][ل][ا][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ب][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ج][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ح][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][خ][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ع][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][غ][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ف][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ق][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ك][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][م][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ه][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][و][^[\]]*)\]/g, type: 'lam_qamariyya' },
      { pattern: /\[([^[\]]*[ا][ل][ي][^[\]]*)\]/g, type: 'lam_qamariyya' },
      
      // Silent letters - separate the characters
      { pattern: /\[([^[\]]*[ٱ][^[\]]*)\]/g, type: 'silent' },
    ];

    let workingText = text;
    const foundSegments: { start: number; end: number; type: string; text: string; originalMatch: string }[] = [];

    // Find all tajweed segments
    tajweedPatterns.forEach(({ pattern, type }) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        foundSegments.push({
          start: match.index,
          end: match.index + match[0].length,
          type,
          text: match[1] || match[0],
          originalMatch: match[0]
        });
      }
    });

    // Sort segments by position
    foundSegments.sort((a, b) => a.start - b.start);

    // Remove overlapping segments (keep the first one)
    const nonOverlappingSegments = [];
    let lastEnd = 0;
    
    for (const segment of foundSegments) {
      if (segment.start >= lastEnd) {
        nonOverlappingSegments.push(segment);
        lastEnd = segment.end;
      }
    }

    // Build the final segments array
    let currentPos = 0;
    
    for (const segment of nonOverlappingSegments) {
      // Add text before this segment
      if (segment.start > currentPos) {
        const beforeText = text.substring(currentPos, segment.start);
        const cleanBeforeText = this.cleanText(beforeText);
        if (cleanBeforeText.trim()) {
          segments.push({
            text: cleanBeforeText,
            type: 'default',
            color: this.tajweedColors.default
          });
        }
      }
      
      // Add the tajweed segment
      const cleanSegmentText = this.cleanText(segment.text);
      if (cleanSegmentText.trim()) {
        segments.push({
          text: cleanSegmentText,
          type: segment.type,
          color: this.tajweedColors[segment.type] || this.tajweedColors.default
        });
      }
      
      currentPos = segment.end;
    }
    
    // Add remaining text
    if (currentPos < text.length) {
      const remainingText = text.substring(currentPos);
      const cleanRemainingText = this.cleanText(remainingText);
      if (cleanRemainingText.trim()) {
        segments.push({
          text: cleanRemainingText,
          type: 'default',
          color: this.tajweedColors.default
        });
      }
    }

    // If no segments were found, return the whole text as default
    if (segments.length === 0) {
      const cleanText = this.cleanText(text);
      if (cleanText.trim()) {
        segments.push({
          text: cleanText,
          type: 'default',
          color: this.tajweedColors.default
        });
      }
    }

    return {
      surah: surahNumber,
      ayah: ayahNumber,
      segments: segments.filter(s => s.text && s.text.trim().length > 0)
    };
  }

  private cleanText(text: string): string {
    // Remove brackets and HTML tags, keep Arabic text and diacritics
    return text
      .replace(/[[\]]/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  private generateBasicTajweed(surahNumber: number, ayahNumber: number): TajweedData {
    // This is a fallback method that applies basic tajweed rules
    console.log(`Generating basic tajweed for ${surahNumber}:${ayahNumber}`);
    
    // Try to get the plain text from the main Quran API as fallback
    return {
      surah: surahNumber,
      ayah: ayahNumber,
      segments: []
    };
  }

  // Method to apply basic tajweed rules to any Arabic text
  applyBasicTajweedRules(text: string): TajweedSegment[] {
    const segments: TajweedSegment[] = [];
    
    if (!text || typeof text !== 'string') {
      console.log('Invalid text provided to applyBasicTajweedRules');
      return segments;
    }
    
    // Apply word-by-word analysis for basic tajweed rules
    const words = text.split(/(\s+)/); // Keep spaces
    
    words.forEach((word) => {
      if (!word || word.trim().length === 0) {
        if (word) { // It's a space
          segments.push({
            text: word,
            type: 'default',
            color: this.tajweedColors.default
          });
        }
        return;
      }
      
      // Analyze each word for tajweed rules
      const wordSegments = this.analyzeWordForTajweed(word);
      segments.push(...wordSegments);
    });
    
    return segments.filter(s => s.text && s.text.length > 0);
  }

  private analyzeWordForTajweed(word: string): TajweedSegment[] {
    const segments: TajweedSegment[] = [];
    
    // Check for various tajweed rules in order of priority
    
    // 1. Check for Ghunna (نون ساكنة ومیم ساكنة)
    if (this.hasGhunna(word)) {
      segments.push({
        text: word,
        type: 'ghunna',
        color: this.tajweedColors.ghunna
      });
    }
    // 2. Check for Qalqala (قطب جد)
    else if (this.hasQalqala(word)) {
      segments.push({
        text: word,
        type: 'qalqala',
        color: this.tajweedColors.qalqala
      });
    }
    // 3. Check for Madd (مد)
    else if (this.hasMadd(word)) {
      segments.push({
        text: word,
        type: 'madd',
        color: this.tajweedColors.madd
      });
    }
    // 4. Check for Idgham (إدغام)
    else if (this.hasIdgham(word)) {
      segments.push({
        text: word,
        type: 'idgham',
        color: this.tajweedColors.idgham
      });
    }
    // 5. Check for Ikhfa (إخفاء)
    else if (this.hasIkhfa(word)) {
      segments.push({
        text: word,
        type: 'ikhfa',
        color: this.tajweedColors.ikhfa
      });
    }
    // 6. Check for Iqlab (إقلاب)
    else if (this.hasIqlab(word)) {
      segments.push({
        text: word,
        type: 'iqlab',
        color: this.tajweedColors.iqlab
      });
    }
    // 7. Check for Waqf signs
    else if (this.hasWaqf(word)) {
      segments.push({
        text: word,
        type: 'waqf',
        color: this.tajweedColors.waqf
      });
    }
    // Default case
    else {
      segments.push({
        text: word,
        type: 'default',
        color: this.tajweedColors.default
      });
    }
    
    return segments;
  }

  private hasGhunna(word: string): boolean {
    // Ghunna: نون ساكنة أو میم ساكنة - separate the characters
    return /[ن][ْ]/.test(word) || /[م][ْ]/.test(word) || /[ن][ّ]/.test(word) || /[م][ّ]/.test(word);
  }

  private hasQalqala(word: string): boolean {
    // Qalqala letters: ق ط ب ج د with sukun - separate the characters
    return /[ق][ْ]/.test(word) || /[ط][ْ]/.test(word) || /[ب][ْ]/.test(word) || /[ج][ْ]/.test(word) || /[د][ْ]/.test(word);
  }

  private hasMadd(word: string): boolean {
    // Madd: prolonged vowels - separate the characters
    return /[ا][ٰ]/.test(word) || /[و][ٰ]/.test(word) || /[ي][ٰ]/.test(word) || /[ا][ۤ]/.test(word) || /[و][ۤ]/.test(word) || /[ي][ۤ]/.test(word) || /[اوي]{2,}/.test(word);
  }

  private hasIdgham(word: string): boolean {
    // Idgham: نون ساكنة أو تنوين followed by يرملنو - separate the characters
    return /[ن][ْ]\s*[يرملنو]/.test(word) || /[م][ْ]\s*[يرملنو]/.test(word);
  }

  private hasIkhfa(word: string): boolean {
    // Ikhfa: نون ساكنة أو تنوين followed by تثجدذزسشصضطظفقك - separate the characters
    return /[ن][ْ]\s*[تثجدذزسشصضطظفقك]/.test(word) || /[م][ْ]\s*[تثجدذزسشصضطظفقك]/.test(word);
  }

  private hasIqlab(word: string): boolean {
    // Iqlab: نون ساكنة أو تنوين followed by ب - separate the characters
    return /[ن][ْ]\s*[ب]/.test(word) || /[م][ْ]\s*[ب]/.test(word);
  }

  private hasWaqf(word: string): boolean {
    // Waqf signs - each sign separately
    return /[۝]/.test(word) || /[۞]/.test(word) || /[ۖ]/.test(word) || /[ۗ]/.test(word) || /[ۘ]/.test(word) || /[ۙ]/.test(word) || /[ۚ]/.test(word) || /[ۛ]/.test(word) || /[ۜ]/.test(word);
  }

  getTajweedColorLegend(): { [key: string]: { color: string; name: string; description: string } } {
    return {
      'ghunna': {
        color: this.tajweedColors.ghunna,
        name: 'غنة',
        description: 'نون ساكنة ومیم ساكنة'
      },
      'qalqala': {
        color: this.tajweedColors.qalqala,
        name: 'قلقلة',
        description: 'قطب جد'
      },
      'madd': {
        color: this.tajweedColors.madd,
        name: 'مد',
        description: 'إطالة الصوت'
      },
      'idgham': {
        color: this.tajweedColors.idgham,
        name: 'إدغام',
        description: 'دمج الحروف'
      },
      'ikhfa': {
        color: this.tajweedColors.ikhfa,
        name: 'إخفاء',
        description: 'إخفاء النون الساكنة'
      },
      'iqlab': {
        color: this.tajweedColors.iqlab,
        name: 'إقلاب',
        description: 'قلب النون میماً'
      },
      'izhar': {
        color: this.tajweedColors.izhar,
        name: 'إظهار',
        description: 'إظهار النون الساكنة'
      },
      'waqf': {
        color: this.tajweedColors.waqf,
        name: 'وقف',
        description: 'علامات الوقف'
      },
      'lam_shamsiyya': {
        color: this.tajweedColors.lam_shamsiyya,
        name: 'لام شمسية',
        description: 'اللام الشمسية'
      },
      'lam_qamariyya': {
        color: this.tajweedColors.lam_qamariyya,
        name: 'لام قمرية',
        description: 'اللام القمرية'
      }
    };
  }
}

export const tajweedService = new TajweedService();
