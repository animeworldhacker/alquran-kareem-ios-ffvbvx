
import React, { useEffect, useState } from 'react';
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
  selectedReciter?: number;
  reciters?: Reciter[];
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
  onNext,
  selectedReciter,
  reciters = []
}: AudioPlayerProps) {
  const { colors } = useTheme();
  const [reciterName, setReciterName] = useState('قارئ');

  useEffect(() => {
    if (selectedReciter && reciters.length > 0) {
      const reciterIndex = reciters.findIndex(r => r.id === selectedReciter);
      if (reciterIndex !== -1) {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const arabicNumber = (reciterIndex + 1).toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
        setReciterName(`قارئ ${arabicNumber}`);
      } else {
        setReciterName('قارئ');
      }
    } else {
      setReciterName('قارئ');
    }
  }, [selectedReciter, reciters]);

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
      backgroundColor: '#1E5B4C',
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 3,
      borderTopColor: '#D4AF37',
      boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 8,
      position: 'relative',
    },
    progressBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: '#D4AF37',
    },
    info: {
      flex: 1,
    },
    reciterText: {
      color: '#D4AF37',
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Amiri_400Regular',
      marginBottom: 2,
    },
    currentText: {
      color: '#D4AF37',
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Amiri_700Bold',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    controlButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#D4AF37',
    },
    playButton: {
      backgroundColor: '#D4AF37',
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    controlIcon: {
      color: '#D4AF37',
    },
    playIcon: {
      color: '#1E5B4C',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBar} />
      
      <View style={styles.info}>
        <Text style={styles.reciterText}>{reciterName}</Text>
        <Text style={styles.currentText}>
          سورة {toArabicNumerals(audioState.currentSurah || 0)} - آية {toArabicNumerals(audioState.currentAyah || 0)}
        </Text>
      </View>
      
      <View style={styles.controls}>
        {onNext && (
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <Icon name="play-skip-forward" size={18} style={styles.controlIcon} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={audioState.isPlaying ? handlePause : handlePlay}
        >
          <Icon 
            name={audioState.isPlaying ? "pause" : "play"} 
            size={24} 
            style={styles.playIcon} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <Icon name="stop" size={18} style={styles.controlIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
