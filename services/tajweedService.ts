
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

  // Tajweed color mapping based on common tajweed rules
  private tajweedColors: { [key: string]: string } = {
    'ghunna': '#FF6B6B',           // Red for Ghunna
    'qalqala': '#4ECDC4',          // Teal for Qalqala
    'madd': '#45B7D1',             // Blue for Madd
    'idgham': '#96CEB4',           // Green for Idgham
    'ikhfa': '#FFEAA7',            // Yellow for Ikhfa
    'iqlab': '#DDA0DD',            // Plum for Iqlab
    'izhar': '#FFB347',            // Orange for Izhar
    'silent': '#D3D3D3',           // Light gray for silent letters
    'waqf': '#FF69B4',             // Hot pink for Waqf signs
    'default': '#2F4F4F'           // Default dark slate gray
  };

  async getTajweedData(surahNumber: number, ayahNumber: number): Promise<TajweedData | null> {
    const cacheKey = `${surahNumber}:${ayahNumber}`;
    
    if (this.tajweedCache.has(cacheKey)) {
      return this.tajweedCache.get(cacheKey)!;
    }

    try {
      console.log(`Fetching Tajweed data for Surah ${surahNumber}, Ayah ${ayahNumber}...`);
      
      // Try to fetch from the tajweed API
      const response = await fetch(`${this.baseUrl}/ayah/${surahNumber}:${ayahNumber}/editions/quran-tajweed`);
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.length > 0) {
        const ayahData = data.data[0];
        const tajweedData = this.parseTajweedText(ayahData.text, surahNumber, ayahNumber);
        this.tajweedCache.set(cacheKey, tajweedData);
        console.log(`Tajweed data fetched successfully for ${surahNumber}:${ayahNumber}`);
        return tajweedData;
      } else {
        // Fallback to basic tajweed parsing
        return this.generateBasicTajweed(surahNumber, ayahNumber);
      }
    } catch (error) {
      console.error(`Error fetching Tajweed data for ${surahNumber}:${ayahNumber}:`, error);
      // Return basic tajweed as fallback
      return this.generateBasicTajweed(surahNumber, ayahNumber);
    }
  }

  private parseTajweedText(text: string, surahNumber: number, ayahNumber: number): TajweedData {
    const segments: TajweedSegment[] = [];
    
    // Remove HTML tags and parse tajweed markup
    let cleanText = text;
    
    // Parse different tajweed markings
    const tajweedPatterns = [
      { pattern: /<span class="ghunna">(.*?)<\/span>/g, type: 'ghunna' },
      { pattern: /<span class="qalqala">(.*?)<\/span>/g, type: 'qalqala' },
      { pattern: /<span class="madd">(.*?)<\/span>/g, type: 'madd' },
      { pattern: /<span class="idgham">(.*?)<\/span>/g, type: 'idgham' },
      { pattern: /<span class="ikhfa">(.*?)<\/span>/g, type: 'ikhfa' },
      { pattern: /<span class="iqlab">(.*?)<\/span>/g, type: 'iqlab' },
      { pattern: /<span class="izhar">(.*?)<\/span>/g, type: 'izhar' },
      { pattern: /<span class="silent">(.*?)<\/span>/g, type: 'silent' },
      { pattern: /<span class="waqf">(.*?)<\/span>/g, type: 'waqf' },
    ];

    let processedText = cleanText;
    const foundSegments: Array<{ start: number; end: number; type: string; text: string }> = [];

    // Find all tajweed segments
    tajweedPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        foundSegments.push({
          start,
          end,
          type,
          text: match[1]
        });
      }
    });

    // Sort segments by position
    foundSegments.sort((a, b) => a.start - b.start);

    // Remove HTML tags for clean text
    processedText = processedText.replace(/<[^>]*>/g, '');

    // If no specific tajweed markings found, create basic segments
    if (foundSegments.length === 0) {
      segments.push({
        text: processedText,
        type: 'default',
        color: this.tajweedColors.default
      });
    } else {
      // Process segments with tajweed markings
      let lastEnd = 0;
      
      foundSegments.forEach(segment => {
        // Add text before this segment
        if (segment.start > lastEnd) {
          const beforeText = cleanText.substring(lastEnd, segment.start).replace(/<[^>]*>/g, '');
          if (beforeText.trim()) {
            segments.push({
              text: beforeText,
              type: 'default',
              color: this.tajweedColors.default
            });
          }
        }
        
        // Add the tajweed segment
        segments.push({
          text: segment.text,
          type: segment.type,
          color: this.tajweedColors[segment.type] || this.tajweedColors.default
        });
        
        lastEnd = segment.end;
      });
      
      // Add remaining text
      if (lastEnd < cleanText.length) {
        const remainingText = cleanText.substring(lastEnd).replace(/<[^>]*>/g, '');
        if (remainingText.trim()) {
          segments.push({
            text: remainingText,
            type: 'default',
            color: this.tajweedColors.default
          });
        }
      }
    }

    return {
      surah: surahNumber,
      ayah: ayahNumber,
      segments: segments.filter(s => s.text.trim().length > 0)
    };
  }

  private generateBasicTajweed(surahNumber: number, ayahNumber: number): TajweedData {
    // This is a fallback method that applies basic tajweed rules
    // In a real implementation, you would have more sophisticated rules
    
    // For now, we'll return a simple structure that can be enhanced
    return {
      surah: surahNumber,
      ayah: ayahNumber,
      segments: []
    };
  }

  // Method to apply basic tajweed rules to any Arabic text
  applyBasicTajweedRules(text: string): TajweedSegment[] {
    const segments: TajweedSegment[] = [];
    const words = text.split(' ');
    
    words.forEach((word, index) => {
      let wordSegments: TajweedSegment[] = [];
      
      // Basic tajweed rules
      if (word.includes('ن') || word.includes('م')) {
        // Check for Ghunna
        if (this.hasGhunna(word)) {
          wordSegments.push({
            text: word,
            type: 'ghunna',
            color: this.tajweedColors.ghunna
          });
        } else {
          wordSegments.push({
            text: word,
            type: 'default',
            color: this.tajweedColors.default
          });
        }
      } else if (this.hasQalqala(word)) {
        wordSegments.push({
          text: word,
          type: 'qalqala',
          color: this.tajweedColors.qalqala
        });
      } else if (this.hasMadd(word)) {
        wordSegments.push({
          text: word,
          type: 'madd',
          color: this.tajweedColors.madd
        });
      } else {
        wordSegments.push({
          text: word,
          type: 'default',
          color: this.tajweedColors.default
        });
      }
      
      segments.push(...wordSegments);
      
      // Add space between words (except for the last word)
      if (index < words.length - 1) {
        segments.push({
          text: ' ',
          type: 'default',
          color: this.tajweedColors.default
        });
      }
    });
    
    return segments;
  }

  private hasGhunna(word: string): boolean {
    // Basic Ghunna detection
    return /[نم]/.test(word) && (/[نم][نم]/.test(word) || /[نم]ْ/.test(word));
  }

  private hasQalqala(word: string): boolean {
    // Qalqala letters: ق ط ب ج د
    return /[قطبجد]/.test(word);
  }

  private hasMadd(word: string): boolean {
    // Basic Madd detection
    return /[اوي]/.test(word) && /[اوي]{2,}/.test(word);
  }

  getTajweedColorLegend(): { [key: string]: { color: string; name: string; description: string } } {
    return {
      'ghunna': {
        color: this.tajweedColors.ghunna,
        name: 'غنة',
        description: 'Nasal sound'
      },
      'qalqala': {
        color: this.tajweedColors.qalqala,
        name: 'قلقلة',
        description: 'Echoing sound'
      },
      'madd': {
        color: this.tajweedColors.madd,
        name: 'مد',
        description: 'Prolongation'
      },
      'idgham': {
        color: this.tajweedColors.idgham,
        name: 'إدغام',
        description: 'Merging'
      },
      'ikhfa': {
        color: this.tajweedColors.ikhfa,
        name: 'إخفاء',
        description: 'Concealment'
      },
      'iqlab': {
        color: this.tajweedColors.iqlab,
        name: 'إقلاب',
        description: 'Conversion'
      },
      'izhar': {
        color: this.tajweedColors.izhar,
        name: 'إظهار',
        description: 'Clear pronunciation'
      },
      'waqf': {
        color: this.tajweedColors.waqf,
        name: 'وقف',
        description: 'Stopping signs'
      }
    };
  }
}

export const tajweedService = new TajweedService();
