
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { AppSettings } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { tajweedService } from '../../services/tajweedService';
import Icon from '../../components/Icon';

export default function SettingsTab() {
  const { settings, updateSettings, colors, textSizes } = useTheme();
  const [showTajweedLegend, setShowTajweedLegend] = useState(false);

  const handleUpdateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      console.log(`Updated ${key} to:`, value);
    } catch (error) {
      console.log('Error updating setting:', error);
      Alert.alert('خطأ', 'فشل في حفظ الإعدادات');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل أنت متأكد من إعادة تعيين جميع الإعدادات؟',
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
              console.log('Error resetting settings:', error);
              Alert.alert('خطأ', 'فشل في إعادة تعيين الإعدادات');
            }
          },
        },
      ]
    );
  };

  const tajweedLegend = tajweedService.getTajweedColorLegend();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: textSizes.heading,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'center',
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'right',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 8,
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
      marginLeft: 12,
    },
    optionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      marginLeft: 8,
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
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: '#fff',
    },
    tajweedLegendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginTop: 8,
    },
    tajweedLegendText: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.text,
      marginLeft: 8,
    },
    legendContainer: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    legendColor: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 12,
    },
    legendName: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    legendDescription: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'right',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Text Size Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حجم النص</Text>
          <View style={styles.settingItem}>
            <View style={{ flexDirection: 'row' }}>
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
                    {size === 'small' ? 'صغير' : 
                     size === 'medium' ? 'متوسط' : 
                     size === 'large' ? 'كبير' : 'كبير جداً'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingLabel}>حجم النص</Text>
          </View>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المظهر</Text>
          <View style={styles.settingItem}>
            <View style={{ flexDirection: 'row' }}>
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
            <Text style={styles.settingLabel}>نمط المظهر</Text>
          </View>
        </View>

        {/* Reading Mode Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وضع القراءة</Text>
          <View style={styles.settingItem}>
            <View style={{ flexDirection: 'row' }}>
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
            <Text style={styles.settingLabel}>وضع القراءة</Text>
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
              thumbColor={settings.showTajweed ? '#fff' : colors.textSecondary}
            />
            <Text style={styles.settingLabel}>إظهار ألوان التجويد</Text>
          </View>
          
          {settings.showTajweed && (
            <>
              <TouchableOpacity
                style={styles.tajweedLegendButton}
                onPress={() => setShowTajweedLegend(!showTajweedLegend)}
              >
                <Icon 
                  name={showTajweedLegend ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  style={{ color: colors.text }} 
                />
                <Text style={styles.tajweedLegendText}>دليل ألوان التجويد</Text>
              </TouchableOpacity>
              
              {showTajweedLegend && (
                <View style={styles.legendContainer}>
                  {Object.entries(tajweedLegend).map(([key, legend]) => (
                    <View key={key} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: legend.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.legendName}>{legend.name}</Text>
                        <Text style={styles.legendDescription}>{legend.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات أخرى</Text>
          <View style={styles.settingItem}>
            <Switch
              value={settings.showBanner}
              onValueChange={(value) => handleUpdateSetting('showBanner', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.showBanner ? '#fff' : colors.textSecondary}
            />
            <Text style={styles.settingLabel}>إظهار البانر في الصفحة الرئيسية</Text>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
          <Text style={styles.resetButtonText}>إعادة تعيين الإعدادات</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
