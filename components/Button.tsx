
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary';
}

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary' 
}: ButtonProps) {
  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const buttonTextStyle = variant === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <TouchableOpacity 
      style={[buttonStyle, style]} 
      onPress={onPress}
    >
      <Text style={[buttonTextStyle, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    minHeight: 48,
  },
  primaryText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Amiri_400Regular',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Amiri_400Regular',
  },
});
