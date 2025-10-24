
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
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

interface AyahPosition {
  ayahNumber: number;
  startIndex: number;
  endIndex: number;
}

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

  // Build continuous text with inline verse numbers
  const buildContinuousText = (): { text: string; positions: AyahPosition[] } => {
    let fullText = '';
    const positions: AyahPosition[] = [];

    ayahs.forEach((ayah, index) => {
      const startIndex = fullText.length;
      const processedText = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
      
      // Add ayah text
      fullText += processedText;
      
      // Add verse number in circle (using Unicode circled numbers or custom format)
      const verseNumber = ` ﴿${toArabicIndic(ayah.numberInSurah)}﴾ `;
      fullText += verseNumber;
      
      const endIndex = fullText.length;
      
      positions.push({
        ayahNumber: ayah.numberInSurah,
        startIndex,
        endIndex,
      });
    });

    return { text: fullText, positions };
  };

  const { text: continuousText, positions: ayahPositions } = buildContinuousText();

  // Find which ayah was tapped based on text position
  const findAyahAtPosition = (charIndex: number): number | null => {
    for (const pos of ayahPositions) {
      if (charIndex >= pos.startIndex && charIndex < pos.endIndex) {
        return pos.ayahNumber;
      }
    }
    return null;
  };

  const handleTextPress = (event: any) => {
    // This is a simplified approach - in production, you'd need more sophisticated
    // text measurement to determine exact character position
    // For now, we'll use a different approach with individual ayah rendering
  };

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
        // Navigate to tafsir screen
        break;
      case 'copy':
        // Copy ayah text
        break;
      case 'share':
        // Share ayah
        break;
      case 'bookmark':
        // Toggle bookmark
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 24,
      paddingBottom: 40,
    },
    bismillahContainer: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      marginBottom: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.gold,
    },
    bismillah: {
      fontSize: textSizes.heading,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.text,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    surahTitlePanel: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.primary,
      marginBottom: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.gold,
    },
    surahTitle: {
      fontSize: textSizes.heading,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      textAlign: 'center',
    },
    pageContent: {
      minHeight: Dimensions.get('window').height - 200,
    },
    ayahContainer: {
      marginBottom: 8,
    },
    ayahRow: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    highlighted: {
      backgroundColor: `${colors.primary}20`,
      borderRadius: 12,
    },
    playing: {
      backgroundColor: `${colors.success}20`,
      borderRadius: 12,
    },
    ayahTextContainer: {
      flex: 1,
      minWidth: 0,
    },
    ayahText: {
      fontSize: textSizes.ayah,
      lineHeight: textSizes.ayah * 1.9,
      textAlign: 'justify',
      color: colors.text,
      fontFamily: 'ScheherazadeNew_400Regular',
      writingDirection: 'rtl',
    },
    verseNumber: {
      fontSize: textSizes.body,
      color: colors.primary,
      fontFamily: 'Amiri_700Bold',
      marginLeft: 4,
    },
    markersContainer: {
      marginTop: 4,
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showBismillah && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          </View>
        )}

        <View style={styles.pageContent}>
          {ayahs.map((ayah, index) => {
            const isHighlighted = highlightedAyah === ayah.numberInSurah;
            const isPlaying = currentPlayingAyah === ayah.numberInSurah;
            const processedText = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
            const prevAyah = index > 0 ? ayahs[index - 1] : previousAyah;

            return (
              <TouchableOpacity
                key={`${surahNumber}-${ayah.numberInSurah}`}
                activeOpacity={0.7}
                onPress={(event) => handleAyahPress(ayah.numberInSurah, event)}
              >
                <View
                  ref={(ref) => {
                    if (ref) {
                      ayahRefs.current.set(ayah.numberInSurah, ref);
                    }
                  }}
                  style={[
                    styles.ayahContainer,
                    isHighlighted && styles.highlighted,
                    isPlaying && styles.playing,
                  ]}
                >
                  <View style={styles.ayahRow}>
                    <View style={styles.ayahTextContainer}>
                      {/* Show markers if any */}
                      <View style={styles.markersContainer}>
                        <VerseMarkers ayah={ayah} previousAyah={prevAyah} compact={false} />
                      </View>
                      
                      <Text style={styles.ayahText}>
                        {processedText}
                        <Text style={styles.verseNumber}>
                          {' '}﴿{toArabicIndic(ayah.numberInSurah)}﴾
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Tap outside to clear highlight */}
      {highlightedAyah && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleOutsideTap}
        >
          <View style={{ flex: 1 }} />
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
          onClose={() => setPopoverVisible(false)}
        />
      )}
    </View>
  );
}
