
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import SplashScreen from '../components/SplashScreen';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('🚀 Index screen mounted');
    console.log('📱 Platform:', Platform.OS);
    console.log('🔧 Debug mode:', __DEV__);
  }, []);

  const handleSplashFinish = () => {
    console.log('✅ Splash screen finished');
    setShowSplash(false);
  };

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Redirect to chapters tab
  console.log('🔄 Redirecting to chapters tab');
  return <Redirect href="/(tabs)/chapters" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE3',
  },
});
