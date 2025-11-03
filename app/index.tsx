
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../components/SplashScreen';
import { runTextProcessorTests } from '../utils/testTextProcessor';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  let themeContext;
  let themeError = null;
  
  try {
    themeContext = useTheme();
  } catch (error) {
    console.error('Error loading theme context:', error);
    themeError = error;
  }

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

  // Show error if theme context failed
  if (themeError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>فشل في تحميل إعدادات التطبيق</Text>
        <Text style={styles.errorSubtext}>يرجى إعادة تشغيل التطبيق</Text>
      </View>
    );
  }

  // Show loading while initializing
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#F5EEE3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6D6558',
    textAlign: 'center',
  },
});
