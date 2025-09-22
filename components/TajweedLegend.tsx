
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { tajweedService } from '../services/tajweedService';
import Icon from './Icon';

interface TajweedLegendProps {
  onClose: () => void;
}

export default function TajweedLegend({ onClose }: TajweedLegendProps) {
  const { colors, textSizes } = useTheme();
  const legend = tajweedService.getTajweedColorLegend();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: textSizes.heading,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    scrollContainer: {
      flex: 1,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      padding: 15,
      backgroundColor: colors.surface,
      borderRadius: 12,
      boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
      elevation: 2,
    },
    colorBox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      marginLeft: 15,
      boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
      elevation: 2,
    },
    textContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    ruleName: {
      fontSize: textSizes.body + 2,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 4,
    },
    ruleDescription: {
      fontSize: textSizes.body,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'right',
      lineHeight: 22,
    },
    footer: {
      marginTop: 20,
      padding: 15,
      backgroundColor: colors.surface,
      borderRadius: 12,
      alignItems: 'center',
    },
    footerText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={20} style={{ color: colors.text }} />
        </TouchableOpacity>
        <Text style={styles.title}>دليل ألوان التجويد</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {Object.entries(legend).map(([key, rule]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: rule.color }]} />
            <View style={styles.textContainer}>
              <Text style={styles.ruleName}>{rule.name}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            يمكنك تفعيل أو إلغاء عرض ألوان التجويد من الإعدادات
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
