
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import AppErrorHandler from '../components/AppErrorHandler';
import OfflineNotice from '../components/OfflineNotice';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Updates from 'expo-updates';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(error => {
  console.error('Error preventing splash screen auto-hide:', error);
});

// Setup error logging as early as possible
try {
  setupErrorLogging();
  console.log('✅ Error logging initialized');
} catch (error) {
  console.error('❌ Failed to setup error logging:', error);
}

// Disable expo-updates in development
if (__DEV__) {
  console.log('🔧 Development mode: Expo Updates disabled');
}

function RootLayoutContent() {
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });
  
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('🚀 Preparing app...');
        
        // Check if we're running in Expo Go or development build
        if (!Updates.isEmbeddedLaunch && !__DEV__) {
          console.log('📦 Checking for updates...');
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              console.log('⬇️ Downloading update...');
              await Updates.fetchUpdateAsync();
              console.log('🔄 Reloading with new update...');
              await Updates.reloadAsync();
            } else {
              console.log('✅ App is up to date');
            }
          } catch (updateError) {
            console.warn('⚠️ Update check failed, continuing with cached version:', updateError);
            // Continue with app launch even if update fails
          }
        } else {
          console.log('🔧 Running in development mode or Expo Go - skipping updates');
        }
        
        // Wait for fonts to load or error
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.error('❌ Font loading error:', fontError);
            // Continue anyway - app will use system fonts
          } else {
            console.log('✅ Fonts loaded successfully');
          }
          
          // Small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Hide splash screen
          try {
            await SplashScreen.hideAsync();
            console.log('✅ Splash screen hidden');
          } catch (error) {
            console.error('❌ Error hiding splash screen:', error);
          }
          
          // Mark app as ready
          setAppReady(true);
          console.log('✅ App ready');
        }
      } catch (error) {
        console.error('❌ Error preparing app:', error);
        // Even if there's an error, mark app as ready to show error boundary
        setAppReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Show loading screen while fonts are loading
  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  // Show error if fonts failed to load (but still allow app to continue)
  if (fontError) {
    console.warn('⚠️ Continuing without custom fonts due to error:', fontError);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <View style={styles.container}>
              <OfflineNotice />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="home" options={{ headerShown: false }} />
                <Stack.Screen name="surah/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="tafsir/[surah]/[ayah]" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
                <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
              </Stack>
            </View>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AppErrorHandler>
      <RootLayoutContent />
    </AppErrorHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    fontWeight: '600',
  },
});
