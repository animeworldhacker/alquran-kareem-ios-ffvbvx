
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useTheme } from '../../contexts/ThemeContext';
import SurahCard from '../../components/SurahCard';
import Icon from '../../components/Icon';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Svg, { Path, Rect } from 'react-native-svg';

type DivisionTab = 'juz' | 'hizb' | 'quarter' | 'sajda';

const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChaptersTab() {
  const { surahs, loading, error } = useQuran();
  const { bookmarks } = useBookmarks();
  const { settings, colors, textSizes } = useTheme();

  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DivisionTab>('juz');
  const [sajdaList, setSajdaList] = useState<any[]>([]);
  const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%', '80%'], []);
  const scrollViewRef = useRef<ScrollView>(null);

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.trim().toLowerCase();
    return surahs.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahs, search]);

  const openSheet = (tab: DivisionTab) => {
    setActiveTab(tab);
    setSheetOpen(true);
    setTimeout(() => sheetRef.current?.snapToIndex(1), 0);
    if (tab === 'sajda' && sajdaList.length === 0) {
      loadSajda();
    }
  };

  const closeSheet = () => {
    sheetRef.current?.close();
    setSheetOpen(false);
  };

  const navigateToSurah = (surahNumber: number) => {
    console.log(`Navigating to Surah ${surahNumber}`);
    router.push(`/surah/${surahNumber}`);
  };

  const handleNavigate = (surahNumber: number, ayahNumber: number) => {
    console.log('Navigate to', surahNumber, ayahNumber);
    router.push(`/surah/${surahNumber}?ayah=${ayahNumber}`);
    closeSheet();
  };

  const loadSajda = async () => {
    try {
      const res = await fetch(`http://api.alquran.cloud/v1/sajda/quran-uthmani`);
      const data = await res.json();
      if (data.code === 200) {
        const items = data.data?.ayahs || data.data?.verses || [];
        setSajdaList(items);
      } else {
        console.log('Sajda API unexpected response');
      }
    } catch (e) {
      console.log('Failed to load Sajda', e);
    }
  };

  const handleSelectJuz = async (n: number) => {
    try {
      const res = await fetch(`http://api.alquran.cloud/v1/juz/${n}/quran-uthmani`);
      const data = await res.json();
      if (data.code === 200) {
        const ayahs = data.data?.ayahs || [];
        if (ayahs.length > 0) {
          const first = ayahs[0];
          const surahNumber = first.surah?.number || first.surahNumber || 1;
          const ayahNumber = first.numberInSurah || 1;
          handleNavigate(surahNumber, ayahNumber);
        }
      }
    } catch (e) {
      console.log('Failed to fetch juz', e);
    }
  };

  const handleSelectQuarter = async (n: number) => {
    try {
      const res = await fetch(`http://api.alquran.cloud/v1/hizbQuarter/${n}/quran-uthmani`);
      const data = await res.json();
      if (data.code === 200) {
        const ayahs = data.data?.ayahs || [];
        if (ayahs.length > 0) {
          const first = ayahs[0];
          const surahNumber = first.surah?.number || first.surahNumber || 1;
          const ayahNumber = first.numberInSurah || 1;
          handleNavigate(surahNumber, ayahNumber);
        }
      }
    } catch (e) {
      console.log('Failed to fetch quarter hizb', e);
    }
  };

  const handleSelectHizb = async (n: number) => {
    const firstQuarter = (n - 1) * 4 + 1;
    await handleSelectQuarter(firstQuarter);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    setContentHeight(contentHeight);
    setScrollViewHeight(scrollViewHeight);
    
    if (contentHeight > scrollViewHeight) {
      const scrollPercentage = offsetY / (contentHeight - scrollViewHeight);
      const indicatorHeight = 80;
      const maxPosition = scrollViewHeight - indicatorHeight - 40;
      setScrollIndicatorPosition(scrollPercentage * maxPosition);
    }
  };

  const handleScrollIndicatorPress = (event: any) => {
    const touchY = event.nativeEvent.locationY;
    const indicatorHeight = 80;
    const maxPosition = scrollViewHeight - indicatorHeight - 40;
    
    if (contentHeight > scrollViewHeight && scrollViewRef.current) {
      const scrollPercentage = touchY / maxPosition;
      const targetOffset = scrollPercentage * (contentHeight - scrollViewHeight);
      scrollViewRef.current.scrollTo({ y: Math.max(0, targetOffset), animated: true });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5EEE3',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
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
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
      position: 'relative',
    },
    headerTitle: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 22,
      color: '#D4AF37',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontFamily: 'Amiri_400Regular',
      fontSize: 14,
      color: '#D4AF37',
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 4,
    },
    searchField: {
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#D4AF37',
      backgroundColor: '#F5EEE3',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: '#2C2416',
      fontSize: 16,
      textAlign: 'right',
    },
    filterChips: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 12,
      gap: 8,
    },
    chip: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#D4AF37',
      backgroundColor: '#F5EEE3',
    },
    chipActive: {
      backgroundColor: '#1E5B4C',
    },
    chipText: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 14,
      color: '#2C2416',
    },
    chipTextActive: {
      color: '#D4AF37',
    },
    contentWrapper: {
      flex: 1,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 80,
    },
    footerText: {
      fontSize: 16,
      color: '#6D6558',
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    sheetContainer: {
      flex: 1,
      backgroundColor: '#F5EEE3',
    },
    sheetTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
      paddingHorizontal: 16,
      gap: 8,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#D4AF37',
      backgroundColor: '#F5EEE3',
    },
    tabBtnActive: {
      backgroundColor: '#1E5B4C',
    },
    tabBtnText: {
      textAlign: 'center',
      fontFamily: 'Amiri_700Bold',
      color: '#2C2416',
      fontSize: 14,
    },
    tabBtnTextActive: {
      color: '#D4AF37',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    gridItem: {
      width: '20%',
      padding: 6,
    },
    gridItemText: {
      textAlign: 'center',
      backgroundColor: '#F5EEE3',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#D4AF37',
      paddingVertical: 12,
      fontFamily: 'Amiri_700Bold',
      color: '#2C2416',
      fontSize: 16,
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    },
    sajdaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#F5EEE3',
      marginHorizontal: 16,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: '#D4AF37',
      gap: 12,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    },
    badge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#1E5B4C',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#D4AF37',
    },
    badgeText: {
      color: '#D4AF37',
      fontFamily: 'Amiri_700Bold',
      fontSize: 16,
    },
    sajdaContent: {
      flex: 1,
    },
    sajdaTitle: {
      fontFamily: 'Amiri_700Bold',
      color: '#2C2416',
      fontSize: 18,
      textAlign: 'right',
    },
    sajdaSub: {
      fontFamily: 'Amiri_400Regular',
      color: '#6D6558',
      fontSize: 14,
      textAlign: 'right',
      marginTop: 4,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: 20, color: '#2C2416', fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: 20, color: '#2C2416', fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: 16, color: '#6D6558', fontFamily: 'Amiri_400Regular' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.ornateHeader}>
        <Text style={styles.headerTitle}>القرآن الكريم</Text>
        <Text style={styles.headerSubtitle}>المصحف الشريف</Text>
      </View>

      <View style={styles.searchField}>
        <Icon name="search" size={20} style={{ color: '#D4AF37' }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="البحث في السور..."
          placeholderTextColor="#6D6558"
          style={styles.searchInput}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterChips}
      >
        <TouchableOpacity 
          style={styles.chip} 
          onPress={() => openSheet('juz')}
        >
          <Text style={styles.chipText}>جزء</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.chip} 
          onPress={() => openSheet('hizb')}
        >
          <Text style={styles.chipText}>حزب</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.chip} 
          onPress={() => openSheet('quarter')}
        >
          <Text style={styles.chipText}>ربع الحزب</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.chip} 
          onPress={() => openSheet('sajda')}
        >
          <Text style={styles.chipText}>سجدة</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.contentWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {filteredSurahs.map((surah) => (
            <SurahCard
              key={surah.number}
              surah={surah}
              onPress={() => navigateToSurah(surah.number)}
            />
          ))}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              تم تطوير هذا التطبيق بحمد الله وتوفيقه
            </Text>
          </View>
        </ScrollView>
      </View>

      {sheetOpen && (
        <BottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setSheetOpen(false)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} pressBehavior="close" opacity={0.25} />
          )}
          backgroundStyle={{ backgroundColor: '#F5EEE3' }}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetTabs}>
              {(['juz', 'hizb', 'quarter', 'sajda'] as DivisionTab[]).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveTab(t)}
                  style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
                    {t === 'juz' ? 'جزء' : t === 'hizb' ? 'حزب' : t === 'quarter' ? 'ربع الحزب' : 'سجدة'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={{ flex: 1 }}>
              {activeTab === 'juz' && (
                <View style={styles.grid}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                    <TouchableOpacity key={n} style={styles.gridItem} onPress={() => handleSelectJuz(n)}>
                      <Text style={styles.gridItemText}>{toArabicNumerals(n)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeTab === 'hizb' && (
                <View style={styles.grid}>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                    <TouchableOpacity key={n} style={styles.gridItem} onPress={() => handleSelectHizb(n)}>
                      <Text style={styles.gridItemText}>{toArabicNumerals(n)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeTab === 'quarter' && (
                <View style={styles.grid}>
                  {Array.from({ length: 240 }, (_, i) => i + 1).map(n => (
                    <TouchableOpacity key={n} style={styles.gridItem} onPress={() => handleSelectQuarter(n)}>
                      <Text style={styles.gridItemText}>{toArabicNumerals(n)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeTab === 'sajda' && (
                <View style={{ paddingVertical: 12 }}>
                  {sajdaList.map((a: any, idx) => {
                    const surahNumber = a.surah?.number || a.surahNumber || 1;
                    const ayahNumber = a.numberInSurah || a.ayah || 1;
                    const surahName = a.surah?.name || '';
                    return (
                      <TouchableOpacity 
                        key={`${surahNumber}-${ayahNumber}-${idx}`} 
                        style={styles.sajdaItem} 
                        onPress={() => handleNavigate(surahNumber, ayahNumber)}
                      >
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{toArabicNumerals(ayahNumber)}</Text>
                        </View>
                        <View style={styles.sajdaContent}>
                          <Text style={styles.sajdaTitle}>سجدة</Text>
                          <Text style={styles.sajdaSub}>{surahName} - آية {toArabicNumerals(ayahNumber)}</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} style={{ color: '#1E5B4C' }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}
