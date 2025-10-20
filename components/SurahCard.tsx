
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { useTheme } from '../contexts/ThemeContext';

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
  const { textSizes } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#E8DCC4', // Beige background
      borderBottomWidth: 1,
      borderBottomColor: '#D4C5A9',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    ayahCount: {
      fontSize: 14,
      color: '#9B8B7E', // Gray color for ayah count
      fontFamily: 'Amiri_400Regular',
      marginRight: 20,
      minWidth: 70,
    },
    arabicName: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#3D3D3D',
      textAlign: 'right',
      fontFamily: 'ScheherazadeNew_700Bold',
      flex: 1,
    },
    rightSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 15,
    },
    chapterNumber: {
      fontSize: 20,
      color: '#3D3D3D',
      fontFamily: 'ScheherazadeNew_700Bold',
      fontWeight: 'bold',
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <Text style={styles.ayahCount}>
            {surah.numberOfAyahs} ayas
          </Text>
          <Text style={styles.arabicName}>{surah.name}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={styles.chapterNumber}>
            {toArabicNumerals(surah.number)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
