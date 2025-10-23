
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
      >
        {TAJWEED_RULES.map((rule, index) => (
          <View key={index} style={styles.ruleChip}>
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
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Amiri_700Bold',
    color: '#1E5B4C',
    textAlign: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  ruleChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  sampleLetter: {
    fontSize: 24,
    fontFamily: 'ScheherazadeNew_400Regular',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ruleName: {
    fontSize: 11,
    fontFamily: 'Amiri_400Regular',
    color: '#2C2416',
    textAlign: 'center',
  },
});
