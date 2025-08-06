
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { ScheherazadeNew_400Regular } from '@expo-google-fonts/scheherazade-new';
import SplashScreen from '../components/SplashScreen';
import HomeScreen from './home';
import { commonStyles } from '../styles/commonStyles';

export default function MainScreen() {
  const [showSplash, setShowSplash] = useState(true);
  
  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    ScheherazadeNew_400Regular,
  });

  useEffect(() => {
    console.log('Main screen loaded');
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  return (
    <View style={commonStyles.container}>
      <HomeScreen />
    </View>
  );
}
