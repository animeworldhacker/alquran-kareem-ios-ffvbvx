
/**
 * Utility functions for processing Quran text
 */

/**
 * Removes Bismillah from the first verse of every chapter
 * @param text - The ayah text
 * @param surahNumber - The surah number
 * @param ayahNumber - The ayah number within the surah
 * @returns The processed text with Bismillah removed if it's the first verse
 */
export function processAyahText(text: string, surahNumber: number, ayahNumber: number): string {
  if (!text) return text;
  
  // Only process the first verse of each chapter
  if (ayahNumber === 1) {
    console.log(`Processing first ayah of Surah ${surahNumber}:${ayahNumber}`);
    
    // Multiple variations of Bismillah to handle different API formats
    const bismillahVariations = [
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      'بسم الله الرحمن الرحيم',
      'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ',
      'بِسْمِ ٱللهِ ٱلرَّحْمنِ ٱلرَّحِيمِ',
    ];
    
    let processedText = text;
    const originalText = text;
    let wasRemoved = false;
    
    // Try to remove each variation
    for (const bismillah of bismillahVariations) {
      // Remove from the very beginning
      if (processedText.startsWith(bismillah)) {
        processedText = processedText.substring(bismillah.length).trim();
        wasRemoved = true;
        console.log(`Removed Bismillah variation from start of ${surahNumber}:${ayahNumber}`);
        break;
      }
      
      // Remove with potential whitespace at the beginning
      if (processedText.startsWith(` ${bismillah}`)) {
        processedText = processedText.substring(bismillah.length + 1).trim();
        wasRemoved = true;
        console.log(`Removed Bismillah variation with space from start of ${surahNumber}:${ayahNumber}`);
        break;
      }
      
      // Remove with potential whitespace after
      if (processedText.startsWith(`${bismillah} `)) {
        processedText = processedText.substring(bismillah.length + 1).trim();
        wasRemoved = true;
        console.log(`Removed Bismillah variation with trailing space from start of ${surahNumber}:${ayahNumber}`);
        break;
      }
    }
    
    // More aggressive pattern matching for edge cases
    if (!wasRemoved) {
      // Create a regex pattern that matches Bismillah with flexible diacritics and spacing
      const bismillahPattern = /^[\s]*بِسْمِ[\s]*اللَّهِ[\s]*الرَّحْمَٰنِ[\s]*الرَّحِيمِ[\s]*/;
      const alternativePattern = /^[\s]*بِسْمِ[\s]*ٱللَّهِ[\s]*ٱلرَّحْمَٰنِ[\s]*ٱلرَّحِيمِ[\s]*/;
      const simplePattern = /^[\s]*بسم[\s]*الله[\s]*الرحمن[\s]*الرحيم[\s]*/;
      
      const patterns = [bismillahPattern, alternativePattern, simplePattern];
      
      for (const pattern of patterns) {
        if (pattern.test(processedText)) {
          processedText = processedText.replace(pattern, '').trim();
          wasRemoved = true;
          console.log(`Removed Bismillah using regex pattern from ${surahNumber}:${ayahNumber}`);
          break;
        }
      }
    }
    
    // Final cleanup - remove any remaining leading/trailing whitespace
    processedText = processedText.trim();
    
    // Special handling for Surah At-Tawbah (Surah 9) which traditionally doesn't start with Bismillah
    if (surahNumber === 9) {
      console.log(`Surah At-Tawbah (9) - no Bismillah expected`);
    }
    
    console.log(`Processed ayah ${surahNumber}:${ayahNumber}`, {
      original: originalText.substring(0, 80) + (originalText.length > 80 ? '...' : ''),
      processed: processedText.substring(0, 80) + (processedText.length > 80 ? '...' : ''),
      removed: wasRemoved,
      originalLength: originalText.length,
      processedLength: processedText.length
    });
    
    return processedText;
  }
  
  return text;
}

/**
 * Checks if text contains any variation of Bismillah
 * @param text - The text to check
 * @returns True if text contains Bismillah
 */
export function containsBismillah(text: string): boolean {
  if (!text) return false;
  
  const bismillahVariations = [
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'بسم الله الرحمن الرحيم',
    'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ',
    'بِسْمِ ٱللهِ ٱلرَّحْمنِ ٱلرَّحِيمِ',
  ];
  
  return bismillahVariations.some(bismillah => text.includes(bismillah));
}

/**
 * Extracts Bismillah from text if present
 * @param text - The text to extract from
 * @returns The Bismillah text if found, empty string otherwise
 */
export function extractBismillah(text: string): string {
  if (!text) return '';
  
  const bismillahVariations = [
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'بسم الله الرحمن الرحيم',
    'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ',
    'بِسْمِ ٱللهِ ٱلرَّحْمنِ ٱلرَّحِيمِ',
  ];
  
  for (const bismillah of bismillahVariations) {
    if (text.includes(bismillah)) {
      return bismillah;
    }
  }
  
  return '';
}

/**
 * Force removes Bismillah from any text regardless of position
 * @param text - The text to clean
 * @returns The text with all Bismillah occurrences removed
 */
export function forceRemoveBismillah(text: string): string {
  if (!text) return text;
  
  let cleanedText = text;
  
  const bismillahVariations = [
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'بسم الله الرحمن الرحيم',
    'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ',
    'بِسْمِ ٱللهِ ٱلرَّحْمنِ ٱلرَّحِيمِ',
  ];
  
  // Remove all variations
  for (const bismillah of bismillahVariations) {
    cleanedText = cleanedText.replace(new RegExp(bismillah, 'g'), '');
  }
  
  // Clean up extra whitespace
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  return cleanedText;
}
