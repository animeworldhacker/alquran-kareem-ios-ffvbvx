
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ayah, TajweedData } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { tafsirService } from '../services/tafsirService';
import { tajweedService } from '../services/tajweedService';
import { processAyahText, validateTextProcessing, normalizeArabicText } from '../utils/textProcessor';
import { router } from 'expo-router';
import TajweedText from './TajweedText';
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
  const [tajweedData, setTajweedData] = useState<TajweedData | null>(null);
  const [loadingTajweed, setLoadingTajweed] = useState(false);
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

  useEffect(() => {
    const loadTajweedData = async () => {
      if (settings.showTajweed && !tajweedData && !loadingTajweed) {
        setLoadingTajweed(true);
        try {
          const data = await tajweedService.getTajweedData(surahNumber, ayah.numberInSurah);
          if (data && data.segments && data.segments.length > 0) {
            setTajweedData(data);
          } else {
            // Fallback to basic tajweed rules using processed text
            const segments = tajweedService.applyBasicTajweedRules(processedAyahText);
            setTajweedData({
              surah: surahNumber,
              ayah: ayah.numberInSurah,
              segments
            });
          }
        } catch (error) {
          console.log('Error loading tajweed data:', error);
          // Fallback to basic tajweed rules using processed text
          try {
            const segments = tajweedService.applyBasicTajweedRules(processedAyahText);
            setTajweedData({
              surah: surahNumber,
              ayah: ayah.numberInSurah,
              segments
            });
          } catch (fallbackError) {
            console.error('Error in tajweed fallback:', fallbackError);
            setTajweedData(null);
          }
        } finally {
          setLoadingTajweed(false);
        }
      }
    };

    loadTajweedData();
  }, [settings.showTajweed, surahNumber, ayah.numberInSurah, processedAyahText, tajweedData, loadingTajweed]);

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

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#f8f6f0', // Cream background
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
      elevation: 4,
    },
    ayahRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 20,
    },
    ayahNumberCircle: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: '#d4af37', // Gold color
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15, // Changed from marginLeft to marginRight
      marginTop: 5,
      boxShadow: '0px 2px 6px rgba(212, 175, 55, 0.3)',
      elevation: 3,
    },
    ayahNumber: {
      fontSize: 16,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
      fontWeight: 'bold',
    },
    ayahTextContainer: {
      flex: 1,
      position: 'relative',
      alignItems: 'flex-end', // Align content to the right
    },
    ayahText: {
      fontSize: Math.max(20, textSizes.arabic * 0.9),
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F', // Dark slate gray
      textAlign: 'right',
      lineHeight: Math.max(38, (textSizes.arabic * 0.9) * 1.9),
      marginBottom: 12,
      paddingLeft: 10, // Changed from paddingRight to paddingLeft
      width: '100%',
      writingDirection: 'rtl',
    },
    tajweedContainer: {
      textAlign: 'right',
      marginBottom: 12,
      paddingLeft: 10, // Changed from paddingRight to paddingLeft
      width: '100%',
      alignItems: 'flex-end', // Align tajweed text to the right
    },
    ayahTranslation: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513', // Brown color
      textAlign: 'left',
      lineHeight: 22,
      fontStyle: 'italic',
      marginBottom: 10,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderTopWidth: 1,
      borderTopColor: '#e8e6e0',
      marginTop: 10,
      paddingTop: 15,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    actionButtonActive: {
      backgroundColor: '#d4af37',
    },
    actionText: {
      fontSize: textSizes.caption - 1,
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginLeft: 6,
    },
    actionTextActive: {
      color: '#fff',
    },
    tafsirContainer: {
      backgroundColor: '#f0ede5',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#e8e6e0',
    },
    tafsirTitle: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginBottom: 12,
      textAlign: 'right',
    },
    tafsirText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: '#2F4F4F',
      lineHeight: 26,
      textAlign: 'right',
      marginBottom: 15,
    },
    fullTafsirButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: '#d4af37',
      borderRadius: 20,
    },
    fullTafsirText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513',
      marginLeft: 10,
    },
    playingIndicator: {
      position: 'absolute',
      top: -5,
      left: -5, // Changed from right to left
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#d4af37',
    },
    tajweedIndicator: {
      position: 'absolute',
      top: -5,
      right: -5, // Changed from left to right
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#FF6B6B',
    },
    debugInfo: {
      backgroundColor: '#fff3cd',
      padding: 8,
      marginTop: 8,
      borderRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107',
    },
    debugText: {
      fontSize: 12,
      fontFamily: 'Amiri_400Regular',
      color: '#856404',
      textAlign: 'left',
    },
    warningInfo: {
      backgroundColor: '#f8d7da',
      padding: 8,
      marginTop: 8,
      borderRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: '#dc3545',
    },
    warningText: {
      fontSize: 12,
      fontFamily: 'Amiri_400Regular',
      color: '#721c24',
      textAlign: 'left',
    },
  });

  // Debug information (only show in development for first verses)
  const showDebug = __DEV__ && ayah.numberInSurah === 1;
  const showWarning = textProcessingInfo?.hasIssues && __DEV__;

  return (
    <View style={styles.card}>
      <View style={styles.ayahRow}>
        <View style={styles.ayahTextContainer}>
          {settings.showTajweed && tajweedData && tajweedData.segments ? (
            <TajweedText
              segments={tajweedData.segments}
              fontSize={Math.max(20, textSizes.arabic * 0.9)}
              style={styles.tajweedContainer}
            />
          ) : (
            <Text style={styles.ayahText}>{processedAyahText}</Text>
          )}
          
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
          {settings.showTajweed && tajweedData && <View style={styles.tajweedIndicator} />}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, isPlaying && styles.actionButtonActive]}
          onPress={handlePlayAudio}
        >
          <Icon 
            name={isPlaying ? "pause" : "play"} 
            size={16} 
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
            size={16} 
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
            size={16} 
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
                {tafsir ? tafsir.substring(0, 200) + (tafsir.length > 200 ? '...' : '') : 'تفسير غير متوفر حاليا'}
              </Text>
              {tafsir && tafsir.length > 200 && (
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
