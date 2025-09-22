
import { Ayah } from '../types';
import { processAyahText } from '../utils/textProcessor';

export interface TajweedSegment {
  text: string;
  rule?: string;
  color?: string;
}

export interface TajweedData {
  surah: number;
  ayah: number;
  segments: TajweedSegment[];
}

class TajweedService {
  private cache: Map<string, TajweedData> = new Map();
  private baseUrl = 'https://api.fcat97.com/quran/v1';

  async getTajweedData(surahNumber: number, ayahNumber: number): Promise<TajweedData | null> {
    const cacheKey = `${surahNumber}:${ayahNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`Returning cached tajweed data for ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log(`Fetching tajweed data for ${surahNumber}:${ayahNumber}`);
      
      // Try the new API first
      const response = await fetch(`${this.baseUrl}/tajweed/${surahNumber}/${ayahNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.segments && Array.isArray(data.segments)) {
          const tajweedData: TajweedData = {
            surah: surahNumber,
            ayah: ayahNumber,
            segments: data.segments.map((segment: any) => ({
              text: segment.text || '',
              rule: segment.rule || '',
              color: this.getRuleColor(segment.rule || '')
            }))
          };
          
          // Cache the result
          this.cache.set(cacheKey, tajweedData);
          console.log(`Cached tajweed data for ${cacheKey}`);
          return tajweedData;
        }
      }
      
      console.log(`API failed for ${cacheKey}, falling back to basic rules`);
      return null;
      
    } catch (error) {
      console.log(`Error fetching tajweed data for ${cacheKey}:`, error);
      return null;
    }
  }

  applyBasicTajweedRules(text: string): TajweedSegment[] {
    if (!text) return [];

    console.log('Applying basic tajweed rules to text:', text.substring(0, 50) + '...');
    
    const segments: TajweedSegment[] = [];
    let currentIndex = 0;
    
    // Define tajweed rules with their patterns and colors
    const rules = [
      {
        name: 'Ghunna',
        pattern: /[نم](?=[\u064B-\u0652]*[نم])/g,
        color: '#FF6B6B'
      },
      {
        name: 'Qalqala',
        pattern: /[قطبجد](?=[\u064B-\u0652]*[\s]|$)/g,
        color: '#4ECDC4'
      },
      {
        name: 'Madd',
        pattern: /[اوي][\u064E\u064F\u0650]?/g,
        color: '#45B7D1'
      },
      {
        name: 'Idgham',
        pattern: /[نم][\u064B-\u0652]*[يرملنو]/g,
        color: '#96CEB4'
      },
      {
        name: 'Ikhfa',
        pattern: /ن[\u064B-\u0652]*[تثجحخسشصضطظفقك]/g,
        color: '#FFEAA7'
      },
      {
        name: 'Iqlab',
        pattern: /ن[\u064B-\u0652]*ب/g,
        color: '#DDA0DD'
      }
    ];

    // Create a combined pattern to find all matches
    const allMatches: Array<{match: RegExpMatchArray, rule: string, color: string}> = [];
    
    rules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, 'g');
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          match,
          rule: rule.name,
          color: rule.color
        });
      }
    });

    // Sort matches by position
    allMatches.sort((a, b) => a.match.index! - b.match.index!);

    // Build segments
    allMatches.forEach(({match, rule, color}) => {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      // Add text before this match
      if (currentIndex < matchStart) {
        segments.push({
          text: text.substring(currentIndex, matchStart),
          rule: 'normal',
          color: '#2F4F4F'
        });
      }

      // Add the matched segment
      if (currentIndex <= matchStart) {
        segments.push({
          text: match[0],
          rule,
          color
        });
        currentIndex = matchEnd;
      }
    });

    // Add remaining text
    if (currentIndex < text.length) {
      segments.push({
        text: text.substring(currentIndex),
        rule: 'normal',
        color: '#2F4F4F'
      });
    }

    // If no rules matched, return the whole text as normal
    if (segments.length === 0) {
      segments.push({
        text,
        rule: 'normal',
        color: '#2F4F4F'
      });
    }

    console.log(`Applied basic tajweed rules, created ${segments.length} segments`);
    return segments;
  }

  private getRuleColor(rule: string): string {
    const colorMap: { [key: string]: string } = {
      'ghunna': '#FF6B6B',
      'qalqala': '#4ECDC4', 
      'madd': '#45B7D1',
      'idgham': '#96CEB4',
      'ikhfa': '#FFEAA7',
      'iqlab': '#DDA0DD',
      'normal': '#2F4F4F'
    };

    return colorMap[rule.toLowerCase()] || '#2F4F4F';
  }

  // Clear cache
  async clearCache(): Promise<void> {
    console.log('Clearing tajweed cache');
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}

export const tajweedService = new TajweedService();
