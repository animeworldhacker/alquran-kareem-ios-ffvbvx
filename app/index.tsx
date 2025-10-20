
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../components/SplashScreen';
import { runTextProcessorTests } from '../utils/testTextProcessor';

export default function Index() {
  const { isLoading } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Run text processor tests in development
    if (__DEV__) {
      console.log('Running text processor tests...');
      runTextProcessorTests();
    }
  }, []);

  const handleSplashFinish = () => {
    console.log('Splash screen finished');
    setShowSplash(false);
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Redirect to tabs/chapters instead of home
  return <Redirect href="/(tabs)/chapters" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f0',
  },
});
