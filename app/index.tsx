
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../components/SplashScreen';
import { runTextProcessorTests } from '../utils/testTextProcessor';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  // Always call hooks at the top level - FIXED
  const themeContext = useTheme();

  useEffect(() => {
    async function initialize() {
      try {
        // Run text processor tests in development
        if (__DEV__) {
          console.log('Running text processor tests...');
          runTextProcessorTests();
        }
        
        // Wait a bit for theme to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true); // Still mark as ready to show error
      }
    }

    initialize();
  }, []);

  const handleSplashFinish = () => {
    console.log('Splash screen finished');
    setShowSplash(false);
  };

  // Show loading while initializing or theme is loading
  if (!isReady || !themeContext || themeContext.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Redirect to chapters tab
  return <Redirect href="/(tabs)/chapters" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5EEE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#2C2416',
  },
});
