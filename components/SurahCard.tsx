
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Surah } from '../types';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface SurahCardProps {
  surah: Surah;
  onPress: () => void;
}

export default function SurahCard({ surah, onPress }: SurahCardProps) {
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

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  number: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  content: {
    flex: 1,
  },
  arabicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    marginBottom: 4,
    fontFamily: 'ScheherazadeNew_400Regular',
  },
  englishName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 2,
    fontFamily: 'Amiri_400Regular',
  },
  translation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Amiri_400Regular',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: 'Amiri_400Regular',
  },
  chevron: {
    color: colors.grey,
  },
});
