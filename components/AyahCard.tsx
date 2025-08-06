
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ayah } from '../types';
import { colors, commonStyles } from '../styles/commonStyles';
import { tafsirService } from '../services/tafsirService';
import { useBookmarks } from '../hooks/useBookmarks';
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
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<string>('');
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { addBookmark, removeBookmark, isBookmarked: checkBookmarked, bookmarks } = useBookmarks();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const bookmarked = await checkBookmarked(surahNumber, ayah.numberInSurah);
      setIsBookmarked(bookmarked);
    };
    checkBookmarkStatus();
  }, [surahNumber, ayah.numberInSurah, checkBookmarked, bookmarks]);

  const handleTafsirToggle = async () => {
    if (!showTafsir && !tafsir) {
      setLoadingTafsir(true);
      try {
        const tafsirText = await tafsirService.getTafsir(surahNumber, ayah.numberInSurah);
        setTafsir(tafsirText || tafsirService.getBasicTafsir(surahNumber, ayah.numberInSurah));
      } catch (error) {
        console.error('Error loading tafsir:', error);
        setTafsir(tafsirService.getBasicTafsir(surahNumber, ayah.numberInSurah));
      } finally {
        setLoadingTafsir(false);
      }
    }
    setShowTafsir(!showTafsir);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        // Find and remove the bookmark
        const bookmark = bookmarks.find(
          b => b.surahNumber === surahNumber && b.ayahNumber === ayah.numberInSurah
        );
        if (bookmark) {
          await removeBookmark(bookmark.id);
          setIsBookmarked(false);
          console.log('Bookmark removed');
        }
      } else {
        // Add bookmark
        await addBookmark(
          surahNumber,
          surahName,
          surahEnglishName,
          ayah.numberInSurah,
          ayah.text
        );
        setIsBookmarked(true);
        console.log('Bookmark added');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert(
        'خطأ',
        error instanceof Error ? error.message : 'حدث خطأ في حفظ المفضلة',
        [{ text: 'موافق' }]
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.ayahNumber}>
          <Text style={styles.numberText}>{ayah.numberInSurah}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onPlayAudio(ayah.numberInSurah)}
          >
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              style={styles.actionIcon} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleTafsirToggle}
          >
            <Icon 
              name={showTafsir ? "book" : "book-outline"} 
              size={20} 
              style={styles.actionIcon} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isBookmarked && styles.bookmarkedButton]} 
            onPress={handleBookmarkToggle}
          >
            <Icon 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              style={[styles.actionIcon, isBookmarked && styles.bookmarkedIcon]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.ayahText}>{ayah.text}</Text>
      
      {showTafsir && (
        <View style={styles.tafsirContainer}>
          <Text style={styles.tafsirTitle}>التفسير:</Text>
          {loadingTafsir ? (
            <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
          ) : (
            <Text style={styles.tafsirText}>{tafsir}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: colors.backgroundAlt,
    fontSize: 14,
    fontWeight: 'bold',
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkedButton: {
    backgroundColor: colors.accent,
  },
  actionIcon: {
    color: colors.backgroundAlt,
  },
  bookmarkedIcon: {
    color: colors.backgroundAlt,
  },
  ayahText: {
    fontSize: 22,
    lineHeight: 36,
    color: colors.text,
    textAlign: 'right',
    fontFamily: 'ScheherazadeNew_400Regular',
  },
  tafsirContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  tafsirTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
  },
  tafsirText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'right',
    fontFamily: 'Amiri_400Regular',
  },
  loadingText: {
    fontSize: 14,
    color: colors.grey,
    fontStyle: 'italic',
    fontFamily: 'Amiri_400Regular',
  },
});
