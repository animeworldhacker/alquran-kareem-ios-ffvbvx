
import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useTheme } from '../../contexts/ThemeContext';
import SurahCard from '../../components/SurahCard';
import OrnateHeader from '../../components/OrnateHeader';
import OrnateSearchField from '../../components/OrnateSearchField';
import Icon from '../../components/Icon';

export default function ChaptersTab() {
  const { surahs, loading, error } = useQuran();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.trim().toLowerCase();
    
    return surahs.filter(s => {
      const arabicName = s.name.toLowerCase();
      const englishName = s.englishName.toLowerCase();
      const translation = s.englishNameTranslation.toLowerCase();
      
      return arabicName.includes(q) || 
             englishName.includes(q) || 
             translation.includes(q);
    });
  }, [surahs, search]);

  const navigateToSurah = (surahNumber: number) => {
    router.push(`/surah/${surahNumber}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
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
      color: colors.mutedBrown,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    noResultsContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsText: {
      fontSize: 18,
      color: colors.mutedBrown,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      marginTop: 10,
    },
    loadingText: {
      fontSize: 20,
      color: colors.darkBrown,
      fontFamily: 'Amiri_700Bold',
    },
    errorText: {
      fontSize: 20,
      color: colors.darkBrown,
      fontFamily: 'Amiri_700Bold',
    },
    errorSubtext: {
      fontSize: 16,
      color: colors.mutedBrown,
      fontFamily: 'Amiri_400Regular',
      marginTop: 8,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <OrnateHeader title="القرآن الكريم" subtitle="المصحف الشريف" showBismillahWatermark />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>جاري تحميل القرآن الكريم...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <OrnateHeader title="القرآن الكريم" subtitle="المصحف الشريف" showBismillahWatermark />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>خطأ في تحميل البيانات</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OrnateHeader title="القرآن الكريم" subtitle="المصحف الشريف" showBismillahWatermark />
      
      <OrnateSearchField
        value={search}
        onChangeText={setSearch}
        placeholder="البحث في السور..."
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
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
  );
}
