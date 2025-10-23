
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

  const handlePlayAyah = async (ayahNumber: number) => {
    try {
      console.log(`Playing Surah ${surahNumber}, Ayah ${ayahNumber}`);
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
        setTajweedVerses(surahData.tajweedVerses || []);
        setMetadata(surahData.metadata || []);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setError('فشل في إعادة المحاولة');
    }
  };

  const getTajweedVerseForAyah = (ayahNumber: number): TajweedVerse | undefined => {
    return tajweedVerses.find(v => {
      const parts = v.verse_key.split(':');
      return parseInt(parts[1]) === ayahNumber;
    });
  };

  const getMetadataForAyah = (ayahNumber: number): VerseMetadata | undefined => {
    return metadata.find(m => m.verse_number === ayahNumber);
  };

  const getPreviousMetadata = (ayahNumber: number): VerseMetadata | undefined => {
    if (ayahNumber === 1) return undefined;
    return metadata.find(m => m.verse_number === ayahNumber - 1);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5EEE3',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      padding: 20,
    },
    ornateHeader: {
      backgroundColor: '#1E5B4C',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: '#D4AF37',
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
      fontSize: 22,
      fontWeight: 'bold',
      color: '#D4AF37',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#D4AF37',
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
      fontSize: 12,
      color: '#D4AF37',
      fontFamily: 'Amiri_400Regular',
    },
    scrollView: {
      flex: 1,
    },
    bismillahContainer: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: '#F5EEE3',
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#D4AF37',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    },
    bismillah: {
      fontSize: 24,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2C2416',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    footer: {
      padding: 30,
      alignItems: 'center',
      backgroundColor: '#F5EEE3',
      marginBottom: 20,
    },
    footerText: {
      fontSize: 20,
      color: '#1E5B4C',
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    errorContainer: {
      backgroundColor: '#FFEBEE',
      padding: 20,
      margin: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#C62828',
    },
    errorText: {
      fontSize: 16,
      color: '#C62828',
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: '#1E5B4C',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 10,
      borderWidth: 2,
      borderColor: '#D4AF37',
    },
    retryButtonText: {
      color: '#D4AF37',
      fontSize: 16,
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
            <Icon name="arrow-back" size={24} style={{ color: '#D4AF37' }} />
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
            <Icon name="arrow-back" size={24} style={{ color: '#D4AF37' }} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>جاري التحميل...</Text>
          </View>
          
          <View style={styles.headerInfo} />
        </View>
        
        <View style={styles.centerContent}>
          <Text style={{ fontSize: 20, color: '#2C2416', fontFamily: 'Amiri_700Bold' }}>
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
            <Icon name="arrow-back" size={24} style={{ color: '#D4AF37' }} />
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
          <Icon name="arrow-back" size={24} style={{ color: '#D4AF37' }} />
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
