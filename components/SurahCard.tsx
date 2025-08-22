
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
      backgroundColor: '#f8f6f0', // Cream background
      borderColor: '#e8e6e0',
      borderWidth: 1,
      borderRadius: 12,
      marginVertical: 6,
      marginHorizontal: 16,
      overflow: 'hidden',
      boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.08)',
      elevation: 4,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    numberContainer: {
      width: 50 * (settings.squareAdjustment / 100),
      height: 50 * (settings.squareAdjustment / 100),
      borderRadius: 25 * (settings.squareAdjustment / 100),
      backgroundColor: '#d4af37', // Gold color
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
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
      color: '#8B4513',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#f8f6f0',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#d4af37',
    },
    content: {
      flex: 1,
      position: 'relative',
    },
    arabicName: {
      fontSize: Math.max(22, textSizes.title * 1.1),
      fontWeight: 'bold',
      color: '#2F4F4F', // Dark slate gray
      textAlign: 'right',
      marginBottom: 6,
      fontFamily: 'ScheherazadeNew_400Regular',
    },
    englishName: {
      fontSize: textSizes.body,
      color: '#8B4513', // Brown color
      marginBottom: 4,
      fontFamily: 'Amiri_700Bold',
      fontWeight: 'bold',
    },
    translation: {
      fontSize: textSizes.caption,
      color: '#8B4513',
      marginBottom: 6,
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
      fontSize: textSizes.caption,
      color: '#8B4513',
      fontFamily: 'Amiri_700Bold',
    },
    revelationType: {
      backgroundColor: '#d4af37',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    revelationText: {
      fontSize: textSizes.caption - 2,
      color: '#fff',
      fontFamily: 'Amiri_700Bold',
      fontWeight: 'bold',
    },
    chevron: {
      color: '#d4af37',
    },
    decorativeLine: {
      height: 2,
      backgroundColor: '#d4af37',
      marginHorizontal: 16,
      marginBottom: 8,
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
