
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ayah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { tafsirService } from '../services/tafsirService';
import { processAyahText, validateTextProcessing, normalizeArabicText } from '../utils/textProcessor';
import { router } from 'expo-router';
import Icon from './Icon';

interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  onPlayAudio: (ayahNumber: number) => void;
  isPlaying: boolean;
}

export default function AyahCard({ 
  ayah, 
  surahNumber, 
  surahName, 
  surahEnglishName, 
  onPlayAudio, 
  isPlaying 
}: AyahCardProps) {
  const { settings, colors, textSizes } = useTheme();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [textProcessingInfo, setTextProcessingInfo] = useState<any>(null);

  // Check if this ayah is bookmarked
  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);

  // Process the ayah text to remove Bismillah from first verses and normalize text
  const processedAyahText = processAyahText(ayah.text || '', surahNumber, ayah.numberInSurah);
  
  // Validate text processing
  useEffect(() => {
    const validation = validateTextProcessing(
      ayah.text || '', 
      processedAyahText, 
      surahNumber, 
      ayah.numberInSurah
    );
    setTextProcessingInfo(validation);
    
    if (validation.hasIssues) {
      console.warn(`Text processing issue: ${validation.details}`);
    }
  }, [ayah.text, processedAyahText, surahNumber, ayah.numberInSurah]);

  const handleTafsirToggle = async () => {
    if (!showTafsir && !tafsir && !loadingTafsir) {
      setLoadingTafsir(true);
      try {
        console.log(`Loading Ibn Katheer Tafsir for ${surahNumber}:${ayah.numberInSurah}`);
        const tafsirText = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
        setTafsir(tafsirText || 'تفسير غير متوفر حاليا');
        console.log('Tafsir loaded successfully');
      } catch (error) {
        console.error('Failed to load tafsir:', error);
        setTafsir('حدث خطأ في تحميل التفسير. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoadingTafsir(false);
      }
    }
    setShowTafsir(!showTafsir);
  };

  const handleFullTafsir = () => {
    router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (bookmarked) {
        const bookmark = bookmarks.find(b => 
          b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
        );
        if (bookmark) {
          await removeBookmark(bookmark.id);
        }
      } else {
        await addBookmark({
          surahNumber,
          surahName,
          surahEnglishName,
          ayahNumber: ayah.numberInSurah,
          ayahText: processedAyahText, // Use processed text for bookmarks
        });
      }
    } catch (error) {
      console.log('Bookmark error:', error);
      Alert.alert('خطأ', 'فشل في حفظ العلامة المرجعية');
    }
  };

  const handlePlayAudio = () => {
    try {
      onPlayAudio(ayah.numberInSurah);
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الصوت');
    }
  };

  // Skip rendering if the processed text is empty (happens when Bismillah is removed and nothing else remains)
  if (!processedAyahText.trim()) {
    console.log(`Skipping empty ayah ${surahNumber}:${ayah.numberInSurah} after processing`);
    return null;
  }

  // Increased text sizes - making them significantly larger
  const increasedArabicTextSize = Math.max(26, textSizes.arabic * 1.3); // Increased from 20 to 26+ base
  const increasedLineHeight = Math.max(50, increasedArabicTextSize * 1.9); // Increased line height proportionally

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#f8f6f0', // Cream background
      marginVertical: 10, // Increased margin for larger cards
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      minHeight: 120, // Minimum height to accommodate larger text
    },
    ayahRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 24, // Increased padding for larger text
    },
    ayahNumberCircle: {
      width: 40, // Increased from 35 to 40
      height: 40, // Increased from 35 to 40
      borderRadius: 20, // Adjusted for new size
      backgroundColor: '#d4af37', // Gold color
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18, // Increased margin
      marginTop: 8, // Adjusted for better alignment with larger text
      shadowColor: '#d4af37',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    ayahNumber: {
      fontSize: 18, // Increased from 16 to 18
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
      fontWeight: 'bold',
    },
    ayahTextContainer: {
      flex: 1,
      position: 'relative',
      alignItems: 'flex-end', // Align content to the right
      minHeight: 60, // Minimum height for text container
    },
    ayahText: {
      fontSize: increasedArabicTextSize, // Significantly increased text size
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F', // Dark slate gray
      textAlign: 'right',
      lineHeight: increasedLineHeight, // Increased line height
      marginBottom: 16, // Increased margin
      paddingLeft: 12, // Increased padding
      paddingRight: 4, // Added right padding
      width: '100%',
      writingDirection: 'rtl',
    },
    ayahTranslation: {
      fontSize: textSizes.body + 2, // Slightly increased translation text
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513', // Brown color
      textAlign: 'left',
      lineHeight: 24, // Increased line height
      fontStyle: 'italic',
      marginBottom: 12, // Increased margin
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24, // Increased padding
      paddingBottom: 18, // Increased padding
      borderTopWidth: 1,
      borderTopColor: '#e8e6e0',
      marginTop: 12, // Increased margin
      paddingTop: 18, // Increased padding
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12, // Increased padding
      paddingVertical: 10, // Increased padding
      borderRadius: 22, // Increased border radius
      backgroundColor: 'transparent',
      minWidth: 80, // Minimum width for better touch targets
    },
    actionButtonActive: {
      backgroundColor: '#d4af37',
    },
    actionText: {
      fontSize: textSizes.caption, // Kept same size for action text
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginLeft: 8, // Increased margin
    },
    actionTextActive: {
      color: '#fff',
    },
    tafsirContainer: {
      backgroundColor: '#f0ede5',
      padding: 24, // Increased padding
      borderTopWidth: 1,
      borderTopColor: '#e8e6e0',
    },
    tafsirTitle: {
      fontSize: textSizes.body + 4, // Increased tafsir title size
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginBottom: 16, // Increased margin
      textAlign: 'right',
    },
    tafsirText: {
      fontSize: textSizes.body + 2, // Increased tafsir text size
      fontFamily: 'Amiri_400Regular',
      color: '#2F4F4F',
      lineHeight: 30, // Increased line height
      textAlign: 'right',
      marginBottom: 18, // Increased margin
    },
    fullTafsirButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 18, // Increased padding
      paddingVertical: 10, // Increased padding
      backgroundColor: '#d4af37',
      borderRadius: 22, // Increased border radius
    },
    fullTafsirText: {
      fontSize: textSizes.caption + 1, // Slightly increased button text
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24, // Increased padding
    },
    loadingText: {
      fontSize: textSizes.body + 1, // Increased loading text size
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513',
      marginLeft: 12, // Increased margin
    },
    playingIndicator: {
      position: 'absolute',
      top: -6, // Adjusted for larger circle
      left: -6, // Adjusted for larger circle
      width: 14, // Increased size
      height: 14, // Increased size
      borderRadius: 7, // Adjusted for new size
      backgroundColor: '#d4af37',
    },
    debugInfo: {
      backgroundColor: '#fff3cd',
      padding: 10, // Increased padding
      marginTop: 10, // Increased margin
      borderRadius: 6, // Increased border radius
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107',
    },
    debugText: {
      fontSize: 13, // Slightly increased debug text
      fontFamily: 'Amiri_400Regular',
      color: '#856404',
      textAlign: 'left',
      lineHeight: 18, // Added line height
    },
    warningInfo: {
      backgroundColor: '#f8d7da',
      padding: 10, // Increased padding
      marginTop: 10, // Increased margin
      borderRadius: 6, // Increased border radius
      borderLeftWidth: 4,
      borderLeftColor: '#dc3545',
    },
    warningText: {
      fontSize: 13, // Slightly increased warning text
      fontFamily: 'Amiri_400Regular',
      color: '#721c24',
      textAlign: 'left',
      lineHeight: 18, // Added line height
    },
  });

  // Debug information (only show in development for first verses)
  const showDebug = __DEV__ && ayah.numberInSurah === 1;
  const showWarning = textProcessingInfo?.hasIssues && __DEV__;

  return (
    <View style={styles.card}>
      <View style={styles.ayahRow}>
        <View style={styles.ayahTextContainer}>
          <Text style={styles.ayahText}>{processedAyahText}</Text>
          
          {showDebug && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Debug - Surah {surahNumber}:{ayah.numberInSurah}
              </Text>
              <Text style={styles.debugText}>
                Original Length: {(ayah.text || '').length}
              </Text>
              <Text style={styles.debugText}>
                Processed Length: {processedAyahText.length}
              </Text>
              <Text style={styles.debugText}>
                Length Difference: {(ayah.text || '').length - processedAyahText.length}
              </Text>
              <Text style={styles.debugText}>
                Bismillah Removed: {(ayah.text || '') !== processedAyahText ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.debugText}>
                Text Size: {increasedArabicTextSize}px
              </Text>
              <Text style={styles.debugText}>
                Line Height: {increasedLineHeight}px
              </Text>
            </View>
          )}
          
          {showWarning && (
            <View style={styles.warningInfo}>
              <Text style={styles.warningText}>
                Warning: {textProcessingInfo.details}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.ayahNumberCircle}>
          <Text style={styles.ayahNumber}>{ayah.numberInSurah}</Text>
          {isPlaying && <View style={styles.playingIndicator} />}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, isPlaying && styles.actionButtonActive]}
          onPress={handlePlayAudio}
        >
          <Icon 
            name={isPlaying ? "pause" : "play"} 
            size={18} // Increased icon size
            style={{ color: isPlaying ? '#fff' : '#8B4513' }} 
          />
          <Text style={[styles.actionText, isPlaying && styles.actionTextActive]}>
            {isPlaying ? 'إيقاف' : 'تشغيل'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, showTafsir && styles.actionButtonActive]}
          onPress={handleTafsirToggle}
        >
          <Icon 
            name="book" 
            size={18} // Increased icon size
            style={{ color: showTafsir ? '#fff' : '#8B4513' }} 
          />
          <Text style={[styles.actionText, showTafsir && styles.actionTextActive]}>
            تفسير
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, bookmarked && styles.actionButtonActive]}
          onPress={handleBookmarkToggle}
        >
          <Icon 
            name={bookmarked ? "bookmark" : "bookmark-outline"} 
            size={18} // Increased icon size
            style={{ color: bookmarked ? '#fff' : '#8B4513' }} 
          />
          <Text style={[styles.actionText, bookmarked && styles.actionTextActive]}>
            {bookmarked ? 'محفوظ' : 'حفظ'}
          </Text>
        </TouchableOpacity>
      </View>

      {showTafsir && (
        <View style={styles.tafsirContainer}>
          <Text style={styles.tafsirTitle}>تفسير ابن كثير:</Text>
          {loadingTafsir ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#d4af37" />
              <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.tafsirText}>
                {tafsir ? tafsir.substring(0, 250) + (tafsir.length > 250 ? '...' : '') : 'تفسير غير متوفر حاليا'}
              </Text>
              {tafsir && tafsir.length > 250 && (
                <TouchableOpacity style={styles.fullTafsirButton} onPress={handleFullTafsir}>
                  <Text style={styles.fullTafsirText}>اقرأ التفسير كاملاً</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
