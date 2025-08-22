
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ayah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { tafsirService } from '../services/tafsirService';
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
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmarked = () => {
      const exists = bookmarks.some(b => 
        b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
      );
      setIsBookmarked(exists);
    };
    checkBookmarked();
  }, [surahNumber, ayah.numberInSurah, bookmarks]);

  const handleTafsirToggle = async () => {
    if (!showTafsir && !tafsir) {
      try {
        const tafsirText = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
        setTafsir(tafsirText);
      } catch (error) {
        console.log('Failed to load tafsir:', error);
        Alert.alert('خطأ', 'فشل في تحميل التفسير');
        return;
      }
    }
    setShowTafsir(!showTafsir);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
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
          ayahText: ayah.text,
        });
      }
    } catch (error) {
      console.log('Bookmark error:', error);
      Alert.alert('خطأ', 'فشل في حفظ العلامة المرجعية');
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
      marginLeft: 15,
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
    },
    ayahText: {
      fontSize: Math.max(20, textSizes.arabic * 0.9),
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F', // Dark slate gray
      textAlign: 'right',
      lineHeight: 38,
      marginBottom: 12,
      paddingRight: 10,
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
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    actionButtonActive: {
      backgroundColor: '#d4af37',
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
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginBottom: 10,
      textAlign: 'right',
    },
    tafsirText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: '#2F4F4F',
      lineHeight: 24,
      textAlign: 'right',
    },
    playingIndicator: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#d4af37',
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
          <Text style={styles.ayahText}>{ayah.text}</Text>
          <Text style={styles.ayahTranslation}>
            [All] praise is [due] to Allah, who has sent down upon His Servant the Book and has not made therein any deviance.
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, isPlaying && styles.actionButtonActive]}
          onPress={() => onPlayAudio(ayah.numberInSurah)}
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
          style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
          onPress={handleBookmarkToggle}
        >
          <Icon 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={16} 
            style={{ color: isBookmarked ? '#fff' : '#8B4513' }} 
          />
          <Text style={[styles.actionText, isBookmarked && styles.actionTextActive]}>
            {isBookmarked ? 'محفوظ' : 'حفظ'}
          </Text>
        </TouchableOpacity>
      </View>

      {showTafsir && (
        <View style={styles.tafsirContainer}>
          <Text style={styles.tafsirTitle}>تفسير ابن كثير:</Text>
          <Text style={styles.tafsirText}>
            {tafsir || 'جاري تحميل التفسير...'}
          </Text>
        </View>
      )}
    </View>
  );
}
