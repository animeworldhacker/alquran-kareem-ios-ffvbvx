
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { quranService } from '../../services/quranService';
import { audioService } from '../../services/audioService';
import { tafsirService } from '../../services/tafsirService';
import Icon from '../../components/Icon';
import { AppSettings } from '../../types';

export default function SettingsTab() {
  const { settings, updateSettings, colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Setting ${key} updated to:`, value);
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
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
              await updateSettings({
                textSize: 'medium',
                theme: 'light',
                showBanner: true,
                readingMode: 'scroll',
                squareAdjustment: 50,
                showTajweed: true,
                showTajweedLegend: true,
                autoExpandTafsir: false,
              });
              Alert.alert('نجح', 'تم إعادة تعيين الإعدادات');
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
      'هل تريد تحديث بيانات القرآن؟ سيتم حذف البيانات المخزنة مؤقتاً.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحديث',
          onPress: async () => {
            try {
              setIsRefreshing(true);
              quranService.clearCache();
              await quranService.forceReprocess();
              Alert.alert('نجح', 'تم تحديث بيانات القرآن بنجاح');
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

  const handleClearTafsirCache = async () => {
    Alert.alert(
      'مسح ذاكرة التفسير',
      'هل تريد مسح ذاكرة التفسير المخزنة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          onPress: async () => {
            try {
              await tafsirService.clearCache();
              Alert.alert('نجح', 'تم مسح ذاكرة التفسير');
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
    try {
      await audioService.testAudio();
      Alert.alert('نجح', 'تم اختبار الصوت بنجاح');
    } catch (error) {
      console.error('Error testing audio:', error);
      Alert.alert('خطأ', 'فشل في اختبار الصوت');
    }
  };

  const handleClearAudioCache = async () => {
    Alert.alert(
      'مسح ذاكرة الصوت',
      'هل تريد مسح ذاكرة الصوت المخزنة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          onPress: async () => {
            try {
              await audioService.clearCache();
              Alert.alert('نجح', 'تم مسح ذاكرة الصوت');
            } catch (error) {
              console.error('Error clearing audio cache:', error);
              Alert.alert('خطأ', 'فشل في مسح ذاكرة الصوت');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5EEE3',
    },
    header: {
      backgroundColor: '#1E5B4C',
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: '#D4AF37',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#D4AF37',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: '#D4AF37',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1E5B4C',
      fontFamily: 'Amiri_700Bold',
      marginBottom: 12,
      textAlign: 'right',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    settingLabel: {
      fontSize: 16,
      color: '#2C2416',
      fontFamily: 'Amiri_400Regular',
      flex: 1,
      textAlign: 'right',
    },
    button: {
      backgroundColor: '#1E5B4C',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginTop: 8,
      borderWidth: 2,
      borderColor: '#D4AF37',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: {
      color: '#D4AF37',
      fontSize: 16,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    dangerButton: {
      backgroundColor: '#C62828',
      borderColor: '#8B0000',
    },
    dangerButtonText: {
      color: '#fff',
    },
    textSizeOptions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    textSizeButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#D4AF37',
      backgroundColor: '#F5EEE3',
      alignItems: 'center',
    },
    textSizeButtonActive: {
      backgroundColor: '#1E5B4C',
    },
    textSizeButtonText: {
      fontSize: 14,
      color: '#2C2416',
      fontFamily: 'Amiri_400Regular',
    },
    textSizeButtonTextActive: {
      color: '#D4AF37',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات العرض</Text>

          <View style={styles.settingRow}>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => handleUpdateSetting('theme', value ? 'dark' : 'light')}
              trackColor={{ false: '#D4AF37', true: '#1E5B4C' }}
              thumbColor={settings.theme === 'dark' ? '#D4AF37' : '#f4f3f4'}
            />
            <Text style={styles.settingLabel}>الوضع الداكن</Text>
          </View>

          <View style={styles.settingRow}>
            <Switch
              value={settings.showBanner}
              onValueChange={(value) => handleUpdateSetting('showBanner', value)}
              trackColor={{ false: '#D4AF37', true: '#1E5B4C' }}
              thumbColor={settings.showBanner ? '#D4AF37' : '#f4f3f4'}
            />
            <Text style={styles.settingLabel}>عرض اللافتة</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>حجم النص</Text>
          </View>
          <View style={styles.textSizeOptions}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات التجويد</Text>

          <View style={styles.settingRow}>
            <Switch
              value={settings.showTajweed}
              onValueChange={(value) => handleUpdateSetting('showTajweed', value)}
              trackColor={{ false: '#D4AF37', true: '#1E5B4C' }}
              thumbColor={settings.showTajweed ? '#D4AF37' : '#f4f3f4'}
            />
            <Text style={styles.settingLabel}>إظهار ألوان التجويد</Text>
          </View>

          <View style={styles.settingRow}>
            <Switch
              value={settings.showTajweedLegend}
              onValueChange={(value) => handleUpdateSetting('showTajweedLegend', value)}
              trackColor={{ false: '#D4AF37', true: '#1E5B4C' }}
              thumbColor={settings.showTajweedLegend ? '#D4AF37' : '#f4f3f4'}
            />
            <Text style={styles.settingLabel}>إظهار دليل ألوان التجويد</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات القراءة</Text>

          <View style={styles.settingRow}>
            <Switch
              value={settings.autoExpandTafsir}
              onValueChange={(value) => handleUpdateSetting('autoExpandTafsir', value)}
              trackColor={{ false: '#D4AF37', true: '#1E5B4C' }}
              thumbColor={settings.autoExpandTafsir ? '#D4AF37' : '#f4f3f4'}
            />
            <Text style={styles.settingLabel}>فتح التفسير تلقائياً</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إدارة البيانات</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRefreshQuranData}
            disabled={isRefreshing}
          >
            <Icon name="refresh" size={20} style={{ color: '#D4AF37' }} />
            <Text style={styles.buttonText}>
              {isRefreshing ? 'جاري التحديث...' : 'تحديث بيانات القرآن'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleClearTafsirCache}>
            <Icon name="trash-outline" size={20} style={{ color: '#D4AF37' }} />
            <Text style={styles.buttonText}>مسح ذاكرة التفسير</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleClearAudioCache}>
            <Icon name="trash-outline" size={20} style={{ color: '#D4AF37' }} />
            <Text style={styles.buttonText}>مسح ذاكرة الصوت</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختبار</Text>

          <TouchableOpacity style={styles.button} onPress={handleTestAudio}>
            <Icon name="musical-notes" size={20} style={{ color: '#D4AF37' }} />
            <Text style={styles.buttonText}>اختبار الصوت</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleResetSettings}
          >
            <Icon name="warning" size={20} style={{ color: '#fff' }} />
            <Text style={[styles.buttonText, styles.dangerButtonText]}>
              إعادة تعيين الإعدادات
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
