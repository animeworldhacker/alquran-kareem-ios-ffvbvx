
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import OfflineNotice from '../components/OfflineNotice';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(error => {
  console.error('Error preventing splash screen auto-hide:', error);
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    async function hideSplash() {
      try {
        // Wait for fonts to load or error
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.error('❌ Font loading error:', fontError);
            // Continue anyway - app will use system fonts
          } else {
            console.log('✅ Fonts loaded successfully');
          }
          
          // Hide splash screen
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden');
        }
      } catch (error) {
        console.error('❌ Error hiding splash screen:', error);
      }
    }

    hideSplash();
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded or errored
  if (!fontsLoaded && !fontError) {
    return null;
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
                  gestureEnabled: true,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
