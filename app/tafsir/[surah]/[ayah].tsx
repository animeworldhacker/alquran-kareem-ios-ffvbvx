
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Share, Clipboard, Alert } from 'react-native';
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
    loadData();
  }, [surahNumber, ayahNumber]);

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
      const errorMsg = err instanceof Error ? err.message : 'حدث خطأ في تحميل التفسير';
      setError(errorMsg);
      setTafsir('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      router.push(`/surah/${surahNumber}`);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const tafsirText = await tafsirService.refreshTafsir(surahNumber, ayahNumber);
      setTafsir(tafsirText);
      Alert.alert('نجح', 'تم تحديث التفسير بنجاح');
    } catch (err) {
      console.error('Error refreshing tafsir:', err);
      setError('فشل في تحديث التفسير');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (tafsir) {
      try {
        const fullText = `${surahData?.name || `سورة ${surahNumber}`} - آية ${ayahNumber}\n\n${ayahData?.text || ''}\n\nتفسير ابن كثير:\n${tafsir}`;
        await Clipboard.setString(fullText);
        Alert.alert('تم النسخ', 'تم نسخ التفسير إلى الحافظة');
      } catch (error) {
        console.error('Error copying tafsir:', error);
        Alert.alert('خطأ', 'فشل في نسخ التفسير');
      }
    }
  };

  const handleShare = async () => {
    if (tafsir) {
      try {
        await Share.share({
          message: `${surahData?.name || `سورة ${surahNumber}`} - آية ${ayahNumber}\n\n${ayahData?.text || ''}\n\nتفسير ابن كثير:\n${tafsir}`,
        });
      } catch (error) {
        console.error('Error sharing tafsir:', error);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f8f6f0',
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
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    ayahSection: {
      backgroundColor: colors.surface,
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
      borderBottomColor: settings.theme === 'dark' ? '#3a3530' : '#e8e6e0',
    },
    ayahNumberCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
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
      color: colors.secondary,
      marginBottom: 4,
    },
    ayahSubtitle: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.secondary,
      opacity: 0.8,
    },
    ayahText: {
      fontSize: Math.max(24, textSizes.arabic * 1.2),
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.text,
      textAlign: 'right',
      lineHeight: Math.max(46, (textSizes.arabic * 1.2) * 1.9),
      marginBottom: 8,
      paddingHorizontal: 8,
    },
    tafsirSection: {
      backgroundColor: colors.surface,
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
      borderBottomColor: colors.primary,
    },
    tafsirIcon: {
      marginRight: 12,
    },
    tafsirTitle: {
      fontSize: textSizes.title - 2,
      fontFamily: 'Amiri_700Bold',
      color: colors.secondary,
    },
    tafsirText: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      lineHeight: 32,
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
      color: colors.secondary,
      marginTop: 16,
      textAlign: 'center',
    },
    errorContainer: {
      backgroundColor: settings.theme === 'dark' ? '#3d2020' : '#ffebee',
      padding: 20,
      margin: 20,
      borderRadius: 12,
      borderRightWidth: 4,
      borderRightColor: colors.error,
    },
    errorText: {
      fontSize: textSizes.body,
      color: colors.error,
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
      color: colors.secondary,
      textAlign: 'center',
      lineHeight: 28,
    },
  });

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
          
          <View style={{ width: 36 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
        </View>
      </View>
    );
  }

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
          
          <View style={{ width: 36 }} />
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
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Icon name="share-outline" size={20} style={styles.backIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleCopy}>
            <Icon name="copy-outline" size={20} style={styles.backIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
            <Icon name="refresh-outline" size={20} style={styles.backIcon} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
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
          
          <View style={styles.tafsirSection}>
            <View style={styles.tafsirHeader}>
              <Icon 
                name="book" 
                size={24} 
                style={[styles.tafsirIcon, { color: colors.primary }]} 
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
