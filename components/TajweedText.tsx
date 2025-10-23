
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { parseTajweedHTML } from '../utils/tajweedColors';
import { useTheme } from '../contexts/ThemeContext';

interface TajweedTextProps {
  html: string;
  style?: any;
  showTajweed?: boolean;
}

export default function TajweedText({ html, style, showTajweed = true }: TajweedTextProps) {
  const { settings } = useTheme();
  const shouldShowTajweed = showTajweed && settings.showTajweed;

  if (!html) {
    return null;
  }

  const segments = parseTajweedHTML(html);

  return (
    <Text style={[styles.container, style]}>
      {segments.map((segment, index) => (
        <Text
          key={`segment-${index}`}
          style={[
            styles.segment,
            shouldShowTajweed && segment.color ? { color: segment.color } : {},
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    fontSize: 32,
    lineHeight: 60,
    textAlign: 'right',
    color: '#2C2416',
    fontFamily: 'ScheherazadeNew_400Regular',
    writingDirection: 'rtl',
  },
  segment: {
    fontFamily: 'ScheherazadeNew_400Regular',
  },
});
