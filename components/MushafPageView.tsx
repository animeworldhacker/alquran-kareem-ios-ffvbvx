
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Platform } from 'react-native';
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

// Reusable verse medallion component with Madani styling
const VerseMedallion = ({ number }: { number: number }) => {
  const { colors, textSizes, settings } = useTheme();
  const isDark = settings.theme === 'dark';
  
  const styles = StyleSheet.create({
    container: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginHorizontal: 8,
      borderRadius: 12,
      backgroundColor: isDark ? '#c9a46a' : '#c9a46a',
      borderWidth: 1.5,
      borderColor: isDark ? '#8B7355' : '#9a7d4f',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
        },
      }),
    },
    text: {
      fontSize: 12,
      color: isDark ? '#0f0d0a' : '#2C2416',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
      zIndex: 1,
    },
  });

  return (
    <View style={styles.container}>
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const ayahRefs = useRef<Map<number, View>>(new Map());

  const isDark = settings.theme === 'dark';

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

  // Calculate page number (simplified - you may want to use actual Madani page numbers)
  const pageNumber = Math.floor((surahNumber - 1) * 20 / 114) + 1;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f0d0a' : '#fbf7ef',
    },
    scrollContent: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    pageContainer: {
      width: '95%',
      maxWidth: 600,
      aspectRatio: 1 / 1.414,
      backgroundColor: isDark ? '#1a1714' : '#fbf7ef',
      borderRadius: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.15)',
        },
      }),
      overflow: 'hidden',
      transform: [{ scale: zoomLevel }],
    },
    pageInner: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 40,
      paddingBottom: 32,
    },
    surahHeader: {
      alignItems: 'center',
      marginBottom: 20,
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: isDark ? '#2d2416' : '#efe3c8',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: isDark ? '#8B7355' : '#c9a46a',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    surahTitle: {
      fontSize: 20,
      fontFamily: 'Amiri_700Bold',
      color: isDark ? '#c9a46a' : '#2C2416',
      textAlign: 'center',
      marginBottom: 4,
    },
    surahSubtitle: {
      fontSize: 12,
      fontFamily: 'Amiri_400Regular',
      color: isDark ? '#8B7355' : '#6D6558',
      textAlign: 'center',
    },
    pageNumberBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: isDark ? '#2d2416' : '#efe3c8',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1.5,
      borderColor: isDark ? '#8B7355' : '#c9a46a',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    pageNumberText: {
      fontSize: 11,
      fontFamily: 'Amiri_700Bold',
      color: isDark ? '#c9a46a' : '#6D6558',
    },
    bismillahContainer: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    bismillah: {
      fontSize: 24,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: isDark ? '#c9a46a' : '#1e1a16',
      textAlign: 'center',
      fontWeight: 'bold',
      letterSpacing: 0,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? '#8B7355' : '#c9a46a',
      width: '60%',
      marginTop: 12,
      opacity: 0.4,
    },
    boundaryMarkerContainer: {
      alignItems: 'center',
      marginVertical: 16,
      marginBottom: 20,
    },
    boundaryDivider: {
      height: 1.5,
      backgroundColor: isDark ? '#8B7355' : '#c9a46a',
      width: '100%',
      marginBottom: 10,
      opacity: 0.5,
    },
    boundaryBadges: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    boundaryBadge: {
      backgroundColor: isDark ? '#2d2416' : '#efe3c8',
      borderColor: isDark ? '#8B7355' : '#c9a46a',
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
        web: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    boundaryBadgeText: {
      fontSize: 12,
      color: isDark ? '#c9a46a' : '#6D6558',
      fontFamily: 'Amiri_700Bold',
    },
    pageContent: {
      flex: 1,
    },
    ayahBlock: {
      marginBottom: 18,
    },
    ayahRow: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      gap: 10,
    },
    rubMarkerColumn: {
      width: 50,
      alignItems: 'flex-end',
      paddingTop: 6,
    },
    rubBadge: {
      backgroundColor: isDark ? '#2d2416' : '#efe3c8',
      borderColor: isDark ? '#8B7355' : '#c9a46a',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    rubBadgeText: {
      fontSize: 10,
      color: isDark ? '#c9a46a' : '#6D6558',
      fontFamily: 'Amiri_700Bold',
    },
    ayahContentColumn: {
      flex: 1,
      minWidth: 0,
    },
    highlightOverlay: {
      position: 'absolute',
      left: -6,
      right: -6,
      top: -6,
      bottom: -6,
      backgroundColor: isDark ? 'rgba(201, 164, 106, 0.15)' : 'rgba(201, 164, 106, 0.12)',
      borderRadius: 12,
      zIndex: -1,
      ...Platform.select({
        web: {
          boxShadow: '0 0 20px rgba(201, 164, 106, 0.3)',
        },
      }),
    },
    playingOverlay: {
      position: 'absolute',
      left: -6,
      right: -6,
      top: -6,
      bottom: -6,
      backgroundColor: isDark ? 'rgba(30, 91, 76, 0.2)' : 'rgba(30, 91, 76, 0.12)',
      borderRadius: 12,
      zIndex: -1,
      ...Platform.select({
        web: {
          boxShadow: '0 0 20px rgba(30, 91, 76, 0.3)',
        },
      }),
    },
    ayahTextContainer: {
      position: 'relative',
    },
    ayahTextLine: {
      fontSize: Math.max(26, textSizes.ayah),
      lineHeight: Math.max(26, textSizes.ayah) * 2.0,
      textAlign: 'justify',
      color: isDark ? '#d4c4a8' : '#1e1a16',
      fontFamily: 'ScheherazadeNew_400Regular',
      writingDirection: 'rtl',
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      letterSpacing: 0,
      wordSpacing: 2,
    },
    ayahTextSegment: {
      fontSize: Math.max(26, textSizes.ayah),
      lineHeight: Math.max(26, textSizes.ayah) * 2.0,
      color: isDark ? '#d4c4a8' : '#1e1a16',
      fontFamily: 'ScheherazadeNew_400Regular',
      letterSpacing: 0,
    },
    sajdahIcon: {
      fontSize: 13,
      color: isDark ? '#c9a46a' : '#6D6558',
      fontFamily: 'Amiri_700Bold',
      marginLeft: 8,
      backgroundColor: isDark ? '#2d2416' : '#efe3c8',
      borderColor: isDark ? '#8B7355' : '#c9a46a',
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    zoomControls: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      flexDirection: 'row',
      gap: 10,
      backgroundColor: isDark ? 'rgba(26, 23, 20, 0.9)' : 'rgba(251, 247, 239, 0.9)',
      borderRadius: 20,
      padding: 8,
      borderWidth: 1,
      borderColor: isDark ? '#8B7355' : '#c9a46a',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
        },
      }),
    },
    zoomButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#2d2416' : '#efe3c8',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#8B7355' : '#c9a46a',
    },
    zoomButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#c9a46a' : '#6D6558',
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
        <View style={styles.pageContainer}>
          {/* Page number badge */}
          <View style={styles.pageNumberBadge}>
            <Text style={styles.pageNumberText}>
              صفحة {toArabicIndic(pageNumber)}
            </Text>
          </View>

          <View style={styles.pageInner}>
            {/* Surah header */}
            <View style={styles.surahHeader}>
              <Text style={styles.surahTitle}>{surahName}</Text>
              <Text style={styles.surahSubtitle}>{surahEnglishName}</Text>
            </View>

            {/* Bismillah with divider */}
            {showBismillah && (
              <View style={styles.bismillahContainer}>
                <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                <View style={styles.divider} />
              </View>
            )}

            <View style={styles.pageContent}>
              {ayahs.map((ayah, index) => {
                const isHighlighted = highlightedAyah === ayah.numberInSurah;
                const isPlaying = currentPlayingAyah === ayah.numberInSurah;
                const processedText = processAyahText(ayah.text, surahNumber, ayah.numberInSurah);
                const prevAyah = index > 0 ? ayahs[index - 1] : previousAyah;
                
                // Check for boundary markers
                const boundaryMarkers = shouldShowBoundaryMarkers(ayah, prevAyah);
                const rubMarker = shouldShowRubMarker(ayah, prevAyah);
                const showSajdah = hasSajdah(ayah);

                return (
                  <View key={`${surahNumber}-${ayah.numberInSurah}`}>
                    {/* Juz/Hizb boundary markers - centered with divider */}
                    {(boundaryMarkers.juz || boundaryMarkers.hizb) && (
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
                    )}

                    {/* Ayah block */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={(event) => handleAyahPress(ayah.numberInSurah, event)}
                    >
                      <View
                        ref={(ref) => {
                          if (ref) {
                            ayahRefs.current.set(ayah.numberInSurah, ref);
                          }
                        }}
                        style={styles.ayahBlock}
                      >
                        <View style={styles.ayahRow}>
                          {/* Rub' marker in outer margin */}
                          {rubMarker && (
                            <View style={styles.rubMarkerColumn}>
                              <View style={styles.rubBadge}>
                                <Text style={styles.rubBadgeText}>
                                  {rubMarker === 1 && '¼'}
                                  {rubMarker === 2 && '½'}
                                  {rubMarker === 3 && '¾'}
                                  {rubMarker === 4 && '●'}
                                </Text>
                              </View>
                            </View>
                          )}

                          {/* Ayah content */}
                          <View style={styles.ayahContentColumn}>
                            {/* Highlight overlay */}
                            {isHighlighted && <View style={styles.highlightOverlay} />}
                            {isPlaying && <View style={styles.playingOverlay} />}

                            {/* Ayah text with inline verse number */}
                            <View style={styles.ayahTextContainer}>
                              <Text style={styles.ayahTextLine}>
                                <Text style={styles.ayahTextSegment}>
                                  {processedText}
                                </Text>
                                {/* Inline verse medallion - Madani style */}
                                <VerseMedallion number={ayah.numberInSurah} />
                                {/* Sajdah icon right after verse number */}
                                {showSajdah && (
                                  <Text style={styles.sajdahIcon}>سجدة</Text>
                                )}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
        >
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoomLevel(1)}
        >
          <Text style={[styles.zoomButtonText, { fontSize: 14 }]}>١٫٠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.2))}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
      </View>

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
