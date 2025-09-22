
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
  private baseUrl = 'https://quranapi.pages.dev/api';
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
      
      // Try to fetch from the new QuranApi with tajweed
      const response = await fetch(`${this.baseUrl}/${surahNumber}/${ayahNumber}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`QuranApi returned ${response.status}, using fallback`);
        return this.generateBasicTajweed(surahNumber, ayahNumber);
      }
      
      const data = await response.json();
      
      if (data && data.arabic1) {
        // The new API provides arabic1 with tajweed markup
        const tajweedData = this.parseTajweedText(data.arabic1, surahNumber, ayahNumber);
        this.tajweedCache.set(cacheKey, tajweedData);
        console.log(`Tajweed data fetched successfully for ${surahNumber}:${ayahNumber}`);
        return tajweedData;
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
    
    // The new API uses HTML-like tags for tajweed rules
    // Parse the text and extract tajweed segments
    let workingText = text;
    let currentIndex = 0;
    
    // Regular expression to match HTML-like tags with content
    const tagPattern = /<([^>]+)>([^<]*)<\/[^>]*>/g;
    const matches = [];
    let match;
    
    while ((match = tagPattern.exec(text)) !== null) {
      matches.push({
        fullMatch: match[0],
        tag: match[1],
        content: match[2],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    let lastEnd = 0;
    
    for (const tagMatch of matches) {
      // Add text before this tag
      if (tagMatch.start > lastEnd) {
        const beforeText = text.substring(lastEnd, tagMatch.start);
        const cleanBeforeText = this.cleanText(beforeText);
        if (cleanBeforeText.trim()) {
          segments.push({
            text: cleanBeforeText,
            type: 'default',
            color: this.tajweedColors.default
          });
        }
      }
      
      // Determine tajweed type from tag attributes
      const tajweedType = this.determineTajweedType(tagMatch.tag);
      const cleanContent = this.cleanText(tagMatch.content);
      
      if (cleanContent.trim()) {
        segments.push({
          text: cleanContent,
          type: tajweedType,
          color: this.tajweedColors[tajweedType] || this.tajweedColors.default
        });
      }
      
      lastEnd = tagMatch.end;
    }
    
    // Add remaining text
    if (lastEnd < text.length) {
      const remainingText = text.substring(lastEnd);
      const cleanRemainingText = this.cleanText(remainingText);
      if (cleanRemainingText.trim()) {
        segments.push({
          text: cleanRemainingText,
          type: 'default',
          color: this.tajweedColors.default
        });
      }
    }

    // If no segments were found, apply basic tajweed rules
    if (segments.length === 0) {
      const cleanText = this.cleanText(text);
      if (cleanText.trim()) {
        const basicSegments = this.applyBasicTajweedRules(cleanText);
        return {
          surah: surahNumber,
          ayah: ayahNumber,
          segments: basicSegments
        };
      }
    }

    return {
      surah: surahNumber,
      ayah: ayahNumber,
      segments: segments.filter(s => s.text && s.text.trim().length > 0)
    };
  }

  private determineTajweedType(tag: string): string {
    // Map HTML tag attributes to tajweed types
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes('ghunna') || tagLower.includes('color="#01579b"')) {
      return 'ghunna';
    } else if (tagLower.includes('qalqala') || tagLower.includes('color="#4a148c"')) {
      return 'qalqala';
    } else if (tagLower.includes('madd') || tagLower.includes('color="#d32f2f"')) {
      return 'madd';
    } else if (tagLower.includes('idgham') || tagLower.includes('color="#2e7d32"')) {
      return 'idgham';
    } else if (tagLower.includes('ikhfa') || tagLower.includes('color="#f57c00"')) {
      return 'ikhfa';
    } else if (tagLower.includes('iqlab') || tagLower.includes('color="#7b1fa2"')) {
      return 'iqlab';
    } else if (tagLower.includes('izhar') || tagLower.includes('color="#1976d2"')) {
      return 'izhar';
    } else if (tagLower.includes('waqf') || tagLower.includes('color="#e91e63"')) {
      return 'waqf';
    } else if (tagLower.includes('lam') && tagLower.includes('shams')) {
      return 'lam_shamsiyya';
    } else if (tagLower.includes('lam') && tagLower.includes('qamar')) {
      return 'lam_qamariyya';
    } else if (tagLower.includes('silent') || tagLower.includes('color="#9e9e9e"')) {
      return 'silent';
    }
    
    return 'default';
  }

  private cleanText(text: string): string {
    // Remove HTML tags and clean up the text
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private async generateBasicTajweed(surahNumber: number, ayahNumber: number): Promise<TajweedData> {
    // This is a fallback method that applies basic tajweed rules
    console.log(`Generating basic tajweed for ${surahNumber}:${ayahNumber}`);
    
    try {
      // Try to get the plain text from the main Quran API as fallback
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`);
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.text) {
          const segments = this.applyBasicTajweedRules(data.data.text);
          return {
            surah: surahNumber,
            ayah: ayahNumber,
            segments
          };
        }
      }
    } catch (error) {
      console.log('Error in generateBasicTajweed:', error);
    }
    
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
    return /[ن][ْ]/.test(word) || /[م][ْ]/.test(word) || /[ن][ّ]/.test(word) || /[م][ّ]/.test(word);
  }

  private hasQalqala(word: string): boolean {
    // Qalqala letters: ق ط ب ج د with sukun
    return /[قطبجد][ْ]/.test(word);
  }

  private hasMadd(word: string): boolean {
    // Madd: prolonged vowels
    return /[ا][ٰ]/.test(word) || /[و][ٰ]/.test(word) || /[ي][ٰ]/.test(word) || /[اوي]{2,}/.test(word);
  }

  private hasIdgham(word: string): boolean {
    // Idgham: نون ساكنة أو تنوين followed by يرملنو
    return /[ن][ْ]\s*[يرملنو]/.test(word) || /[م][ْ]\s*[يرملنو]/.test(word);
  }

  private hasIkhfa(word: string): boolean {
    // Ikhfa: نون ساكنة أو تنوين followed by تثجدذزسشصضطظفقك
    return /[ن][ْ]\s*[تثجدذزسشصضطظفقك]/.test(word) || /[م][ْ]\s*[تثجدذزسشصضطظفقك]/.test(word);
  }

  private hasIqlab(word: string): boolean {
    // Iqlab: نون ساكنة أو تنوين followed by ب
    return /[ن][ْ]\s*[ب]/.test(word) || /[م][ْ]\s*[ب]/.test(word);
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
