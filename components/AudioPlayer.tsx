
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AudioState } from '../types';
import Icon from './Icon';

interface AudioPlayerProps {
  audioState: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext?: () => void;
}

const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

export default function AudioPlayer({ 
  audioState, 
  onPlay, 
  onPause, 
  onStop,
  onNext
}: AudioPlayerProps) {
  const { colors, textSizes, isDark } = useTheme();

  if (!audioState || (!audioState.currentSurah && !audioState.currentAyah)) {
    return null;
  }

  const handlePlay = () => {
    try {
      onPlay();
    } catch (error) {
      console.error('Error in AudioPlayer onPlay:', error);
    }
  };

  const handlePause = () => {
    try {
      onPause();
    } catch (error) {
      console.error('Error in AudioPlayer onPause:', error);
    }
  };

  const handleStop = () => {
    try {
      onStop();
    } catch (error) {
      console.error('Error in AudioPlayer onStop:', error);
    }
  };

  const handleNext = () => {
    try {
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Error in AudioPlayer onNext:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 85 : 65,
      left: 0,
      right: 0,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 2,
      borderTopColor: colors.gold,
      boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)',
      elevation: 8,
      zIndex: 1000,
    },
    info: {
      flex: 1,
    },
    currentText: {
      color: colors.gold,
      fontSize: textSizes.body,
      fontWeight: '700',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    controlButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.gold,
    },
    playButton: {
      backgroundColor: colors.gold,
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 0,
    },
    controlIcon: {
      color: colors.gold,
    },
    playIcon: {
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.currentText}>
          سورة {toArabicNumerals(audioState.currentSurah || 0)} - آية {toArabicNumerals(audioState.currentAyah || 0)}
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <Icon name="stop" size={18} style={styles.controlIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={audioState.isPlaying ? handlePause : handlePlay}
        >
          <Icon 
            name={audioState.isPlaying ? "pause" : "play"} 
            size={22} 
            style={styles.playIcon} 
          />
        </TouchableOpacity>

        {onNext && (
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <Icon name="play-skip-forward" size={18} style={styles.controlIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
