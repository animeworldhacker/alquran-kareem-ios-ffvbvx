
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AudioState } from '../types';
import Icon from './Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
      backgroundColor: colors.emerald,
      height: 56,
      paddingHorizontal: 16,
      paddingBottom: insets.bottom,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 2,
      borderTopColor: colors.gold,
      borderRadius: 16,
      marginHorizontal: 12,
      marginBottom: 12,
      boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.12)',
      elevation: 6,
      position: 'relative',
    },
    progressBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.gold,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    centerSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightSection: {
      flex: 1,
      alignItems: 'flex-end',
    },
    reciterText: {
      color: colors.gold,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
    },
    controlButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.gold,
    },
    playButton: {
      backgroundColor: colors.gold,
      width: 44,
      height: 44,
      borderRadius: 22,
      marginHorizontal: 8,
    },
    controlIcon: {
      color: colors.gold,
    },
    playIcon: {
      color: colors.emerald,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBar} />
      
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <Icon name="stop" size={16} style={styles.controlIcon} />
        </TouchableOpacity>
        
        {onNext && (
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <Icon name="play-skip-back" size={16} style={styles.controlIcon} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerSection}>
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
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.reciterText}>عبد الباسط</Text>
      </View>
    </View>
  );
}
