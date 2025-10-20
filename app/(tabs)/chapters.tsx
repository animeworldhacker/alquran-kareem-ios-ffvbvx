
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useTheme } from '../../contexts/ThemeContext';
import SurahCard from '../../components/SurahCard';
import Icon from '../../components/Icon';

// Arabic numerals conversion
const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

export default function ChaptersTab() {
  const { surahs, loading, error } = useQuran();
  const { settings, colors, textSizes } = useTheme();
  const [search, setSearch] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const screenHeight = Dimensions.get('window').height;

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
    
    // Calculate scroll percentage
    const scrollPercentage = offsetY / (contentHeight - scrollViewHeight);
    setScrollPosition(scrollPercentage);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E8DCC4', // Beige/cream background matching the image
      flexDirection: 'row',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Audio sidebar on the left (green)
    audioSidebar: {
      width: 50,
      backgroundColor: '#6B8E6F', // Green color from the image
      paddingVertical: 10,
    },
    audioIconContainer: {
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    audioIcon: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Main content area
    mainContent: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#E8DCC4',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#D4C5A9',
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#D4C5A9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'ScheherazadeNew_700Bold',
      fontSize: 28,
      color: '#3D3D3D',
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 12,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: '#F5EFE0',
      borderWidth: 1,
      borderColor: '#D4C5A9',
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: '#3D3D3D',
      fontSize: textSizes.body,
      paddingVertical: 4,
      textAlign: 'left',
    },
    scrollView: {
      flex: 1,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      fontSize: textSizes.caption,
      color: '#8B7355',
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    // Dot indicators on the right
    dotIndicators: {
      width: 20,
      backgroundColor: '#E8DCC4',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    dotContainer: {
      height: '100%',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#B8A88A',
      marginVertical: 3,
    },
    dotActive: {
      backgroundColor: '#6B8E6F',
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: '#E8DCC4' }, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: '#3D3D3D', fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[{ flex: 1, backgroundColor: '#E8DCC4' }, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: '#3D3D3D', fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: textSizes.body, color: '#8B7355', fontFamily: 'Amiri_400Regular' }}>{error}</Text>
      </View>
    );
  }

  // Calculate which dot should be active based on scroll position
  const activeDotIndex = Math.floor(scrollPosition * 10);

  return (
    <View style={styles.container}>
      {/* Audio Sidebar on the left */}
      <View style={styles.audioSidebar}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredSurahs.map((surah) => (
            <View key={surah.number} style={styles.audioIconContainer}>
              <TouchableOpacity style={styles.audioIcon}>
                <Icon name="volume-high" size={20} style={{ color: '#FFFFFF' }} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.iconBtn}>
            <Icon name="settings" size={20} style={{ color: '#3D3D3D' }} />
          </TouchableOpacity>
          <Text style={styles.title}>السور</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.searchBox}>
          <Icon name="search" size={18} style={{ color: '#8B7355' }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="البحث في السور..."
            placeholderTextColor="#8B7355"
            style={styles.searchInput}
          />
        </View>
        
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

      {/* Dot Indicators on the right */}
      <View style={styles.dotIndicators}>
        <View style={styles.dotContainer}>
          {Array.from({ length: 11 }, (_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot,
                i === activeDotIndex && styles.dotActive
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  );
}
