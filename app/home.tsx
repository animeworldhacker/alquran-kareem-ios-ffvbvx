
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useQuran } from '../hooks/useQuran';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTheme } from '../contexts/ThemeContext';
import SurahCard from '../components/SurahCard';
import Icon from '../components/Icon';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { normalizeArabicForSearch } from '../utils/textProcessor';

type DivisionTab = 'juz' | 'hizb' | 'quarter' | 'sajda';

export default function HomeScreen() {
  const { surahs, loading, error } = useQuran();
  const { bookmarks } = useBookmarks();
  const { settings, colors, textSizes } = useTheme();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DivisionTab>('juz');
  const [sajdaList, setSajdaList] = useState<any[]>([]);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%', '80%'], []);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input with 250ms delay
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  const filteredSurahs = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();
    
    // If search is empty, return all surahs
    if (!trimmedSearch) {
      return surahs;
    }
    
    // Normalize the search query for Arabic-friendly matching
    const normalizedQuery = normalizeArabicForSearch(trimmedSearch);
    
    console.log('Home search with normalized query:', {
      original: trimmedSearch,
      normalized: normalizedQuery,
      length: normalizedQuery.length
    });
    
    // Filter surahs using normalized text matching
    const results = surahs.filter(s => {
      // Normalize all searchable fields
      const normalizedArabicName = normalizeArabicForSearch(s.name);
      const normalizedEnglishName = normalizeArabicForSearch(s.englishName);
      const normalizedTranslation = normalizeArabicForSearch(s.englishNameTranslation);
      
      // Check if any field contains the normalized query
      return normalizedArabicName.includes(normalizedQuery) || 
             normalizedEnglishName.includes(normalizedQuery) || 
             normalizedTranslation.includes(normalizedQuery);
    });
    
    console.log(`Home search results: ${results.length} of ${surahs.length} surahs`);
    
    return results;
  }, [surahs, debouncedSearch]);

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

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  const styles = StyleSheet.create({
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundAlt,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconBtn: {
      width: 36 * (settings.squareAdjustment / 100),
      height: 36 * (settings.squareAdjustment / 100),
      borderRadius: 18 * (settings.squareAdjustment / 100),
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Amiri_700Bold',
      fontSize: textSizes.title,
      color: colors.text,
    },
    dedicationBox: {
      margin: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: '#d4db7f',
    },
    dedicationText: {
      color: colors.text,
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
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 44,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      fontSize: textSizes.body,
      textAlign: 'right',
      textAlignVertical: 'center',
      paddingVertical: 0,
      includeFontPadding: false,
    },
    clearButton: {
      padding: 4,
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
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 10 * (settings.squareAdjustment / 100),
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
    },
    quickBtnText: {
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      fontSize: textSizes.caption,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
    },
    noResultsContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noResultsText: {
      fontSize: textSizes.title,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      marginTop: 10,
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
      <View style={[{ flex: 1, backgroundColor: colors.background }, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, styles.centerContent]}>
        <Text style={{ fontSize: textSizes.title, color: colors.text, fontFamily: 'Amiri_700Bold' }}>خطأ في تحميل البيانات</Text>
        <Text style={{ fontSize: textSizes.body, color: colors.textSecondary, fontFamily: 'Amiri_400Regular' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.iconBtn}>
          <Icon name="settings" size={20} style={{ color: colors.text }} />
        </TouchableOpacity>
        <Text style={styles.title}>القرآن الكريم</Text>
        <View style={styles.iconBtn} />
      </View>

      {settings.showBanner && (
        <View style={styles.dedicationBox}>
          <Text style={styles.dedicationText}>صدقة جارية الى مريم سليمان رحمة الله عليها</Text>
        </View>
      )}

      <View style={styles.searchBox}>
        <Icon name="search" size={18} style={{ color: colors.textSecondary }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="البحث في السور..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Icon name="close-circle" size={18} style={{ color: colors.textSecondary }} />
          </TouchableOpacity>
        )}
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredSurahs.length > 0 ? (
          <>
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
          </>
        ) : (
          <View style={styles.noResultsContainer}>
            <Icon name="search" size={48} style={{ color: colors.textSecondary, opacity: 0.5 }} />
            <Text style={styles.noResultsText}>
              No results found for &quot;{search}&quot;
            </Text>
            <TouchableOpacity 
              onPress={handleClearSearch}
              style={{
                marginTop: 20,
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: colors.primary,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                fontFamily: 'Amiri_700Bold',
                fontSize: textSizes.body,
                color: colors.text,
              }}>
                Clear Search
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
