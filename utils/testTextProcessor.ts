
/**
 * Test file to verify text processing functionality
 */

import { processAyahText, containsBismillah, extractBismillah } from './textProcessor';

// Test cases for the text processor
export function runTextProcessorTests() {
  console.log('Running text processor tests...');
  
  const bismillah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  
  // Test case 1: First verse with Bismillah at the beginning
  const testText1 = `${bismillah} الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ`;
  const result1 = processAyahText(testText1, 1, 1);
  console.log('Test 1 - First verse with Bismillah:', {
    original: testText1,
    processed: result1,
    bismillahRemoved: !result1.includes(bismillah)
  });
  
  // Test case 2: First verse without Bismillah
  const testText2 = 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ';
  const result2 = processAyahText(testText2, 1, 1);
  console.log('Test 2 - First verse without Bismillah:', {
    original: testText2,
    processed: result2,
    unchanged: testText2 === result2
  });
  
  // Test case 3: Second verse (should not be processed)
  const testText3 = `${bismillah} الرَّحْمَٰنِ الرَّحِيمِ`;
  const result3 = processAyahText(testText3, 1, 2);
  console.log('Test 3 - Second verse (should not be processed):', {
    original: testText3,
    processed: result3,
    unchanged: testText3 === result3
  });
  
  // Test case 4: First verse of Surah Al-Fatiha (should be processed)
  const testText4 = `${bismillah} الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ`;
  const result4 = processAyahText(testText4, 1, 1);
  console.log('Test 4 - Al-Fatiha first verse:', {
    original: testText4,
    processed: result4,
    bismillahRemoved: !result4.includes(bismillah)
  });
  
  // Test case 5: First verse of another surah
  const testText5 = `${bismillah} قُلْ هُوَ اللَّهُ أَحَدٌ`;
  const result5 = processAyahText(testText5, 112, 1);
  console.log('Test 5 - Al-Ikhlas first verse:', {
    original: testText5,
    processed: result5,
    bismillahRemoved: !result5.includes(bismillah)
  });
  
  // Test utility functions
  console.log('Testing utility functions:');
  console.log('containsBismillah test:', containsBismillah(testText1));
  console.log('extractBismillah test:', extractBismillah(testText1));
  
  console.log('Text processor tests completed.');
}

// Export for use in other files
export { processAyahText, containsBismillah, extractBismillah };
