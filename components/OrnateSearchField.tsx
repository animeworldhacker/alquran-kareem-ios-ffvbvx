
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface OrnateSearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function OrnateSearchField({
  value,
  onChangeText,
  placeholder,
}: OrnateSearchFieldProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.gold,
      backgroundColor: colors.cream,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    input: {
      flex: 1,
      fontFamily: 'Amiri_400Regular',
      color: colors.darkBrown,
      fontSize: 16,
      textAlign: 'right',
      padding: 0,
    },
  });

  return (
    <View style={styles.container}>
      <Icon name="search" size={20} style={{ color: colors.gold }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedBrown}
        style={styles.input}
      />
    </View>
  );
}
