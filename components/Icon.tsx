
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: any;
}

export default function Icon({ name, size = 24, style }: IconProps) {
  return (
    <Ionicons 
      name={name} 
      size={size} 
      color={style?.color || colors.text}
      style={style}
    />
  );
}
