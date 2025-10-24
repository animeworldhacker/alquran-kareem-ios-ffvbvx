
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Ayah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { processAyahText } from '../utils/textProcessor';
import { toArabicIndic } from '../utils/tajweedColors';
import VerseMarkers from './VerseMarkers';
import AyahActionPopover from './AyahActionPopover';

interface MushafPageViewProps {
  ayahs: Ayah[];
  previousAyah?: Ayah;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  showBismillah: boolean;
  onPlayAudio: (ayahNumber: number) => void;
  onStopAudio?: () => void;
  onPlayFromHere?: (ayahNumber: number) => void;
  currentPlayingAyah: number | null;
  isContinuousPlaying?: boolean;
}

interface AyahBoundary {
  ayahNumber: number;
  startY: number;
  endY: number;
}

// Reusable verse medallion component matching scrolling mode exactly
const VerseMedallion = ({ number }: { number: number }) => {
  const { colors, textSizes, settings } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginHorizontal: 6,
    },
    image: {
      width: 24,
      height: 24,
      position: 'absolute',
    },
    text: {
      fontSize: 13,
      color: settings.theme === 'dark' ? '#1E5B4C' : colors.text,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
      zIndex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/8683a5b3-d596-4d40-b189-82163cc3e43a.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        {toArabicIndic(number)}
      </Text>
    </View>
  );
};

export default function MushafPageView({
  ayahs,
  previousAyah,
  surahNumber,
  surahName,
  surahEnglishName,
  showBismillah,
  onPlayAudio,
  onStopAudio,
  onPlayFromHere,
  currentPlayingAyah,
  isContinuousPlaying,
}: MushafPageViewProps) {
  const { colors, textSizes, settings } = useTheme();
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const ayahRefs = useRef<Map<number, View>>(new Map());

  const handleAyahPress = (ayahNumber: number, event: any) => {
    setHighlightedAyah(ayahNumber);
    
    // Clear existing timeout
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
    }

    // Show popover after delay
    popoverTimeoutRef.current = setTimeout(() => {
      // Get touch position
      const { pageX, pageY } = event.nativeEvent;
      setPopoverPosition({ x: pageX, y: pageY });
      setPopoverVisible(true);
    }, 200);
  };

  const handleOutsideTap = () => {
    setHighlightedAyah(null);
    setPopoverVisible(false);
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
    }
  };

  const handlePopoverAction = (action: string, ayahNumber: number) => {
    setPopoverVisible(false);
    
    switch (action) {
      case 'play':
        onPlayAudio(ayahNumber);
        break;
      case 'tafsir':
        // Handled by popover component
        break;
      case 'copy':
        // Handled by popover component
        break;
      case 'share':
        // Handled by popover component
        break;
      case 'bookmark':
        // Handled by popover component
        break;
    }
  };

  // Auto-center current playing ayah
  useEffect(() => {
    if (currentPlayingAyah && scrollViewRef.current) {
      const ayahRef = ayahRefs.current.get(currentPlayingAyah);
      if (ayahRef) {
        ayahRef.measureLayout(
          scrollViewRef.current as any,
          (x, y, width, height) => {
            scrollViewRef.current?.scrollTo({
              y: y - Dimensions.get('window').height / 3,
              animated: true,
            });
          },
          () => console.log('Failed to measure ayah position')
        );
      }
    }
  }, [currentPlayingAyah]);

  // Check if we should show boundary markers (Juz/Hizb)
  const shouldShowBoundaryMarkers = (ayah: Ayah, prevAyah?: Ayah): { juz?: number; hizb?: number } => {
    const markers: { juz?: number; hizb?: number } = {};
    
    if (!prevAyah || ayah.juz !== prevAyah.juz) {
      markers.juz = ayah.juz;
    }
    
    const currentHizb = Math.floor((ayah.hizbQuarter - 1) / 4) + 1;
    const prevHizb = prevAyah ? Math.floor((prevAyah.hizbQuarter - 1) / 4) + 1 : 0;
    
    if (!prevAyah || currentHizb !== prevHizb) {
      markers.hizb = currentHizb;
    }
    
    return markers;
  };

  // Check if we should show Rub' marker
  const shouldShowRubMarker = (ayah: Ayah, prevAyah?: Ayah): number | null => {
    if (ayah.hizbQuarter && ayah.hizbQuarter > 0 && (!prevAyah || ayah.hizbQuarter !== prevAyah.hizbQuarter)) {
      return ((ayah.hizbQuarter - 1) % 4) + 1;
    }
    return null;
  };

  // Check for Sajdah
  const hasSajdah = (ayah: Ayah): boolean => {
    return ayah.sajda && (typeof ayah.sajda === 'boolean' ? ayah.sajda : true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 40,
    },
    bismillahContainer: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    bismillah: {
      fontSize: textSizes.heading,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.text,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: colors.outline,
      marginTop: 8,
      opacity: 0.3,
    },
    boundaryMarkerContainer: {
      alignItems: 'center',
      marginVertical: 12,
      marginBottom: 16,
    },
    boundaryDivider: {
      height: 1,
      backgroundColor: colors.outline,
      width: '100%',
      marginBottom: 8,
    },
    boundaryBadges: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    boundaryBadge: {
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      transform: [{ scale: 0.85 }],
    },
    boundaryBadgeText: {
      fontSize: 11,
      color: colors.onSurfaceVariant,
      fontFamily: 'Amiri_700Bold',
    },
    pageContent: {
      minHeight: Dimensions.get('window').height - 200,
    },
    continuousTextContainer: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      textAlign: 'justify',
      lineHeight: textSizes.ayah * 1.95,
    },
    ayahTextSegment: {
      fontSize: textSizes.ayah,
      lineHeight: textSizes.ayah * 1.95,
      color: colors.text,
      fontFamily: 'ScheherazadeNew_400Regular',
    },
    highlightedText: {
      backgroundColor: `${colors.primary}1F`,
      borderRadius: 4,
    },
    playingText: {
      backgroundColor: `${colors.success}1F`,
      borderRadius: 4,
    },
    sajdahIcon: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      fontFamily: 'Amiri_700Bold',
      marginLeft: 6,
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
  });

  // Render continuous text with inline verse numbers
  const renderContinuousText = () => {
    const elements: JSX.Element[] = [];
    
    ayahs.forEach((ayah, index) => {
      const isHighlighted = highlightedAyah === ayah.numberInSurah;
      const isPlaying = currentPlayingAyah === ayah.numberInSurah;
      const processedText = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
      const prevAyah = index > 0 ? ayahs[index - 1] : previousAyah;
      
      // Check for boundary markers
      const boundaryMarkers = shouldShowBoundaryMarkers(ayah, prevAyah);
      const rubMarker = shouldShowRubMarker(ayah, prevAyah);
      const showSajdah = hasSajdah(ayah);

      // Add boundary markers if needed
      if (boundaryMarkers.juz || boundaryMarkers.hizb) {
        elements.push(
          <View key={`boundary-${ayah.numberInSurah}`} style={{ width: '100%' }}>
            <View style={styles.boundaryMarkerContainer}>
              <View style={styles.boundaryDivider} />
              <View style={styles.boundaryBadges}>
                {boundaryMarkers.juz && (
                  <View style={styles.boundaryBadge}>
                    <Text style={styles.boundaryBadgeText}>
                      الجزء {toArabicIndic(boundaryMarkers.juz)}
                    </Text>
                  </View>
                )}
                {boundaryMarkers.hizb && (
                  <View style={styles.boundaryBadge}>
                    <Text style={styles.boundaryBadgeText}>
                      الحزب {toArabicIndic(boundaryMarkers.hizb)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      }

      // Add ayah text
      elements.push(
        <TouchableOpacity
          key={`ayah-${ayah.numberInSurah}`}
          activeOpacity={0.7}
          onPress={(event) => handleAyahPress(ayah.numberInSurah, event)}
        >
          <Text
            ref={(ref) => {
              if (ref) {
                ayahRefs.current.set(ayah.numberInSurah, ref as any);
              }
            }}
            style={[
              styles.ayahTextSegment,
              isHighlighted && styles.highlightedText,
              isPlaying && styles.playingText,
            ]}
          >
            {processedText}
          </Text>
        </TouchableOpacity>
      );

      // Add verse number (medallion)
      elements.push(
        <View key={`medallion-${ayah.numberInSurah}`}>
          <VerseMedallion number={ayah.numberInSurah} />
        </View>
      );

      // Add sajdah icon if needed
      if (showSajdah) {
        elements.push(
          <Text key={`sajdah-${ayah.numberInSurah}`} style={styles.sajdahIcon}>
            سجدة
          </Text>
        );
      }

      // Add space between verses
      elements.push(
        <Text key={`space-${ayah.numberInSurah}`} style={styles.ayahTextSegment}>
          {' '}
        </Text>
      );
    });

    return elements;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bismillah with divider */}
        {showBismillah && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            <View style={styles.divider} />
          </View>
        )}

        <View style={styles.pageContent}>
          {/* Continuous text with inline verse numbers */}
          <View style={styles.continuousTextContainer}>
            {renderContinuousText()}
          </View>
        </View>
      </ScrollView>

      {/* Tap outside to clear highlight */}
      {highlightedAyah && !popoverVisible && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleOutsideTap}
          pointerEvents="box-none"
        >
          <View style={{ flex: 1 }} pointerEvents="none" />
        </TouchableOpacity>
      )}

      {/* Action Popover */}
      {popoverVisible && highlightedAyah && (
        <AyahActionPopover
          visible={popoverVisible}
          position={popoverPosition}
          ayahNumber={highlightedAyah}
          surahNumber={surahNumber}
          surahName={surahName}
          ayahText={ayahs.find(a => a.numberInSurah === highlightedAyah)?.text || ''}
          onAction={handlePopoverAction}
          onClose={() => {
            setPopoverVisible(false);
            setHighlightedAyah(null);
          }}
        />
      )}
    </View>
  );
}
