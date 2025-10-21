
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTheme } from '../contexts/ThemeContext';
import BookmarkCard from '../components/BookmarkCard';
import Icon from '../components/Icon';

export default function BookmarksScreen() {
  const { bookmarks, loading, error, removeBookmark } = useBookmarks();
  const { colors, textSizes } = useTheme();

  const navigateToAyah = (surahNumber: number, ayahNumber: number) => {
    console.log(`Navigating to Surah ${surahNumber}, Ayah ${ayahNumber}`);
    router.push(`/surah/${surahNumber}?ayah=${ayahNumber}`);
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      await removeBookmark(bookmarkId);
      console.log('Bookmark deleted successfully');
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: colors.backgroundAlt,
      fontFamily: 'Amiri_700Bold',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      color: colors.backgroundAlt,
    },
    headerSpacer: {
      width: 40,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      color: colors.textSecondary,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      fontFamily: 'Amiri_700Bold',
    },
    emptySubtitle: {
      fontSize: textSizes.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: textSizes.body * 1.5,
      fontFamily: 'Amiri_400Regular',
    },
    statsContainer: {
      padding: 16,
      backgroundColor: colors.backgroundAlt,
      marginBottom: 16,
      alignItems: 'center',
    },
    statsText: {
      fontSize: textSizes.body,
      color: colors.primary,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>جاري تحميل المفضلة...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: textSizes.body, color: colors.textSecondary, fontFamily: 'Amiri_400Regular' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>المفضلة</Text>
        
        <View style={styles.headerSpacer} />
      </View>
      
      {bookmarks.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="bookmark-outline" size={64} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>لا توجد آيات محفوظة</Text>
          <Text style={styles.emptySubtitle}>
            اضغط على أيقونة المفضلة بجانب أي آية لحفظها هنا
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {bookmarks.length} آية محفوظة
            </Text>
          </View>
          
          {bookmarks
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onPress={() => navigateToAyah(bookmark.surahNumber, bookmark.ayahNumber)}
                onDelete={handleDeleteBookmark}
              />
            ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              تم حفظ جميع المفضلة محلياً على جهازك
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}


