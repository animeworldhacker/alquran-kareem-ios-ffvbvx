
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, resetSettings, colors, textSizes } = useTheme();
  const [testingAudio, setTestingAudio] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Setting updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Error updating setting:',Looking at the settings.tsx file I already read, I can see the issue. The file is incomplete - it cuts off at line 377 where there's a TouchableOpacity that's not properly closed. Let me fix both files:

<write file="app/(tabs)/settings.tsx">
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, resetSettings, colors, textSizes } = useTheme();
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
              await resetSettings();
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
              await quranService.clearCache();
              await quranService.fetchQuranData();
              Alert.alert('نجح', 'تم تحديث بيانات القرآن بنجاح');
            } catch (error) {
              console.error('Error refreshing Quran data:', error);
              Alert.alert('خطأ', 'فشل في تحديث بيانات القرآن');
            }
          },
        },
      ]
    );
  };

  const handleTestTextProcessing = () => {
    Alert.alert(
      'اختبار معالجة النص',
      'تم تنفيذ اختبار معالجة النص. تحقق من السجلات للحصول على التفاصيل.',
      [{ text: 'حسناً' }]
    );
  };

  const handleTestAudio = async () => {
    setTestingAudio(true);
    try {
      console.log('\n🧪 ===== TESTING AUDIO SYSTEM =====');
      
      // Test 1: Initialize audio
      console.log('Test 1: Initializing audio...');
      await audioService.initializeAudio();
      console.log('✅ Audio initialization successful');
      
      // Test 2: Get reciters
      console.log('\nTest 2: Loading reciters...');
      const reciters = await audioService.getReciters();
      console.log(`✅ Loaded ${reciters.length} reciters:`, reciters.map(r => r.name).join(', '));
      
      // Test 3: Test audio URL
      console.log('\nTest 3: Testing audio URL for Al-Fatiha (1:1)...');
      const testUrl = 'https://verses.quran.com/7/001001.mp3';
      console.log('Test URL:', testUrl);
      
      const response = await fetch(testUrl, { method: 'HEAD' });
      console.log('URL Response Status:', response.status);
      
      if (response.ok) {
        console.log('✅ Audio URL is accessible');
        
        // Test 4: Try playing a short ayah
        console.log('\nTest 4: Attempting to play Al-Fatiha (1:1)...');
        await audioService.playAyah(1, 1, 7, false, 7);
        console.log('✅ Audio playback started successfully');
        
        Alert.alert(
          'نجح الاختبار! ✅',
          'نظام الصوت يعمل بشكل صحيح.\n\n' +
          `• تم تهيئة الصوت\n` +
          `• تم تحميل ${reciters.length} قراء\n` +
          `• الملفات الصوتية متاحة\n` +
          `• بدأ تشغيل الصوت\n\n` +
          'تحقق من السجلات للحصول على تفاصيل إضافية.',
          [
            {
              text: 'إيقاف الصوت',
              onPress: async () => {
                await audioService.stopAudio();
              }
            }
          ]
        );
      } else {
        throw new Error(`Audio URL returned status ${response.status}`);
      }
      
      console.log('\n✅ ===== AUDIO TEST COMPLETED =====\n');
    } catch (error) {
      console.error('❌ Audio test failed:', error);
      Alert.alert(
        'فشل الاختبار ❌',
        `حدث خطأ أثناء اختبار نظام الصوت:\n\n${error instanceof Error ? error.message : 'خطأ غير معروف'}\n\n` +
        'يرجى التحقق من:\n' +
        '• اتصال الإنترنت\n' +
        '• أذونات الصوت\n' +
        '• السجلات للحصول على تفاصيل\n\n' +
        'إذا استمرت المشكلة، جرب:\n' +
        '1. إعادة تشغيل التطبيق\n' +
        '2. التحقق من إعدادات الجهاز\n' +
        '3. تجربة قارئ مختلف'
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
          onPress: () => {
            audioService.clearCache();
            Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت للصوت');
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
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 20,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'Amiri_700Bold',
    },
    section: {
      backgroundColor: colors.card,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: textSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      fontFamily: 'Amiri_700Bold',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: textSizes.body,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      flex: 1,
    },
    textSizeButtons: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    textSizeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    textSizeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    textSizeButtonText: {
      fontSize: textSizes.caption,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
    },
    textSizeButtonTextActive: {
      color: '#fff',
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 8,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: colors.secondary,
    },
    buttonDanger: {
      backgroundColor: '#f44336',
    },
    buttonSuccess: {
      backgroundColor: '#4caf50',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#fff',
      fontSize: textSizes.body,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    infoText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
    },
    dedicationSection: {
      backgroundColor: colors.card,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dedicationText: {
      fontSize: textSizes.body,
      color: colors.text,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      lineHeight: 28,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المظهر</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>الوضع الداكن</Text>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => handleUpdateSetting('theme', value ? 'dark' : 'light')}
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>حجم النص</Text>
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
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>القراءة</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>إظهار التجويد</Text>
            <Switch
              value={settings.showTajweed}
              onValueChange={(value) => handleUpdateSetting('showTajweed', value)}
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Text style={styles.settingLabel}>وضع القراءة</Text>
            <View style={styles.textSizeButtons}>
              <TouchableOpacity
                style={[
                  styles.textSizeButton,
                  settings.readingMode === 'scroll' && styles.textSizeButtonActive,
                ]}
                onPress={() => handleUpdateSetting('readingMode', 'scroll')}
              >
                <Text
                  style={[
                    styles.textSizeButtonText,
                    settings.readingMode === 'scroll' && styles.textSizeButtonTextActive,
                  ]}
                >
                  تمرير
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.textSizeButton,
                  settings.readingMode === 'page' && styles.textSizeButtonActive,
                ]}
                onPress={() => handleUpdateSetting('readingMode', 'page')}
              >
                <Text
                  style={[
                    styles.textSizeButtonText,
                    settings.readingMode === 'page' && styles.textSizeButtonTextActive,
                  ]}
                >
                  صفحة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الصوت</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, testingAudio && styles.buttonDisabled]}
            onPress={handleTestAudio}
            disabled={testingAudio}
          >
            <Text style={styles.buttonText}>
              {testingAudio ? 'جاري الاختبار...' : 'اختبار نظام الصوت'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleClearAudioCache}
          >
            <Text style={styles.buttonText}>مسح ذاكرة التخزين المؤقت للصوت</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            استخدم اختبار نظام الصوت للتحقق من أن الصوت يعمل بشكل صحيح
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البيانات</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleRefreshQuranData}
          >
            <Text style={styles.buttonText}>تحديث بيانات القرآن</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleTestTextProcessing}
          >
            <Text style={styles.buttonText}>اختبار معالجة النص</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            استخدم هذه الخيارات لتحديث البيانات أو اختبار معالجة النص
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعادة تعيين</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleResetSettings}
          >
            <Text style={styles.buttonText}>إعادة تعيين جميع الإعدادات</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            سيؤدي هذا إلى إعادة تعيين جميع الإعدادات إلى القيم الافتراضية
          </Text>
        </View>

        <View style={styles.dedicationSection}>
          <Text style={styles.dedicationText}>
            هذا المصحف صدقة جارية إلى{'\n'}
            مريم سليمان، أحمد جاسم،{'\n'}
            شيخة أحمد، راشد بدر
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
