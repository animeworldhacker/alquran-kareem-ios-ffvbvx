
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import { tafsirService } from '../../services/tafsirService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [testingAudio, setTestingAudio] = useState(false);
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Setting updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('خطأ', 'فشل في تحديث الإعداد');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('نجح', 'تم تسجيل الخروج بنجاح');
          },
        },
      ]
    );
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

  const handleDownloadAudio = () => {
    Alert.alert(
      'تنزيل التلاوات الصوتية',
      'اختر ما تريد تنزيله للاستماع بدون إنترنت:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'سورة واحدة',
          onPress: () => handleDownloadSurah(),
        },
        {
          text: 'جزء كامل',
          onPress: () => handleDownloadJuz(),
        },
        {
          text: 'القرآن كاملاً',
          onPress: () => handleDownloadFullQuran(),
        },
      ]
    );
  };

  const handleDownloadSurah = () => {
    Alert.prompt(
      'تنزيل سورة',
      'أدخل رقم السورة (1-114):',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async (surahNumber) => {
            const num = parseInt(surahNumber || '0');
            if (num < 1 || num > 114) {
              Alert.alert('خطأ', 'رقم السورة يجب أن يكون بين 1 و 114');
              return;
            }
            await downloadSurahAudio(num);
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleDownloadJuz = () => {
    Alert.prompt(
      'تنزيل جزء',
      'أدخل رقم الجزء (1-30):',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async (juzNumber) => {
            const num = parseInt(juzNumber || '0');
            if (num < 1 || num > 30) {
              Alert.alert('خطأ', 'رقم الجزء يجب أن يكون بين 1 و 30');
              return;
            }
            await downloadJuzAudio(num);
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleDownloadFullQuran = () => {
    Alert.alert(
      'تنزيل القرآن كاملاً',
      'سيتم تنزيل جميع التلاوات الصوتية للقرآن الكريم (حوالي 6236 آية). قد يستغرق هذا وقتاً طويلاً ويستهلك مساحة تخزين كبيرة.\n\nهل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async () => {
            await downloadFullQuranAudio();
          },
        },
      ]
    );
  };

  const downloadSurahAudio = async (surahNumber: number) => {
    setDownloadingAudio(true);
    try {
      console.log(`📥 Starting download for Surah ${surahNumber}`);
      
      const surah = await quranService.getSurah(surahNumber);
      if (!surah) {
        throw new Error('فشل في الحصول على معلومات السورة');
      }

      const totalAyahs = surah.ayahs.length;
      setDownloadProgress({ current: 0, total: totalAyahs });

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < surah.ayahs.length; i++) {
        const ayah = surah.ayahs[i];
        try {
          await audioService.downloadAyah(surahNumber, ayah.numberInSurah);
          successCount++;
          setDownloadProgress({ current: i + 1, total: totalAyahs });
        } catch (error) {
          console.error(`Failed to download ayah ${ayah.numberInSurah}:`, error);
          failCount++;
        }
      }

      Alert.alert(
        'اكتمل التنزيل',
        `تم تنزيل السورة ${surah.name}\n\nنجح: ${successCount}\nفشل: ${failCount}`,
        [{ text: 'حسناً' }]
      );
    } catch (error) {
      console.error('Error downloading surah audio:', error);
      Alert.alert('خطأ', 'فشل في تنزيل التلاوات الصوتية');
    } finally {
      setDownloadingAudio(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const downloadJuzAudio = async (juzNumber: number) => {
    setDownloadingAudio(true);
    try {
      console.log(`📥 Starting download for Juz ${juzNumber}`);
      
      const allAyahs = await quranService.getAyahsByJuz(juzNumber);
      if (!allAyahs || allAyahs.length === 0) {
        throw new Error('فشل في الحصول على آيات الجزء');
      }

      setDownloadProgress({ current: 0, total: allAyahs.length });

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < allAyahs.length; i++) {
        const ayah = allAyahs[i];
        try {
          const surahNumber = await quranService.getSurahNumberForAyah(ayah.number);
          await audioService.downloadAyah(surahNumber, ayah.numberInSurah);
          successCount++;
          setDownloadProgress({ current: i + 1, total: allAyahs.length });
        } catch (error) {
          console.error(`Failed to download ayah ${ayah.number}:`, error);
          failCount++;
        }
      }

      Alert.alert(
        'اكتمل التنزيل',
        `تم تنزيل الجزء ${juzNumber}\n\nنجح: ${successCount}\nفشل: ${failCount}`,
        [{ text: 'حسناً' }]
      );
    } catch (error) {
      console.error('Error downloading juz audio:', error);
      Alert.alert('خطأ', 'فشل في تنزيل التلاوات الصوتية');
    } finally {
      setDownloadingAudio(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const downloadFullQuranAudio = async () => {
    setDownloadingAudio(true);
    try {
      console.log('📥 Starting download for full Quran');
      
      const totalAyahs = 6236;
      setDownloadProgress({ current: 0, total: totalAyahs });

      let successCount = 0;
      let failCount = 0;
      let currentAyahCount = 0;

      for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
        const surah = await quranService.getSurah(surahNumber);
        if (!surah) continue;

        for (const ayah of surah.ayahs) {
          try {
            await audioService.downloadAyah(surahNumber, ayah.numberInSurah);
            successCount++;
          } catch (error) {
            console.error(`Failed to download ${surahNumber}:${ayah.numberInSurah}:`, error);
            failCount++;
          }
          currentAyahCount++;
          setDownloadProgress({ current: currentAyahCount, total: totalAyahs });
        }
      }

      Alert.alert(
        'اكتمل التنزيل',
        `تم تنزيل القرآن الكريم كاملاً\n\nنجح: ${successCount}\nفشل: ${failCount}`,
        [{ text: 'حسناً' }]
      );
    } catch (error) {
      console.error('Error downloading full Quran audio:', error);
      Alert.alert('خطأ', 'فشل في تنزيل التلاوات الصوتية');
    } finally {
      setDownloadingAudio(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const handleClearAudioCache = () => {
    Alert.alert(
      'مسح ذاكرة التخزين المؤقت للصوت',
      'هل تريد مسح ذاكرة التخزين المؤقت للملفات الصوتية؟ سيتم حذف جميع التلاوات المحملة.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          onPress: async () => {
            await audioService.clearCache();
            await audioService.clearDownloadedAudio();
            Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت للصوت');
          },
        },
      ]
    );
  };

  const handleCheckDownloadedAudio = async () => {
    try {
      const stats = await audioService.getDownloadStats();
      Alert.alert(
        'إحصائيات التنزيل',
        `التلاوات المحملة:\n\n• عدد الآيات: ${stats.totalAyahs}\n• الحجم: ${stats.totalSize}\n• السور: ${stats.surahs.join(', ')}`,
        [{ text: 'حسناً' }]
      );
    } catch (error) {
      console.error('Error checking download stats:', error);
      Alert.alert('خطأ', 'فشل في الحصول على إحصائيات التنزيل');
    }
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
    progressContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'center',
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.success,
      borderRadius: 4,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 12,
    },
    userEmail: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      flex: 1,
      textAlign: 'right',
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.ornateHeader}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>الحساب</Text>
          
          {user ? (
            <React.Fragment>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonDanger]}
                onPress={handleSignOut}
              >
                <Text style={[styles.buttonText, styles.buttonTextWhite]}>تسجيل الخروج</Text>
              </TouchableOpacity>
              
              <Text style={styles.infoText}>
                حسابك متصل. يتم مزامنة بياناتك تلقائياً عبر الأجهزة.
              </Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <TouchableOpacity
                style={[styles.button, styles.buttonSuccess]}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={[styles.buttonText, styles.buttonTextWhite]}>تسجيل الدخول</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => router.push('/auth/signup')}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>إنشاء حساب جديد</Text>
              </TouchableOpacity>
              
              <Text style={styles.infoText}>
                قم بتسجيل الدخول لمزامنة الإشارات المرجعية والإعدادات عبر الأجهزة
              </Text>
            </React.Fragment>
          )}
        </View>

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
            style={[styles.button, styles.buttonSuccess, downloadingAudio && styles.buttonDisabled]}
            onPress={handleDownloadAudio}
            disabled={downloadingAudio}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>
              {downloadingAudio ? 'جاري التنزيل...' : 'تنزيل التلاوات الصوتية'}
            </Text>
          </TouchableOpacity>

          {downloadingAudio && downloadProgress.total > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {downloadProgress.current} / {downloadProgress.total}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleCheckDownloadedAudio}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>عرض التلاوات المحملة</Text>
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
            • تنزيل التلاوات: لحفظ التلاوات للاستماع بدون إنترنت{'\n'}
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
