
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useQuran } from '../../../hooks/useQuran';
import { tafsirService } from '../../../services/tafsirService';
import Icon from '../../../components/Icon';

export default function TafsirScreen() {
  const { surah, ayah } = useLocalSearchParams<{ surah: string; ayah: string }>();
  const surahNumber = parseInt(surah || '1', 10);
  const ayahNumber = parseInt(ayah || '1', 10);
  
  const { settings, colors, textSizes } = useTheme();
  const { getSurah } = useQuran();
  
  const [tafsir, setTafsir] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surahData, setSurahData] = useState<any>(null);
  const [ayahData, setAyahData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get surah data
        const surahInfo = getSurah(surahNumber);
        setSurahData(surahInfo);
        
        // Get specific ayah data
        if (surahInfo && surahInfo.ayahs) {
          const ayahInfo = surahInfo.ayahs.find((a: any) => a.numberInSurah === ayahNumber);
          setAyahData(ayahInfo);
        }
        
        // Get tafsir
        console.log(`Loading full tafsir for ${surahNumber}:${ayahNumber}`);
        const tafsirText = await tafsirService.getTafsir(surahNumber, ayahNumber);
        setTafsir(tafsirText || 'تفسير غير متوفر حاليا');
        
      } catch (err) {
        console.error('Error loading tafsir:', err);
        setError('حدث خطأ في تحميل التفسير');
        setTafsir('حدث خطأ في تحميل التفسير. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    if (surahNumber && ayahNumber) {
      loadData();
    }
  }, [surahNumber, ayahNumber, getSurah]);

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      router.push(`/surah/${surahNumber}`);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    
    // Retry loading tafsir
    tafsirService.getTafsir(surahNumber, ayahNumber)
      .then(tafsirText => {
        setTafsir(tafsirText || 'تفسير غير متوفر حاليا');
        setLoading(false);
      })
      .catch(err => {
        console.error('Retry failed:', err);
        setError('فشل في إعادة المحاولة');
        setTafsir('حدث خطأ في تحميل التفسير. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f6f0',
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    backButton: {
      width: 40 * (settings.squareAdjustment / 100),
      height: 40 * (settings.squareAdjustment / 100),
      borderRadius: 20 * (settings.squareAdjustment / 100),
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      color: '#fff',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: textSizes.caption,
      color: '#fff',
      opacity: 0.9,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
      marginTop: 2,
    },
    headerInfo: {
      alignItems: 'center',
      minWidth: 60,
    },
    ayahNumber: {
      fontSize: textSizes.caption,
      color: '#fff',
      opacity: 0.9,
      fontFamily: 'Amiri_700Bold',
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    ayahSection: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    ayahHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e8e6e0',
    },
    ayahNumberCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#d4af37',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    ayahNumberText: {
      fontSize: 16,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
      fontWeight: 'bold',
    },
    ayahInfo: {
      flex: 1,
    },
    ayahTitle: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
      marginBottom: 4,
    },
    ayahSubtitle: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513',
      opacity: 0.8,
    },
    ayahText: {
      fontSize: Math.max(24, textSizes.arabic * 1.2), // Increased text size
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F',
      textAlign: 'right',
      lineHeight: Math.max(46, (textSizes.arabic * 1.2) * 1.9), // Increased line height
      marginBottom: 8,
      paddingHorizontal: 8,
    },
    tafsirSection: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    tafsirHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: '#d4af37',
    },
    tafsirIcon: {
      marginRight: 12,
    },
    tafsirTitle: {
      fontSize: textSizes.title - 2,
      fontFamily: 'Amiri_700Bold',
      color: '#8B4513',
    },
    tafsirText: {
      fontSize: textSizes.body + 2, // Increased tafsir text size
      fontFamily: 'Amiri_400Regular',
      color: '#2F4F4F',
      lineHeight: 32, // Increased line height
      textAlign: 'right',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513',
      marginTop: 16,
      textAlign: 'center',
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      padding: 20,
      margin: 20,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#f44336',
    },
    errorText: {
      fontSize: textSizes.body,
      color: '#c62828',
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      alignSelf: 'center',
    },
    retryButtonText: {
      color: '#fff',
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513',
      textAlign: 'center',
      lineHeight: 28,
    },
  });

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>تفسير ابن كثير</Text>
            <Text style={styles.headerSubtitle}>جاري التحميل...</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>تفسير ابن كثير</Text>
            <Text style={styles.headerSubtitle}>خطأ</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>تفسير ابن كثير</Text>
          <Text style={styles.headerSubtitle}>
            {surahData?.name || `سورة ${surahNumber}`}
          </Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.ayahNumber}>آية {ayahNumber}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Ayah Section */}
          <View style={styles.ayahSection}>
            <View style={styles.ayahHeader}>
              <View style={styles.ayahNumberCircle}>
                <Text style={styles.ayahNumberText}>{ayahNumber}</Text>
              </View>
              <View style={styles.ayahInfo}>
                <Text style={styles.ayahTitle}>
                  {surahData?.name || `سورة ${surahNumber}`}
                </Text>
                <Text style={styles.ayahSubtitle}>
                  {surahData?.englishName || ''} - آية {ayahNumber}
                </Text>
              </View>
            </View>
            
            {ayahData && ayahData.text && (
              <Text style={styles.ayahText}>
                {ayahData.text}
              </Text>
            )}
          </View>
          
          {/* Tafsir Section */}
          <View style={styles.tafsirSection}>
            <View style={styles.tafsirHeader}>
              <Icon 
                name="book" 
                size={24} 
                style={[styles.tafsirIcon, { color: '#d4af37' }]} 
              />
              <Text style={styles.tafsirTitle}>تفسير ابن كثير</Text>
            </View>
            
            {tafsir ? (
              <Text style={styles.tafsirText}>{tafsir}</Text>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  تفسير غير متوفر حاليا لهذه الآية.{'\n'}
                  يرجى المحاولة مرة أخرى لاحقاً.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
