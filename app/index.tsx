
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import SplashScreen from '../components/SplashScreen';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('🚀 Initializing app from index...');
        console.log('📱 Platform:', Platform.OS);
        console.log('🔧 Debug mode:', __DEV__);
        
        // Wait a bit for everything to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ App initialized successfully');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Still mark as ready to show error
        setIsReady(true);
      }
    }

    initialize();
  }, []);

  const handleSplashFinish = () => {
    console.log('✅ Splash screen finished');
    setShowSplash(false);
  };

  // Show loading while initializing
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading...</Text>
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
    fontWeight: 'bold',
  },
});
