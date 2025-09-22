
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';
import { tajweedService } from '../../services/tajweedService';
import Icon from '../../components/Icon';
import TajweedLegend from '../../components/TajweedLegend';

export default function SettingsTab() {
  const { settings, colors, textSizes, updateSettings } = useTheme();
  const [showTajweedLegend, setShowTajweedLegend] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Setting ${key} updated to:`, value);
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
                squareAdjustment: 50,
                showTajweed: true,
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

  if (showTajweedLegend) {
    return <TajweedLegend onClose={() => setShowTajweedLegend(false)} />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: textSizes.heading,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 30,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 15,
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
      textAlign: 'right',
      flex: 1,
    },
    settingValue: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.primary,
      marginRight: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
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
      color: colors.background,
      fontWeight: 'bold',
    },
    resetButton: {
      backgroundColor: colors.error,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 30,
      boxShadow: '0px 4px 12px rgba(244, 67, 54, 0.3)',
      elevation: 4,
    },
    resetButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.background,
    },
    legendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 10,
      boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
      elevation: 3,
    },
    legendButtonText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.background,
      marginRight: 8,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>الإعدادات</Text>

        {/* Text Size Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حجم النص</Text>
          <View style={styles.settingItem}>
            <View style={styles.buttonRow}>
              {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
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
                    {size === 'small' && 'صغير'}
                    {size === 'medium' && 'متوسط'}
                    {size === 'large' && 'كبير'}
                    {size === 'extra-large' && 'كبير جداً'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المظهر</Text>
          <View style={styles.settingItem}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.theme === 'light' && styles.optionButtonActive,
                ]}
                onPress={() => handleUpdateSetting('theme', 'light')}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.theme === 'light' && styles.optionTextActive,
                  ]}
                >
                  فاتح
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.theme === 'dark' && styles.optionButtonActive,
                ]}
                onPress={() => handleUpdateSetting('theme', 'dark')}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.theme === 'dark' && styles.optionTextActive,
                  ]}
                >
                  داكن
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reading Mode Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وضع القراءة</Text>
          <View style={styles.settingItem}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.readingMode === 'scroll' && styles.optionButtonActive,
                ]}
                onPress={() => handleUpdateSetting('readingMode', 'scroll')}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.readingMode === 'scroll' && styles.optionTextActive,
                  ]}
                >
                  تمرير
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  settings.readingMode === 'flip' && styles.optionButtonActive,
                ]}
                onPress={() => handleUpdateSetting('readingMode', 'flip')}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.readingMode === 'flip' && styles.optionTextActive,
                  ]}
                >
                  تقليب
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tajweed Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التجويد</Text>
          <View style={styles.settingItem}>
            <Switch
              value={settings.showTajweed}
              onValueChange={(value) => handleUpdateSetting('showTajweed', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.showTajweed ? colors.background : colors.textSecondary}
            />
            <Text style={styles.settingLabel}>عرض ألوان التجويد</Text>
          </View>
          
          {settings.showTajweed && (
            <TouchableOpacity
              style={styles.legendButton}
              onPress={() => setShowTajweedLegend(true)}
            >
              <Icon name="color-palette" size={20} style={{ color: colors.background }} />
              <Text style={styles.legendButtonText}>دليل ألوان التجويد</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Banner Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عام</Text>
          <View style={styles.settingItem}>
            <Switch
              value={settings.showBanner}
              onValueChange={(value) => handleUpdateSetting('showBanner', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.showBanner ? colors.background : colors.textSecondary}
            />
            <Text style={styles.settingLabel}>عرض رسالة الإهداء</Text>
          </View>
        </View>

        {/* Reset Settings */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
          <Text style={styles.resetButtonText}>إعادة تعيين الإعدادات</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
