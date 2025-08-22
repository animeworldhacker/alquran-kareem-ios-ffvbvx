
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface SurahCardProps {
  surah: Surah;
  onPress: () => void;
}

export default function SurahCard({ surah, onPress }: SurahCardProps) {
  const { settings, colors, textSizes } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      marginVertical: 6,
      marginHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    numberContainer: {
      width: 40 * (settings.squareAdjustment / 100),
      height: 40 * (settings.squareAdjustment / 100),
      borderRadius: 20 * (settings.squareAdjustment / 100),
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    number: {
      color: colors.backgroundAlt,
      fontSize: textSizes.body,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    content: {
      flex: 1,
    },
    arabicName: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 4,
      fontFamily: 'ScheherazadeNew_400Regular',
    },
    englishName: {
      fontSize: textSizes.body,
      color: colors.textSecondary,
      marginBottom: 2,
      fontFamily: 'Amiri_400Regular',
    },
    translation: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      marginBottom: 4,
      fontFamily: 'Amiri_400Regular',
    },
    info: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
    chevron: {
      color: colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{surah.number}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.arabicName}>{surah.name}</Text>
        <Text style={styles.englishName}>{surah.englishName}</Text>
        <Text style={styles.translation}>{surah.englishNameTranslation}</Text>
        
        <View style={styles.info}>
          <Text style={styles.infoText}>
            {surah.numberOfAyahs} آية • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
          </Text>
        </View>
      </View>
      
      <Icon name="chevron-forward" size={24} style={styles.chevron} />
    </TouchableOpacity>
  );
}


