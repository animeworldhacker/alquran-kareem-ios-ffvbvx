
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SurahCardProps {
  surah: Surah;
  onPress: () => void;
}

// Arabic numerals conversion
const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

export default function SurahCard({ surah, onPress }: SurahCardProps) {
  const { textSizes, colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#F5EEE3',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#D4AF37',
      marginHorizontal: 16,
      marginVertical: 6,
      overflow: 'hidden',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: 90,
    },
    ribbonContainer: {
      width: 70,
      backgroundColor: '#1E5B4C',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    ribbonNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#D4AF37',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'center',
    },
    contentSection: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    surahName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2C2416',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
    },
    chevronButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: '#D4AF37',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5EEE3',
    },
    chevronText: {
      fontSize: 18,
      color: '#1E5B4C',
      fontWeight: 'bold',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
    },
    metaText: {
      fontSize: 14,
      color: '#6D6558',
      fontFamily: 'Amiri_400Regular',
      textAlign: 'right',
    },
    separator: {
      fontSize: 14,
      color: '#6D6558',
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.ribbonContainer}>
          <Text style={styles.ribbonNumber}>
            {toArabicNumerals(surah.number)}
          </Text>
        </View>
        
        <View style={styles.contentSection}>
          <View style={styles.topRow}>
            <View style={styles.chevronButton}>
              <Text style={styles.chevronText}>‹</Text>
            </View>
            <Text style={styles.surahName}>{surah.name}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.metaText}>
              {toArabicNumerals(surah.numberOfAyahs)} آية
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
