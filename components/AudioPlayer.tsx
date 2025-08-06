
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { AudioState } from '../types';
import Icon from './Icon';

interface AudioPlayerProps {
  audioState: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export default function AudioPlayer({ audioState, onPlay, onPause, onStop }: AudioPlayerProps) {
  if (!audioState.currentSurah || !audioState.currentAyah) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.currentText}>
          سورة {audioState.currentSurah} - آية {audioState.currentAyah}
        </Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={onStop}>
          <Icon name="stop" size={24} style={styles.controlIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={audioState.isPlaying ? onPause : onPlay}
        >
          <Icon 
            name={audioState.isPlaying ? "pause" : "play"} 
            size={28} 
            style={styles.controlIcon} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  },
  info: {
    flex: 1,
  },
  currentText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Amiri_400Regular',
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.accent,
  },
  controlIcon: {
    color: colors.backgroundAlt,
  },
});
