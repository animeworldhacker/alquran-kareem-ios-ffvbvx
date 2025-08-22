
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

  // Safety check for segments
  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    console.log('TajweedText: No valid segments provided');
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
      fontSize: fontSize || 20,
      lineHeight: (fontSize || 20) * 1.8,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {segments.map((segment, index) => {
        // Safety check for each segment
        if (!segment || typeof segment.text !== 'string') {
          console.log(`TajweedText: Invalid segment at index ${index}:`, segment);
          return null;
        }

        return (
          <Text
            key={index}
            style={[
              styles.segment,
              {
                color: settings.showTajweed && segment.color ? segment.color : '#2F4F4F',
              }
            ]}
          >
            {segment.text}
          </Text>
        );
      })}
    </View>
  );
}
