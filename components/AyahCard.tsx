
import { useBookmarks } from '../hooks/useBookmarks';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Share, Clipboard, Modal } from 'react-native';
import Icon from './Icon';
import { tafsirService } from '../services/tafsirService';
import { processAyahText, validateTextProcessing } from '../utils/textProcessor';
import TajweedText from './TajweedText';
import { Ayah, VerseMetadata, TajweedVerse } from '../types';
import VerseMarkers from './VerseMarkers';
import { useTheme } from '../contexts/ThemeContext';
import React, { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  onPlayAudio: (ayahNumber: number) => void;
  onStopAudio?: () => void;
  onPlayFromHere?: (ayahNumber: number) => void;
  isPlaying: boolean;
  isContinuousPlaying?: boolean;
  tajweedVerse?: TajweedVerse;
  metadata?: VerseMetadata;
  previousMetadata?: VerseMetadata;
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
  onStopAudio,
  onPlayFromHere,
  isPlaying,
  isContinuousPlaying,
  tajweedVerse,
  metadata,
  previousMetadata
}: AyahCardProps) {
  const { colors, settings } = useTheme();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const { addBookmark, removeBookmarkByAyah, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);

  const handleAyahTap = () => {
    setShowBottomSheet(true);
  };

  const handleTafsirLoad = useCallback(async () => {
    try {
      if (tafsirText) {
        router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
        setShowBottomSheet(false);
        return;
      }

      setTafsirLoading(true);
      setTafsirError(null);

      const text = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah).catch(error => {
        console.error('Error from tafsirService.getTafsir:', error);
        throw error;
      });
      
      setTafsirText(text);
      router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
      setShowBottomSheet(false);
    } catch (error) {
      console.error('Error loading tafsir:', error);
      setTafsirError('تعذّر تحميل التفسير');
      Alert.alert('خطأ', 'تعذّر تحميل التفسير. يرجى المحاولة مرة أخرى.', [{ text: 'حسناً' }]);
    } finally {
      setTafsirLoading(false);
    }
  }, [tafsirText, surahNumber, ayah.numberInSurah]);

  // Validate text processing
  useEffect(() => {
    const processedText = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
    const validation = validateTextProcessing(ayah.text, processedText, surahNumber, ayah.numberInSurah);
    
    if (validation.hasIssues) {
      console.warn(`Text processing issue in ${surahNumber}:${ayah.numberInSurah}:`, validation.details);
    }
  }, [ayah.text, surahNumber, ayah.numberInSurah]);

  const handleCopyAyah = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(ayah.text).catch(error => {
        console.error('Error copying to clipboard:', error);
        throw error;
      });
      Alert.alert('تم النسخ', 'تم نسخ الآية إلى الحافظة', [{ text: 'حسناً' }]);
      setShowBottomSheet(false);
    } catch (error) {
      console.error('Error copying ayah:', error);
      Alert.alert('خطأ', 'تعذّر نسخ الآية', [{ text: 'حسناً' }]);
    }
  }, [ayah.text]);

  const handleShareAyah = useCallback(async () => {
    try {
      await Share.share({
        message: `${surahName} - آية ${ayah.numberInSurah}\n\n${ayah.text}`,
      }).catch(error => {
        console.error('Error sharing:', error);
        throw error;
      });
      setShowBottomSheet(false);
    } catch (error) {
      console.error('Error sharing ayah:', error);
      Alert.alert('خطأ', 'تعذّر مشاركة الآية', [{ text: 'حسناً' }]);
    }
  }, [ayah.text, surahName, ayah.numberInSurah]);

  const handleBookmarkToggle = useCallback(async () => {
    try {
      if (bookmarked) {
        await removeBookmarkByAyah(surahNumber, ayah.numberInSurah).catch(error => {
          console.error('Error removing bookmark:', error);
          throw error;
        });
      } else {
        await addBookmark({
          surahNumber,
          surahName,
          surahEnglishName,
          ayahNumber: ayah.numberInSurah,
          ayahText: ayah.text,
        }).catch(error => {
          console.error('Error adding bookmark:', error);
          throw error;
        });
      }
      setShowBottomSheet(false);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('خطأ', 'تعذّر حفظ الإشارة المرجعية', [{ text: 'حسناً' }]);
    }
  }, [bookmarked, surahNumber, ayah.numberInSurah, surahName, surahEnglishName, ayah.text, addBookmark, removeBookmarkByAyah]);

  const handlePlayAudio = useCallback(() => {
    try {
      if (isPlaying && !isContinuousPlaying) {
        onStopAudio?.();
      } else {
        onPlayAudio(ayah.numberInSurah);
      }
      setShowBottomSheet(false);
    } catch (error) {
      console.error('Error handling audio playback:', error);
    }
  }, [isPlaying, isContinuousPlaying, onStopAudio, onPlayAudio, ayah.numberInSurah]);

  const handlePlayFromHere = useCallback(() => {
    try {
      onPlayFromHere?.(ayah.numberInSurah);
      setShowBottomSheet(false);
    } catch (error) {
      console.error('Error playing from here:', error);
    }
  }, [onPlayFromHere, ayah.numberInSurah]);

  const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
      marginHorizontal: 18,
      borderRadius: 20,
      padding: 20,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.gold,
      boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
      elevation: 3,
    },
    ayahTextContainer: {
      marginBottom: 0,
    },
    ayahTextWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      direction: 'rtl',
    },
    ayahText: {
      fontSize: 22,
      lineHeight: 39.6,
      textAlign: 'justify',
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.text,
      writingDirection: 'rtl',
    },
    verseNumberCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.gold,
      borderWidth: 2,
      borderColor: colors.emerald,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4,
      marginRight: 4,
    },
    verseNumber: {
      fontSize: 13,
      fontWeight: 'bold',
      color: colors.emerald,
      fontFamily: 'Amiri_700Bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    bottomSheet: {
      backgroundColor: colors.cream,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 2,
      borderColor: colors.gold,
      borderBottomWidth: 0,
      padding: 24,
      paddingBottom: 40,
      boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)',
      elevation: 8,
    },
    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.gold,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.emerald,
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Amiri_700Bold',
    },
    actionButtonsContainer: {
      gap: 12,
    },
    actionButton: {
      backgroundColor: colors.emerald,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderWidth: 2,
      borderColor: colors.gold,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    actionButtonText: {
      color: colors.gold,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Amiri_700Bold',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.emerald,
      marginTop: 8,
    },
    cancelButtonText: {
      color: colors.emerald,
    },
  });

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={handleAyahTap}
        activeOpacity={0.7}
      >
        <VerseMarkers
          metadata={metadata}
          previousMetadata={previousMetadata}
        />

        <View style={styles.ayahTextContainer}>
          <View style={styles.ayahTextWrapper}>
            {settings.showTajweed && tajweedVerse?.text_uthmani_tajweed ? (
              <>
                <TajweedText 
                  html={tajweedVerse.text_uthmani_tajweed}
                  style={styles.ayahText}
                />
                <View style={styles.verseNumberCircle}>
                  <Text style={styles.verseNumber}>
                    {toArabicNumerals(ayah.numberInSurah)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.ayahText}>
                  {ayah.text}
                </Text>
                <View style={styles.verseNumberCircle}>
                  <Text style={styles.verseNumber}>
                    {toArabicNumerals(ayah.numberInSurah)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBottomSheet(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>
                آية {toArabicNumerals(ayah.numberInSurah)}
              </Text>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handlePlayAudio}
                >
                  <Icon 
                    name={isPlaying && !isContinuousPlaying ? 'pause' : 'play'} 
                    size={20} 
                    color={colors.gold} 
                  />
                  <Text style={styles.actionButtonText}>
                    {isPlaying && !isContinuousPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  </Text>
                </TouchableOpacity>

                {onPlayFromHere && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handlePlayFromHere}
                  >
                    <Icon 
                      name="play-skip-forward" 
                      size={20} 
                      color={colors.gold} 
                    />
                    <Text style={styles.actionButtonText}>
                      تشغيل من هنا
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleTafsirLoad}
                  disabled={tafsirLoading}
                >
                  <Icon 
                    name="book-outline" 
                    size={20} 
                    color={colors.gold} 
                  />
                  <Text style={styles.actionButtonText}>
                    {tafsirLoading ? 'جاري التحميل...' : 'التفسير'}
                  </Text>
                  {tafsirLoading && (
                    <ActivityIndicator size="small" color={colors.gold} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleBookmarkToggle}
                >
                  <Icon 
                    name={bookmarked ? 'bookmark' : 'bookmark-outline'} 
                    size={20} 
                    color={colors.gold} 
                  />
                  <Text style={styles.actionButtonText}>
                    {bookmarked ? 'إزالة الإشارة' : 'إضافة إشارة'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleCopyAyah}
                >
                  <Icon 
                    name="copy-outline" 
                    size={20} 
                    color={colors.gold} 
                  />
                  <Text style={styles.actionButtonText}>
                    نسخ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleShareAyah}
                >
                  <Icon 
                    name="share-outline" 
                    size={20} 
                    color={colors.gold} 
                  />
                  <Text style={styles.actionButtonText}>
                    مشاركة
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setShowBottomSheet(false)}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                    إلغاء
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
