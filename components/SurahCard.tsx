
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

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
  const { settings, colors, textSizes } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface, // Use theme surface color
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      marginVertical: 8,
      marginHorizontal: 16,
      overflow: 'hidden',
      boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.08)',
      elevation: 4,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20, // Increased padding for larger appearance
    },
    numberContainer: {
      width: 55 * (settings.squareAdjustment / 100), // Slightly larger
      height: 55 * (settings.squareAdjustment / 100),
      borderRadius: 27.5 * (settings.squareAdjustment / 100),
      backgroundColor: colors.primary, // Use theme primary color
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18, // Increased margin
      boxShadow: '0px 2px 8px rgba(212, 175, 55, 0.3)',
      elevation: 3,
    },
    number: {
      color: '#fff',
      fontSize: textSizes.body,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    arabicNumber: {
      color: colors.secondary,
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.surface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    content: {
      flex: 1,
      position: 'relative',
    },
    arabicName: {
      fontSize: Math.max(24, textSizes.title * 1.2), // Larger font
      fontWeight: 'bold',
      color: colors.text, // Use theme text color
      textAlign: 'right',
      marginBottom: 8, // Increased margin
      fontFamily: 'ScheherazadeNew_400Regular',
    },
    englishName: {
      fontSize: textSizes.body + 1, // Slightly larger
      color: colors.secondary, // Use theme secondary color
      marginBottom: 5,
      fontFamily: 'Amiri_700Bold',
      fontWeight: 'bold',
    },
    translation: {
      fontSize: textSizes.caption + 1, // Slightly larger
      color: colors.secondary,
      marginBottom: 8, // Increased margin
      fontFamily: 'Amiri_400Regular',
      fontStyle: 'italic',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    info: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      fontSize: textSizes.caption + 1, // Slightly larger
      color: colors.secondary,
      fontFamily: 'Amiri_700Bold',
    },
    revelationType: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10, // Increased padding
      paddingVertical: 3,
      borderRadius: 12, // Larger border radius
      marginLeft: 10,
    },
    revelationText: {
      fontSize: textSizes.caption - 2,
      color: '#fff',
      fontFamily: 'Amiri_700Bold',
      fontWeight: 'bold',
    },
    chevron: {
      color: colors.primary,
    },
    decorativeLine: {
      height: 2,
      backgroundColor: colors.primary,
      marginHorizontal: 20, // Increased margin
      marginBottom: 10, // Increased margin
      borderRadius: 1,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.numberContainer}>
          <Text style={styles.number}>{surah.number}</Text>
          <Text style={styles.arabicNumber}>{toArabicNumerals(surah.number)}</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.arabicName}>{surah.name}</Text>
          <Text style={styles.englishName}>{surah.englishName}</Text>
          <Text style={styles.translation}>{surah.englishNameTranslation}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.info}>
              <Text style={styles.infoText}>
                {toArabicNumerals(surah.numberOfAyahs)} آية
              </Text>
              <View style={styles.revelationType}>
                <Text style={styles.revelationText}>
                  {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} style={styles.chevron} />
          </View>
        </View>
      </View>
      <View style={styles.decorativeLine} />
    </TouchableOpacity>
  );
}
