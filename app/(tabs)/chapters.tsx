
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../../hooks/useQuran';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useTheme } from '../../contexts/ThemeContext';
import SurahCard from '../../components/SurahCard';
import Icon from '../../components/Icon';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

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
      const indicatorHeight = 60;
      const maxPosition = scrollViewHeight - indicatorHeight - 20;
      setScrollIndicatorPosition(scrollPercentage * maxPosition);
    }
  };

  const handleScrollIndicatorPress = (event: any) => {
    const touchY = event.nativeEvent.locationY;
    const indicatorHeight = 60;
    const maxPosition = scrollViewHeight - indicatorHeight - 20;
    
    if (contentHeight > scrollViewHeight && scrollViewRef.current) {
      const scrollPercentage = touchY / maxPosition;
      const targetOffset = scrollPercentage * (contentHeight - scrollViewHeight);
      scrollViewRef.current.scrollTo({ y: Math.max(0, targetOffset), animated: true });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5EFE7',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentWrapper: {
      flex: 1,
      flexDirection: 'row',
    },
    leftGreenBar: {
      width: 8,
      backgroundColor: '#4A7C59',
    },
    mainContent: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    rightScrollIndicator: {
      position: 'absolute',
      right: 8,
      top: 0,
      bottom: 0,
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollIndicatorTrack: {
      width: 4,
      height: '100%',
      backgroundColor: '#D4C5A9',
      borderRadius: 2,
    },
    scrollIndicatorThumb: {
      position: 'absolute',
      width: 24,
      height: 60,
      backgroundColor: '#4A7C59',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
    },
    scrollIndicatorText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontFamily: 'Amiri_700Bold',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#E8DCC4',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#D4C5A9',
    },
    iconBtn: {
      width: 36 * (settings.squareAdjustment / 100),
      height: 36 * (settings.squareAdjustment / 100),
      borderRadius: 18 * (settings.squareAdjustment / 100),
      backgroundColor: '#F5EFE7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.title,
      color: '#3D3D3D',
    },
    dedicationBox: {
      margin: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: '#E8DCC4',
      borderWidth: 1,
      borderColor: '#4A7C59',
    },
    dedicationText: {
      color: '#3D3D3D',
      fontFamily: 'Amiri_400Regular',
      fontSize: textSizes.body,
      textAlign: 'center',
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: '#E8DCC4',
      borderWidth: 1,
      borderColor: '#D4C5A9',
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: '#3D3D3D',
      fontSize: textSizes.body,
      paddingVertical: 4,
      textAlign: 'left',
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 12,
      marginTop: 12,
      marginBottom: 8,
    },
    quickBtn: {
      flex: 1,
      marginHorizontal: 4,
      backgroundColor: '#E8DCC4',
      paddingVertical: 10 * (settings.squareAdjustment / 100),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#D4C5A9',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
    },
    quickBtnText: {
      fontFamily: 'Amiri_700Bold',
      color: '#3D3D3D',
      fontSize: textSizes.caption,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 80,
    },
    footerText: {
      fontSize: textSizes.caption,
      color: '#9B8B7E',
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    sheetContainer: {
      flex: 1,
    },
    sheetTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 8,
      paddingHorizontal: 10,
    },
    tabBtn: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundAlt,
    },
    tabBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabBtnText: {
      textAlign: 'center',
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontSize: textSizes.caption,
    },
    tabBtnTextActive: {
      color: colors.backgroundAlt,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    gridItem: {
      width: '20%',
      padding: 8,
    },
    gridItemText: {
      textAlign: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10 * (settings.squareAdjustment / 100),
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontSize: textSizes.body,
      boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
    },
    sajdaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.backgroundAlt,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    badge: {
      width: 34 * (settings.squareAdjustment / 100),
      height: 34 * (settings.squareAdjustment / 100),
      borderRadius: 17 * (settings.squareAdjustment / 100),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: colors.backgroundAlt,
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.caption,
    },
    sajdaTitle: {
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontSize: textSizes.body,
      textAlign: 'right',
    },
    sajdaSub: {
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      fontSize: textSizes.caption,
      textAlign: 'right',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: '#3D3D3D', fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: '#3D3D3D', fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: textSizes.body, color: '#9B8B7E', fontFamily: 'Amiri_400Regular' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.iconBtn} />
        <Text style={styles.title}>القرآن الكريم</Text>
        <View style={styles.iconBtn} />
      </View>

      {settings.showBanner && (
        <View style={styles.dedicationBox}>
          <Text style={styles.dedicationText}>
            هذا المصحف صدقة جارية الى مريم سليمان, احمد جاسم, شيخة احمد, راشد بدر
          </Text>
        </View>
      )}

      <View style={styles.searchBox}>
        <Icon name="search" size={18} style={{ color: '#9B8B7E' }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="...Search chapters"
          placeholderTextColor="#9B8B7E"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => openSheet('juz')}>
          <Text style={styles.quickBtnText}>جزء</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => openSheet('hizb')}>
          <Text style={styles.quickBtnText}>حزب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => openSheet('quarter')}>
          <Text style={styles.quickBtnText}>ربع الحزب</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => openSheet('sajda')}>
          <Text style={styles.quickBtnText}>سجدة</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentWrapper}>
        <View style={styles.leftGreenBar} />
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={(event) => {
            setScrollViewHeight(event.nativeEvent.layout.height);
          }}
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

        <TouchableOpacity 
          style={styles.rightScrollIndicator}
          onPress={handleScrollIndicatorPress}
          activeOpacity={0.8}
        >
          <View style={styles.scrollIndicatorTrack} />
          <Animated.View 
            style={[
              styles.scrollIndicatorThumb,
              { top: scrollIndicatorPosition }
            ]}
          >
            <Icon name="chevron-up" size={12} style={{ color: '#FFFFFF' }} />
            <Icon name="chevron-down" size={12} style={{ color: '#FFFFFF' }} />
          </Animated.View>
        </TouchableOpacity>
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
                      <Text style={styles.gridItemText}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeTab === 'hizb' && (
                <View style={styles.grid}>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                    <TouchableOpacity key={n} style={styles.gridItem} onPress={() => handleSelectHizb(n)}>
                      <Text style={styles.gridItemText}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeTab === 'quarter' && (
                <View style={styles.grid}>
                  {Array.from({ length: 240 }, (_, i) => i + 1).map(n => (
                    <TouchableOpacity key={n} style={styles.gridItem} onPress={() => handleSelectQuarter(n)}>
                      <Text style={styles.gridItemText}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeTab === 'sajda' && (
                <View style={{ paddingHorizontal: 12 }}>
                  {sajdaList.map((a: any, idx) => {
                    const surahNumber = a.surah?.number || a.surahNumber || 1;
                    const ayahNumber = a.numberInSurah || a.ayah || 1;
                    const surahName = a.surah?.name || '';
                    return (
                      <TouchableOpacity key={`${surahNumber}-${ayahNumber}-${idx}`} style={styles.sajdaItem} onPress={() => handleNavigate(surahNumber, ayahNumber)}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{ayahNumber}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sajdaTitle}>سجدة</Text>
                          <Text style={styles.sajdaSub}>{surahName} - آية {ayahNumber}</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} style={{ color: colors.textSecondary }} />
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
