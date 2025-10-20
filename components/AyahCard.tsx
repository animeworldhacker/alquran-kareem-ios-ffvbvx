
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ayah } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTheme } from '../contexts/ThemeContext';
import { tafsirService } from '../services/tafsirService';
import { router } from 'expo-router';
import { processAyahText, validateTextProcessing, normalizeArabicText } from '../utils/textProcessor';
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
  isContinuousPlaying,
}: AyahCardProps) {
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [processedAyahText, setProcessedAyahText] = useState<string>('');
  const [audioLoading, setAudioLoading] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { settings, colors, textSizes } = useTheme();

  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);

  useEffect(() => {
    try {
      const processed = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
      setProcessedAyahText(processed);
      
      const isValid = validateTextProcessing(ayah.text, processed, surahNumber, ayah.numberInSurah);
      if (!isValid) {
        console.warn(`Text processing validation failed for ${surahNumber}:${ayah.numberInSurah}`);
      }
    } catch (error) {
      console.error('Error processing ayah text:', error);
      setProcessedAyahText(ayah.text);
    }
  }, [ayah.text, processedAyahText, surahNumber, ayah.numberInSurah]);

  const handleTafsirToggle = async () => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }

    if (tafsirText) {
      setShowTafsir(true);
      return;
    }

    try {
      setTafsirLoading(true);
      const tafsir = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
      
      if (tafsir && tafsir.text) {
        setTafsirText(tafsir.text);
        setShowTafsir(true);
      } else {
        Alert.alert('تنبيه', 'التفسير غير متوفر لهذه الآية');
      }
    } catch (error) {
      console.error('Error loading tafsir:', error);
      Alert.alert('خطأ', 'فشل في تحميل التفسير');
    } finally {
      setTafsirLoading(false);
    }
  };

  const handleFullTafsir = () => {
    router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (bookmarked) {
        await removeBookmark(surahNumber, ayah.numberInSurah);
      } else {
        await addBookmark({
          surahNumber,
          surahName,
          surahEnglishName,
          ayahNumber: ayah.numberInSurah,
          ayahText: ayah.text,
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('خطأ', 'فشل في حفظ العلامة المرجعية');
    }
  };

  const handlePlayAudio = async () => {
    try {
      setAudioLoading(true);
      console.log(`🎵 AyahCard: Playing audio for ${surahNumber}:${ayah.numberInSurah}`);
      await onPlayAudio(ayah.numberInSurah);
    } catch (error) {
      console.error('❌ AyahCard: Error playing audio:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الآية. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setAudioLoading(false);
    }
  };

  const handlePlayFromHere = async () => {
    if (onPlayFromHere) {
      try {
        setAudioLoading(true);
        console.log(`🎵 AyahCard: Playing from ${surahNumber}:${ayah.numberInSurah}`);
        await onPlayFromHere(ayah.numberInSurah);
      } catch (error) {
        console.error('❌ AyahCard: Error playing from here:', error);
        Alert.alert('خطأ', 'فشل في تشغيل الآيات. يرجى التحقق من اتصالك بالإنترنت.');
      } finally {
        setAudioLoading(false);
      }
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isPlaying ? '#c9a961' : '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    playingCard: {
      backgroundColor: '#fffbf0',
      borderWidth: 2,
      borderColor: '#c9a961',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    ayahNumber: {
      fontSize: textSizes.caption,
      color: '#8B4513',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
    },
    activeButton: {
      backgroundColor: '#c9a961',
    },
    playingButton: {
      backgroundColor: '#4CAF50',
    },
    icon: {
      color: '#666',
    },
    activeIcon: {
      color: '#fff',
    },
    ayahText: {
      fontSize: textSizes.ayah,
      lineHeight: textSizes.ayah * 1.8,
      textAlign: 'right',
      color: '#2F4F4F',
      fontFamily: 'ScheherazadeNew_400Regular',
      marginBottom: 12,
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
      fontSize: textSizes.body,
      lineHeight: textSizes.body * 1.6,
      textAlign: 'right',
      color: '#555',
      fontFamily: 'Amiri_400Regular',
    },
    tafsirActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
      gap: 8,
    },
    tafsirButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: '#c9a961',
    },
    tafsirButtonText: {
      color: '#fff',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 8,
      fontSize: textSizes.caption,
      color: '#666',
      fontFamily: 'Amiri_400Regular',
    },
    playingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginTop: 8,
    },
    playingText: {
      color: '#fff',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      marginLeft: 6,
    },
  });

  return (
    <View style={[styles.card, isPlaying && styles.playingCard]}>
      <View style={styles.header}>
        <Text style={styles.ayahNumber}>آية {toArabicNumerals(ayah.numberInSurah)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, bookmarked && styles.activeButton]}
            onPress={handleBookmarkToggle}
          >
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              style={bookmarked ? styles.activeIcon : styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, showTafsir && styles.activeButton]}
            onPress={handleTafsirToggle}
            disabled={tafsirLoading}
          >
            {tafsirLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Icon
                name="book-outline"
                size={20}
                style={showTafsir ? styles.activeIcon : styles.icon}
              />
            )}
          </TouchableOpacity>

          {onPlayFromHere && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                isContinuousPlaying && styles.playingButton,
              ]}
              onPress={handlePlayFromHere}
              disabled={audioLoading}
            >
              {audioLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon
                  name="play-skip-forward"
                  size={20}
                  style={isContinuousPlaying ? styles.activeIcon : styles.icon}
                />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, isPlaying && styles.playingButton]}
            onPress={handlePlayAudio}
            disabled={audioLoading}
          >
            {audioLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                style={isPlaying ? styles.activeIcon : styles.icon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.ayahText}>{processedAyahText || ayah.text}</Text>

      {isPlaying && (
        <View style={styles.playingIndicator}>
          <Icon name="volume-high" size={16} style={styles.activeIcon} />
          <Text style={styles.playingText}>
            {isContinuousPlaying ? 'تشغيل مستمر...' : 'جاري التشغيل...'}
          </Text>
        </View>
      )}

      {showTafsir && tafsirText && (
        <View style={styles.tafsirContainer}>
          <Text style={styles.tafsirText} numberOfLines={5}>
            {tafsirText}
          </Text>
          <View style={styles.tafsirActions}>
            <TouchableOpacity style={styles.tafsirButton} onPress={handleFullTafsir}>
              <Text style={styles.tafsirButtonText}>التفسير الكامل</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
