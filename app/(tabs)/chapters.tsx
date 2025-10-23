
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useTheme } from '../../contexts/ThemeContext';
import SurahCard from '../../components/SurahCard';
import Icon from '../../components/Icon';

const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChaptersTab() {
  const { surahs, loading, error } = useQuran();
  const { bookmarks } = useBookmarks();
  const { settings, colors, textSizes } = useTheme();

  const [search, setSearch] = useState('');
  const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.trim().toLowerCase();
    
    console.log('Searching for:', q);
    
    return surahs.filter(s => {
      const arabicName = s.name.toLowerCase();
      const englishName = s.englishName.toLowerCase();
      const translation = s.englishNameTranslation.toLowerCase();
      
      const matches = arabicName.includes(q) || 
                     englishName.includes(q) || 
                     translation.includes(q);
      
      if (matches) {
        console.log(`Match found: ${s.name} (${s.englishName})`);
      }
      
      return matches;
    });
  }, [surahs, search]);

  const navigateToSurah = (surahNumber: number) => {
    console.log(`Navigating to Surah ${surahNumber}`);
    router.push(`/surah/${surahNumber}`);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    setContentHeight(contentHeight);
    setScrollViewHeight(scrollViewHeight);
    
    if (contentHeight > scrollViewHeight) {
      const scrollPercentage = offsetY / (contentHeight - scrollViewHeight);
      const indicatorHeight = 80;
      const maxPosition = scrollViewHeight - indicatorHeight - 40;
      setScrollIndicatorPosition(scrollPercentage * maxPosition);
    }
  };

  const handleScrollIndicatorPress = (event: any) => {
    const touchY = event.nativeEvent.locationY;
    const indicatorHeight = 80;
    const maxPosition = scrollViewHeight - indicatorHeight - 40;
    
    if (contentHeight > scrollViewHeight && scrollViewRef.current) {
      const scrollPercentage = touchY / maxPosition;
      const targetOffset = scrollPercentage * (contentHeight - scrollViewHeight);
      scrollViewRef.current.scrollTo({ y: Math.max(0, targetOffset), animated: true });
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
    ornateHeader: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
      position: 'relative',
    },
    headerTitle: {
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.heading,
      color: colors.gold,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontFamily: 'Amiri_400Regular',
      fontSize: textSizes.small,
      color: colors.gold,
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 4,
    },
    searchField: {
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.gold,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      fontSize: textSizes.body,
      textAlign: 'right',
    },
    contentWrapper: {
      flex: 1,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 80,
    },
    footerText: {
      fontSize: textSizes.body,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    noResultsContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsText: {
      fontSize: textSizes.title,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      marginTop: 10,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
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
      <View style={styles.ornateHeader}>
        <Text style={styles.headerTitle}>القرآن الكريم</Text>
        <Text style={styles.headerSubtitle}>المصحف الشريف</Text>
      </View>

      <View style={styles.searchField}>
        <Icon name="search" size={20} style={{ color: colors.gold }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="البحث في السور..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>
      
      <View style={styles.contentWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {filteredSurahs.length > 0 ? (
            <>
              {filteredSurahs.map((surah) => (
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
            </>
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="search" size={48} style={{ color: colors.gold, opacity: 0.5 }} />
              <Text style={styles.noResultsText}>
                لم يتم العثور على نتائج للبحث &quot;{search}&quot;
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
