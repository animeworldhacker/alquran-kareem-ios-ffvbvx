
import { useBookmarks } from '../hooks/useBookmarks';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Share, Clipboard, Image } from 'react-native';
import Icon from './Icon';
import { tafsirService } from '../services/tafsirService';
import { processAyahText, validateTextProcessing } from '../utils/textProcessor';
import TajweedText from './TajweedText';
import { Ayah, VerseMetadata, TajweedVerse } from '../types';
import VerseMarkers from './VerseMarkers';
import { useTheme } from '../contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';

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
  const [tafsirExpanded, setTafsirExpanded] = useState(false);
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const { addBookmark, removeBookmarkByAyah, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);

  useEffect(() => {
    if (settings.autoExpandTafsir && !tafsirText && !tafsirLoading && !tafsirError) {
      handleTafsirToggle().catch(error => {
        console.error('Error in auto-expand tafsir:', error);
      });
    }
  }, [settings.autoExpandTafsir]);

  useEffect(() => {
    const processedText = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
    const validation = validateTextProcessing(ayah.text, processedText, surahNumber, ayah.numberInSurah);
    
    if (validation.hasIssues) {
      console.warn(`Text processing issue in ${surahNumber}:${ayah.numberInSurah}:`, validation.details);
    }
  }, [ayah.text, surahNumber, ayah.numberInSurah]);

  const handleTafsirToggle = async () => {
    try {
      if (tafsirExpanded) {
        setTafsirExpanded(false);
        return;
      }

      if (tafsirText) {
        setTafsirExpanded(true);
        return;
      }

      setTafsirLoading(true);
      setTafsirError(null);

      const text = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah).catch(error => {
        console.error('Error from tafsirService.getTafsir:', error);
        throw error;
      });
      
      setTafsirText(text);
      setTafsirExpanded(true);
    } catch (error) {
      console.error('Error loading tafsir:', error);
      setTafsirError('تعذّر تحميل التفسير');
      Alert.alert('خطأ', 'تعذّر تحميل التفسير. يرجى المحاولة مرة أخرى.', [{ text: 'حسناً' }]);
    } finally {
      setTafsirLoading(false);
    }
  };

  const handleRetryTafsir = async () => {
    try {
      setTafsirError(null);
      setTafsirText(null);
      await handleTafsirToggle();
    } catch (error) {
      console.error('Error retrying tafsir:', error);
    }
  };

  const handleFullTafsir = () => {
    try {
      router.push(`/tafsir/${surahNumber}/${ayah.numberInSurah}`);
    } catch (error) {
      console.error('Error navigating to full tafsir:', error);
      Alert.alert('خطأ', 'تعذّر فتح صفحة التفسير', [{ text: 'حسناً' }]);
    }
  };

  const handleCopyTafsir = async () => {
    try {
      if (tafsirText) {
        await Clipboard.setStringAsync(tafsirText).catch(error => {
          console.error('Error copying to clipboard:', error);
          throw error;
        });
        Alert.alert('تم النسخ', 'تم نسخ التفسير إلى الحافظة', [{ text: 'حسناً' }]);
      }
    } catch (error) {
      console.error('Error copying tafsir:', error);
      Alert.alert('خطأ', 'تعذّر نسخ التفسير', [{ text: 'حسناً' }]);
    }
  };

  const handleShareTafsir = async () => {
    try {
      if (tafsirText) {
        await Share.share({
          message: `تفسير ${surahName} - آية ${ayah.numberInSurah}\n\n${tafsirText}`,
        }).catch(error => {
          console.error('Error sharing:', error);
          throw error;
        });
      }
    } catch (error) {
      console.error('Error sharing tafsir:', error);
      Alert.alert('خطأ', 'تعذّر مشاركة التفسير', [{ text: 'حسناً' }]);
    }
  };

  const handleBookmarkToggle = async () => {
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
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('خطأ', 'تعذّر حفظ الإشارة المرجعية', [{ text: 'حسناً' }]);
    }
  };

  const handlePlayAudio = () => {
    try {
      if (isPlaying && !isContinuousPlaying) {
        onStopAudio?.();
      } else {
        onPlayAudio(ayah.numberInSurah);
      }
    } catch (error) {
      console.error('Error handling audio playback:', error);
    }
  };

  const handlePlayFromHere = () => {
    try {
      onPlayFromHere?.(ayah.numberInSurah);
    } catch (error) {
      console.error('Error playing from here:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <VerseMarkers
        metadata={metadata}
        previousMetadata={previousMetadata}
      />

      <View style={styles.ayahHeader}>
        <View style={styles.ayahNumberContainer}>
          <View style={[styles.ayahNumberBadge, { borderColor: colors.accent }]}>
            <Text style={[styles.ayahNumber, { color: colors.accent }]}>
              {toArabicNumerals(ayah.numberInSurah)}
            </Text>
          </View>
        </View>

        <View style={styles.ayahActions}>
          <TouchableOpacity 
            onPress={handleBookmarkToggle}
            style={styles.actionButton}
          >
            <Icon 
              name={bookmarked ? 'bookmark' : 'bookmark-outline'} 
              size={20} 
              color={bookmarked ? colors.accent : colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handlePlayAudio}
            style={styles.actionButton}
          >
            <Icon 
              name={isPlaying && !isContinuousPlaying ? 'pause' : 'play'} 
              size={20} 
              color={isPlaying ? colors.accent : colors.textSecondary} 
            />
          </TouchableOpacity>

          {onPlayFromHere && (
            <TouchableOpacity 
              onPress={handlePlayFromHere}
              style={styles.actionButton}
            >
              <Icon 
                name="play-skip-forward" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.ayahTextContainer}>
        {settings.showTajweed && tajweedVerse?.text_uthmani_tajweed ? (
          <TajweedText 
            html={tajweedVerse.text_uthmani_tajweed}
            style={[styles.ayahText, { color: colors.text }]}
          />
        ) : (
          <Text style={[styles.ayahText, { color: colors.text }]}>
            {ayah.text}
          </Text>
        )}
      </View>

      <View style={styles.tafsirSection}>
        <TouchableOpacity 
          onPress={handleTafsirToggle}
          style={[styles.tafsirButton, { backgroundColor: colors.background }]}
          disabled={tafsirLoading}
        >
          <Icon 
            name="book-outline" 
            size={18} 
            color={colors.accent} 
          />
          <Text style={[styles.tafsirButtonText, { color: colors.accent }]}>
            {tafsirLoading ? 'جاري التحميل...' : 'التفسير'}
          </Text>
          {tafsirLoading && (
            <ActivityIndicator size="small" color={colors.accent} />
          )}
        </TouchableOpacity>

        {tafsirError && (
          <View style={styles.tafsirErrorContainer}>
            <Text style={[styles.tafsirError, { color: colors.error }]}>
              {tafsirError}
            </Text>
            <TouchableOpacity onPress={handleRetryTafsir}>
              <Text style={[styles.retryButton, { color: colors.accent }]}>
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {tafsirExpanded && tafsirText && (
          <View style={styles.tafsirContent}>
            <Text style={[styles.tafsirText, { color: colors.textSecondary }]} numberOfLines={5}>
              {tafsirText}
            </Text>
            
            <View style={styles.tafsirActions}>
              <TouchableOpacity onPress={handleFullTafsir} style={styles.tafsirActionButton}>
                <Text style={[styles.tafsirActionText, { color: colors.accent }]}>
                  عرض كامل
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleCopyTafsir} style={styles.tafsirActionButton}>
                <Icon name="copy-outline" size={16} color={colors.accent} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleShareTafsir} style={styles.tafsirActionButton}>
                <Icon name="share-outline" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ayahNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ayahActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  ayahTextContainer: {
    marginBottom: 12,
  },
  ayahText: {
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    fontFamily: 'Amiri',
  },
  tafsirSection: {
    marginTop: 8,
  },
  tafsirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  tafsirButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tafsirErrorContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  tafsirError: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  tafsirContent: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tafsirText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 12,
  },
  tafsirActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  tafsirActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tafsirActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
