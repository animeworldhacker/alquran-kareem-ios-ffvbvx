
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TAJWEED_RULES } from '../utils/tajweedColors';
import { useTheme } from '../contexts/ThemeContext';

export default function TajweedLegend() {
  const { settings } = useTheme();

  if (!settings.showTajweedLegend) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>دليل ألوان التجويد</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {TAJWEED_RULES.map((rule, index) => (
          <View key={`rule-${index}`} style={styles.ruleChip}>
            <Text style={[styles.sampleLetter, { color: rule.color }]}>
              {rule.sampleLetter}
            </Text>
            <Text style={styles.ruleName}>{rule.arabicName}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5EEE3',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Amiri_700Bold',
    color: '#1E5B4C',
    textAlign: 'center',
    marginBottom: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  ruleChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 85,
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  sampleLetter: {
    fontSize: 26,
    fontFamily: 'ScheherazadeNew_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ruleName: {
    fontSize: 11,
    fontFamily: 'Amiri_400Regular',
    color: '#2C2416',
    textAlign: 'center',
    lineHeight: 16,
  },
});
