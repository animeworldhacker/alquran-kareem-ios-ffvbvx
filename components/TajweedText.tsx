
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
      alignItems: 'flex-start',
      justifyContent: 'flex-end', // Right alignment for Arabic text
      width: '100%',
    },
    textContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '100%',
    },
    segment: {
      fontFamily: 'ScheherazadeNew_400Regular',
      fontSize: fontSize || 20,
      lineHeight: (fontSize || 20) * 1.9,
      textAlign: 'right',
      writingDirection: 'rtl',
      textAlignVertical: 'center',
    },
    wordSpacing: {
      marginHorizontal: 2,
    },
  });

  // Group segments into words for better text flow
  const renderSegments = () => {
    return segments.map((segment, index) => {
      // Safety check for each segment
      if (!segment || typeof segment.text !== 'string') {
        console.log(`TajweedText: Invalid segment at index ${index}:`, segment);
        return null;
      }

      // Clean the segment text
      const cleanText = segment.text.trim();
      if (!cleanText) {
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
            styles.wordSpacing,
            {
              color: segmentColor,
              fontWeight: isTajweedSegment ? '600' : 'normal',
              textShadowColor: isTajweedSegment ? 'rgba(0,0,0,0.1)' : 'transparent',
              textShadowOffset: isTajweedSegment ? { width: 0, height: 1 } : { width: 0, height: 0 },
              textShadowRadius: isTajweedSegment ? 1 : 0,
              backgroundColor: isTajweedSegment && settings.showTajweed ? 
                `${segmentColor}15` : 'transparent', // Very light background for tajweed
            }
          ]}
        >
          {cleanText}
        </Text>
      );
    }).filter(Boolean); // Remove null elements
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        {renderSegments()}
      </View>
    </View>
  );
}
