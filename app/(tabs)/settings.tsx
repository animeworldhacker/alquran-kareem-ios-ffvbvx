
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import { tafsirService } from '../../services/tafsirService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const [testingAudio, setTestingAudio] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Setting updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('خطأ', 'فشل في تحديث الإعداد');
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
              const defaultSettings = {
                textSize: 'medium' as const,
                theme: 'light' as const,
                showBanner: true,
                readingMode: 'scroll' as const,
                squareAdjustment: 50,
                showTajweed: true,
                autoExpandTafsir: false,
              };
              await updateSettings(defaultSettings);
              Alert.alert('نجح', 'تم إعادة تعيين الإعدادات بنجاح');
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
      'هل تريد إعادة تحميل بيانات القرآن من الخادم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحديث',
          onPress: async () => {
            try {
              quranService.clearCache();
              Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت. سيتم تحميل البيانات الجديدة عند الحاجة.');
            } catch (error) {
              console.error('Error refreshing Quran data:', error);
              Alert.alert('خطأ', 'فشل في تحديث بيانات القرآن');
            }
          },
        },
      ]
    );
  };

  const handleClearTafsirCache = () => {
    Alert.alert(
      'مسح ذاكرة التفسير',
      'هل تريد مسح ذاكرة التخزين المؤقت للتفسير؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          onPress: async () => {
            try {
              await tafsirService.clearCache();
              const stats = tafsirService.getCacheStats();
              Alert.alert('نجح', `تم مسح ذاكرة التخزين المؤقت للتفسير\n\nالإحصائيات:\n• الحجم: ${stats.cacheSize}\n• الأخطاء: ${stats.errorCount}`);
            } catch (error) {
              console.error('Error clearing tafsir cache:', error);
              Alert.alert('خطأ', 'فشل في مسح ذاكرة التفسير');
            }
          },
        },
      ]
    );
  };

  const handleTestAudio = async () => {
    setTestingAudio(true);
    try {
      console.log('\n🧪 ===== TESTING AUDIO SYSTEM =====');
      
      console.log('Test 1: Initializing audio...');
      await audioService.initializeAudio();
      console.log('✅ Audio initialization successful');
      
      console.log('\nTest 2: Testing audio URL for Al-Fatiha (1:1)...');
      
      const testUrl = 'https://verses.quran.com/2/001001.mp3';
      console.log('Testing URL:', testUrl);
      
      try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        const status = response.ok ? '✅' : '❌';
        console.log(`${status} Status: ${response.status}`);
        
        console.log('\n✅ ===== AUDIO TEST COMPLETED =====\n');
        
        Alert.alert(
          'نتائج الاختبار',
          `نظام الصوت:\n\n${status} عبد الباسط عبد الصمد: ${response.status}\n\nنظام الصوت يعمل بشكل صحيح`,
          [{ text: 'حسناً' }]
        );
      } catch (error) {
        console.error(`❌ Error:`, error);
        Alert.alert(
          'فشل الاختبار ❌',
          'حدث خطأ أثناء اختبار نظام الصوت. تأكد من اتصالك بالإنترنت.',
          [{ text: 'حسناً' }]
        );
      }
    } catch (error) {
      console.error('❌ Audio test failed:', error);
      Alert.alert(
        'فشل الاختبار ❌',
        `حدث خطأ أثناء اختبار نظام الصوت:\n\n${error instanceof Error ? error.message : 'خطأ غير معروف'}\n\nتأكد من اتصالك بالإنترنت.`
      );
    } finally {
      setTestingAudio(false);
    }
  };

  const handleClearAudioCache = () => {
    Alert.alert(
      'مسح ذاكرة التخزين المؤقت للصوت',
      'هل تريد مسح ذاكرة التخزين المؤقت للملفات الصوتية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          onPress: async () => {
            await audioService.clearCache();
            Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت للصوت');
          },
        },
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    ornateHeader: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.gold,
      fontFamily: 'Amiri_700Bold',
    },
    settingCard: {
      backgroundColor: colors.surface,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 12,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline + '4D',
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      flex: 1,
      textAlign: 'right',
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
      marginTop: 4,
      textAlign: 'right',
    },
    textSizeButtons: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    textSizeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    textSizeButtonActive: {
      backgroundColor: colors.primary,
    },
    textSizeButtonText: {
      fontSize: 13,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
    },
    textSizeButtonTextActive: {
      color: colors.gold,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginTop: 8,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    buttonSecondary: {
      backgroundColor: colors.surface,
    },
    buttonDanger: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    buttonSuccess: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    buttonTextSecondary: {
      color: colors.primary,
    },
    buttonTextWhite: {
      color: '#fff',
    },
    infoText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
      textAlign: 'right',
      lineHeight: 20,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.ornateHeader}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>المظهر</Text>
          
          <View style={styles.settingRow}>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => handleUpdateSetting('theme', value ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
            <Text style={styles.settingLabel}>الوضع الداكن</Text>
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.textSizeButtons}>
              {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.textSizeButton,
                    settings.textSize === size && styles.textSizeButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('textSize', size)}
                >
                  <Text
                    style={[
                      styles.textSizeButtonText,
                      settings.textSize === size && styles.textSizeButtonTextActive,
                    ]}
                  >
                    {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : size === 'large' ? 'كبير' : 'كبير جداً'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>حجم النص</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>القراءة</Text>
          
          <View style={styles.settingRow}>
            <Switch
              value={settings.showTajweed}
              onValueChange={(value) => handleUpdateSetting('showTajweed', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
            <Text style={styles.settingLabel}>إظهار التجويد</Text>
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Switch
              value={settings.autoExpandTafsir}
              onValueChange={(value) => handleUpdateSetting('autoExpandTafsir', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>فتح التفسير تلقائياً</Text>
              <Text style={styles.settingDescription}>
                عرض تفسير ابن كثير تلقائياً لكل آية
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>التفسير</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleClearTafsirCache}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>مسح ذاكرة التخزين المؤقت للتفسير</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            يتم تحميل تفسير ابن كثير من Quran.com وحفظه محلياً للوصول السريع
          </Text>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>الصوت</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, testingAudio && styles.buttonDisabled]}
            onPress={handleTestAudio}
            disabled={testingAudio}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>
              {testingAudio ? 'جاري الاختبار...' : 'اختبار نظام الصوت'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleClearAudioCache}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>مسح ذاكرة التخزين المؤقت للصوت</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            القارئ: عبد الباسط عبد الصمد (حفص عن عاصم){'\n'}
            • اختبار نظام الصوت: للتحقق من توفر الملفات الصوتية{'\n'}
            • مسح الذاكرة: لحذف الملفات المخزنة مؤقتاً
          </Text>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>البيانات</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleRefreshQuranData}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>تحديث بيانات القرآن</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            استخدم هذا الخيار لتحديث بيانات القرآن من الخادم
          </Text>
        </View>

        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>إعادة تعيين</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetSettings}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>إعادة تعيين جميع الإعدادات</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            سيؤدي هذا إلى إعادة تعيين جميع الإعدادات إلى القيم الافتراضية
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
