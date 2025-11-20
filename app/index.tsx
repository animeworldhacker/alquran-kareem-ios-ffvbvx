
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../components/SplashScreen';

// Set this to true to test if the basic app works
const DEBUG_MODE = false;

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();
  
  // Always call hooks at the top level
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.error('❌ Error getting theme context:', error);
  }

  useEffect(() => {
    async function initialize() {
      try {
        console.log('🚀 Initializing app from index...');
        console.log('📱 Platform:', require('react-native').Platform.OS);
        console.log('🔧 Debug mode:', __DEV__);
        
        // Wait a bit for theme to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        
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

  // Debug mode - show simple test screen
  if (DEBUG_MODE) {
    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>🔧 Debug Mode</Text>
        <Text style={styles.debugText}>App is running in debug mode</Text>
        <Text style={styles.debugText}>Platform: {require('react-native').Platform.OS}</Text>
        <Text style={styles.debugText}>Dev: {__DEV__ ? 'Yes' : 'No'}</Text>
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => router.push('/test-simple')}
        >
          <Text style={styles.debugButtonText}>Go to Test Screen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading while initializing or theme is loading
  if (!isReady || !themeContext || themeContext.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.loadingSubtext}>
          {!isReady ? 'Initializing...' : 'Loading theme...'}
        </Text>
      </View>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetails}>{initError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setInitError(null);
            setIsReady(false);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6D6558',
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugContainer: {
    flex: 1,
    backgroundColor: '#F5EEE3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  debugTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 20,
  },
  debugText: {
    fontSize: 16,
    color: '#6D6558',
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
