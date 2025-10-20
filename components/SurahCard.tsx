
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
      backgroundColor: '#E8DCC4',
      borderBottomWidth: 1,
      borderBottomColor: '#D4C5A9',
      flexDirection: 'row',
      minHeight: 90,
    },
    greenSection: {
      width: 90,
      backgroundColor: '#4A7C59',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    decorativeFrame: {
      width: 70,
      height: 70,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    frameImage: {
      width: 70,
      height: 70,
      position: 'absolute',
      top: 0,
      left: 0,
    },
    chapterNumber: {
      fontSize: 24,
      color: '#3D3D3D',
      fontFamily: 'ScheherazadeNew_700Bold',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 1,
    },
    contentSection: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'center',
      paddingVertical: 16,
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
      color: '#9B8B7E',
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
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.greenSection}>
        <View style={styles.decorativeFrame}>
          <Image 
            source={require('../assets/images/5734b2e0-2cb8-482c-bac8-691a5b158c4a.png')}
            style={styles.frameImage}
            resizeMode="contain"
          />
          <Text style={styles.chapterNumber}>
            {surah.number}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentSection}>
        <View style={styles.cardContent}>
          <View style={styles.leftSection}>
            <Text style={styles.ayahCount}>
              {toArabicNumerals(surah.numberOfAyahs)} آيات
            </Text>
            <Text style={styles.arabicName}>{surah.name}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
