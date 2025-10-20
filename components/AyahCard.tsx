
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { tafsirService } from '../services/tafsirService';
import { processAyahText, validateTextProcessing, normalizeArabicText } from '../utils/textProcessor';
import { Ayah } from '../types';
import Icon from './Icon';

interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  onPlayAudio: (ayahNumber: number) => void;
  onPlayFromHere?: (ayahNumber: number) => void;
  isPlaying: boolean;
  isContinuousPlaying?: boolean;
}

// Arabic numerals conversion
const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

export default function AyahCard({
  ayah,
  surahNumber,
  surahName,
  surahEnglishName,
  onPlayAudio,
  onPlayFromHere,
  isPlaying,
  isContinuousPlaying = false,
}: AyahCardProps) {
  const { colors, textSizes } = useTheme();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [processedAyahText, setProcessedAyahText] = useState<string>('');

  const isBookmarked = bookmarks.some(
    b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
  );

  useEffect(() => {
    try {
      const processed = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
      setProcessedAyahText(processed);
      
      const validation = validateTextProcessing(ayah.text, processed, surahNumber, ayah.numberInSurah);
      if (!validation.isValid) {
        console.warn(`Text processing validation failed for ${surahNumber}:${ayah.numberInSurah}:`, validation.issues);
      }
    } catch (error) {
      console.error('Error processing ayah text:', error);
      setProcessedAyahText(ayah.text);
    }
  }, [ayah.text, processedAyahText, surahNumber, ayah.numberInSurah]);

  const handleTafsirToggle = async () => {
    if (!showTafsir && !tafsir) {
      setLoadingTafsir(true);
      try {
        const tafsirText = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
        setTafsir(tafsirText);
        setShowTafsir(true);
      } catch (error) {
        console.error('Error loading tafsir:', error);
        Alert.alert('خطأ', 'فشل في تحميل التفسير');
      } finally {
        setLoadingTafsir(false);
      }
    } else {
      setShowTafsir(!showTafsir);
    }
  };

  const handleFullTafsir = () => {
    router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
  };

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      const bookmark = bookmarks.find(
        b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
      );
      if (bookmark) {
        removeBookmark(bookmark.id);
      }
    } else {
      addBookmark({
        surahNumber,
        surahName,
        surahEnglishName,
        ayahNumber: ayah.numberInSurah,
        ayahText: processedAyahText,
      });
    }
  };

  const handlePlayAudio = () => {
    onPlayAudio(ayah.numberInSurah);
  };

  const handlePlayFromHere = () => {
    if (onPlayFromHere) {
      onPlayFromHere(ayah.numberInSurah);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isPlaying ? 'rgba(201, 169, 97, 0.1)' : '#fff',
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      borderWidth: isPlaying ? 2 : 1,
      borderColor: isPlaying ? '#c9a961' : '#e0e0e0',
      boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    ayahNumber: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#c9a961',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ayahNumberText: {
      color: '#fff',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonActive: {
      backgroundColor: '#c9a961',
    },
    playButton: {
      backgroundColor: isPlaying ? '#c9a961' : '#f5f5f5',
    },
    ayahText: {
      fontSize: textSizes.body + 4,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F',
      textAlign: 'right',
      lineHeight: textSizes.body * 2.2,
      marginBottom: 12,
    },
    playFromHereButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isContinuousPlaying ? '#c9a961' : '#f5f5f5',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginTop: 8,
      gap: 6,
    },
    playFromHereText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: isContinuousPlaying ? '#fff' : '#666',
    },
    tafsirContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: '#f8f6f0',
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#c9a961',
    },
    tafsirText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: '#555',
      textAlign: 'right',
      lineHeight: textSizes.caption * 1.8,
    },
    tafsirActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      gap: 8,
    },
    tafsirButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: '#c9a961',
    },
    tafsirButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
            onPress={handleBookmarkToggle}
          >
            <Icon
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              style={{ color: isBookmarked ? '#fff' : '#666' }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTafsirToggle}
          >
            <Icon name="book-outline" size={20} style={{ color: '#666' }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlayAudio}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              style={{ color: isPlaying ? '#fff' : '#666' }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.ayahNumber}>
          <Text style={styles.ayahNumberText}>{toArabicNumerals(ayah.numberInSurah)}</Text>
        </View>
      </View>

      <Text style={styles.ayahText}>{processedAyahText}</Text>

      {onPlayFromHere && (
        <TouchableOpacity
          style={styles.playFromHereButton}
          onPress={handlePlayFromHere}
        >
          <Icon
            name="play-forward"
            size={16}
            style={{ color: isContinuousPlaying ? '#fff' : '#666' }}
          />
          <Text style={styles.playFromHereText}>
            {isContinuousPlaying ? 'جاري التشغيل المستمر' : 'تشغيل من هنا'}
          </Text>
        </TouchableOpacity>
      )}

      {showTafsir && (
        <View style={styles.tafsirContainer}>
          {loadingTafsir ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#c9a961" />
            </View>
          ) : (
            <>
              <Text style={styles.tafsirText} numberOfLines={3}>
                {tafsir || 'لا يوجد تفسير متاح'}
              </Text>
              <View style={styles.tafsirActions}>
                <TouchableOpacity style={styles.tafsirButton} onPress={handleFullTafsir}>
                  <Text style={styles.tafsirButtonText}>التفسير الكامل</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}
