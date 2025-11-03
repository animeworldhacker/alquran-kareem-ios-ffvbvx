
/**
 * Utility functions for processing Quran text
 */

/**
 * Removes Bismillah from the first verse of every chapter except Surah At-Tawbah
 * @param text - The ayah text
 * @param surahNumber - The surah number
 * @param ayahNumber - The ayah number within the surah
 * @returns The processed text with Bismillah removed if it's the first verse
 */
export function processAyahText(text: string, surahNumber: number, ayahNumber: number): string {
  if (!text) return text;
  
  // Only process the first verse of each chapter (except Surah At-Tawbah which is chapter 9)
  if (ayahNumber === 1 && surahNumber !== 9) {
    console.log(`Processing first ayah of Surah ${surahNumber}:${ayahNumber}`);
    
    // Comprehensive list of Bismillah variations to handle different API formats
    const bismillahVariations = [
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      'بسم الله الرحمن الرحيم',
      'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ',
      'بِسْمِ ٱللهِ ٱلرَّحْمنِ ٱلرَّحِيمِ',
      'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ',
      'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ',
      'بِسْمِ ٱللهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ',
      // Additional variations with different diacritics
      'بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ',
      'بِسْمِ ٱللَّهِ ٱلرَّحْمٰنِ ٱلرَّحِيمِ',
    ];
    
    let processedText = text.trim();
    const originalText = text;
    let wasRemoved = false;
    
    // Try to remove each variation from the beginning
    for (const bismillah of bismillahVariations) {
      // Check if text starts with this variation
      if (processedText.startsWith(bismillah)) {
        processedText = processedText.substring(bismillah.length).trim();
        wasRemoved = true;
        console.log(`✓ Removed Bismillah variation from start of ${surahNumber}:${ayahNumber}`);
        break;
      }
      
      // Check with potential leading whitespace
      const trimmedText = processedText.trimStart();
      if (trimmedText.startsWith(bismillah)) {
        processedText = trimmedText.substring(bismillah.length).trim();
        wasRemoved = true;
        console.log(`✓ Removed Bismillah variation with leading space from ${surahNumber}:${ayahNumber}`);
        break;
      }
    }
    
    // More aggressive pattern matching for edge cases using regex
    if (!wasRemoved) {
      // Create comprehensive regex patterns that match Bismillah with flexible diacritics and spacing
      const patterns = [
        // Standard Bismillah with various diacritics
        /^[\s]*بِسْمِ[\s]*اللَّهِ[\s]*الرَّحْمَٰنِ[\s]*الرَّحِيمِ[\s]*/u,
        /^[\s]*بِسْمِ[\s]*ٱللَّهِ[\s]*ٱلرَّحْمَٰنِ[\s]*ٱلرَّحِيمِ[\s]*/u,
        /^[\s]*بِسْمِ[\s]*اللَّهِ[\s]*الرَّحْمَنِ[\s]*الرَّحِيمِ[\s]*/u,
        /^[\s]*بِسْمِ[\s]*ٱللَّهِ[\s]*ٱلرَّحْمَنِ[\s]*ٱلرَّحِيمِ[\s]*/u,
        /^[\s]*بِسْمِ[\s]*اللهِ[\s]*الرَّحْمنِ[\s]*الرَّحِيمِ[\s]*/u,
        /^[\s]*بِسْمِ[\s]*ٱللهِ[\s]*ٱلرَّحْمنِ[\s]*ٱلرَّحِيمِ[\s]*/u,
        // Simple version without diacritics
        /^[\s]*بسم[\s]*الله[\s]*الرحمن[\s]*الرحيم[\s]*/u,
        // Very flexible pattern that matches the core words
        /^[\s]*بِ?سْ?مِ?[\s]*اللَّ?هِ?[\s]*الرَّ?حْ?مَ?[ٰن]?ِ?[\s]*الرَّ?حِ?يمِ?[\s]*/u,
        /^[\s]*بِ?سْ?مِ?[\s]*ٱللَّ?هِ?[\s]*ٱلرَّ?حْ?مَ?[ٰن]?ِ?[\s]*ٱلرَّ?حِ?يمِ?[\s]*/u,
      ];
      
      for (const pattern of patterns) {
        if (pattern.test(processedText)) {
          const match = processedText.match(pattern);
          if (match && match[0]) {
            processedText = processedText.replace(pattern, '').trim();
            wasRemoved = true;
            console.log(`✓ Removed Bismillah using regex pattern from ${surahNumber}:${ayahNumber}`, {
              matched: match[0].trim(),
              pattern: pattern.toString()
            });
            break;
          }
        }
      }
    }
    
    // Final cleanup and text normalization
    processedText = normalizeArabicText(processedText);
    
    // Log the processing result
    console.log(`Processed ayah ${surahNumber}:${ayahNumber}`, {
      original: originalText.substring(0, 80) + (originalText.length > 80 ? '...' : ''),
      processed: processedText.substring(0, 80) + (processedText.length > 80 ? '...' : ''),
      removed: wasRemoved,
      originalLength: originalText.length,
      processedLength: processedText.length,
      lengthDifference: originalText.length - processedText.length,
      isEmpty: processedText.trim().length === 0
    });
    
    return processedText;
  }
  
  // For non-first verses, just normalize the text
  return normalizeArabicText(text);
}

/**
 * Normalizes Arabic text for proper display
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeArabicText(text: string): string {
  if (!text) return text;
  
  let normalizedText = text;
  
  // Remove excessive whitespace
  normalizedText = normalizedText.replace(/\s+/g, ' ');
  
  // Trim leading and trailing whitespace
  normalizedText = normalizedText.trim();
  
  // Fix common Arabic text issues
  // Replace multiple consecutive Arabic punctuation marks
  normalizedText = normalizedText.replace(/[۔۔]+/g, '۔');
  normalizedText = normalizedText.replace(/[؍؍]+/g, '؍');
  
  // Ensure proper spacing around Arabic punctuation
  normalizedText = normalizedText.replace(/([۔؍])([^\s])/g, '$1 $2');
  normalizedText = normalizedText.replace(/([^\s])([۔؍])/g, '$1$2');
  
  // Remove any remaining double spaces
  normalizedText = normalizedText.replace(/\s+/g, ' ');
  
  // Fix common Unicode normalization issues
  normalizedText = normalizedText.normalize('NFC');
  
  return normalizedText.trim();
}

/**
 * Normalizes Arabic text for search purposes
 * Removes diacritics and normalizes character variants for case/diacritics-insensitive matching
 * @param text - The text to normalize for search
 * @returns The normalized text suitable for search matching
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  
  // Remove all Arabic diacritics (tashkeel/harakat)
  // This includes: fatha, damma, kasra, sukun, shadda, tanween, etc.
  normalized = normalized.replace(/[\u064B-\u065F]/g, ''); // Arabic diacritics range
  normalized = normalized.replace(/[\u0670]/g, ''); // Arabic letter superscript alef
  normalized = normalized.replace(/[\u06D6-\u06ED]/g, ''); // Additional Arabic marks
  
  // Remove tatweel (kashida) - the elongation character
  normalized = normalized.replace(/\u0640/g, '');
  
  // Normalize alef variants to plain alef
  // أ (alef with hamza above), إ (alef with hamza below), آ (alef with madda), ٱ (alef wasla) → ا (plain alef)
  normalized = normalized.replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627');
  
  // Normalize taa marbuta to haa
  // ة (taa marbuta) → ه (haa)
  normalized = normalized.replace(/\u0629/g, '\u0647');
  
  // Normalize yaa variants
  // ى (alef maksura) → ي (yaa)
  normalized = normalized.replace(/\u0649/g, '\u064A');
  
  // Normalize waw with hamza to plain waw
  // ؤ (waw with hamza) → و (plain waw)
  normalized = normalized.replace(/\u0624/g, '\u0648');
  
  // Normalize yaa with hamza to plain yaa
  // ئ (yaa with hamza) → ي (plain yaa)
  normalized = normalized.replace(/\u0626/g, '\u064A');
  
  // Remove excessive whitespace and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Convert to lowercase for case-insensitive matching
  normalized = normalized.toLowerCase();
  
  return normalized;
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
    'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ',
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
    'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ',
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
    'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ',
  ];
  
  // Remove all variations
  for (const bismillah of bismillahVariations) {
    cleanedText = cleanedText.replace(new RegExp(bismillah, 'g'), '');
  }
  
  // Apply text normalization
  cleanedText = normalizeArabicText(cleanedText);
  
  return cleanedText;
}

/**
 * Validates if the text processing was successful
 * @param originalText - The original text
 * @param processedText - The processed text
 * @param surahNumber - The surah number
 * @param ayahNumber - The ayah number
 * @returns Validation result with details
 */
export function validateTextProcessing(
  originalText: string, 
  processedText: string, 
  surahNumber: number, 
  ayahNumber: number
): { isValid: boolean; details: string; hasIssues: boolean } {
  if (!originalText || !processedText) {
    return {
      isValid: false,
      details: 'Missing text data',
      hasIssues: true
    };
  }
  
  const lengthDifference = originalText.length - processedText.length;
  const stillContainsBismillah = containsBismillah(processedText);
  const processedIsEmpty = processedText.trim().length === 0;
  
  // For first verses, we expect Bismillah to be removed (except Surah 9)
  if (ayahNumber === 1 && surahNumber !== 9) {
    if (stillContainsBismillah) {
      return {
        isValid: false,
        details: `Bismillah still present in ${surahNumber}:${ayahNumber}`,
        hasIssues: true
      };
    }
    
    if (lengthDifference === 0) {
      return {
        isValid: false,
        details: `No text change detected for ${surahNumber}:${ayahNumber} (expected Bismillah removal)`,
        hasIssues: true
      };
    }
    
    // Check if the processed text is empty (this would indicate Bismillah was the only content)
    if (processedIsEmpty) {
      return {
        isValid: true, // This is actually valid - some first verses might only contain Bismillah
        details: `First verse ${surahNumber}:${ayahNumber} became empty after Bismillah removal (this is expected for some surahs)`,
        hasIssues: false
      };
    }
  }
  
  // Check for text quality issues
  const hasExcessiveSpaces = /\s{3,}/.test(processedText);
  const hasInvalidCharacters = /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d۔؍]/.test(processedText);
  
  if (hasExcessiveSpaces || hasInvalidCharacters) {
    return {
      isValid: true, // Still valid but has issues
      details: `Text quality issues in ${surahNumber}:${ayahNumber}`,
      hasIssues: true
    };
  }
  
  return {
    isValid: true,
    details: `Text processing successful for ${surahNumber}:${ayahNumber}`,
    hasIssues: false
  };
}
