
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../hooks/useQuran';
import { useBookmarks } from '../hooks/useBookmarks';
import { colors, commonStyles } from '../styles/commonStyles';
import SurahCard from '../components/SurahCard';
import Icon from '../components/Icon';

export default function HomeScreen() {
  const { surahs, loading, error } = useQuran();
  const { bookmarks } = useBookmarks();

  const navigateToSurah = (surahNumber: number) => {
    console.log(`Navigating to Surah ${surahNumber}`);
    router.push(`/surah/${surahNumber}`);
  };

  const navigateToBookmarks = () => {
    console.log('Navigating to bookmarks');
    router.push('/bookmarks');
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={commonStyles.title}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={commonStyles.title}>خطأ في تحميل البيانات</Text>
        <Text style={commonStyles.text}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>المصحف الشريف</Text>
        
        <TouchableOpacity 
          style={styles.bookmarksButton} 
          onPress={navigateToBookmarks}
        >
          <Icon name="bookmark" size={24} style={styles.bookmarksIcon} />
          {bookmarks.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{bookmarks.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={styles.subtitle}>اختر السورة التي تريد قراءتها</Text>
          
          {bookmarks.length > 0 && (
            <TouchableOpacity 
              style={styles.quickBookmarksButton} 
              onPress={navigateToBookmarks}
            >
              <Icon name="bookmark" size={16} style={styles.quickBookmarksIcon} />
              <Text style={styles.quickBookmarksText}>
                {bookmarks.length} آية محفوظة
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {surahs.map((surah) => (
          <SurahCard
            key={surah.number}
            surah={surah}
            onPress={() => navigateToSurah(surah.number)}
          />
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            تم تطوير هذا التطبيق بحمد الله وتوفيقه
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  bookmarksButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bookmarksIcon: {
    color: colors.backgroundAlt,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundAlt,
  },
  badgeText: {
    color: colors.backgroundAlt,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  welcomeSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'ScheherazadeNew_400Regular',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
    marginBottom: 12,
  },
  quickBookmarksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  quickBookmarksIcon: {
    color: colors.backgroundAlt,
    marginRight: 6,
  },
  quickBookmarksText: {
    color: colors.backgroundAlt,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
  },
});
