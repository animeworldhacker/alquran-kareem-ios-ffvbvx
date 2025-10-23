
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeChip: string | null;
  onChipPress: (chipId: string) => void;
}

export default function FilterChips({ chips, activeChip, onChipPress }: FilterChipsProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    scrollView: {
      flexDirection: 'row',
    },
    chip: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.gold,
      backgroundColor: colors.cream,
      marginRight: 10,
    },
    chipActive: {
      backgroundColor: colors.emerald,
    },
    chipText: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 14,
      color: colors.darkBrown,
    },
    chipTextActive: {
      color: colors.gold,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, activeChip === chip.id && styles.chipActive]}
            onPress={() => onChipPress(chip.id)}
          >
            <Text style={[styles.chipText, activeChip === chip.id && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
