
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Animated, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useAudio } from '../../hooks/useAudio';
import { useTheme } from '../../contexts/ThemeContext';
import AyahCard from '../../components/AyahCard';
import AudioPlayer from '../../components/AudioPlayer';
import Icon from '../../components/Icon';

const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

export default function SurahScreen() {
  const { id, ayah: targetAyah } = useLocalSearchParams();
  const surahNumber = parseInt(id as string);
  
  const { getSurah, loading: quranLoading, error } = useQuran();
  const { colors, textSizes, isDark } = useTheme();
  const { 
    audioState, 
    playAyah, 
    pauseAudio, 
    stopAudio, 
    playNextAyah,
    setOnAyahEnd 
  } = useAudio();

  const [surah, setSurah] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  useEffect(() => {
    if (targetAyah && surah) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, [targetAyah, surah]);

  useEffect(() => {
    setOnAyahEnd(() => {
      if (surah && audioState.currentAyah) {
        const nextAyahNumber = audioState.currentAyah + 1;
        if (nextAyahNumber <= surah.numberOfAyahs) {
          playNextAyah();
        } else {
          stopAudio();
        }
      }
    });
  }, [setOnAyahEnd, surah, audioState.currentAyah]);

  const loadSurah = async () => {
    try {
      setLoading(true);
      const data = await getSurah(surahNumber);
      setSurah(data);
    } catch (err) {
      console.error('Error loading surah:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAyah = (ayahNumber: number) => {
    if (audioState.isPlaying && audioState.currentAyah === ayahNumber) {
      pauseAudio();
    } else {
      playAyah(surahNumber, ayahNumber);
    }
  };

  const handlePlayFromHere = (ayahNumber: number) => {
    playAyah(surahNumber, ayahNumber);
  };

  const isCurrentAyahPlaying = (ayahNumber: number): boolean => {
    return audioState.isPlaying && 
           audioState.currentSurah === surahNumber && 
           audioState.currentAyah === ayahNumber;
  };

  const handleBackPress = () => {
    if (audioState.isPlaying) {
      stopAudio();
    }
    router.back();
  };

  const handleRetry = () => {
    loadSurah();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 2,
      borderBottomColor: colors.gold,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      elevation: 4,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gold,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 12,
    },
    surahName: {
      fontFamily: 'ScheherazadeNew_700Bold',
      fontSize: 22,
      color: colors.gold,
      textAlign: 'center',
    },
    surahInfo: {
      fontFamily: 'Amiri_400Regular',
      fontSize: textSizes.caption,
      color: colors.gold,
      textAlign: 'center',
      opacity: 0.8,
      marginTop: 2,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gold,
    },
    bismillahContainer: {
      backgroundColor: colors.surfaceElevated,
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    bismillahText: {
      fontSize: textSizes.ayah,
      fontFamily: 'ScheherazadeNew_700Bold',
      color: colors.text,
      textAlign: 'center',
      lineHeight: textSizes.ayah * 1.5,
    },
    scrollView: {
      flex: 1,
    },
    ayahsContainer: {
      paddingBottom: audioState.isPlaying ? 80 : 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      marginTop: 16,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    errorText: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    errorSubtext: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.gold,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
      elevation: 2,
    },
    retryButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.primary,
    },
  });

  if (loading || quranLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Icon name="arrow-forward" size={20} style={{ color: colors.gold }} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.surahName}>جاري التحميل...</Text>
            </View>
            <View style={styles.actionButton} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>جاري تحميل السورة...</Text>
        </View>
      </View>
    );
  }

  if (error || !surah) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Icon name="arrow-forward" size={20} style={{ color: colors.gold }} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.surahName}>خطأ</Text>
            </View>
            <View style={styles.actionButton} />
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>خطأ في تحميل السورة</Text>
          <Text style={styles.errorSubtext}>{error || 'حدث خطأ غير متوقع'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const revelationTypeArabic = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-forward" size={20} style={{ color: colors.gold }} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.surahName}>{surah.name}</Text>
            <Text style={styles.surahInfo}>
              {revelationTypeArabic} • {toArabicNumerals(surah.numberOfAyahs)} آيات
            </Text>
          </View>
          
          <View style={styles.actionButton} />
        </View>
      </View>

      {showBismillah && (
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ayahsContainer}>
          {surah.ayahs?.map((ayah: any) => (
            <AyahCard
              key={ayah.numberInSurah}
              ayah={ayah}
              surahNumber={surahNumber}
              surahName={surah.name}
              surahEnglishName={surah.englishName}
              onPlayAudio={handlePlayAyah}
              onPlayFromHere={handlePlayFromHere}
              isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
              isContinuousPlaying={audioState.isPlaying && audioState.currentSurah === surahNumber}
            />
          ))}
        </View>
      </ScrollView>

      {audioState.isPlaying && audioState.currentSurah === surahNumber && (
        <AudioPlayer
          audioState={audioState}
          onPlay={() => playAyah(surahNumber, audioState.currentAyah || 1)}
          onPause={pauseAudio}
          onStop={stopAudio}
          onNext={playNextAyah}
        />
      )}
    </View>
  );
}
