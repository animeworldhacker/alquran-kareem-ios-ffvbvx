
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors, textSizes } = useTheme();
  
  // Use useMemo to memoize the animated values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const tapHintAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    console.log('Splash screen loaded, waiting for user tap');
    
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
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(tapHintAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(tapHintAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [fadeAnim, scaleAnim, tapHintAnim]);

  const handleTap = () => {
    console.log('Splash screen tapped, proceeding to main app');
    onFinish();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#316612',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    bismillah: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#d4db7f',
      textAlign: 'center',
      marginBottom: 40,
      fontFamily: 'ScheherazadeNew_400Regular',
    },
    dedicationContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 20,
      borderRadius: 15,
      marginBottom: 40,
      alignItems: 'center',
    },
    dedicationText: {
      fontSize: textSizes.body,
      textAlign: 'center',
      lineHeight: 32,
      fontFamily: 'Amiri_700Bold',
    },
    whiteText: {
      color: '#FFFFFF',
    },
    yellowText: {
      color: '#FFD700',
    },
    appTitle: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: colors.backgroundAlt,
      textAlign: 'center',
      marginBottom: 10,
      fontFamily: 'Amiri_700Bold',
    },
    subtitle: {
      fontSize: textSizes.body,
      color: colors.backgroundAlt,
      textAlign: 'center',
      opacity: 0.9,
      fontFamily: 'Amiri_400Regular',
    },
    tapHintContainer: {
      marginTop: 50,
      alignItems: 'center',
    },
    tapHint: {
      fontSize: textSizes.body,
      color: '#d4db7f',
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      marginBottom: 5,
    },
    tapHintEnglish: {
      fontSize: textSizes.caption,
      color: colors.backgroundAlt,
      textAlign: 'center',
      opacity: 0.8,
    },
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleTap}
      activeOpacity={1}
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
        <Text style={styles.bismillah} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        
        <View style={styles.dedicationContainer}>
          <Text style={styles.dedicationText}>
            <Text style={styles.whiteText}>هذا المصحف صدقة جارية الى </Text>
            <Text style={styles.yellowText}>مريم سليمان</Text>
            <Text style={styles.whiteText}>، </Text>
            <Text style={styles.yellowText}>احمد جاسم</Text>
            <Text style={styles.whiteText}>، </Text>
            <Text style={styles.yellowText}>شيخة احمد</Text>
            <Text style={styles.whiteText}>، </Text>
            <Text style={styles.yellowText}>راشد بدر</Text>
            <Text style={styles.whiteText}>، والمسلمين والمسلمات رحمهم الله واسكنهم فسيح جناته</Text>
          </Text>
        </View>

        <Text style={styles.appTitle}>المصحف الشريف</Text>
        <Text style={styles.subtitle}>مع تفسير ابن كثير والتلاوات الصوتية</Text>
        
        <Animated.View style={[styles.tapHintContainer, { opacity: tapHintAnim }]}>
          <Text style={styles.tapHint}>اضغط في أي مكان للمتابعة</Text>
          <Text style={styles.tapHintEnglish}>Tap anywhere to continue</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}
