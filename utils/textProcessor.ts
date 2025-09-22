
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
    
    // The Bismillah text to remove
    const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    
    // Remove Bismillah from the beginning of the text
    // We'll check for various possible formats and spacing
    let processedText = text;
    const originalText = text;
    
    // Remove if it's at the very beginning
    if (processedText.startsWith(bismillah)) {
      processedText = processedText.substring(bismillah.length).trim();
      console.log(`Removed Bismillah from start of ${surahNumber}:${ayahNumber}`);
    }
    
    // Remove if it's at the beginning with some whitespace
    const bismillahWithSpaces = new RegExp(`^\\s*${bismillah.replace(/[\u064B-\u0652\u0670\u0640]/g, '\\s*')}\\s*`, 'g');
    processedText = processedText.replace(bismillahWithSpaces, '').trim();
    
    // More aggressive removal - remove any occurrence of Bismillah at the start
    const patterns = [
      bismillah,
      `${bismillah} `,
      ` ${bismillah}`,
      ` ${bismillah} `,
    ];
    
    for (const pattern of patterns) {
      if (processedText.startsWith(pattern)) {
        processedText = processedText.substring(pattern.length).trim();
        console.log(`Removed Bismillah pattern from ${surahNumber}:${ayahNumber}`);
        break;
      }
    }
    
    const wasRemoved = originalText !== processedText;
    console.log(`Processed ayah ${surahNumber}:${ayahNumber}`, {
      original: originalText.substring(0, 80) + '...',
      processed: processedText.substring(0, 80) + '...',
      removed: wasRemoved,
      originalLength: originalText.length,
      processedLength: processedText.length
    });
    
    return processedText;
  }
  
  return text;
}

/**
 * Checks if text contains Bismillah
 * @param text - The text to check
 * @returns True if text contains Bismillah
 */
export function containsBismillah(text: string): boolean {
  if (!text) return false;
  
  const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  return text.includes(bismillah);
}

/**
 * Extracts Bismillah from text if present
 * @param text - The text to extract from
 * @returns The Bismillah text if found, empty string otherwise
 */
export function extractBismillah(text: string): string {
  if (!text) return '';
  
  const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  return text.includes(bismillah) ? bismillah : '';
}
