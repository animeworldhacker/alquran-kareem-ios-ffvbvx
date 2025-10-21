
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { quranService } from '../../services/quranService';
import { tafsirService } from '../../services/tafsirService';
import { audioService } from '../../services/audioService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('خطأ', 'فشل تحديث الإعداد');
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
                theme: 'dark',
                showBanner: true,
                readingMode: 'scroll',
                squareAdjustment: 100,
                showTajweed: true,
                autoExpandTafsir: false,
              });
              Alert.alert('نجح', 'تم إعادة تعيين الإعدادات');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('خطأ', 'فشل إعادة تعيين الإعدادات');
            }
          },
        },
      ]
    );
  };

  const handleRefreshQuranData = async () => {
    Alert.alert(
      'تحديث بيانات القرآن',
      'هل تريد إعادة تحميل بيانات القرآن الكريم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تحديث',
          onPress: async () => {
            try {
              setRefreshing(true);
              await quranService.clearCache();
              Alert.alert('نجح', 'تم تحديث بيانات القرآن الكريم');
            } catch (error) {
              console.error('Error refreshing Quran data:', error);
              Alert.alert('خطأ', 'فشل تحديث البيانات');
            } finally {
              setRefreshing(false);
            }
          },
        },
      ]
    );
  };

  const handleClearTafsirCache = async () => {
    try {
      await tafsirService.clearCache();
      Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت للتفسير');
    } catch (error) {
      console.error('Error clearing tafsir cache:', error);
      Alert.alert('خطأ', 'فشل مسح ذاكرة التخزين المؤقت');
    }
  };

  const handleClearAudioCache = async () => {
    try {
      await audioService.clearCache();
      Alert.alert('نجح', 'تم مسح ذاكرة التخزين المؤقت للصوت');
    } catch (error) {
      console.error('Error clearing audio cache:', error);
      Alert.alert('خطأ', 'فشل مسح ذاكرة التخزين المؤقت');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    headerTitle: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 24,
      color: colors.gold,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginTop: 20,
      marginHorizontal: 16,
    },
    sectionTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      marginBottom: 12,
      textAlign: 'right',
    },
    settingCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingInfo: {
      flex: 1,
      marginRight: 12,
    },
    settingLabel: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    optionsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    optionButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
    },
    optionButtonActive: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    optionButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
    },
    optionButtonTextActive: {
      color: colors.primary,
    },
    actionButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    actionButtonDanger: {
      borderColor: colors.error,
    },
    actionButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      textAlign: 'right',
    },
    actionButtonTextDanger: {
      color: colors.error,
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
      lineHeight: 20,
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
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>السمة</Text>
                <Text style={styles.settingDescription}>اختر سمة التطبيق</Text>
              </View>
            </View>
            <View style={styles.optionsRow}>
              {(['light', 'dark'] as const).map(theme => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.optionButton,
                    settings.theme === theme && styles.optionButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('theme', theme)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      settings.theme === theme && styles.optionButtonTextActive,
                    ]}
                  >
                    {theme === 'light' ? 'فاتح' : 'داكن'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>حجم الخط</Text>
                <Text style={styles.settingDescription}>اضبط حجم النص</Text>
              </View>
            </View>
            <View style={styles.optionsRow}>
              {(['small', 'medium', 'large', 'extra-large'] as const).map(size => (
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
                      styles.optionButtonText,
                      settings.textSize === size && styles.optionButtonTextActive,
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
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Switch
                value={settings.showBanner}
                onValueChange={(value) => handleUpdateSetting('showBanner', value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor={settings.showBanner ? colors.primary : colors.textSecondary}
              />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>عرض الإهداء</Text>
                <Text style={styles.settingDescription}>إظهار رسالة الإهداء</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Switch
                value={settings.autoExpandTafsir}
                onValueChange={(value) => handleUpdateSetting('autoExpandTafsir', value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor={settings.autoExpandTafsir ? colors.primary : colors.textSecondary}
              />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>توسيع التفسير تلقائياً</Text>
                <Text style={styles.settingDescription}>عرض التفسير مباشرة</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البيانات</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleRefreshQuranData}
            disabled={refreshing}
          >
            <Icon name="refresh" size={20} style={{ color: colors.gold }} />
            <Text style={styles.actionButtonText}>
              {refreshing ? 'جاري التحديث...' : 'تحديث بيانات القرآن'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearTafsirCache}>
            <Icon name="trash-outline" size={20} style={{ color: colors.gold }} />
            <Text style={styles.actionButtonText}>مسح ذاكرة التفسير</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearAudioCache}>
            <Icon name="trash-outline" size={20} style={{ color: colors.gold }} />
            <Text style={styles.actionButtonText}>مسح ذاكرة الصوت</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonDanger]} 
            onPress={handleResetSettings}
          >
            <Icon name="warning-outline" size={20} style={{ color: colors.error }} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
              إعادة تعيين الإعدادات
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            تطبيق القرآن الكريم{'\n'}
            نسخة 1.0.0{'\n'}
            تم تطويره بحمد الله وتوفيقه
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
