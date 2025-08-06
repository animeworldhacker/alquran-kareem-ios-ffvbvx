
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../hooks/useQuran';
import { colors, commonStyles } from '../styles/commonStyles';
import SurahCard from '../components/SurahCard';
import Button from '../components/Button';

export default function HomeScreen() {
  const { surahs, loading, error } = useQuran();

  const navigateToSurah = (surahNumber: number) => {
    console.log(`Navigating to Surah ${surahNumber}`);
    router.push(`/surah/${surahNumber}`);
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
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={styles.subtitle}>اختر السورة التي تريد قراءتها</Text>
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
