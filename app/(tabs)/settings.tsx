
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../components/Icon';
import { AppSettings } from '../../types';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      setLoading(true);
      await updateSettings({ [key]: value });
      console.log(`Updated ${key} to:`, value);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const textSizeOptions = [
    { key: 'small', label: 'صغير', value: 'small' },
    { key: 'medium', label: 'متوسط', value: 'medium' },
    { key: 'large', label: 'كبير', value: 'large' },
    { key: 'extra-large', label: 'كبير جداً', value: 'extra-large' },
  ];

  const readingModeOptions = [
    { key: 'scroll', label: 'التمرير', value: 'scroll' },
    { key: 'flip', label: 'تقليب الصفحات', value: 'flip' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: textSizes.subtitle,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
      flex: 1,
    },
    settingValue: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'right',
      marginRight: 8,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    optionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundAlt,
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
    },
    optionTextActive: {
      color: colors.backgroundAlt,
    },
    sliderContainer: {
      marginTop: 8,
    },
    sliderLabel: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    sliderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    sliderButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sliderValue: {
      flex: 1,
      textAlign: 'center',
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
    },
    resetButton: {
      backgroundColor: colors.error,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    resetButtonText: {
      color: colors.backgroundAlt,
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
    },
  });

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
              });
            } catch (error) {
              console.error('Error resetting settings:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات العرض</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>حجم النص</Text>
              <Text style={styles.settingValue}>
                {textSizeOptions.find(opt => opt.value === settings.textSize)?.label}
              </Text>
            </View>
            <View style={styles.optionsRow}>
              {textSizeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    settings.textSize === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('textSize', option.value)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.textSize === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Switch
                value={settings.theme === 'dark'}
                onValueChange={(value) => handleUpdateSetting('theme', value ? 'dark' : 'light')}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.backgroundAlt}
                disabled={loading}
              />
              <Text style={styles.settingLabel}>الوضع الليلي</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Switch
                value={settings.showBanner}
                onValueChange={(value) => handleUpdateSetting('showBanner', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.backgroundAlt}
                disabled={loading}
              />
              <Text style={styles.settingLabel}>إظهار البانر في الصفحة الرئيسية</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>تعديل حجم المربعات</Text>
              <Text style={styles.settingValue}>{settings.squareAdjustment}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>حجم المربعات والعناصر</Text>
              <View style={styles.sliderRow}>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => handleUpdateSetting('squareAdjustment', Math.max(0, settings.squareAdjustment - 10))}
                  disabled={loading}
                >
                  <Icon name="remove" size={20} style={{ color: colors.backgroundAlt }} />
                </TouchableOpacity>
                <Text style={styles.sliderValue}>{settings.squareAdjustment}%</Text>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => handleUpdateSetting('squareAdjustment', Math.min(100, settings.squareAdjustment + 10))}
                  disabled={loading}
                >
                  <Icon name="add" size={20} style={{ color: colors.backgroundAlt }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Reading Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات القراءة</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>طريقة القراءة</Text>
              <Text style={styles.settingValue}>
                {readingModeOptions.find(opt => opt.value === settings.readingMode)?.label}
              </Text>
            </View>
            <View style={styles.optionsRow}>
              {readingModeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    settings.readingMode === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => handleUpdateSetting('readingMode', option.value)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      settings.readingMode === option.value && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {settings.readingMode === 'flip' && (
              <View style={{ marginTop: 8, padding: 8, backgroundColor: colors.background, borderRadius: 8 }}>
                <Text style={[styles.settingValue, { textAlign: 'center' }]}>
                  وضع تقليب الصفحات يحاكي قراءة المصحف التقليدي
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>إعادة تعيين الإعدادات</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


