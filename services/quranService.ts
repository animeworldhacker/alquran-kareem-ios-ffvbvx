
import { QuranData, Surah, Ayah } from '../types';
import { processAyahText, validateTextProcessing } from '../utils/textProcessor';

class QuranService {
  private baseUrl = 'https://api.alquran.cloud/v1';
  private cachedQuran: QuranData | null = null;
  private processingStats = {
    totalSurahs: 0,
    processedSurahs: 0,
    bismillahRemoved: 0,
    processingErrors: 0
  };

  async getFullQuran(): Promise<QuranData> {
    if (this.cachedQuran) {
      console.log('Returning cached Quran data');
      return this.cachedQuran;
    }

    try {
      console.log('Fetching Quran data from API...');
      const response = await fetch(`${this.baseUrl}/quran/quran-uthmani`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        console.log('Processing Quran data to remove Bismillah from all first verses...');
        // Process the Quran data to remove Bismillah from first verses and fix verse numbering
        const processedData = this.processQuranData(data.data);
        this.cachedQuran = processedData;
        
        // Log processing statistics
        console.log('Quran data processing completed:', this.processingStats);
        
        return this.cachedQuran;
      } else {
        throw new Error(`API error: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching Quran:', error);
      throw new Error(`Failed to fetch Quran data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSurah(surahNumber: number): Promise<any> {
    try {
      console.log(`Fetching individual Surah ${surahNumber}...`);
      
      if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
        throw new Error(`Invalid surah number: ${surahNumber}`);
      }
      
      // Try to get from cached data first
      if (this.cachedQuran && this.cachedQuran.surahs) {
        const cachedSurah = this.cachedQuran.surahs.find(s => s.number === surahNumber);
        if (cachedSurah) {
          console.log(`Returning cached Surah ${surahNumber}`);
          return {
            number: cachedSurah.number,
            name: cachedSurah.name,
            englishName: cachedSurah.englishName,
            englishNameTranslation: cachedSurah.englishNameTranslation,
            numberOfAyahs: cachedSurah.numberOfAyahs,
            revelationType: cachedSurah.revelationType,
            ayahs: cachedSurah.ayahs
          };
        }
      }
      
      // Fetch individual surah if not in cache
      const response = await fetch(`${this.baseUrl}/surah/${surahNumber}/ar.asad`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        // Process the surah data to remove Bismillah from first verse and fix verse numbering
        const processedSurah = this.processSurahData(data.data, surahNumber);
        console.log(`Surah ${surahNumber} fetched and processed successfully`);
        return processedSurah;
      } else {
        throw new Error(`API error: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      throw new Error(`Failed to fetch Surah ${surahNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSurahs(): Promise<Surah[]> {
    try {
      const quranData = await this.getFullQuran();
      
      if (!quranData || !quranData.surahs || !Array.isArray(quranData.surahs)) {
        throw new Error('Invalid Quran data structure');
      }
      
      return quranData.surahs.map(surah => ({
        number: surah.number || 0,
        name: surah.name || '',
        englishName: surah.englishName || '',
        englishNameTranslation: surah.englishNameTranslation || '',
        numberOfAyahs: surah.numberOfAyahs || 0,
        revelationType: surah.revelationType || '',
      }));
    } catch (error) {
      console.error('Error getting surahs:', error);
      throw new Error(`Failed to get surahs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private processQuranData(quranData: QuranData): QuranData {
    console.log('Processing Quran data to remove Bismillah from first verses and fix verse numbering...');
    
    // Reset processing stats
    this.processingStats = {
      totalSurahs: quranData.surahs.length,
      processedSurahs: 0,
      bismillahRemoved: 0,
      processingErrors: 0
    };
    
    // Process each surah to remove Bismillah from first verses and fix verse numbering
    const processedSurahs = quranData.surahs.map(surah => {
      try {
        this.processingStats.processedSurahs++;
        
        if (surah.ayahs && Array.isArray(surah.ayahs)) {
          const processedAyahs = surah.ayahs.map(ayah => {
            try {
              // Process the text to remove Bismillah from first verse
              const originalText = ayah.text || '';
              const processedText = processAyahText(originalText, surah.number, ayah.numberInSurah);
              
              // Validate the processing
              const validation = validateTextProcessing(originalText, processedText, surah.number, ayah.numberInSurah);
              
              // Count processed first verses
              if (ayah.numberInSurah === 1 && originalText !== processedText) {
                this.processingStats.bismillahRemoved++;
                console.log(`✓ Bismillah removed from Surah ${surah.number}:1`);
              }
              
              // Log validation issues
              if (validation.hasIssues) {
                console.warn(`Processing issue in Surah ${surah.number}:${ayah.numberInSurah}: ${validation.details}`);
              }
              
              return {
                ...ayah,
                text: processedText
              };
            } catch (ayahError) {
              console.error(`Error processing ayah ${surah.number}:${ayah.numberInSurah}:`, ayahError);
              this.processingStats.processingErrors++;
              return ayah; // Return original ayah if processing fails
            }
          });
          
          // Filter out empty ayahs (where Bismillah was the only content)
          const filteredAyahs = processedAyahs.filter(ayah => {
            const hasContent = ayah.text && ayah.text.trim().length > 0;
            if (!hasContent) {
              console.log(`Filtering out empty ayah ${surah.number}:${ayah.numberInSurah} after Bismillah removal`);
            }
            return hasContent;
          });
          
          // Renumber ayahs to start from 1 and be consecutive
          const renumberedAyahs = filteredAyahs.map((ayah, index) => ({
            ...ayah,
            numberInSurah: index + 1
          }));
          
          // Update the numberOfAyahs to reflect the actual count after processing
          const updatedSurah = {
            ...surah,
            ayahs: renumberedAyahs,
            numberOfAyahs: renumberedAyahs.length
          };
          
          console.log(`Surah ${surah.number}: ${surah.ayahs.length} → ${renumberedAyahs.length} ayahs after processing`);
          
          return updatedSurah;
        }
        
        return surah;
      } catch (surahError) {
        console.error(`Error processing Surah ${surah.number}:`, surahError);
        this.processingStats.processingErrors++;
        return surah; // Return original surah if processing fails
      }
    });

    console.log(`Finished processing Quran data:`, {
      totalSurahs: this.processingStats.totalSurahs,
      processedSurahs: this.processingStats.processedSurahs,
      bismillahRemoved: this.processingStats.bismillahRemoved,
      processingErrors: this.processingStats.processingErrors,
      successRate: `${((this.processingStats.processedSurahs / this.processingStats.totalSurahs) * 100).toFixed(1)}%`
    });
    
    // Verify that all expected first verses had Bismillah removed (except Surah 9)
    const expectedRemovals = this.processingStats.totalSurahs - 1; // All except Surah 9
    if (this.processingStats.bismillahRemoved < expectedRemovals) {
      console.warn(`Warning: Expected ${expectedRemovals} Bismillah removals, but only ${this.processingStats.bismillahRemoved} were processed`);
    }
    
    return {
      ...quranData,
      surahs: processedSurahs
    };
  }

  private processSurahData(surahData: any, surahNumber: number): any {
    console.log(`Processing individual Surah ${surahNumber} data to remove Bismillah and fix verse numbering...`);
    
    // Process individual surah data to remove Bismillah from first verse and fix verse numbering
    if (surahData.ayahs && Array.isArray(surahData.ayahs)) {
      const processedAyahs = surahData.ayahs.map((ayah: any) => {
        try {
          // Process the text to remove Bismillah from first verse
          const originalText = ayah.text || '';
          const processedText = processAyahText(originalText, surahNumber, ayah.numberInSurah);
          
          // Validate the processing
          const validation = validateTextProcessing(originalText, processedText, surahNumber, ayah.numberInSurah);
          
          if (validation.hasIssues) {
            console.warn(`Processing issue in individual Surah ${surahNumber}:${ayah.numberInSurah}: ${validation.details}`);
          }
          
          return {
            ...ayah,
            text: processedText
          };
        } catch (error) {
          console.error(`Error processing ayah ${surahNumber}:${ayah.numberInSurah}:`, error);
          return ayah; // Return original ayah if processing fails
        }
      });
      
      // Filter out empty ayahs (where Bismillah was the only content)
      const filteredAyahs = processedAyahs.filter((ayah: any) => {
        const hasContent = ayah.text && ayah.text.trim().length > 0;
        if (!hasContent) {
          console.log(`Filtering out empty ayah ${surahNumber}:${ayah.numberInSurah} after Bismillah removal`);
        }
        return hasContent;
      });
      
      // Renumber ayahs to start from 1 and be consecutive
      const renumberedAyahs = filteredAyahs.map((ayah: any, index: number) => ({
        ...ayah,
        numberInSurah: index + 1
      }));
      
      console.log(`Individual Surah ${surahNumber}: ${surahData.ayahs.length} → ${renumberedAyahs.length} ayahs after processing`);
      
      return {
        ...surahData,
        ayahs: renumberedAyahs,
        numberOfAyahs: renumberedAyahs.length
      };
    }
    
    return surahData;
  }

  // Clear cache to force refresh
  clearCache(): void {
    console.log('Clearing Quran cache');
    this.cachedQuran = null;
    this.processingStats = {
      totalSurahs: 0,
      processedSurahs: 0,
      bismillahRemoved: 0,
      processingErrors: 0
    };
  }

  // Get cache status
  isCached(): boolean {
    return this.cachedQuran !== null;
  }

  // Get processing statistics
  getProcessingStats() {
    return { ...this.processingStats };
  }

  // Force reprocess all data
  async forceReprocess(): Promise<void> {
    console.log('Force reprocessing Quran data...');
    this.clearCache();
    await this.getFullQuran();
  }
}

export const quranService = new QuranService();
