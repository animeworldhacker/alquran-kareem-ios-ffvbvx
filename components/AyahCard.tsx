
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Share, Clipboard } from 'react-native';
import { Ayah } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTheme } from '../contexts/ThemeContext';
import { tafsirService } from '../services/tafsirService';
import { router } from 'expo-router';
import { processAyahText, validateTextProcessing } from '../utils/textProcessor';
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
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const [processedAyahText, setProcessedAyahText] = useState<string>('');
  const [audioLoading, setAudioLoading] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { settings, colors, textSizes } = useTheme();

  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);

  // Auto-expand tafsir if setting is enabled
  useEffect(() => {
    if (settings.autoExpandTafsir && !tafsirText && !tafsirLoading && !tafsirError) {
      handleTafsirToggle();
    }
  }, [settings.autoExpandTafsir]);

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
  }, [ayah.text, surahNumber, ayah.numberInSurah]);

  const handleTafsirToggle = async () => {
    // If already showing, just hide
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }

    // If already loaded, just show
    if (tafsirText) {
      setShowTafsir(true);
      return;
    }

    // Load tafsir
    try {
      setTafsirLoading(true);
      setTafsirError(null);
      
      const tafsir = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
      
      if (tafsir && tafsir.trim().length > 0) {
        setTafsirText(tafsir);
        setShowTafsir(true);
      } else {
        setTafsirError('التفسير غير متوفر');
      }
    } catch (error) {
      console.error('Error loading tafsir:', error);
      const errorMsg = error instanceof Error ? error.message : 'تعذّر تحميل التفسير';
      setTafsirError(errorMsg);
    } finally {
      setTafsirLoading(false);
    }
  };

  const handleRetryTafsir = async () => {
    setTafsirError(null);
    setTafsirText(null);
    await handleTafsirToggle();
  };

  const handleFullTafsir = () => {
    router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
  };

  const handleCopyTafsir = async () => {
    if (tafsirText) {
      try {
        await Clipboard.setString(tafsirText);
        Alert.alert('تم النسخ', 'تم نسخ التفسير إلى الحافظة');
      } catch (error) {
        console.error('Error copying tafsir:', error);
        Alert.alert('خطأ', 'فشل في نسخ التفسير');
      }
    }
  };

  const handleShareTafsir = async () => {
    if (tafsirText) {
      try {
        await Share.share({
          message: `${surahName} - آية ${ayah.numberInSurah}\n\n${processedAyahText}\n\nتفسير ابن كثير:\n${tafsirText}`,
        });
      } catch (error) {
        console.error('Error sharing tafsir:', error);
      }
    }
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
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isPlaying ? colors.primary : colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    playingCard: {
      backgroundColor: settings.theme === 'dark' ? '#2d2520' : '#fffbf0',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    ayahNumber: {
      fontSize: textSizes.caption,
      color: colors.secondary,
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
      backgroundColor: colors.backgroundAlt,
    },
    activeButton: {
      backgroundColor: colors.primary,
    },
    playingButton: {
      backgroundColor: colors.success,
    },
    icon: {
      color: colors.textSecondary,
    },
    activeIcon: {
      color: '#fff',
    },
    ayahText: {
      fontSize: textSizes.arabic,
      lineHeight: textSizes.arabic * 1.8,
      textAlign: 'right',
      color: colors.text,
      fontFamily: 'ScheherazadeNew_400Regular',
      marginBottom: 12,
    },
    tafsirContainer: {
      marginTop: 12,
      padding: 16,
      backgroundColor: settings.theme === 'dark' ? '#2a2520' : '#f8f6f0',
      borderRadius: 8,
      borderRightWidth: 4,
      borderRightColor: colors.primary,
    },
    tafsirHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'dark' ? '#3a3530' : '#e8e6e0',
    },
    tafsirTitle: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.secondary,
    },
    tafsirText: {
      fontSize: textSizes.body,
      lineHeight: textSizes.body * 1.8,
      textAlign: 'right',
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      marginBottom: 12,
    },
    tafsirActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 8,
    },
    tafsirButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.primary,
      gap: 4,
    },
    tafsirButtonSecondary: {
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tafsirButtonText: {
      color: '#fff',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
    },
    tafsirButtonTextSecondary: {
      color: colors.text,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 8,
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
    errorContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: settings.theme === 'dark' ? '#3d2020' : '#ffebee',
      borderRadius: 8,
      borderRightWidth: 3,
      borderRightColor: colors.error,
    },
    errorText: {
      fontSize: textSizes.caption,
      color: colors.error,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'right',
      marginBottom: 8,
    },
    retryButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.error,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
    },
    playingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success,
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
              <ActivityIndicator size="small" color={colors.textSecondary} />
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
          <View style={styles.tafsirHeader}>
            <View style={styles.tafsirActions}>
              <TouchableOpacity 
                style={[styles.tafsirButton, styles.tafsirButtonSecondary]} 
                onPress={handleShareTafsir}
              >
                <Icon name="share-outline" size={14} style={{ color: colors.text }} />
                <Text style={[styles.tafsirButtonText, styles.tafsirButtonTextSecondary]}>
                  مشاركة
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tafsirButton, styles.tafsirButtonSecondary]} 
                onPress={handleCopyTafsir}
              >
                <Icon name="copy-outline" size={14} style={{ color: colors.text }} />
                <Text style={[styles.tafsirButtonText, styles.tafsirButtonTextSecondary]}>
                  نسخ
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.tafsirTitle}>تفسير ابن كثير</Text>
          </View>
          
          <Text style={styles.tafsirText} numberOfLines={5}>
            {tafsirText}
          </Text>
          
          <View style={styles.tafsirActions}>
            <TouchableOpacity style={styles.tafsirButton} onPress={handleFullTafsir}>
              <Icon name="book" size={14} style={styles.activeIcon} />
              <Text style={styles.tafsirButtonText}>التفسير الكامل</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tafsirError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{tafsirError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetryTafsir}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
