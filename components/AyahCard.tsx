
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Share, Clipboard, Image } from 'react-native';
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
      backgroundColor: '#F5EEE3',
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isPlaying ? '#1E5B4C' : '#D4AF37',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    verseNumberContainer: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    verseNumberImage: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
    verseNumberText: {
      fontSize: 16,
      color: '#2C2416',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
      zIndex: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F5EEE3',
      borderWidth: 2,
      borderColor: '#D4AF37',
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeButton: {
      backgroundColor: '#1E5B4C',
    },
    playingButton: {
      backgroundColor: '#2E7D32',
    },
    icon: {
      color: '#6D6558',
    },
    activeIcon: {
      color: '#D4AF37',
    },
    ayahText: {
      fontSize: 26,
      lineHeight: 48,
      textAlign: 'right',
      color: '#2C2416',
      fontFamily: 'ScheherazadeNew_400Regular',
      marginBottom: 12,
    },
    tafsirContainer: {
      marginTop: 12,
      padding: 16,
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#D4AF37',
    },
    tafsirHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#D4AF37',
    },
    tafsirTitle: {
      fontSize: 16,
      fontFamily: 'Amiri_700Bold',
      color: '#1E5B4C',
    },
    tafsirText: {
      fontSize: 16,
      lineHeight: 28,
      textAlign: 'right',
      color: '#2C2416',
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
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#1E5B4C',
      gap: 4,
      borderWidth: 2,
      borderColor: '#D4AF37',
    },
    tafsirButtonSecondary: {
      backgroundColor: '#F5EEE3',
    },
    tafsirButtonText: {
      color: '#D4AF37',
      fontSize: 13,
      fontFamily: 'Amiri_700Bold',
    },
    tafsirButtonTextSecondary: {
      color: '#1E5B4C',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: '#6D6558',
      fontFamily: 'Amiri_400Regular',
    },
    errorContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: '#FFEBEE',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#C62828',
    },
    errorText: {
      fontSize: 14,
      color: '#C62828',
      fontFamily: 'Amiri_400Regular',
      textAlign: 'right',
      marginBottom: 8,
    },
    retryButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: '#C62828',
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 13,
      fontFamily: 'Amiri_700Bold',
    },
    playingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2E7D32',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    playingText: {
      color: '#fff',
      fontSize: 13,
      fontFamily: 'Amiri_700Bold',
      marginLeft: 6,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.verseNumberContainer}>
          <Image 
            source={require('../assets/images/8683a5b3-d596-4d40-b189-82163cc3e43a.png')}
            style={styles.verseNumberImage}
            resizeMode="contain"
          />
          <Text style={styles.verseNumberText}>
            {toArabicNumerals(ayah.numberInSurah)}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, bookmarked && styles.activeButton]}
            onPress={handleBookmarkToggle}
          >
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              style={bookmarked ? styles.activeIcon : styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, showTafsir && styles.activeButton]}
            onPress={handleTafsirToggle}
            disabled={tafsirLoading}
          >
            {tafsirLoading ? (
              <ActivityIndicator size="small" color="#6D6558" />
            ) : (
              <Icon
                name="book-outline"
                size={18}
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
                  size={18}
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
                size={18}
                style={isPlaying ? styles.activeIcon : styles.icon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.ayahText}>{processedAyahText || ayah.text}</Text>

      {isPlaying && (
        <View style={styles.playingIndicator}>
          <Icon name="volume-high" size={14} style={styles.activeIcon} />
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
                <Icon name="share-outline" size={14} style={{ color: '#1E5B4C' }} />
                <Text style={[styles.tafsirButtonText, styles.tafsirButtonTextSecondary]}>
                  مشاركة
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tafsirButton, styles.tafsirButtonSecondary]} 
                onPress={handleCopyTafsir}
              >
                <Icon name="copy-outline" size={14} style={{ color: '#1E5B4C' }} />
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
