
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useBookmarks } from '../hooks/useBookmarks';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import BookmarkCard from '../components/BookmarkCard';
import Icon from '../components/Icon';

export default function BookmarksScreen() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { colors, textSizes, isDark } = useTheme();

  const navigateToAyah = (surahNumber: number, ayahNumber: number) => {
    console.log('Navigate to bookmark:', surahNumber, ayahNumber);
    router.push(`/surah/${surahNumber}?ayah=${ayahNumber}`);
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      await removeBookmark(bookmarkId);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 2,
      borderBottomColor: colors.gold,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      elevation: 4,
    },
    headerTitle: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 24,
      color: colors.gold,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emptyText: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المفضلة</Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="bookmark-outline" size={40} style={{ color: colors.gold }} />
          </View>
          <Text style={styles.emptyText}>لا توجد إشارات مرجعية</Text>
          <Text style={styles.emptySubtext}>
            احفظ آياتك المفضلة{'\n'}
            للوصول إليها بسهولة
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onPress={() => navigateToAyah(bookmark.surahNumber, bookmark.ayahNumber)}
                onDelete={handleDeleteBookmark}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
