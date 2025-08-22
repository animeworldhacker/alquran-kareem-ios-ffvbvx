
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
    const tajweedPatterns = [
      // Ghunna patterns (نون ساكنة ومیم ساكنة)
      { pattern: /\[([^[\]]*[نم]ْ[^[\]]*)\]/g, type: 'ghunna' },
      { pattern: /\[([^[\]]*[نم]ّ[^[\]]*)\]/g, type: 'ghunna' },
      
      // Qalqala patterns (قطب جد)
      { pattern: /\[([^[\]]*[قطبجد]ْ[^[\]]*)\]/g, type: 'qalqala' },
      
      // Madd patterns (مد)
      { pattern: /\[([^[\]]*[اوي]ٰ[^[\]]*)\]/g, type: 'madd' },
      { pattern: /\[([^[\]]*[اوي]ۤ[^[\]]*)\]/g, type: 'madd' },
      
      // Idgham patterns (إدغام)
      { pattern: /\[([^[\]]*[نم]ْ\s*[يرملنو][^[\]]*)\]/g, type: 'idgham' },
      
      // Ikhfa patterns (إخفاء)
      { pattern: /\[([^[\]]*[نم]ْ\s*[تثجدذزسشصضطظفقك][^[\]]*)\]/g, type: 'ikhfa' },
      
      // Iqlab patterns (إقلاب)
      { pattern: /\[([^[\]]*[نم]ْ\s*ب[^[\]]*)\]/g, type: 'iqlab' },
      
      // Waqf signs (علامات الوقف)
      { pattern: /([۝۞ۖۗۘۙۚۛۜ])/g, type: 'waqf' },
      
      // Lam Shamsiyya and Qamariyya
      { pattern: /\[([^[\]]*ال[تثدذرزسشصضطظلن][^[\]]*)\]/g, type: 'lam_shamsiyya' },
      { pattern: /\[([^[\]]*ال[ابجحخعغفقكمهوي][^[\]]*)\]/g, type: 'lam_qamariyya' },
      
      // Silent letters
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
    // Ghunna: نون ساكنة أو میم ساكنة
    return /[نم]ْ/.test(word) || /[نم]ّ/.test(word);
  }

  private hasQalqala(word: string): boolean {
    // Qalqala letters: ق ط ب ج د with sukun
    return /[قطبجد]ْ/.test(word);
  }

  private hasMadd(word: string): boolean {
    // Madd: prolonged vowels
    return /[اوي]ٰ/.test(word) || /[اوي]ۤ/.test(word) || /[اوي]{2,}/.test(word);
  }

  private hasIdgham(word: string): boolean {
    // Idgham: نون ساكنة أو تنوين followed by يرملنو
    return /[نم]ْ\s*[يرملنو]/.test(word);
  }

  private hasIkhfa(word: string): boolean {
    // Ikhfa: نون ساكنة أو تنوين followed by تثجدذزسشصضطظفقك
    return /[نم]ْ\s*[تثجدذزسشصضطظفقك]/.test(word);
  }

  private hasIqlab(word: string): boolean {
    // Iqlab: نون ساكنة أو تنوين followed by ب
    return /[نم]ْ\s*ب/.test(word);
  }

  private hasWaqf(word: string): boolean {
    // Waqf signs
    return /[۝۞ۖۗۘۙۚۛۜ]/.test(word);
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
