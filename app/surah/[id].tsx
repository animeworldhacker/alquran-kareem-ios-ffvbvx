
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
  
  const { getSurah, loading: quranLoading } = useQuran();
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
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const surahData = getSurah(surahNumber);
    setSurah(surahData);
    console.log(`Loaded Surah ${surahNumber}:`, surahData?.name);
  }, [surahNumber, getSurah]);

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
    console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
    await playAyah(surahNumber, ayahNumber);
  };

  const isCurrentAyahPlaying = (ayahNumber: number) => {
    return audioState.isPlaying && 
           audioState.currentSurah === surahNumber && 
           audioState.currentAyah === ayahNumber;
  };

  // Split ayahs into pages for flip mode (10 ayahs per page)
  const ayahsPerPage = 10;
  const totalPages = surah ? Math.ceil(surah.ayahs?.length / ayahsPerPage) : 0;
  
  const getCurrentPageAyahs = () => {
    if (!surah?.ayahs) return [];
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
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
      color: colors.backgroundAlt,
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: colors.backgroundAlt,
      fontFamily: 'Amiri_700Bold',
    },
    headerSubtitle: {
      fontSize: textSizes.caption,
      color: colors.backgroundAlt,
      opacity: 0.8,
      fontFamily: 'Amiri_400Regular',
    },
    headerInfo: {
      alignItems: 'center',
    },
    ayahCount: {
      fontSize: textSizes.caption,
      color: colors.backgroundAlt,
      opacity: 0.8,
      fontFamily: 'Amiri_400Regular',
    },
    bismillahContainer: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      marginBottom: 16,
    },
    bismillah: {
      fontSize: textSizes.arabic,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      fontFamily: 'ScheherazadeNew_400Regular',
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      fontSize: textSizes.body,
      color: colors.primary,
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    // Flip mode styles
    flipContainer: {
      flex: 1,
      backgroundColor: colors.backgroundAlt,
      margin: 16,
      borderRadius: 12,
      padding: 20,
      boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
      elevation: 5,
    },
    pageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pageNumber: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_700Bold',
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.backgroundAlt,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.primary,
      opacity: 1,
    },
    navButtonDisabled: {
      opacity: 0.3,
    },
    navButtonText: {
      color: colors.backgroundAlt,
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      marginHorizontal: 4,
    },
    pageIndicator: {
      alignItems: 'center',
    },
    pageIndicatorText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
  });

  if (quranLoading || !surah) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>جاري تحميل السورة...</Text>
      </View>
    );
  }

  if (settings.readingMode === 'flip') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{surah.name}</Text>
            <Text style={styles.headerSubtitle}>{surah.englishName}</Text>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.ayahCount}>{surah.numberOfAyahs} آية</Text>
          </View>
        </View>

        <View style={styles.flipContainer}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageNumber}>صفحة {currentPage + 1} من {totalPages}</Text>
            <Text style={styles.pageNumber}>{surah.name}</Text>
          </View>

          {currentPage === 0 && surahNumber !== 1 && (
            <View style={styles.bismillahContainer}>
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {getCurrentPageAyahs().map((ayah: any) => (
              <AyahCard
                key={ayah.number}
                ayah={ayah}
                surahNumber={surahNumber}
                surahName={surah.name}
                surahEnglishName={surah.englishName}
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
            <Icon name="chevron-back" size={16} style={{ color: colors.backgroundAlt }} />
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
            <Icon name="chevron-forward" size={16} style={{ color: colors.backgroundAlt }} />
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

  // Default scroll mode
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{surah.name}</Text>
          <Text style={styles.headerSubtitle}>{surah.englishName}</Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.ayahCount}>{surah.numberOfAyahs} آية</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {surahNumber !== 1 && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          </View>
        )}
        
        {surah.ayahs?.map((ayah: any) => (
          <AyahCard
            key={ayah.number}
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={surah.name}
            surahEnglishName={surah.englishName}
            onPlayAudio={handlePlayAyah}
            isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
          />
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            صدق الله العظيم
          </Text>
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


