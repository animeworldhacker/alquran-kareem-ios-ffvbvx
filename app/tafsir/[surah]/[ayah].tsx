
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { tafsirService } from '../../../services/tafsirService';
import { useQuran } from '../../../hooks/useQuran';
import Icon from '../../../components/Icon';

export default function TafsirScreen() {
  const { surah, ayah } = useLocalSearchParams();
  const { colors, textSizes } = useTheme();
  const { getSurah } = useQuran();
  const [tafsir, setTafsir] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [surahData, setSurahData] = useState<any>(null);
  const [ayahData, setAyahData] = useState<any>(null);

  const surahNumber = parseInt(surah as string);
  const ayahNumber = parseInt(ayah as string);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load surah data
        const surahInfo = await getSurah(surahNumber);
        setSurahData(surahInfo);
        
        // Find the specific ayah
        if (surahInfo && surahInfo.ayahs) {
          const specificAyah = surahInfo.ayahs.find((a: any) => a.numberInSurah === ayahNumber);
          setAyahData(specificAyah);
        }
        
        // Load tafsir
        const tafsirText = await tafsirService.getTafsir(surahNumber, ayahNumber);
        setTafsir(tafsirText);
        
      } catch (error) {
        console.error('Error loading tafsir data:', error);
        setTafsir('حدث خطأ في تحميل التفسير');
      } finally {
        setLoading(false);
      }
    };

    if (surahNumber && ayahNumber) {
      loadData();
    }
  }, [surahNumber, ayahNumber]);

  const handleBack = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 15,
    },
    headerTitle: {
      fontSize: textSizes.heading,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    ayahContainer: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ayahHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    ayahNumber: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 15,
    },
    ayahNumberText: {
      fontSize: 16,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
    },
    surahInfo: {
      flex: 1,
    },
    surahName: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
    },
    surahEnglishName: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    ayahText: {
      fontSize: textSizes.arabic,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.text,
      textAlign: 'right',
      lineHeight: 40,
      marginTop: 15,
    },
    tafsirContainer: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tafsirTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.primary,
      marginBottom: 15,
      textAlign: 'right',
    },
    tafsirText: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      lineHeight: 28,
      textAlign: 'right',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      marginTop: 10,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} style={{ color: colors.text }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفسير ابن كثير</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} style={{ color: colors.text }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفسير ابن كثير</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {surahData && ayahData && (
          <View style={styles.ayahContainer}>
            <View style={styles.ayahHeader}>
              <View style={styles.ayahNumber}>
                <Text style={styles.ayahNumberText}>{ayahNumber}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{surahData.name}</Text>
                <Text style={styles.surahEnglishName}>{surahData.englishName}</Text>
              </View>
            </View>
            <Text style={styles.ayahText}>{ayahData.text}</Text>
          </View>
        )}

        <View style={styles.tafsirContainer}>
          <Text style={styles.tafsirTitle}>تفسير ابن كثير:</Text>
          <Text style={styles.tafsirText}>{tafsir}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
