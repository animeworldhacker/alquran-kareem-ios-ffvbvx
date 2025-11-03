
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../components/SplashScreen';
import { runTextProcessorTests } from '../utils/testTextProcessor';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Always call hooks at the top level
  const themeContext = useTheme();

  useEffect(() => {
    async function initialize() {
      try {
        console.log('🚀 Initializing app...');
        
        // Run text processor tests in development
        if (__DEV__) {
          try {
            console.log('Running text processor tests...');
            runTextProcessorTests();
            console.log('✅ Text processor tests completed');
          } catch (error) {
            console.error('❌ Text processor tests failed:', error);
          }
        }
        
        // Wait a bit for theme to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ App initialized successfully');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsReady(true); // Still mark as ready to show error
      }
    }

    initialize();
  }, []);

  const handleSplashFinish = () => {
    console.log('✅ Splash screen finished');
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

  // Show error if initialization failed
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>فشل في تهيئة التطبيق</Text>
        <Text style={styles.errorDetails}>{initError}</Text>
      </View>
    );
  }

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Redirect to chapters tab
  console.log('🔄 Redirecting to chapters tab');
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
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6D6558',
    textAlign: 'center',
  },
});
