
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: any;
}

export default function Icon({ name, size = 24, style }: IconProps) {
  try {
    // Validate props
    if (!name) {
      console.warn('Icon: name prop is required');
      return null;
    }

    const iconSize = typeof size === 'number' && size > 0 ? size : 24;
    const iconColor = style?.color || '#2F4F4F';

    return (
      <Ionicons 
        name={name} 
        size={iconSize} 
        color={iconColor}
        style={style}
      />
    );
  } catch (error) {
    console.error('Error rendering Icon:', error);
    return <View style={{ width: size, height: size }} />;
  }
}
