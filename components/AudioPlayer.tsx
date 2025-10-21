
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AudioState, Reciter } from '../types';
import Icon from './Icon';

interface AudioPlayerProps {
  audioState: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext?: () => void;
  currentReciter?: Reciter;
}

export default function AudioPlayer({ 
  audioState, 
  onPlay, 
  onPause, 
  onStop,
  onNext,
  currentReciter
}: AudioPlayerProps) {
  const { colors, textSizes } = useTheme();

  // Safety checks
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
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.secondary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    info: {
      flex: 1,
    },
    currentText: {
      color: '#fff',
      fontSize: textSizes.body,
      fontWeight: '600',
      fontFamily: 'Amiri_700Bold',
    },
    reciterText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      marginTop: 2,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      backgroundColor: colors.accent,
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    controlIcon: {
      color: '#fff',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.currentText}>
          سورة {audioState.currentSurah || '؟'} - آية {audioState.currentAyah || '؟'}
        </Text>
        {currentReciter && (
          <Text style={styles.reciterText}>
            {currentReciter.name}
          </Text>
        )}
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <Icon name="stop" size={20} style={styles.controlIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={audioState.isPlaying ? handlePause : handlePlay}
        >
          <Icon 
            name={audioState.isPlaying ? "pause" : "play"} 
            size={24} 
            style={styles.controlIcon} 
          />
        </TouchableOpacity>

        {onNext && (
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <Icon name="play-skip-forward" size={20} style={styles.controlIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
