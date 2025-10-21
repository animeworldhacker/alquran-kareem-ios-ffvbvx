
import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Animated } from 'react-native';
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

export default function ChaptersTab() {
  const { surahs, loading, error } = useQuran();
  const { bookmarks } = useBookmarks();
  const { settings, colors, textSizes, isDark } = useTheme();

  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DivisionTab>('juz');
  const [sajdaList, setSajdaList] = useState<any[]>([]);
  
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.trim().toLowerCase();
    return surahs.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.number.toString().includes(q)
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    // Header
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 2,
      borderBottomColor: colors.gold,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      elevation: 4,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 24,
      color: colors.gold,
      textAlign: 'center',
    },
    
    // Dedication banner
    dedicationBox: {
      margin: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.gold,
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
      elevation: 2,
    },
    dedicationText: {
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      fontSize: textSizes.body,
      textAlign: 'center',
      lineHeight: 24,
    },
    
    // Search
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      fontSize: textSizes.body,
      paddingVertical: 0,
      textAlign: 'right',
    },
    
    // Quick navigation buttons
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginBottom: 12,
      gap: 8,
    },
    quickBtn: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    quickBtnText: {
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      fontSize: textSizes.caption,
    },
    
    // Surah list
    scrollView: {
      flex: 1,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    footerText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    
    // Bottom sheet
    sheetContainer: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    sheetHandle: {
      backgroundColor: colors.divider,
      width: 40,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    sheetTabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    tabBtn: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
    },
    tabBtnActive: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    tabBtnText: {
      textAlign: 'center',
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontSize: textSizes.caption,
    },
    tabBtnTextActive: {
      color: colors.primary,
    },
    sheetContent: {
      flex: 1,
      padding: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    gridItem: {
      width: '18%',
      aspectRatio: 1,
      margin: '1%',
    },
    gridItemBtn: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    gridItemText: {
      textAlign: 'center',
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      fontSize: textSizes.body,
    },
    sajdaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    badge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: colors.primary,
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.body,
    },
    sajdaContent: {
      flex: 1,
    },
    sajdaTitle: {
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontSize: textSizes.body,
      textAlign: 'right',
      marginBottom: 4,
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
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>
          جاري تحميل القرآن الكريم...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>
          خطأ في تحميل البيانات
        </Text>
        <Text style={{ fontSize: textSizes.body, color: colors.textSecondary, fontFamily: 'Amiri_400Regular', marginTop: 8 }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>السور</Text>
        </View>
      </View>

      {settings.showBanner && (
        <View style={styles.dedicationBox}>
          <Text style={styles.dedicationText}>
            هذا المصحف صدقة جارية الى مريم سليمان, احمد جاسم, شيخة احمد, راشد بدر
          </Text>
        </View>
      )}

      <View style={styles.searchBox}>
        <Icon name="search" size={20} style={{ color: colors.textSecondary }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن سورة..."
          placeholderTextColor={colors.textSecondary}
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
          <Text style={styles.quickBtnText}>ربع</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => openSheet('sajda')}>
          <Text style={styles.quickBtnText}>سجدة</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
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

      {sheetOpen && (
        <BottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setSheetOpen(false)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} pressBehavior="close" opacity={0.5} />
          )}
          backgroundStyle={{ backgroundColor: colors.surface }}
          handleIndicatorStyle={{ backgroundColor: colors.gold }}
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
                    {t === 'juz' ? 'جزء' : t === 'hizb' ? 'حزب' : t === 'quarter' ? 'ربع' : 'سجدة'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'juz' && (
                <View style={styles.grid}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                    <View key={n} style={styles.gridItem}>
                      <TouchableOpacity style={styles.gridItemBtn} onPress={() => handleSelectJuz(n)}>
                        <Text style={styles.gridItemText}>{toArabicNumerals(n)}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {activeTab === 'hizb' && (
                <View style={styles.grid}>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                    <View key={n} style={styles.gridItem}>
                      <TouchableOpacity style={styles.gridItemBtn} onPress={() => handleSelectHizb(n)}>
                        <Text style={styles.gridItemText}>{toArabicNumerals(n)}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {activeTab === 'quarter' && (
                <View style={styles.grid}>
                  {Array.from({ length: 240 }, (_, i) => i + 1).map(n => (
                    <View key={n} style={styles.gridItem}>
                      <TouchableOpacity style={styles.gridItemBtn} onPress={() => handleSelectQuarter(n)}>
                        <Text style={styles.gridItemText}>{toArabicNumerals(n)}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {activeTab === 'sajda' && (
                <View>
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
                        <Icon name="chevron-back" size={20} style={{ color: colors.textSecondary }} />
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
