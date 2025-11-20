
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Path, Rect, G } from 'react-native-svg';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

// Ornate corner decoration component
const OrnateCorner = ({ style, rotation = 0 }: { style?: any; rotation?: number }) => (
  <Svg width="80" height="80" viewBox="0 0 80 80" style={[style, { transform: [{ rotate: `${rotation}deg` }] }]}>
    <G fill="none" stroke="#D4AF37" strokeWidth="2">
      {/* Outer corner lines */}
      <Path d="M 5 5 L 5 30 M 5 5 L 30 5" strokeWidth="2.5" />
      <Path d="M 10 10 L 10 25 M 10 10 L 25 10" strokeWidth="1.5" />
      
      {/* Decorative swirls */}
      <Path d="M 5 35 Q 5 45 15 45 Q 25 45 25 35 Q 25 25 15 25" />
      <Path d="M 35 5 Q 45 5 45 15 Q 45 25 35 25 Q 25 25 25 15" />
      
      {/* Geometric patterns */}
      <Path d="M 15 15 L 20 20 L 15 25 L 10 20 Z" fill="#D4AF37" fillOpacity="0.3" />
      <Path d="M 30 10 L 35 15 L 30 20 L 25 15 Z" fill="#D4AF37" fillOpacity="0.3" />
      <Path d="M 10 30 L 15 35 L 10 40 L 5 35 Z" fill="#D4AF37" fillOpacity="0.3" />
    </G>
  </Svg>
);

// Decorative frame border component
const DecorativeFrame = () => (
  <View style={styles.frameContainer}>
    {/* Top border */}
    <View style={[styles.borderLine, styles.borderTop]} />
    <View style={[styles.borderLine, styles.borderTopInner]} />
    
    {/* Bottom border */}
    <View style={[styles.borderLine, styles.borderBottom]} />
    <View style={[styles.borderLine, styles.borderBottomInner]} />
    
    {/* Left border */}
    <View style={[styles.borderLine, styles.borderLeft]} />
    <View style={[styles.borderLine, styles.borderLeftInner]} />
    
    {/* Right border */}
    <View style={[styles.borderLine, styles.borderRight]} />
    <View style={[styles.borderLine, styles.borderRightInner]} />
    
    {/* Corner ornaments */}
    <OrnateCorner style={styles.cornerTopLeft} rotation={0} />
    <OrnateCorner style={styles.cornerTopRight} rotation={90} />
    <OrnateCorner style={styles.cornerBottomRight} rotation={180} />
    <OrnateCorner style={styles.cornerBottomLeft} rotation={270} />
  </View>
);

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors, textSizes } = useTheme();
  
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

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleTap}
      activeOpacity={1}
    >
      <LinearGradient
        colors={['#2D5016', '#3A5C1E', '#4A7C2C']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <DecorativeFrame />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Top Bismillah - Made larger */}
          <Text style={styles.bismillah}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
          
          {/* Main Content Card - Removed LacePattern (dotted box) */}
          <View style={styles.mainCard}>
            <View style={styles.cardContent}>
              <Text style={styles.dedicationTitle}>هذا المصحف صدقة جارية إلى</Text>
              
              <View style={styles.namesContainer}>
                <Text style={styles.dedicationNames}>مريم سليمان</Text>
                <Text style={styles.dedicationNames}>أحمد جاسم</Text>
                <Text style={styles.dedicationNames}>شيخة أحمد</Text>
                <Text style={styles.dedicationNames}>راشد بدر</Text>
              </View>
              
              <Text style={styles.prayer}>
                والمسلمين والمسلمات{'\n'}
                رحمهم الله واسكنهم فسيح جناته
              </Text>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.appTitle}>المصحف الشريف</Text>
            <Text style={styles.subtitle}>مع تفسير ابن كثير والتلاوات الصوتية</Text>
            
            <Animated.View style={[styles.tapHintContainer, { opacity: tapHintAnim }]}>
              <Text style={styles.tapHint}>اضغط في أي مكان للمتابعة</Text>
              <Text style={styles.tapHintEnglish}>Tap anywhere to continue</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  borderLine: {
    position: 'absolute',
    backgroundColor: '#D4AF37',
  },
  borderTop: {
    top: 15,
    left: 15,
    right: 15,
    height: 2.5,
  },
  borderTopInner: {
    top: 20,
    left: 20,
    right: 20,
    height: 1.5,
  },
  borderBottom: {
    bottom: 15,
    left: 15,
    right: 15,
    height: 2.5,
  },
  borderBottomInner: {
    bottom: 20,
    left: 20,
    right: 20,
    height: 1.5,
  },
  borderLeft: {
    top: 15,
    bottom: 15,
    left: 15,
    width: 2.5,
  },
  borderLeftInner: {
    top: 20,
    bottom: 20,
    left: 20,
    width: 1.5,
  },
  borderRight: {
    top: 15,
    bottom: 15,
    right: 15,
    width: 2.5,
  },
  borderRightInner: {
    top: 20,
    bottom: 20,
    right: 20,
    width: 1.5,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 5,
    left: 5,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 5,
    left: 5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  bismillah: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginTop: 90,
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  mainCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(58, 92, 30, 0.85)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  dedicationTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F5EEE3',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  namesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dedicationNames: {
    fontSize: 18,
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  prayer: {
    fontSize: 15,
    color: '#F5EEE3',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#E8D7B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  tapHintContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  tapHint: {
    fontSize: 12,
    color: '#F5EEE3',
    textAlign: 'center',
    marginBottom: 4,
  },
  tapHintEnglish: {
    fontSize: 10,
    color: '#E8D7B8',
    textAlign: 'center',
    opacity: 0.8,
  },
});
