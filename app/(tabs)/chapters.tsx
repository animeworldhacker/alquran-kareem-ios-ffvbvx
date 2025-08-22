
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
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const chapterScrollRef = useRef<ScrollView>(null);

  const screenHeight = Dimensions.get('window').height;
  const itemHeight = 50;

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

  const handleChapterSelect = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
    
    // Scroll to the selected surah in the main list
    const surahIndex = surahs.findIndex(s => s.number === chapterNumber);
    if (surahIndex !== -1 && scrollViewRef.current) {
      // Calculate approximate position (each SurahCard is roughly 100px)
      const position = surahIndex * 100;
      scrollViewRef.current.scrollTo({ y: position, animated: true });
    }
    
    // Navigate to the surah after a short delay
    setTimeout(() => {
      navigateToSurah(chapterNumber);
    }, 300);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: 'row',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Chapter number scroller on the left
    chapterScroller: {
      width: 80,
      backgroundColor: colors.backgroundAlt,
      borderRightWidth: 2,
      borderRightColor: '#d4af37',
    },
    chapterScrollContainer: {
      paddingVertical: 10,
    },
    chapterItem: {
      height: itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 2,
      marginHorizontal: 8,
      borderRadius: 25,
      backgroundColor: 'transparent',
    },
    chapterItemSelected: {
      backgroundColor: '#d4af37',
      boxShadow: '0px 2px 8px rgba(212, 175, 55, 0.3)',
      elevation: 4,
    },
    chapterNumber: {
      fontSize: 18,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontWeight: 'bold',
    },
    chapterNumberSelected: {
      color: '#fff',
    },
    // Main content area
    mainContent: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundAlt,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBtn: {
      width: 36 * (settings.squareAdjustment / 100),
      height: 36 * (settings.squareAdjustment / 100),
      borderRadius: 18 * (settings.squareAdjustment / 100),
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.title,
      color: colors.text,
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
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
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
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    // Instructions
    instructionText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      padding: 8,
      backgroundColor: colors.backgroundAlt,
      marginHorizontal: 12,
      marginBottom: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#d4af37',
    },
  });

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: textSizes.body, color: colors.textSecondary, fontFamily: 'Amiri_400Regular' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chapter Number Scroller */}
      <View style={styles.chapterScroller}>
        <ScrollView 
          ref={chapterScrollRef}
          style={styles.chapterScrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {Array.from({ length: 114 }, (_, i) => i + 1).map((chapterNum) => (
            <TouchableOpacity
              key={chapterNum}
              style={[
                styles.chapterItem,
                selectedChapter === chapterNum && styles.chapterItemSelected
              ]}
              onPress={() => handleChapterSelect(chapterNum)}
            >
              <Text style={[
                styles.chapterNumber,
                selectedChapter === chapterNum && styles.chapterNumberSelected
              ]}>
                {toArabicNumerals(chapterNum)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.iconBtn}>
            <Icon name="settings" size={20} style={{ color: colors.text }} />
          </TouchableOpacity>
          <Text style={styles.title}>السور</Text>
          <View style={styles.iconBtn} />
        </View>

        <Text style={styles.instructionText}>
          اضغط على رقم السورة من الجانب الأيسر للانتقال إليها مباشرة
        </Text>

        <View style={styles.searchBox}>
          <Icon name="search" size={18} style={{ color: colors.textSecondary }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="البحث في السور..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
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
