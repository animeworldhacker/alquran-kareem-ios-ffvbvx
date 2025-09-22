
/**
 * Test file to verify text processing functionality
 */

import { processAyahText, containsBismillah, extractBismillah, forceRemoveBismillah } from './textProcessor';

// Test cases for the text processor
export function runTextProcessorTests() {
  console.log('Running comprehensive text processor tests...');
  
  const bismillahVariations = [
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'بسم الله الرحمن الرحيم',
    'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ',
    'بِسْمِ ٱللهِ ٱلرَّحْمنِ ٱلرَّحِيمِ',
  ];
  
  // Test each variation
  bismillahVariations.forEach((bismillah, index) => {
    const testText = `${bismillah} الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ`;
    const result = processAyahText(testText, 1, 1);
    console.log(`Test ${index + 1} - Bismillah variation ${index + 1}:`, {
      original: testText.substring(0, 50) + '...',
      processed: result.substring(0, 50) + '...',
      bismillahRemoved: !result.includes(bismillah),
      success: result === 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'
    });
  });
  
  // Test first verse without Bismillah
  const testText2 = 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ';
  const result2 = processAyahText(testText2, 1, 1);
  console.log('Test - First verse without Bismillah:', {
    original: testText2,
    processed: result2,
    unchanged: testText2 === result2
  });
  
  // Test second verse (should not be processed)
  const testText3 = `${bismillahVariations[0]} الرَّحْمَٰنِ الرَّحِيمِ`;
  const result3 = processAyahText(testText3, 1, 2);
  console.log('Test - Second verse (should not be processed):', {
    original: testText3.substring(0, 50) + '...',
    processed: result3.substring(0, 50) + '...',
    unchanged: testText3 === result3
  });
  
  // Test Surah At-Tawbah (should still process even though it traditionally doesn't have Bismillah)
  const testText4 = `${bismillahVariations[0]} بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ`;
  const result4 = processAyahText(testText4, 9, 1);
  console.log('Test - Surah At-Tawbah first verse:', {
    original: testText4.substring(0, 50) + '...',
    processed: result4.substring(0, 50) + '...',
    bismillahRemoved: !result4.includes(bismillahVariations[0])
  });
  
  // Test multiple surahs
  const testSurahs = [1, 2, 3, 9, 112, 113, 114];
  testSurahs.forEach(surahNumber => {
    const testText = `${bismillahVariations[0]} قُلْ هُوَ اللَّهُ أَحَدٌ`;
    const result = processAyahText(testText, surahNumber, 1);
    console.log(`Test - Surah ${surahNumber} first verse:`, {
      surah: surahNumber,
      bismillahRemoved: !result.includes(bismillahVariations[0]),
      processed: result.substring(0, 30) + '...'
    });
  });
  
  // Test utility functions
  console.log('Testing utility functions:');
  bismillahVariations.forEach((bismillah, index) => {
    const testText = `${bismillah} some text`;
    console.log(`containsBismillah test ${index + 1}:`, containsBismillah(testText));
    console.log(`extractBismillah test ${index + 1}:`, extractBismillah(testText) === bismillah);
  });
  
  // Test force remove function
  const mixedText = `${bismillahVariations[0]} some text ${bismillahVariations[1]} more text`;
  const forceCleaned = forceRemoveBismillah(mixedText);
  console.log('Force remove test:', {
    original: mixedText.substring(0, 50) + '...',
    cleaned: forceCleaned,
    allRemoved: !bismillahVariations.some(b => forceCleaned.includes(b))
  });
  
  console.log('Comprehensive text processor tests completed.');
}

// Export for use in other files
export { processAyahText, containsBismillah, extractBismillah, forceRemoveBismillah };
