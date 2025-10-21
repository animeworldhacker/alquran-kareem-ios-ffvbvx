
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Path, Circle } from 'react-native-svg';

interface SplashScreenProps {
  onFinish: () => void;
}

// Islamic star pattern
function IslamicStar({ size = 100, color = '#D4AF37' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 5 L58 35 L88 35 L64 52 L72 82 L50 65 L28 82 L36 52 L12 35 L42 35 Z"
        fill={color}
        opacity={0.9}
      />
      <Circle cx="50" cy="50" r="35" fill="transparent" stroke={color} strokeWidth="2" opacity={0.5} />
      <Circle cx="50" cy="50" r="25" fill="transparent" stroke={color} strokeWidth="1.5" opacity={0.3} />
    </Svg>
  );
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors, textSizes } = useTheme();
  
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const tapHintAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tapHintAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(tapHintAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);
  }, [fadeAnim, scaleAnim, tapHintAnim]);

  const handleTap = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontFamily: 'ScheherazadeNew_700Bold',
      color: colors.gold,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 20,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      textAlign: 'center',
      marginBottom: 40,
      opacity: 0.9,
    },
    dedicationBox: {
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 40,
      borderWidth: 2,
      borderColor: colors.gold,
      maxWidth: 400,
    },
    dedicationTitle: {
      fontSize: 18,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
      textAlign: 'center',
      marginBottom: 12,
    },
    dedicationText: {
      fontSize: 16,
      fontFamily: 'Amiri_400Regular',
      color: colors.gold,
      textAlign: 'center',
      lineHeight: 28,
      opacity: 0.9,
    },
    tapHint: {
      fontSize: 16,
      fontFamily: 'Amiri_400Regular',
      color: colors.gold,
      textAlign: 'center',
      opacity: 0.7,
    },
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleTap}
      activeOpacity={0.9}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <IslamicStar size={120} color={colors.gold} />
        </View>

        <Text style={styles.title}>القرآن الكريم</Text>
        <Text style={styles.subtitle}>Al-Quran Al-Kareem</Text>

        <View style={styles.dedicationBox}>
          <Text style={styles.dedicationTitle}>صدقة جارية</Text>
          <Text style={styles.dedicationText}>
            هذا المصحف صدقة جارية الى{'\n'}
            مريم سليمان{'\n'}
            احمد جاسم{'\n'}
            شيخة احمد{'\n'}
            راشد بدر
          </Text>
        </View>

        <Animated.Text 
          style={[
            styles.tapHint,
            {
              opacity: tapHintAnim,
            },
          ]}
        >
          اضغط للمتابعة
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
