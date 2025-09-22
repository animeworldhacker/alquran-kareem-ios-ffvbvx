
import { TajweedData, TajweedSegment } from '../types';

class TajweedService {
  private cache = new Map<string, TajweedData>();
  private baseUrl = 'https://api.github.com/repos/fcat97/QuranApi/contents/tajweed';

  async getTajweedData(surahNumber: number, ayahNumber: number): Promise<TajweedData | null> {
    const cacheKey = `${surahNumber}:${ayahNumber}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`Returning cached tajweed data for ${cacheKey}`);
      return this.cache.get(cacheKey) || null;
    }

    try {
      console.log(`Fetching tajweed data for ${surahNumber}:${ayahNumber}`);
      
      // Try to fetch from the GitHub API
      const response = await fetch(`${this.baseUrl}/${surahNumber}.json`);
      
      if (!response.ok) {
        console.log(`Tajweed API returned ${response.status}, falling back to basic rules`);
        return null;
      }
      
      const data = await response.json();
      
      // Parse the GitHub API response
      if (data.content) {
        const decodedContent = atob(data.content);
        const tajweedData = JSON.parse(decodedContent);
        
        // Find the specific ayah
        const ayahData = tajweedData.find((item: any) => item.ayah === ayahNumber);
        
        if (ayahData && ayahData.segments) {
          const result: TajweedData = {
            surah: surahNumber,
            ayah: ayahNumber,
            segments: ayahData.segments.map((segment: any) => ({
              text: segment.text || '',
              type: segment.type || 'default',
              color: this.getTajweedColor(segment.type || 'default')
            }))
          };
          
          // Cache the result
          this.cache.set(cacheKey, result);
          console.log(`Cached tajweed data for ${cacheKey}`);
          
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.log(`Error fetching tajweed data for ${cacheKey}:`, error);
      return null;
    }
  }

  applyBasicTajweedRules(text: string): TajweedSegment[] {
    if (!text) {
      return [];
    }

    console.log('Applying basic tajweed rules to text:', text.substring(0, 50) + '...');

    // Basic tajweed rules with regex patterns
    const rules = [
      {
        name: 'ghunna',
        pattern: /[نم](?=[\u064B-\u0652])/gu,
        color: '#FF6B6B',
        type: 'ghunna'
      },
      {
        name: 'qalqala',
        pattern: /[قطبجد](?=[\u064B-\u0652])/gu,
        color: '#4ECDC4',
        type: 'qalqala'
      },
      {
        name: 'madd',
        pattern: /[اوي](?=[\u064B-\u0652]?[اوي])/gu,
        color: '#45B7D1',
        type: 'madd'
      },
      {
        name: 'idgham',
        pattern: /ن(?=[\u064B-\u0652]?[يرملو])/gu,
        color: '#96CEB4',
        type: 'idgham'
      },
      {
        name: 'ikhfa',
        pattern: /ن(?=[\u064B-\u0652]?[تثجحخسشصضطظفقك])/gu,
        color: '#FFEAA7',
        type: 'ikhfa'
      },
      {
        name: 'iqlab',
        pattern: /ن(?=[\u064B-\u0652]?ب)/gu,
        color: '#DDA0DD',
        type: 'iqlab'
      }
    ];

    const segments: TajweedSegment[] = [];
    let lastIndex = 0;
    const matches: Array<{ index: number; length: number; rule: any }> = [];

    // Find all matches
    rules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          rule: rule
        });
      }
    });

    // Sort matches by position
    matches.sort((a, b) => a.index - b.index);

    // Remove overlapping matches (keep the first one)
    const filteredMatches = [];
    let lastEndIndex = -1;
    
    for (const match of matches) {
      if (match.index >= lastEndIndex) {
        filteredMatches.push(match);
        lastEndIndex = match.index + match.length;
      }
    }

    // Create segments
    filteredMatches.forEach(match => {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText.trim()) {
          segments.push({
            text: beforeText,
            type: 'default',
            color: '#2F4F4F'
          });
        }
      }

      // Add the matched text with tajweed coloring
      const matchedText = text.substring(match.index, match.index + match.length);
      segments.push({
        text: matchedText,
        type: match.rule.type,
        color: match.rule.color
      });

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        segments.push({
          text: remainingText,
          type: 'default',
          color: '#2F4F4F'
        });
      }
    }

    // If no matches found, return the entire text as default
    if (segments.length === 0) {
      segments.push({
        text: text,
        type: 'default',
        color: '#2F4F4F'
      });
    }

    console.log(`Applied basic tajweed rules, created ${segments.length} segments`);
    return segments;
  }

  private getTajweedColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'ghunna': '#FF6B6B',
      'qalqala': '#4ECDC4',
      'madd': '#45B7D1',
      'idgham': '#96CEB4',
      'ikhfa': '#FFEAA7',
      'iqlab': '#DDA0DD',
      'default': '#2F4F4F'
    };

    return colorMap[type] || colorMap['default'];
  }

  // Clear cache
  clearCache(): void {
    console.log('Clearing tajweed cache');
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }

  // Get cache keys
  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

export const tajweedService = new TajweedService();
