
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
    return surahs.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
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
      backgroundColor: '#F5EEE3',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    ornateHeader: {
      backgroundColor: '#1E5B4C',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: '#D4AF37',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
      position: 'relative',
    },
    headerTitle: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 22,
      color: '#D4AF37',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontFamily: 'Amiri_400Regular',
      fontSize: 14,
      color: '#D4AF37',
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
      borderColor: '#D4AF37',
      backgroundColor: '#F5EEE3',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: '#2C2416',
      fontSize: 16,
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
      fontSize: 16,
      color: '#6D6558',
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: 20, color: '#2C2416', fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: 20, color: '#2C2416', fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: 16, color: '#6D6558', fontFamily: 'Amiri_400Regular' }}>{error}</Text>
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
        <Icon name="search" size={20} style={{ color: '#D4AF37' }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="البحث في السور..."
          placeholderTextColor="#6D6558"
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
        </ScrollView>
      </View>
    </View>
  );
}
