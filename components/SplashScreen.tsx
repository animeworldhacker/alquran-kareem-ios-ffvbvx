
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
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

    // Auto-finish after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        
        <View style={styles.dedicationContainer}>
          <Text style={styles.dedicationTitle}>هذا المصحف صدقة جارية إلى</Text>
          <Text style={styles.dedicationNames}>مريم سليمان</Text>
          <Text style={styles.dedicationNames}>أحمد جاسم</Text>
          <Text style={styles.dedicationNames}>شيخة أحمد</Text>
          <Text style={styles.dedicationNames}>راشد بدر</Text>
          <Text style={styles.prayer}>رحمهم الله وأسكنهم فسيح جناته</Text>
        </View>

        <Text style={styles.appTitle}>المصحف الشريف</Text>
        <Text style={styles.subtitle}>مع تفسير ابن كثير والتلاوات الصوتية</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bismillah: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.accent,
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
  dedicationTitle: {
    fontSize: 18,
    color: colors.backgroundAlt,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Amiri_400Regular',
  },
  dedicationNames: {
    fontSize: 20,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  prayer: {
    fontSize: 16,
    color: colors.backgroundAlt,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    fontFamily: 'Amiri_400Regular',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.backgroundAlt,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Amiri_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.backgroundAlt,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'Amiri_400Regular',
  },
});
