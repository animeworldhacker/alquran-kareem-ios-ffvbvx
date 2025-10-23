
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { parseTajweedHTML, TajweedSegment } from '../utils/tajweedColors';
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
          key={index}
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
    fontSize: 26,
    lineHeight: 48,
    textAlign: 'right',
    color: '#2C2416',
    fontFamily: 'ScheherazadeNew_400Regular',
    writingDirection: 'rtl',
  },
  segment: {
    fontFamily: 'ScheherazadeNew_400Regular',
  },
});
