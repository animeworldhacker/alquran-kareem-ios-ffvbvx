
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SurahCardProps {
  surah: Surah;
  onPress: () => void;
}

// Arabic-Indic numerals conversion
const toArabicIndic = (num: number): string => {
  const arabicIndic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicIndic[parseInt(digit)]).join('');
};

export default function SurahCard({ surah, onPress }: SurahCardProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.cream,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.gold,
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
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    ribbonNumber: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.gold,
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
      color: colors.darkBrown,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
    },
    chevronButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cream,
    },
    chevronText: {
      fontSize: 18,
      color: colors.emerald,
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
      color: colors.mutedBrown,
      fontFamily: 'Amiri_400Regular',
      textAlign: 'right',
    },
    separator: {
      fontSize: 14,
      color: colors.mutedBrown,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.ribbonContainer}>
          <Text style={styles.ribbonNumber}>
            {toArabicIndic(surah.number)}
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
              {toArabicIndic(surah.numberOfAyahs)} آية
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
