
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useAudio } from '../../hooks/useAudio';
import { useTheme } from '../../contexts/ThemeContext';
import AyahCard from '../../components/AyahCard';
import AudioPlayer from '../../components/AudioPlayer';
import Icon from '../../components/Icon';
import Svg, { Path, Rect } from 'react-native-svg';

export default function SurahScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahNumber = parseInt(id || '1', 10);
  const targetAyah = ayah ? parseInt(ayah, 10) : null;
  
  const { getSurah, loading: quranLoading, error: quranError } = useQuran();
  const { 
    audioState, 
    reciters,
    selectedReciter,
    setSelectedReciter,
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
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    if (contentHeight > scrollViewHeight && scrollViewHeight > 0) {
      setShowScrollIndicator(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowScrollIndicator(false);
      });
    }
  }, [contentHeight, scrollViewHeight, fadeAnim]);

  // Set callback for continuous playback
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

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setScrollPosition(contentOffset.y);
    setContentHeight(contentSize.height);
    setScrollViewHeight(layoutMeasurement.height);
  };

  const handleScrollIndicatorPress = (event: any) => {
    const { locationY } = event.nativeEvent;
    const scrollIndicatorHeight = screenHeight * 0.6;
    const scrollRatio = locationY / scrollIndicatorHeight;
    const targetScrollY = scrollRatio * (contentHeight - scrollViewHeight);
    
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, Math.min(targetScrollY, contentHeight - scrollViewHeight)),
      animated: true,
    });
  };

  const getScrollIndicatorStyle = () => {
    if (contentHeight <= scrollViewHeight) return { height: 0, top: 0 };
    
    const scrollIndicatorHeight = screenHeight * 0.6;
    const scrollRatio = scrollPosition / (contentHeight - scrollViewHeight);
    const indicatorSize = Math.max(20, (scrollViewHeight / contentHeight) * scrollIndicatorHeight);
    const indicatorPosition = scrollRatio * (scrollIndicatorHeight - indicatorSize);
    
    return {
      height: indicatorSize,
      top: indicatorPosition,
    };
  };

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

  const handleReciterSelect = (reciterId: number) => {
    setSelectedReciter(reciterId);
    setShowReciterDropdown(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f6f0',
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
      backgroundColor: '#c9a961',
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
      opacity: 0.9,
      fontFamily: 'Amiri_400Regular',
    },
    headerInfo: {
      alignItems: 'center',
    },
    ayahCount: {
      fontSize: textSizes.caption,
      color: '#fff',
      opacity: 0.9,
      fontFamily: 'Amiri_400Regular',
    },
    reciterSelector: {
      backgroundColor: '#f8f6f0',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#d4c5a0',
    },
    reciterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#c9a961',
    },
    reciterButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: '#2F4F4F',
      textAlign: 'right',
      flex: 1,
    },
    reciterDropdown: {
      backgroundColor: '#fff',
      marginTop: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#c9a961',
      maxHeight: 200,
    },
    reciterOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    reciterOptionActive: {
      backgroundColor: 'rgba(201, 169, 97, 0.1)',
    },
    reciterOptionText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: '#2F4F4F',
      textAlign: 'right',
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
      backgroundColor: '#c9a961',
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
    decorativeHeader: {
      backgroundColor: '#f8f6f0',
      paddingVertical: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#d4c5a0',
    },
    decorativeBorderTop: {
      height: 60,
      width: '100%',
      backgroundColor: '#c9a961',
      position: 'relative',
      overflow: 'hidden',
    },
    ornamentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 10,
    },
    surahNameContainer: {
      backgroundColor: '#fff',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: '#c9a961',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    surahTitle: {
      fontSize: 32,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    bismillahContainer: {
      paddingVertical: 30,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: '#f8f6f0',
    },
    bismillah: {
      fontSize: 28,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: '#2F4F4F',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    ayahContainer: {
      paddingHorizontal: 0,
      paddingVertical: 10,
      backgroundColor: '#f8f6f0',
    },
    footer: {
      padding: 30,
      alignItems: 'center',
      backgroundColor: '#f8f6f0',
    },
    footerText: {
      fontSize: 20,
      color: '#8B4513',
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    flipContainer: {
      flex: 1,
      backgroundColor: '#f8f6f0',
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    pageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#d4c5a0',
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
      borderTopColor: '#d4c5a0',
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: '#c9a961',
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
    scrollIndicatorContainer: {
      position: 'absolute',
      right: 8,
      top: screenHeight * 0.15,
      width: 6,
      height: screenHeight * 0.6,
      backgroundColor: 'rgba(201, 169, 97, 0.2)',
      borderRadius: 3,
      zIndex: 1000,
    },
    scrollIndicator: {
      position: 'absolute',
      right: 0,
      width: 6,
      backgroundColor: '#c9a961',
      borderRadius: 3,
      minHeight: 20,
    },
    scrollIndicatorThumb: {
      position: 'absolute',
      right: -2,
      width: 10,
      backgroundColor: '#b8941f',
      borderRadius: 5,
      minHeight: 20,
    },
    contentContainer: {
      position: 'relative',
      flex: 1,
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

  const validAyahs = surah.ayahs.filter((ayah: any) => ayah.text && ayah.text.trim().length > 0);
  const selectedReciterName = reciters.find(r => r.id === selectedReciter)?.name || 'اختر القارئ';

  if (settings.readingMode === 'flip') {
    const currentPageAyahs = getCurrentPageAyahs().filter((ayah: any) => ayah.text && ayah.text.trim().length > 0);
    
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
            <Text style={styles.ayahCount}>{validAyahs.length} آية</Text>
          </View>
        </View>

        <View style={styles.reciterSelector}>
          <TouchableOpacity
            style={styles.reciterButton}
            onPress={() => setShowReciterDropdown(!showReciterDropdown)}
          >
            <Icon name={showReciterDropdown ? 'chevron-up' : 'chevron-down'} size={20} style={{ color: '#2F4F4F' }} />
            <Text style={styles.reciterButtonText}>{selectedReciterName}</Text>
          </TouchableOpacity>

          {showReciterDropdown && (
            <ScrollView style={styles.reciterDropdown} nestedScrollEnabled>
              {reciters.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[
                    styles.reciterOption,
                    selectedReciter === reciter.id && styles.reciterOptionActive,
                  ]}
                  onPress={() => handleReciterSelect(reciter.id)}
                >
                  <Text style={styles.reciterOptionText}>{reciter.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.flipContainer}>
          <View style={styles.decorativeBorderTop} />
          
          <View style={styles.pageHeader}>
            <Text style={styles.pageNumber}>صفحة {currentPage + 1} من {totalPages}</Text>
            <Text style={styles.pageNumber}>{surah.name || 'السورة'}</Text>
          </View>

          {currentPage === 0 && surahNumber !== 1 && surahNumber !== 9 && (
            <View style={styles.bismillahContainer}>
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            </View>
          )}

          <ScrollView style={styles.ayahContainer} showsVerticalScrollIndicator={false}>
            {currentPageAyahs.map((ayah: any) => (
              <AyahCard
                key={`${surahNumber}-${ayah.numberInSurah}`}
                ayah={ayah}
                surahNumber={surahNumber}
                surahName={surah.name || 'السورة'}
                surahEnglishName={surah.englishName || ''}
                onPlayAudio={handlePlayAyah}
                onPlayFromHere={handlePlayFromHere}
                isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
                isContinuousPlaying={continuousPlayback && isCurrentAyahPlaying(ayah.numberInSurah)}
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
          <Text style={styles.ayahCount}>{validAyahs.length} آية</Text>
        </View>
      </View>

      <View style={styles.reciterSelector}>
        <TouchableOpacity
          style={styles.reciterButton}
          onPress={() => setShowReciterDropdown(!showReciterDropdown)}
        >
          <Icon name={showReciterDropdown ? 'chevron-up' : 'chevron-down'} size={20} style={{ color: '#2F4F4F' }} />
          <Text style={styles.reciterButtonText}>{selectedReciterName}</Text>
        </TouchableOpacity>

        {showReciterDropdown && (
          <ScrollView style={styles.reciterDropdown} nestedScrollEnabled>
            {reciters.map((reciter) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.reciterOption,
                  selectedReciter === reciter.id && styles.reciterOptionActive,
                ]}
                onPress={() => handleReciterSelect(reciter.id)}
              >
                <Text style={styles.reciterOptionText}>{reciter.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.decorativeBorderTop} />
          
          <View style={styles.decorativeHeader}>
            <View style={styles.surahNameContainer}>
              <Text style={styles.surahTitle}>{surah.name || 'السورة'}</Text>
            </View>
          </View>

          {surahNumber !== 1 && surahNumber !== 9 && (
            <View style={styles.bismillahContainer}>
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            </View>
          )}
          
          {validAyahs.map((ayah: any) => (
            <AyahCard
              key={`${surahNumber}-${ayah.numberInSurah}`}
              ayah={ayah}
              surahNumber={surahNumber}
              surahName={surah.name || 'السورة'}
              surahEnglishName={surah.englishName || ''}
              onPlayAudio={handlePlayAyah}
              onPlayFromHere={handlePlayFromHere}
              isPlaying={isCurrentAyahPlaying(ayah.numberInSurah)}
              isContinuousPlaying={continuousPlayback && isCurrentAyahPlaying(ayah.numberInSurah)}
            />
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>صدق الله العظيم</Text>
          </View>
        </ScrollView>
        
        {showScrollIndicator && (
          <Animated.View 
            style={[styles.scrollIndicatorContainer, { opacity: fadeAnim }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={handleScrollIndicatorPress}
              activeOpacity={0.8}
            >
              <View style={[styles.scrollIndicator, getScrollIndicatorStyle()]} />
              <View style={[styles.scrollIndicatorThumb, getScrollIndicatorStyle()]} />
            </TouchableOpacity>
          </Animated.View>
        )}
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
