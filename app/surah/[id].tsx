
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useAudio } from '../../hooks/useAudio';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AyahCard from '../../components/AyahCard';
import AudioPlayer from '../../components/AudioPlayer';
import FloatingTabBar from '../../components/FloatingTabBar';
import Icon from '../../components/Icon';

const TAB_BAR_HEIGHT = 60;
const SCROLL_THRESHOLD = 6;
const HIDE_TIMEOUT = 3000;

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
    continuousPlayback,
    setOnAyahEnd,
    loading: audioLoading 
  } = useAudio();
  const { settings, colors, textSizes } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [surah, setSurah] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabVisible, setTabVisible] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const tabTranslateY = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        console.log(`Loaded Surah ${surahNumber}:`, surahData?.name, `with ${surahData?.ayahs?.length} ayahs`);
      } else if (!quranLoading) {
        setError(`لم يتم العثور على السورة رقم ${surahNumber}`);
      }
    } catch (err) {
      console.error('Error loading surah:', err);
      setError('خطأ في تحميل السورة');
    }
  }, [surahNumber, getSurah, quranLoading]);

  useEffect(() => {
    if (targetAyah && surah) {
      setTimeout(() => {
        console.log(`Scrolling to ayah ${targetAyah}`);
      }, 500);
    }
  }, [targetAyah, surah]);

  useEffect(() => {
    setOnAyahEnd((surah: number, ayah: number) => {
      console.log(`Ayah ended, moving to next: ${surah}:${ayah}`);
    });
  }, [setOnAyahEnd]);

  // Animate tab bar visibility
  useEffect(() => {
    Animated.timing(tabTranslateY, {
      toValue: tabVisible ? 0 : TAB_BAR_HEIGHT + insets.bottom,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [tabVisible, insets.bottom]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const delta = currentY - lastScrollY.current;
    const velocity = event.nativeEvent.velocity?.y || 0;

    // At top of content, always show tab bar
    if (currentY <= 0) {
      setTabVisible(true);
      lastScrollY.current = currentY;
      return;
    }

    // Quick downward swipe - force show
    if (velocity < -0.5) {
      setTabVisible(true);
      lastScrollY.current = currentY;
      return;
    }

    // Scrolling down (reading) - hide tab bar
    if (delta < -SCROLL_THRESHOLD) {
      setTabVisible(false);
    }
    // Scrolling up (going back) - show tab bar
    else if (delta > SCROLL_THRESHOLD) {
      setTabVisible(true);
    }

    lastScrollY.current = currentY;
  };

  const handleUserInteraction = () => {
    // Hide tab bar on user interaction
    setTabVisible(false);

    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Set timeout to allow scroll logic to control visibility again
    hideTimeoutRef.current = setTimeout(() => {
      console.log('Interaction timeout ended, scroll logic now controls tab visibility');
    }, HIDE_TIMEOUT);
  };

  const handlePlayAyah = async (ayahNumber: number) => {
    try {
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
      handleUserInteraction();
      await playAyah(surahNumber, ayahNumber, false, 0);
    } catch (error) {
      console.error('Error playing ayah:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الآية. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleStopAudio = async () => {
    try {
      console.log('Stopping audio from AyahCard');
      await stopAudio();
    } catch (error) {
      console.error('Error stopping audio:', error);
      Alert.alert('خطأ', 'فشل في إيقاف الآية. يرجى المحاولة مرة أخرى.');
    }
  };

  const handlePlayFromHere = async (ayahNumber: number) => {
    try {
      console.log(`Playing from Surah ${surahNumber}, Ayah ${ayahNumber} continuously`);
      handleUserInteraction();
      const totalAyahs = surah?.ayahs?.length || 0;
      await playAyah(surahNumber, ayahNumber, true, totalAyahs);
    } catch (error) {
      console.error('Error playing from here:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الآيات. يرجى المحاولة مرة أخرى.');
    }
  };

  const isCurrentAyahPlaying = (ayahNumber: number) => {
    return audioState.isPlaying && 
           audioState.currentSurah === surahNumber && 
           audioState.currentAyah === ayahNumber;
  };

  const handleBackPress = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
      router.push('/(tabs)/chapters');
    }
  };

  const handleRetry = () => {
    setError(null);
    try {
      const surahData = getSurah(surahNumber);
      if (surahData) {
        setSurah(surahData);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setError('فشل في إعادة المحاولة');
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
      flex: 1,
      padding: 20,
    },
    ornateHeader: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.gold,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: textSizes.heading,
      fontWeight: 'bold',
      color: colors.gold,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: textSizes.small,
      color: colors.gold,
      opacity: 0.8,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
      marginTop: 2,
    },
    headerInfo: {
      width: 40,
      alignItems: 'center',
    },
    ayahCount: {
      fontSize: textSizes.caption,
      color: colors.gold,
      fontFamily: 'Amiri_400Regular',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
    },
    bismillahContainer: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.gold,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    },
    bismillah: {
      fontSize: textSizes.heading,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.text,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    footer: {
      padding: 30,
      alignItems: 'center',
      backgroundColor: colors.background,
      marginBottom: 20,
    },
    footerText: {
      fontSize: textSizes.title,
      color: colors.primary,
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    errorContainer: {
      backgroundColor: colors.backgroundAlt,
      padding: 20,
      margin: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    errorText: {
      fontSize: textSizes.body,
      color: colors.error,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 10,
      borderWidth: 2,
      borderColor: colors.gold,
    },
    retryButtonText: {
      color: colors.gold,
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
  });

  if (error || quranError) {
    return (
      <View style={styles.container}>
        <View style={styles.ornateHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={{ color: colors.gold }} />
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
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (quranLoading || !surah) {
    return (
      <View style={styles.container}>
        <View style={styles.ornateHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={{ color: colors.gold }} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>جاري التحميل...</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.centerContent}>
          <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>
            جاري تحميل السورة...
          </Text>
        </View>
      </View>
    );
  }

  if (!surah.ayahs || !Array.isArray(surah.ayahs) || surah.ayahs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.ornateHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={{ color: colors.gold }} />
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

  const validAyahs = surah.ayahs.filter((ayah: any) => ayah.text && ayah.text.trim().length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.ornateHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} style={{ color: colors.gold }} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{surah.name || 'السورة'}</Text>
          <Text style={styles.headerSubtitle}>{surah.englishName || ''}</Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.ayahCount}>{validAyahs.length}</Text>
        </View>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {surahNumber !== 1 && surahNumber !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          </View>
        )}
        
        {validAyahs.map((ayah: any, index: number) => (
          <AyahCard
            key={`${surahNumber}-${ayah.numberInSurah}`}
            ayah={ayah}
            previousAyah={index > 0 ? validAyahs[index - 1] : undefined}
            surahNumber={surahNumber}
            surahName={surah.name || 'السورة'}
            surahEnglishName={surah.englishName || ''}
            onPlayAudio={handlePlayAyah}
            onStopAudio={handleStopAudio}
            onPlayFromHere={handlePlayFromHere}
            isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
            isContinuousPlaying={continuousPlayback && isCurrentAyahPlaying(ayah.numberInSurah)}
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

      <FloatingTabBar visible={tabVisible} translateY={tabTranslateY} />
    </View>
  );
}
