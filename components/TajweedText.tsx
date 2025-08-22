
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TajweedSegment } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TajweedTextProps {
  segments: TajweedSegment[];
  fontSize: number;
  style?: any;
}

export default function TajweedText({ segments, fontSize, style }: TajweedTextProps) {
  const { settings } = useTheme();

  if (!segments || segments.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    segment: {
      fontFamily: 'ScheherazadeNew_400Regular',
      fontSize: fontSize,
      lineHeight: fontSize * 1.8,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={[
            styles.segment,
            {
              color: settings.showTajweed ? segment.color : '#2F4F4F',
            }
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </View>
  );
}
