
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface OrnateHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  showBismillahWatermark?: boolean;
}

// Decorative corner component for ornate design
function OrnateCorner({ style, rotation = 0 }: { style?: any; rotation?: number }) {
  return (
    <View style={[{ position: 'absolute', transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width="40" height="40" viewBox="0 0 40 40">
        <Path
          d="M 0 0 Q 10 0 15 5 Q 20 10 20 20 L 20 0 Z"
          fill="#D4AF37"
          opacity={0.3}
        />
        <Path
          d="M 0 0 Q 8 0 12 4 Q 16 8 16 16 L 16 0 Z"
          fill="#D4AF37"
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

export default function OrnateHeader({
  title,
  subtitle,
  onBackPress,
  rightIcon,
  onRightPress,
  showBismillahWatermark = false,
}: OrnateHeaderProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.emerald,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
      position: 'relative',
      overflow: 'visible',
    },
    scallop: {
      position: 'absolute',
      width: 20,
      height: 20,
      backgroundColor: colors.gold,
    },
    scallopTopLeft: {
      top: -3,
      left: -3,
      borderTopLeftRadius: 20,
    },
    scallopTopRight: {
      top: -3,
      right: -3,
      borderTopRightRadius: 20,
    },
    scallopBottomLeft: {
      bottom: -3,
      left: -3,
      borderBottomLeftRadius: 20,
    },
    scallopBottomRight: {
      bottom: -3,
      right: -3,
      borderBottomRightRadius: 20,
    },
    watermark: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.1,
    },
    watermarkText: {
      fontSize: 32,
      fontFamily: 'ScheherazadeNew_400Regular',
      color: colors.gold,
      textAlign: 'center',
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.gold,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Amiri_700Bold',
      fontSize: 22,
      color: colors.gold,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    subtitle: {
      fontFamily: 'Amiri_400Regular',
      fontSize: 14,
      color: colors.gold,
      opacity: 0.9,
      textAlign: 'center',
      marginTop: 4,
    },
    rightButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.gold,
    },
    placeholder: {
      width: 40,
      height: 40,
    },
  });

  return (
    <View style={styles.container}>
      {/* Decorative scalloped corners */}
      <OrnateCorner style={{ top: -10, left: -10 }} rotation={0} />
      <OrnateCorner style={{ top: -10, right: -10 }} rotation={90} />
      <OrnateCorner style={{ bottom: -10, left: -10 }} rotation={270} />
      <OrnateCorner style={{ bottom: -10, right: -10 }} rotation={180} />

      {/* Bismillah watermark */}
      {showBismillahWatermark && (
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        </View>
      )}

      <View style={styles.contentRow}>
        {onBackPress ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="chevron-forward" size={24} style={{ color: colors.gold }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.centerContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightIcon && onRightPress ? (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
            <Icon name={rightIcon} size={24} style={{ color: colors.gold }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}
