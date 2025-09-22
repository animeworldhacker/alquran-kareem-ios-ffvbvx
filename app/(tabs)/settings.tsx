
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { tajweedService } from '../../services/tajweedService';
import { quranService } from '../../services/quranService';
import TajweedLegend from '../../components/TajweedLegend';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const [showTajweedLegend, setShowTajweedLegend] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Updated setting ${key} to ${value}`);
    } catch (error) {
      console.error('Failed to update setting:', error);
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
                showTajweed: true,
                squareAdjustment: 50,
              });
              Alert.alert('تم', 'تم إعادة تعيين الإعدادات بنجاح');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('خطأ', 'فشل في إعادة تعيين الإعدادات');
            }
          },
        },
      ]
    );
  };

  const handleRefreshQuranData = () => {
    Alert.alert(
      'تحديث بيانات القرآن',
      'هل تريد إعادة تحميل بيانات القرآن من الخادم؟ سيتم حذف البيانات المحفوظة وإعادة تحميلها.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحديث',
          onPress: async () => {
            try {
              console.log('Clearing Quran cache and refreshing data...');
              quranService.clearCache();
              await tajweedService.clearCache();
              Alert.alert('تم', 'تم تحديث بيانات القرآن. سيتم إعادة تحميل البيانات عند الحاجة.');
            } catch (error) {
              console.error('Failed to refresh Quran data:', error);
              Alert.alert('خطأ', 'فشل في تحديث بيانات القرآن');
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
    },
    title: {
      fontSize: textSizes.heading,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 30,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
      elevation: 3,
    },
    sectionTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      marginBottom: 15,
      textAlign: 'right',
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
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    settingValue: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.primary,
      marginLeft: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    optionButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
    },
    optionTextActive: {
      color: '#fff',
      fontWeight: 'bold',
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      alignItems: 'center',
      marginVertical: 8,
    },
    actionButtonSecondary: {
      backgroundColor: colors.secondary,
    },
    actionButtonDanger: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
    },
    legendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 20,
      marginTop: 10,
    },
    legendButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
      marginLeft: 8,
    },
    infoText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: 8,
      fontStyle: 'italic',
    },
    debugSection: {
      backgroundColor: '#fff3cd',
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107',
    },
    debugTitle: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: '#856404',
      marginBottom: 10,
      textAlign: 'right',
    },
    debugText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: '#856404',
      textAlign: 'right',
      marginBottom: 5,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>الإعدادات</Text>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات العرض</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.buttonRow}>
              {['small', 'medium', 'large', 'xlarge'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    settings.textSize === size && styles.optionButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('textSize', size)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.textSize === size && styles.optionTextActive,
                    ]}
                  >
                    {size === 'small' ? 'صغير' : 
                     size === 'medium' ? 'متوسط' : 
                     size === 'large' ? 'كبير' : 'كبير جداً'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingLabel}>حجم النص</Text>
          </View>

          <View style={styles.settingRow}>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => handleUpdateSetting('theme', value ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.theme === 'dark' ? '#fff' : colors.backgroundAlt}
            />
            <Text style={styles.settingLabel}>الوضع الليلي</Text>
          </View>

          <View style={styles.settingRow}>
            <Switch
              value={settings.showBanner}
              onValueChange={(value) => handleUpdateSetting('showBanner', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.showBanner ? '#fff' : colors.backgroundAlt}
            />
            <Text style={styles.settingLabel}>عرض رسالة الإهداء</Text>
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.buttonRow}>
              {['scroll', 'page'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.optionButton,
                    settings.readingMode === mode && styles.optionButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('readingMode', mode)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.readingMode === mode && styles.optionTextActive,
                    ]}
                  >
                    {mode === 'scroll' ? 'تمرير' : 'صفحات'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingLabel}>وضع القراءة</Text>
          </View>
        </View>

        {/* Tajweed Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات التجويد</Text>
          
          <View style={[styles.settingRow, styles.settingRowLast]}>
            <Switch
              value={settings.showTajweed}
              onValueChange={(value) => handleUpdateSetting('showTajweed', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.showTajweed ? '#fff' : colors.backgroundAlt}
            />
            <Text style={styles.settingLabel}>عرض ألوان التجويد</Text>
          </View>

          {settings.showTajweed && (
            <TouchableOpacity
              style={styles.legendButton}
              onPress={() => setShowTajweedLegend(!showTajweedLegend)}
            >
              <Icon name="color-palette" size={16} style={{ color: '#fff' }} />
              <Text style={styles.legendButtonText}>
                {showTajweedLegend ? 'إخفاء' : 'عرض'} دليل ألوان التجويد
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.infoText}>
            ألوان التجويد تساعد في تعلم القراءة الصحيحة للقرآن الكريم
          </Text>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إدارة البيانات</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefreshQuranData}
          >
            <Text style={styles.actionButtonText}>تحديث بيانات القرآن</Text>
          </TouchableOpacity>
          
          <Text style={styles.infoText}>
            إعادة تحميل بيانات القرآن من الخادم وإزالة البسملة من الآيات الأولى
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleResetSettings}
          >
            <Text style={styles.actionButtonText}>إعادة تعيين الإعدادات</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Information (Development only) */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>معلومات التطوير</Text>
            <Text style={styles.debugText}>
              حالة الكاش: {quranService.isCached() ? 'محفوظ' : 'غير محفوظ'}
            </Text>
            <Text style={styles.debugText}>
              إعدادات حالية: {JSON.stringify(settings, null, 2)}
            </Text>
          </View>
        )}

        {/* Tajweed Legend */}
        {showTajweedLegend && <TajweedLegend />}
      </ScrollView>
    </View>
  );
}
