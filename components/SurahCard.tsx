
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Path, Circle } from 'react-native-svg';

interface SurahCardProps {
  surah: Surah;
  onPress: () => void;
}

// Arabic numerals conversion
const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

// Decorative star icon for surah number
function StarIcon({ size = 50, color = '#D4AF37' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 10 L61 39 L92 39 L67 58 L78 87 L50 68 L22 87 L33 58 L8 39 L39 39 Z"
        fill={color}
        opacity={0.2}
      />
      <Circle cx="50" cy="50" r="28" fill="transparent" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

export default function SurahCard({ surah, onPress }: SurahCardProps) {
  const { colors, textSizes, isDark } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      minHeight: 80,
    },
    numberSection: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      position: 'relative',
    },
    surahNumber: {
      position: 'absolute',
      fontSize: 18,
      fontWeight: '700',
      color: colors.gold,
      fontFamily: 'Amiri_700Bold',
      zIndex: 2,
    },
    contentSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rightContent: {
      flex: 1,
      alignItems: 'flex-end',
    },
    arabicName: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'right',
      fontFamily: 'ScheherazadeNew_700Bold',
      marginBottom: 4,
    },
    englishName: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'right',
      fontFamily: 'Amiri_400Regular',
    },
    leftContent: {
      alignItems: 'flex-start',
      marginLeft: 12,
    },
    revelationType: {
      fontSize: 12,
      color: colors.gold,
      fontFamily: 'Amiri_700Bold',
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 6,
    },
    ayahCount: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
  });

  const revelationTypeArabic = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.numberSection}>
        <StarIcon size={60} color={colors.gold} />
        <Text style={styles.surahNumber}>{surah.number}</Text>
      </View>
      
      <View style={styles.contentSection}>
        <View style={styles.leftContent}>
          <Text style={styles.revelationType}>{revelationTypeArabic}</Text>
          <Text style={styles.ayahCount}>{toArabicNumerals(surah.numberOfAyahs)} آيات</Text>
        </View>
        
        <View style={styles.rightContent}>
          <Text style={styles.arabicName}>{surah.name}</Text>
          <Text style={styles.englishName}>{surah.englishName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
