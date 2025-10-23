
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useAudio } from '../../hooks/useAudio';
import { useTheme } from '../../contexts/ThemeContext';
import AyahCard from '../../components/AyahCard';
import AudioPlayer from '../../components/AudioPlayer';
import TajweedLegend from '../../components/TajweedLegend';
import Icon from '../../components/Icon';
import { TajweedVerse, VerseMetadata } from '../../types';

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
  
  const [surah, setSurah] = useState<any>(null);
  const [tajweedVerses, setTajweedVerses] = useState<TajweedVerse[]>([]);
  const [metadata, setMetadata] = useState<VerseMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadSurahData = async () => {
      try {
        if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
          setError(`رقم السورة غير صحيح: ${surahNumber}`);
          return;
        }

        const surahData = getSurah(surahNumber);
        if (surahData) {
          setSurah(surahData);
          setTajweedVerses(surahData.tajweedVerses || []);
          setMetadata(surahData.metadata || []);
          setError(null);
          console.log(`Loaded Surah ${surahNumber}:`, surahData?.name, `with ${surahData?.ayahs?.length} ayahs`);
          console.log(`Tajweed verses: ${surahData.tajweedVerses?.length || 0}, Metadata: ${surahData.metadata?.length || 0}`);
        } else if (!quranLoading) {
          setError(`لم يتم العثور على السورة رقم ${surahNumber}`);
        }
      } catch (err) {
        console.error('Error loading surah:', err);
        setError('خطأ في تحميل السورة');
      }
    };

    loadSurahData().catch(error => {
      console.error('Error in loadSurahData:', error);
    });
  }, [surahNumber, getSurah, quranLoading]);

  useEffect(() => {
    if (targetAyah && surah) {
      setTimeout(() => {
        console.log(`Scrolling to ayah ${targetAyah}`);
      }, 500);
    }
  }, [targetAyah, surah]);

  useEffect(() => {
    try {
      setOnAyahEnd((surah: number, ayah: number) => {
        console.log(`Ayah ended, moving to next: ${surah}:${ayah}`);
      });
    } catch (error) {
      console.error('Error setting ayah end callback:', error);
    }
  }, [setOnAyahEnd]);

  const handlePlayAyah = async (ayahNumber: number) => {
    try {
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
      await playAyah(surahNumber, ayahNumber, false, 0).catch(error => {
        console.error('Error from playAyah:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error playing ayah:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الآية. يرجى المحاولة مرة أخرى.', [{ text: 'حسناً' }]);
    }
  };

  const handleStopAudio = async () => {
    try {
      console.log('Stopping audio from AyahCard');
      await stopAudio().catch(error => {
        console.error('Error from stopAudio:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error stopping audio:', error);
      Alert.alert('خطأ', 'فشل في إيقاف الآية. يرجى المحاولة مرة أخرى.', [{ text: 'حسناً' }]);
    }
  };

  const handlePlayFromHere = async (ayahNumber: number) => {
    try {
      console.log(`Playing from Surah ${surahNumber}, Ayah ${ayahNumber} continuously`);
      const totalAyahs = surah?.ayahs?.length || 0;
      await playAyah(surahNumber, ayahNumber, true, totalAyahs).catch(error => {
        console.error('Error from playAyah (continuous):', error);
        throw error;
      });
    } catch (error) {
      console.error('Error playing from here:', error);
      Alert.alert('خطأ', 'فشل في تشغيل الآيات. يرجى المحاولة مرة أخرى.', [{ text: 'حسناً' }]);
    }
  };

  const isCurrentAyahPlaying = (ayahNumber: number) => {
    try {
      return audioState.isPlaying && 
             audioState.currentSurah === surahNumber && 
             audioState.currentAyah === ayahNumber;
    } catch (error) {
      console.error('Error checking if ayah is playing:', error);
      return false;
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

  const handleRetry = () => {
    setError(null);
    try {
      const surahData = getSurah(surahNumber);
      if (surahData) {
        setSurah(surahData);
        setTajweedVerses(surahData.tajweedVerses || []);
        setMetadata(surahData.metadata || []);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setError('فشل في إعادة المحاولة');
    }
  };

  const getTajweedVerseForAyah = (ayahNumber: number): TajweedVerse | undefined => {
    try {
      return tajweedVerses.find(v => {
        const parts = v.verse_key.split(':');
        return parseInt(parts[1]) === ayahNumber;
      });
    } catch (error) {
      console.error('Error getting tajweed verse:', error);
      return undefined;
    }
  };

  const getMetadataForAyah = (ayahNumber: number): VerseMetadata | undefined => {
    try {
      return metadata.find(m => m.verse_number === ayahNumber);
    } catch (error) {
      console.error('Error getting metadata:', error);
      return undefined;
    }
  };

  const getPreviousMetadata = (ayahNumber: number): VerseMetadata | undefined => {
    try {
      if (ayahNumber === 1) return undefined;
      return metadata.find(m => m.verse_number === ayahNumber - 1);
    } catch (error) {
      console.error('Error getting previous metadata:', error);
      return undefined;
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
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#ffffff',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#ffffff',
      opacity: 0.9,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
      marginTop: 2,
    },
    headerInfo: {
      width: 40,
      alignItems: 'center',
    },
    ayahCount: {
      fontSize: 12,
      color: '#ffffff',
      fontFamily: 'Amiri_400Regular',
    },
    scrollView: {
      flex: 1,
    },
    bismillahContainer: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    },
    bismillah: {
      fontSize: 28,
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
      fontSize: 20,
      color: colors.text,
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
      fontSize: 16,
      color: colors.error,
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
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
  });

  if (error || quranError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={{ color: '#ffffff' }} />
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={{ color: '#ffffff' }} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>جاري التحميل...</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.centerContent}>
          <Text style={{ fontSize: 18, color: colors.text, fontFamily: 'Amiri_700Bold' }}>
            جاري تحميل السورة...
          </Text>
        </View>
      </View>
    );
  }

  if (!surah.ayahs || !Array.isArray(surah.ayahs) || surah.ayahs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} style={{ color: '#ffffff' }} />
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} style={{ color: '#ffffff' }} />
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
        showsVerticalScrollIndicator={false}
      >
        {surahNumber !== 1 && surahNumber !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          </View>
        )}

        <TajweedLegend />
        
        {validAyahs.map((ayah: any) => (
          <AyahCard
            key={`${surahNumber}-${ayah.numberInSurah}`}
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={surah.name || 'السورة'}
            surahEnglishName={surah.englishName || ''}
            onPlayAudio={handlePlayAyah}
            onStopAudio={handleStopAudio}
            onPlayFromHere={handlePlayFromHere}
            isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
            isContinuousPlaying={continuousPlayback && isCurrentAyahPlaying(ayah.numberInSurah)}
            tajweedVerse={getTajweedVerseForAyah(ayah.numberInSurah)}
            metadata={getMetadataForAyah(ayah.numberInSurah)}
            previousMetadata={getPreviousMetadata(ayah.numberInSurah)}
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
