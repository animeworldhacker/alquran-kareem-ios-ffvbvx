
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import { tafsirService } from '../../services/tafsirService';
import { offlineManager } from '../../services/offlineManager';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const router = useRouter();
  const [testingAudio, setTestingAudio] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, status: '' });
  
  // Offline status
  const [offlineStatus, setOfflineStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Check offline status on mount
  useEffect(() => {
    loadOfflineStatus();
  }, []);

  const loadOfflineStatus = async () => {
    try {
      setLoadingStatus(true);
      const status = await offlineManager.getOfflineStatus();
      setOfflineStatus(status);
    } catch (error) {
      console.error('Error loading offline status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

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

  const handleDownloadQuranData = async () => {
    Alert.alert(
      'تنزيل بيانات القرآن',
      'هل تريد تنزيل بيانات القرآن الكريم كاملة للاستخدام بدون إنترنت؟\n\nالحجم التقريبي: ~2 MB',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async () => {
            setDownloading(true);
            try {
              await offlineManager.downloadQuranData((progress) => {
                setDownloadProgress({
                  current: progress.current,
                  total: progress.total,
                  status: progress.status,
                });
              });
              
              await loadOfflineStatus();
              Alert.alert('نجح ✅', 'تم تنزيل بيانات القرآن الكريم بنجاح');
            } catch (error) {
              console.error('Error downloading Quran:', error);
              Alert.alert('خطأ ❌', error instanceof Error ? error.message : 'فشل في تنزيل بيانات القرآن');
            } finally {
              setDownloading(false);
              setDownloadProgress({ current: 0, total: 0, status: '' });
            }
          },
        },
      ]
    );
  };

  const handleDownloadTafsirData = async () => {
    Alert.alert(
      'تنزيل تفسير ابن كثير',
      'هل تريد تنزيل تفسير ابن كثير لجميع الآيات؟\n\nالحجم التقريبي: ~50 MB\nقد يستغرق هذا عدة دقائق.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async () => {
            setDownloading(true);
            try {
              await offlineManager.downloadTafsirData(1, 114, (progress) => {
                setDownloadProgress({
                  current: progress.current,
                  total: progress.total,
                  status: progress.status,
                });
              });
              
              await loadOfflineStatus();
              Alert.alert('نجح ✅', 'تم تنزيل تفسير ابن كثير بنجاح');
            } catch (error) {
              console.error('Error downloading Tafsir:', error);
              Alert.alert('خطأ ❌', error instanceof Error ? error.message : 'فشل في تنزيل التفسير');
            } finally {
              setDownloading(false);
              setDownloadProgress({ current: 0, total: 0, status: '' });
            }
          },
        },
      ]
    );
  };

  const handleDownloadAudioOptions = () => {
    Alert.alert(
      'تنزيل التلاوات الصوتية',
      'اختر ما تريد تنزيله:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'سورة واحدة',
          onPress: () => handleDownloadSurah(),
        },
        {
          text: 'عدة سور',
          onPress: () => handleDownloadMultipleSurahs(),
        },
        {
          text: 'القرآن كاملاً (~500 MB)',
          onPress: () => handleDownloadAllAudio(),
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
          onPress: async (input) => {
            const surahNum = parseInt(input || '0');
            if (surahNum < 1 || surahNum > 114) {
              Alert.alert('خطأ', 'رقم السورة يجب أن يكون بين 1 و 114');
              return;
            }
            
            setDownloading(true);
            try {
              await offlineManager.prefetchSurah(surahNum, (progress) => {
                setDownloadProgress({
                  current: progress.current,
                  total: progress.total,
                  status: progress.status,
                });
              });
              
              await loadOfflineStatus();
              Alert.alert('نجح ✅', `تم تنزيل السورة ${surahNum} بنجاح`);
            } catch (error) {
              console.error('Error downloading surah:', error);
              Alert.alert('خطأ ❌', error instanceof Error ? error.message : 'فشل في تنزيل السورة');
            } finally {
              setDownloading(false);
              setDownloadProgress({ current: 0, total: 0, status: '' });
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleDownloadMultipleSurahs = () => {
    Alert.prompt(
      'تنزيل عدة سور',
      'أدخل أرقام السور مفصولة بفواصل (مثال: 1,2,3):',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async (input) => {
            try {
              const surahs = (input || '')
                .split(',')
                .map(s => parseInt(s.trim()))
                .filter(n => n >= 1 && n <= 114);
              
              if (surahs.length === 0) {
                Alert.alert('خطأ', 'يرجى إدخال أرقام سور صحيحة');
                return;
              }
              
              setDownloading(true);
              await offlineManager.downloadAudioData(surahs, (progress) => {
                setDownloadProgress({
                  current: progress.current,
                  total: progress.total,
                  status: progress.status,
                });
              });
              
              await loadOfflineStatus();
              Alert.alert('نجح ✅', `تم تنزيل ${surahs.length} سورة بنجاح`);
            } catch (error) {
              console.error('Error downloading surahs:', error);
              Alert.alert('خطأ ❌', error instanceof Error ? error.message : 'فشل في تنزيل السور');
            } finally {
              setDownloading(false);
              setDownloadProgress({ current: 0, total: 0, status: '' });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDownloadAllAudio = () => {
    Alert.alert(
      'تنزيل القرآن كاملاً',
      'سيتم تنزيل جميع التلاوات الصوتية للقرآن الكريم.\n\nالحجم التقريبي: ~500 MB\nقد يستغرق هذا وقتاً طويلاً.\n\nهل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل',
          onPress: async () => {
            setDownloading(true);
            try {
              const allSurahs = Array.from({ length: 114 }, (_, i) => i + 1);
              await offlineManager.downloadAudioData(allSurahs, (progress) => {
                setDownloadProgress({
                  current: progress.current,
                  total: progress.total,
                  status: progress.status,
                });
              });
              
              await loadOfflineStatus();
              Alert.alert('نجح ✅', 'تم تنزيل جميع التلاوات الصوتية بنجاح');
            } catch (error) {
              console.error('Error downloading all audio:', error);
              Alert.alert('خطأ ❌', error instanceof Error ? error.message : 'فشل في تنزيل التلاوات');
            } finally {
              setDownloading(false);
              setDownloadProgress({ current: 0, total: 0, status: '' });
            }
          },
        },
      ]
    );
  };

  const handleDownloadEverything = () => {
    Alert.alert(
      'تنزيل كل شيء',
      'سيتم تنزيل:\n• بيانات القرآن الكريم\n• تفسير ابن كثير\n• جميع التلاوات الصوتية\n\nالحجم التقريبي: ~552 MB\nقد يستغرق هذا وقتاً طويلاً جداً.\n\nهل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تنزيل الكل',
          onPress: async () => {
            setDownloading(true);
            try {
              await offlineManager.downloadAllData((progress) => {
                setDownloadProgress({
                  current: progress.current,
                  total: progress.total,
                  status: progress.status,
                });
              });
              
              await loadOfflineStatus();
              Alert.alert('نجح ✅', 'تم تنزيل جميع البيانات بنجاح!\n\nيمكنك الآن استخدام التطبيق بدون إنترنت.');
            } catch (error) {
              console.error('Error downloading everything:', error);
              Alert.alert('خطأ ❌', error instanceof Error ? error.message : 'فشل في تنزيل البيانات');
            } finally {
              setDownloading(false);
              setDownloadProgress({ current: 0, total: 0, status: '' });
            }
          },
        },
      ]
    );
  };

  const handleClearAllOfflineData = () => {
    Alert.alert(
      'مسح جميع البيانات المحملة',
      'هل تريد مسح جميع البيانات المحملة للاستخدام بدون إنترنت؟\n\nسيتم حذف:\n• بيانات القرآن\n• التفسير\n• التلاوات الصوتية',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح الكل',
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineManager.clearAllData();
              await loadOfflineStatus();
              Alert.alert('نجح ✅', 'تم مسح جميع البيانات المحملة');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('خطأ ❌', 'فشل في مسح البيانات');
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
          `نظام الصوت:\n\n${status} القارئ الحالي: ${response.status}\n\nنظام الصوت يعمل بشكل صحيح`,
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

  const getStatusIcon = (downloaded: boolean) => {
    return downloaded ? '✅' : '❌';
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
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
    },
    statusLabel: {
      fontSize: 15,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      flex: 1,
      textAlign: 'right',
    },
    statusValue: {
      fontSize: 15,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
      marginLeft: 8,
    },
    statusIcon: {
      fontSize: 20,
      marginLeft: 8,
    },
    offlineStatusCard: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    offlineStatusTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
      marginBottom: 8,
    },
    offlineStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    offlineStatusLabel: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
    },
    offlineStatusValue: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
    fullyOfflineBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-end',
      marginTop: 8,
    },
    fullyOfflineBadgeText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.ornateHeader}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Offline Status Overview */}
        {!loadingStatus && offlineStatus && (
          <View style={styles.settingCard}>
            <Text style={styles.sectionTitle}>حالة الاستخدام بدون إنترنت</Text>
            
            <View style={styles.offlineStatusCard}>
              <Text style={styles.offlineStatusTitle}>البيانات المحملة</Text>
              
              <View style={styles.offlineStatusRow}>
                <Text style={styles.offlineStatusValue}>
                  {getStatusIcon(offlineStatus.quranData.downloaded)} {offlineStatus.quranData.size}
                </Text>
                <Text style={styles.offlineStatusLabel}>القرآن الكريم</Text>
              </View>
              
              <View style={styles.offlineStatusRow}>
                <Text style={styles.offlineStatusValue}>
                  {getStatusIcon(offlineStatus.tafsirData.cachedAyahs > 0)} {offlineStatus.tafsirData.cachedAyahs} آية ({offlineStatus.tafsirData.size})
                </Text>
                <Text style={styles.offlineStatusLabel}>تفسير ابن كثير</Text>
              </View>
              
              <View style={styles.offlineStatusRow}>
                <Text style={styles.offlineStatusValue}>
                  {getStatusIcon(offlineStatus.audioData.totalAyahs > 0)} {offlineStatus.audioData.totalAyahs} آية ({offlineStatus.audioData.size})
                </Text>
                <Text style={styles.offlineStatusLabel}>التلاوات الصوتية</Text>
              </View>
              
              <View style={[styles.offlineStatusRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 }]}>
                <Text style={[styles.offlineStatusValue, { fontWeight: 'bold' }]}>
                  {offlineStatus.totalSize}
                </Text>
                <Text style={[styles.offlineStatusLabel, { fontWeight: 'bold' }]}>الحجم الإجمالي</Text>
              </View>
              
              {offlineStatus.isFullyOffline && (
                <View style={styles.fullyOfflineBadge}>
                  <Text style={styles.fullyOfflineBadgeText}>✅ جاهز للاستخدام بدون إنترنت</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={loadOfflineStatus}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>تحديث الحالة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Download Section */}
        <View style={styles.settingCard}>
          <Text style={styles.sectionTitle}>تنزيل للاستخدام بدون إنترنت</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, downloading && styles.buttonDisabled]}
            onPress={handleDownloadQuranData}
            disabled={downloading}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>تنزيل بيانات القرآن (~2 MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, downloading && styles.buttonDisabled]}
            onPress={handleDownloadTafsirData}
            disabled={downloading}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>تنزيل تفسير ابن كثير (~50 MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, downloading && styles.buttonDisabled]}
            onPress={handleDownloadAudioOptions}
            disabled={downloading}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>تنزيل التلاوات الصوتية</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess, downloading && styles.buttonDisabled]}
            onPress={handleDownloadEverything}
            disabled={downloading}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>تنزيل كل شيء (~552 MB)</Text>
          </TouchableOpacity>

          {downloading && downloadProgress.total > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {downloadProgress.status}
              </Text>
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
            style={[styles.button, styles.buttonDanger]}
            onPress={handleClearAllOfflineData}
          >
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>مسح جميع البيانات المحملة</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            قم بتنزيل البيانات للاستخدام بدون إنترنت. يمكنك تنزيل كل شيء دفعة واحدة أو تنزيل أجزاء محددة حسب حاجتك.
          </Text>
        </View>

        {/* Appearance Section */}
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

        {/* Reading Section */}
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

        {/* Audio Section */}
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
          
          <Text style={styles.infoText}>
            يمكنك اختيار القارئ من قائمة القراء في الصفحة الرئيسية
          </Text>
        </View>

        {/* Reset Section */}
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
