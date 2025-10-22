
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

// Islamic lace pattern for card border
const LacePattern = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 600" style={StyleSheet.absoluteFill}>
    <Rect
      x="2"
      y="2"
      width="396"
      height="596"
      rx="24"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="2"
      strokeDasharray="8 4"
    />
    <Rect
      x="6"
      y="6"
      width="388"
      height="588"
      rx="22"
      fill="none"
      stroke="#D4AF37"
      strokeWidth="1"
      opacity="0.6"
    />
  </Svg>
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
          {/* Top Bismillah */}
          <Text style={styles.bismillah}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
          
          {/* Main Content Card */}
          <View style={styles.mainCard}>
            <LacePattern />
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

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNav}>
            <View style={styles.navItem}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
                  stroke="#1E5B4C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
                  stroke="#1E5B4C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.navLabel}>القرآن الكريم</Text>
            </View>
            
            <View style={styles.navItem}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="#1E5B4C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#1E5B4C"
                  fillOpacity="0.2"
                />
              </Svg>
              <Text style={styles.navLabel}>المفضلة</Text>
            </View>
            
            <View style={styles.navItem}>
              <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="#1E5B4C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                  stroke="#1E5B4C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.navLabel}>الإعدادات</Text>
            </View>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginTop: 90,
    marginBottom: 30,
    fontFamily: 'ScheherazadeNew_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Amiri_700Bold',
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
    fontFamily: 'Amiri_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  prayer: {
    fontSize: 15,
    color: '#F5EEE3',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Amiri_400Regular',
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#E8D7B8',
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
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
    fontFamily: 'Amiri_400Regular',
    marginBottom: 4,
  },
  tapHintEnglish: {
    fontSize: 10,
    color: '#E8D7B8',
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E8D7B8',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#1E5B4C',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Amiri_400Regular',
    fontWeight: '600',
  },
});
