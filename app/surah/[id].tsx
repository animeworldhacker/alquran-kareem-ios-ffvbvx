
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useAudio } from '../../hooks/useAudio';
import { colors, commonStyles } from '../../styles/commonStyles';
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
  
  const [surah, setSurah] = useState<any>(null);

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

  if (quranLoading || !surah) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={commonStyles.title}>جاري تحميل السورة...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={commonStyles.headerTitle}>{surah.name}</Text>
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

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  headerSubtitle: {
    fontSize: 14,
    color: colors.backgroundAlt,
    opacity: 0.8,
    fontFamily: 'Amiri_400Regular',
  },
  headerInfo: {
    alignItems: 'center',
  },
  ayahCount: {
    fontSize: 12,
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
    fontSize: 24,
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
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
});
