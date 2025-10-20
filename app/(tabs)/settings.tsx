
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      console.log(`Updating setting ${key} to:`, value);
      await updateSettings({ [key]: value });
      console.log(`Successfully updated setting ${key}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('خطأ', 'فشل في حفظ الإعدادات');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateSettings({
                textSize: 'medium',
                theme: 'light',
                showBanner: true,
                readingMode: 'scroll',
                squareAdjustment: 50,
                showTajweed: true,
              });
              Alert.alert('تم', 'تم إعادة تعيين الإعدادات بنجاح');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('خطأ', 'فشل في إعادة تعيين الإعدادات');
            }
          },
        },
      ]
    );
  };

  const handleRefreshQuranData = async () => {
    Alert.alert(
      'تحديث بيانات القرآن',
      'سيتم إعادة تحميل جميع بيانات القرآن وإعادة معالجة النصوص. هذا قد يستغرق بعض الوقت.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحديث',
          onPress: async () => {
            setIsRefreshing(true);
            try {
              console.log('Starting Quran data refresh...');
              
              // Clear all caches
              quranService.clearCache();
              
              // Force reprocess
              await quranService.forceReprocess();
              
              // Get processing stats
              const stats = quranService.getProcessingStats();
              
              console.log('Quran data refresh completed:', stats);
              
              Alert.alert(
                'تم التحديث',
                `تم تحديث بيانات القرآن بنجاح\n\nإحصائيات المعالجة:\n• السور المعالجة: ${stats.processedSurahs}/${stats.totalSurahs}\n• البسملة المحذوفة: ${stats.bismillahRemoved}\n• الأخطاء: ${stats.processingErrors}`
              );
            } catch (error) {
              console.error('Error refreshing Quran data:', error);
              Alert.alert('خطأ', 'فشل في تحديث بيانات القرآن');
            } finally {
              setIsRefreshing(false);
            }
          },
        },
      ]
    );
  };

  const handleTestTextProcessing = () => {
    Alert.alert(
      'اختبار معالجة النصوص',
      'سيتم اختبار معالجة النصوص على عينة من الآيات الأولى للتأكد من إزالة البسملة بشكل صحيح.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'اختبار',
          onPress: async () => {
            try {
              console.log('Testing text processing...');
              
              // Test a few surahs
              const testSurahs = [1, 2, 3, 4, 5, 9, 10]; // Include Surah 9 (At-Tawbah)
              const results = [];
              
              for (const surahNumber of testSurahs) {
                try {
                  const surah = await quranService.getSurah(surahNumber);
                  if (surah && surah.ayahs && surah.ayahs.length > 0) {
                    const firstAyah = surah.ayahs[0];
                    const containsBismillah = firstAyah.text.includes('بِسْمِ اللَّهِ') || 
                                            firstAyah.text.includes('بِسْمِ ٱللَّهِ') ||
                                            firstAyah.text.includes('بسم الله');
                    
                    results.push({
                      surah: surahNumber,
                      name: surah.englishName,
                      hasBismillah: containsBismillah,
                      textLength: firstAyah.text.length,
                      preview: firstAyah.text.substring(0, 50) + '...'
                    });
                  }
                } catch (surahError) {
                  console.error(`Error testing Surah ${surahNumber}:`, surahError);
                  results.push({
                    surah: surahNumber,
                    name: 'Error',
                    hasBismillah: null,
                    textLength: 0,
                    preview: 'Error loading'
                  });
                }
              }
              
              console.log('Text processing test results:', results);
              
              const problematicSurahs = results.filter(r => r.hasBismillah === true && r.surah !== 9);
              
              if (problematicSurahs.length > 0) {
                Alert.alert(
                  'مشاكل في معالجة النصوص',
                  `تم العثور على ${problematicSurahs.length} سورة لا تزال تحتوي على البسملة:\n\n${problematicSurahs.map(s => `• ${s.name} (${s.surah})`).join('\n')}\n\nيُنصح بتحديث بيانات القرآن.`
                );
              } else {
                Alert.alert(
                  'اختبار ناجح',
                  `تم اختبار ${results.length} سورة بنجاح. جميع السور تم معالجتها بشكل صحيح (باستثناء سورة التوبة كما هو متوقع).`
                );
              }
            } catch (error) {
              console.error('Error testing text processing:', error);
              Alert.alert('خطأ', 'فشل في اختبار معالجة النصوص');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      marginBottom: 15,
      textAlign: 'right',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 10,
      boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
      elevation: 2,
    },
    settingLabel: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
      marginRight: 15,
    },
    textSizeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    textSizeButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textSizeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    textSizeButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
    },
    textSizeButtonTextActive: {
      color: '#fff',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
      borderRadius: 12,
      marginBottom: 10,
    },
    actionButtonSecondary: {
      backgroundColor: colors.secondary,
    },
    actionButtonDanger: {
      backgroundColor: colors.error,
    },
    actionButtonDisabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
    },
    actionButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
      marginLeft: 10,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات العرض</Text>
          
          <View style={styles.settingItem}>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => {
                console.log('Dark mode toggled:', value);
                handleUpdateSetting('theme', value ? 'dark' : 'light');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
            <Text style={styles.settingLabel}>الوضع الليلي</Text>
          </View>

          <View style={styles.settingItem}>
            <Switch
              value={settings.showBanner}
              onValueChange={(value) => {
                console.log('Show banner toggled:', value);
                handleUpdateSetting('showBanner', value);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
            <Text style={styles.settingLabel}>عرض الشعار</Text>
          </View>
        </View>

        {/* Text Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات النص</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.textSizeContainer}>
              {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.textSizeButton,
                    settings.textSize === size && styles.textSizeButtonActive,
                  ]}
                  onPress={() => {
                    console.log('Text size changed to:', size);
                    handleUpdateSetting('textSize', size);
                  }}
                >
                  <Text
                    style={[
                      styles.textSizeButtonText,
                      settings.textSize === size && styles.textSizeButtonTextActive,
                    ]}
                  >
                    {size === 'small' && 'صغير'}
                    {size === 'medium' && 'متوسط'}
                    {size === 'large' && 'كبير'}
                    {size === 'extra-large' && 'كبير جداً'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingLabel}>حجم الخط</Text>
          </View>

          <View style={styles.settingItem}>
            <Switch
              value={settings.readingMode === 'flip'}
              onValueChange={(value) => {
                console.log('Reading mode toggled:', value);
                handleUpdateSetting('readingMode', value ? 'flip' : 'scroll');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
            <Text style={styles.settingLabel}>وضع التقليب</Text>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إدارة البيانات</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, isRefreshing && styles.actionButtonDisabled]}
            onPress={handleRefreshQuranData}
            disabled={isRefreshing}
          >
            <Icon name="refresh" size={20} style={{ color: '#fff' }} />
            <Text style={styles.actionButtonText}>
              {isRefreshing ? 'جاري التحديث...' : 'تحديث بيانات القرآن'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleTestTextProcessing}
          >
            <Icon name="checkmark-circle" size={20} style={{ color: '#fff' }} />
            <Text style={styles.actionButtonText}>اختبار معالجة النصوص</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleResetSettings}
          >
            <Icon name="refresh" size={20} style={{ color: '#fff' }} />
            <Text style={styles.actionButtonText}>إعادة تعيين الإعدادات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
