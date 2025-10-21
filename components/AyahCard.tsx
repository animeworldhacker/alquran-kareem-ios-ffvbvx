
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Share } from 'react-native';
import { Ayah } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { tafsirService } from '../services/tafsirService';
import { processAyahText, validateTextProcessing } from '../utils/textProcessor';
import Icon from './Icon';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

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

// Gold circle for ayah number
function AyahNumberCircle({ number, size = 32 }: { number: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="14" fill="transparent" stroke={colors.gold} strokeWidth="1.5" />
      <SvgText
        x="16"
        y="20"
        fontSize="14"
        fontWeight="700"
        fill={colors.gold}
        textAnchor="middle"
        fontFamily="Amiri"
      >
        {toArabicNumerals(number)}
      </SvgText>
    </Svg>
  );
}

export default function AyahCard({
  ayah,
  surahNumber,
  surahName,
  surahEnglishName,
  onPlayAudio,
  onPlayFromHere,
  isPlaying,
  isContinuousPlaying
}: AyahCardProps) {
  const { colors, textSizes, settings, isDark } = useTheme();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [tafsirError, setTafsirError] = useState<string>('');
  const [processedText, setProcessedText] = useState<string>('');
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (settings.autoExpandTafsir) {
      handleTafsirToggle();
    }
  }, [settings.autoExpandTafsir]);

  useEffect(() => {
    const processed = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
    setProcessedText(processed);
    validateTextProcessing(ayah.text, processed, surahNumber, ayah.numberInSurah);
  }, [ayah.text, surahNumber, ayah.numberInSurah]);

  const isBookmarked = bookmarks.some(
    b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
  );

  const handleTafsirToggle = async () => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }

    if (tafsirText) {
      setShowTafsir(true);
      return;
    }

    setLoadingTafsir(true);
    setTafsirError('');
    
    try {
      const text = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
      setTafsirText(text);
      setShowTafsir(true);
    } catch (error: any) {
      console.error('Error loading tafsir:', error);
      setTafsirError(error.message || 'فشل تحميل التفسير');
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handleRetryTafsir = () => {
    setTafsirError('');
    handleTafsirToggle();
  };

  const handleFullTafsir = () => {
    router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        const bookmark = bookmarks.find(
          b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
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
          ayahText: processedText,
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('خطأ', 'فشل حفظ الإشارة المرجعية');
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${surahName} - آية ${toArabicNumerals(ayah.numberInSurah)}\n\n${processedText}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 0,
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    selectedContainer: {
      backgroundColor: colors.selectedAyah,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    ayahNumberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ayahText: {
      fontSize: textSizes.ayah,
      fontFamily: 'ScheherazadeNew_700Bold',
      color: colors.text,
      textAlign: 'right',
      lineHeight: textSizes.ayah * 1.8,
      marginBottom: 12,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.1)',
      borderWidth: 1,
      borderColor: colors.gold,
    },
    actionButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
    },
    tafsirContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundAlt,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tafsirHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    tafsirTitle: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
    },
    tafsirText: {
      fontSize: textSizes.body - 1,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      textAlign: 'right',
      lineHeight: textSizes.body * 1.6,
    },
    tafsirActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 12,
    },
    tafsirButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    tafsirButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
    },
    errorContainer: {
      padding: 12,
      backgroundColor: isDark ? 'rgba(239, 83, 80, 0.15)' : 'rgba(239, 83, 80, 0.1)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
    },
    errorText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.error,
      textAlign: 'center',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity 
      style={[styles.container, (isPlaying || showActions) && styles.selectedContainer]}
      onPress={() => setShowActions(!showActions)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.actions}>
          {isPlaying && (
            <View style={styles.iconButton}>
              <Icon name="volume-high" size={18} style={{ color: colors.gold }} />
            </View>
          )}
          {isBookmarked && (
            <View style={styles.iconButton}>
              <Icon name="bookmark" size={18} style={{ color: colors.gold }} />
            </View>
          )}
        </View>
        
        <View style={styles.ayahNumberContainer}>
          <AyahNumberCircle number={ayah.numberInSurah} />
        </View>
      </View>

      <Text style={styles.ayahText}>{processedText}</Text>

      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-outline" size={16} style={{ color: colors.gold }} />
            <Text style={styles.actionButtonText}>مشاركة</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmarkToggle}>
            <Icon 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={16} 
              style={{ color: colors.gold }} 
            />
            <Text style={styles.actionButtonText}>
              {isBookmarked ? 'إزالة' : 'حفظ'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleTafsirToggle}>
            <Icon name="book-outline" size={16} style={{ color: colors.gold }} />
            <Text style={styles.actionButtonText}>تفسير</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handlePlayAudio}>
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={16} 
              style={{ color: colors.gold }} 
            />
            <Text style={styles.actionButtonText}>
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showTafsir && (
        <View style={styles.tafsirContainer}>
          <View style={styles.tafsirHeader}>
            <TouchableOpacity onPress={() => setShowTafsir(false)}>
              <Icon name="close" size={20} style={{ color: colors.textSecondary }} />
            </TouchableOpacity>
            <Text style={styles.tafsirTitle}>تفسير ابن كثير</Text>
          </View>

          {loadingTafsir && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.gold} />
            </View>
          )}

          {tafsirError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{tafsirError}</Text>
              <TouchableOpacity 
                style={[styles.tafsirButton, { marginTop: 8, alignSelf: 'center' }]} 
                onPress={handleRetryTafsir}
              >
                <Text style={styles.tafsirButtonText}>إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          )}

          {tafsirText && !loadingTafsir && !tafsirError && (
            <>
              <Text style={styles.tafsirText} numberOfLines={5}>
                {tafsirText.substring(0, 300)}...
              </Text>
              <View style={styles.tafsirActions}>
                <TouchableOpacity style={styles.tafsirButton} onPress={handleFullTafsir}>
                  <Text style={styles.tafsirButtonText}>عرض كامل</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
