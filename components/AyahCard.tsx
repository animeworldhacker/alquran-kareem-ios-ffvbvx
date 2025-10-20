
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
          ayahText: processedAyahText,
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

  // Skip rendering if the processed text is empty
  if (!processedAyahText.trim()) {
    console.log(`Skipping empty ayah ${surahNumber}:${ayah.numberInSurah} after processing`);
    return null;
  }

  const increasedArabicTextSize = Math.max(26, textSizes.arabic * 1.3);
  const increasedLineHeight = Math.max(50, increasedArabicTextSize * 1.9);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#f8f6f0',
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 0,
      overflow: 'hidden',
      borderBottomWidth: 1,
      borderBottomColor: '#d4c5a0',
    },
    ayahRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    ayahNumberCircle: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      backgroundColor: '#c9a961',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 16,
      marginTop: 4,
      borderWidth: 2,
      borderColor: '#b8941f',
    },
    ayahNumber: {
      fontSize: 20,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#fff',
      fontWeight: 'bold',
    },
    ayahTextContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    ayahText: {
      fontSize: increasedArabicTextSize,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F',
      textAlign: 'right',
      lineHeight: increasedLineHeight,
      width: '100%',
      writingDirection: 'rtl',
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#e8e6e0',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    actionButtonActive: {
      backgroundColor: '#c9a961',
    },
    actionText: {
      fontSize: textSizes.caption,
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
      fontSize: textSizes.body + 4,
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginBottom: 12,
      textAlign: 'right',
    },
    tafsirText: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_400Regular',
      color: '#2F4F4F',
      lineHeight: 28,
      textAlign: 'right',
      marginBottom: 16,
    },
    fullTafsirButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#c9a961',
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
      top: -4,
      right: -4,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4caf50',
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.ayahRow}>
        <View style={styles.ayahNumberCircle}>
          <Text style={styles.ayahNumber}>{ayah.numberInSurah}</Text>
          {isPlaying && <View style={styles.playingIndicator} />}
        </View>
        <View style={styles.ayahTextContainer}>
          <Text style={styles.ayahText}>{processedAyahText}</Text>
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
              <ActivityIndicator size="small" color="#c9a961" />
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
