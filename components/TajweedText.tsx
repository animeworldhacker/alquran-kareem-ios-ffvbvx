
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
  const { settings, colors } = useTheme();

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
      justifyContent: 'flex-end', // Right alignment for Arabic text
    },
    segment: {
      fontFamily: 'ScheherazadeNew_400Regular',
      fontSize: fontSize || 20,
      lineHeight: (fontSize || 20) * 1.8,
      textAlign: 'right',
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

        // Determine the color to use
        let segmentColor = colors.text; // Default color
        
        if (settings.showTajweed && segment.color) {
          segmentColor = segment.color;
        }

        // Add subtle emphasis for tajweed segments
        const isTajweedSegment = segment.type !== 'default' && settings.showTajweed;

        return (
          <Text
            key={index}
            style={[
              styles.segment,
              {
                color: segmentColor,
                fontWeight: isTajweedSegment ? '600' : 'normal',
                textShadowColor: isTajweedSegment ? 'rgba(0,0,0,0.1)' : 'transparent',
                textShadowOffset: isTajweedSegment ? { width: 0, height: 1 } : { width: 0, height: 0 },
                textShadowRadius: isTajweedSegment ? 1 : 0,
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
