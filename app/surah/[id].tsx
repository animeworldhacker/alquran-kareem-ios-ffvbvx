
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useAudio } from '../../hooks/useAudio';
import { useTheme } from '../../contexts/ThemeContext';
import AyahCard from '../../components/AyahCard';
import AudioPlayer from '../../components/AudioPlayer';
import Icon from '../../components/Icon';

export default function SurahScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahNumber = parseInt(id || '1', 10);
  const targetAyah = ayah ? parseInt(ayah, 10) : null;
  
  const { getSurah, loading: quranLoading, error: quranError } = useQuran();
  const { 
    audioState, 
    playAyah, 
    stopAudio, 
    pauseAudio, 
    resumeAudio,
    loading: audioLoading 
  } = useAudio();
  const { settings, colors, textSizes } = useTheme();
  
  const [surah, setSurah] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    try {
      if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
        setError(`رقم السورة غير صحيح: ${surahNumber}`);
        return;
      }

      const surahData = getSurah(surahNumber);
      if (surahData) {
        setSurah(surahData);
        setError(null);
        console.log(`Loaded Surah ${surahNumber}:`, surahData?.name);
      } else if (!quranLoading) {
        setError(`لم يتم العثور على السورة رقم ${surahNumber}`);
      }
    } catch (err) {
      console.error('Error loading surah:', err);
      setError('خطأ في تحميل السورة');
    }
  }, [surahNumber, getSurah, quranLoading]);

  // Scroll to target ayah if specified
  useEffect(() => {
    if (targetAyah && surah) {
      // Add a small delay to ensure the component is rendered
      setTimeout(() => {
        console.log(`Scrolling to ayah ${targetAyah}`);
        // You could implement scrolling to specific ayah here if needed
      }, 500);
    }
  }, [targetAyah, surah]);

  const handlePlayAyah = async (ayahNumber: number) => {
    try {
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
      await playAyah(surahNumber, ayahNumber);
    } catch (error) {
      console.error('Error playing ayah:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الآية');
    }
  };

  const isCurrentAyahPlaying = (ayahNumber: number) => {
    return audioState.isPlaying && 
           audioState.currentSurah === surahNumber && 
           audioState.currentAyah === ayahNumber;
  };

  // Split ayahs into pages for flip mode (10 ayahs per page)
  const ayahsPerPage = 10;
  const totalPages = surah && surah.ayahs ? Math.ceil(surah.ayahs.length / ayahsPerPage) : 0;
  
  const getCurrentPageAyahs = () => {
    if (!surah?.ayahs || !Array.isArray(surah.ayahs)) return [];
    const startIndex = currentPage * ayahsPerPage;
    const endIndex = startIndex + ayahsPerPage;
    return surah.ayahs.slice(startIndex, endIndex);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBackPress = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      router.push('/(tabs)/chapters');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f6f0', // Cream background like in the image
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      padding: 20,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'Amiri_700Bold',
    },
    headerSubtitle: {
      fontSize: textSizes.caption,
      color: '#fff',
      opacity: 0.8,
      fontFamily: 'Amiri_400Regular',
    },
    headerInfo: {
      alignItems: 'center',
    },
    ayahCount: {
      fontSize: textSizes.caption,
      color: '#fff',
      opacity: 0.8,
      fontFamily: 'Amiri_400Regular',
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      padding: 20,
      margin: 16,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#f44336',
    },
    errorText: {
      fontSize: textSizes.body,
      color: '#c62828',
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 10,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    // New elegant Quran page styles
    pageContainer: {
      backgroundColor: '#f8f6f0',
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
      elevation: 8,
    },
    decorativeBorder: {
      height: 60,
      backgroundColor: '#d4af37', // Gold color
      position: 'relative',
      overflow: 'hidden',
    },
    decorativePattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
    surahHeader: {
      backgroundColor: '#f8f6f0',
      paddingVertical: 20,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: '#d4af37',
    },
    surahTitle: {
      fontSize: 28,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#8B4513', // Brown color
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    bismillahContainer: {
      paddingVertical: 30,
      alignItems: 'center',
      backgroundColor: '#f8f6f0',
    },
    bismillah: {
      fontSize: 24,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F', // Dark slate gray
      textAlign: 'center',
      fontWeight: 'bold',
    },
    ayahContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#f8f6f0',
    },
    ayahRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    ayahNumberCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#d4af37',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 15,
      marginTop: 5,
    },
    ayahNumber: {
      fontSize: 14,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
      fontWeight: 'bold',
    },
    ayahTextContainer: {
      flex: 1,
    },
    ayahText: {
      fontSize: 22,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F',
      textAlign: 'right',
      lineHeight: 40,
      marginBottom: 10,
    },
    ayahTranslation: {
      fontSize: 14,
      fontFamily: 'Amiri_400Regular',
      color: '#8B4513',
      textAlign: 'left',
      lineHeight: 20,
      fontStyle: 'italic',
    },
    audioButton: {
      position: 'absolute',
      right: 10,
      top: 10,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#d4af37',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      padding: 30,
      alignItems: 'center',
      backgroundColor: '#f8f6f0',
    },
    footerText: {
      fontSize: 18,
      color: '#8B4513',
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    // Flip mode styles
    flipContainer: {
      flex: 1,
      backgroundColor: '#f8f6f0',
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
      elevation: 8,
    },
    pageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#d4af37',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    pageNumber: {
      fontSize: textSizes.caption,
      color: '#8B4513',
      fontFamily: 'Amiri_700Bold',
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: '#f8f6f0',
      borderTopWidth: 1,
      borderTopColor: '#d4af37',
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: '#d4af37',
      opacity: 1,
    },
    navButtonDisabled: {
      opacity: 0.3,
    },
    navButtonText: {
      color: '#fff',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      marginHorizontal: 4,
    },
    pageIndicator: {
      alignItems: 'center',
    },
    pageIndicatorText: {
      fontSize: textSizes.caption,
      color: '#8B4513',
      fontFamily: 'Amiri_400Regular',
    },
  });

  // Show error state
  if (error || quranError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>خطأ</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.centerContent}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error || quranError || 'حدث خطأ غير متوقع'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                // Trigger a reload
                window.location.reload();
              }}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Show loading state
  if (quranLoading || !surah) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>جاري التحميل...</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.centerContent}>
          <Text style={{ fontSize: textSizes.title, color: '#8B4513', fontFamily: 'Amiri_700Bold' }}>
            جاري تحميل السورة...
          </Text>
        </View>
      </View>
    );
  }

  // Validate surah data
  if (!surah.ayahs || !Array.isArray(surah.ayahs) || surah.ayahs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>خطأ</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.centerContent}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              لا توجد آيات في هذه السورة
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (settings.readingMode === 'flip') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{surah.name || 'السورة'}</Text>
            <Text style={styles.headerSubtitle}>{surah.englishName || ''}</Text>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.ayahCount}>{surah.numberOfAyahs || surah.ayahs.length} آية</Text>
          </View>
        </View>

        <View style={styles.flipContainer}>
          <View style={styles.decorativeBorder}>
            <View style={styles.decorativePattern} />
          </View>
          
          <View style={styles.pageHeader}>
            <Text style={styles.pageNumber}>صفحة {currentPage + 1} من {totalPages}</Text>
            <Text style={styles.pageNumber}>{surah.name || 'السورة'}</Text>
          </View>

          {currentPage === 0 && surahNumber !== 1 && (
            <View style={styles.bismillahContainer}>
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            </View>
          )}

          <ScrollView style={styles.ayahContainer} showsVerticalScrollIndicator={false}>
            {getCurrentPageAyahs().map((ayah: any) => (
              <AyahCard
                key={ayah.number || ayah.numberInSurah}
                ayah={ayah}
                surahNumber={surahNumber}
                surahName={surah.name || 'السورة'}
                surahEnglishName={surah.englishName || ''}
                onPlayAudio={handlePlayAyah}
                isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
              />
            ))}

            {currentPage === totalPages - 1 && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>صدق الله العظيم</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
            onPress={prevPage}
            disabled={currentPage === 0}
          >
            <Icon name="chevron-back" size={16} style={{ color: '#fff' }} />
            <Text style={styles.navButtonText}>السابق</Text>
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {currentPage + 1} / {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, currentPage === totalPages - 1 && styles.navButtonDisabled]}
            onPress={nextPage}
            disabled={currentPage === totalPages - 1}
          >
            <Text style={styles.navButtonText}>التالي</Text>
            <Icon name="chevron-forward" size={16} style={{ color: '#fff' }} />
          </TouchableOpacity>
        </View>

        <AudioPlayer
          audioState={audioState}
          onPlay={resumeAudio}
          onPause={pauseAudio}
          onStop={stopAudio}
        />
      </View>
    );
  }

  // Default scroll mode with AyahCard components
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{surah.name || 'السورة'}</Text>
          <Text style={styles.headerSubtitle}>{surah.englishName || ''}</Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.ayahCount}>{surah.numberOfAyahs || surah.ayahs.length} آية</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {surahNumber !== 1 && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          </View>
        )}
        
        {surah.ayahs.map((ayah: any) => (
          <AyahCard
            key={ayah.number || ayah.numberInSurah}
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={surah.name || 'السورة'}
            surahEnglishName={surah.englishName || ''}
            onPlayAudio={handlePlayAyah}
            isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
          />
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>صدق الله العظيم</Text>
        </View>
      </ScrollView>
      
      <AudioPlayer
        audioState={audioState}
        onPlay={resumeAudio}
        onPause={pauseAudio}
        onStop={stopAudio}
      />
    </View>
  );
}
