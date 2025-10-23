
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  useEffect(() => {
    try {
      setupErrorLogging();

      // Add global promise rejection handler
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('🚨 Unhandled Promise Rejection:', event.reason);
        console.error('Promise:', event.promise);
        
        // Prevent the default behavior (which would crash the app)
        event.preventDefault();
        
        // Log the error for debugging
        if (event.reason instanceof Error) {
          console.error('Error message:', event.reason.message);
          console.error('Error stack:', event.reason.stack);
        }
      };

      // Add event listener for unhandled promise rejections
      if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
      }

      if (Platform.OS === 'web') {
        if (emulate) {
          localStorage.setItem(STORAGE_KEY, emulate);
          setStoredEmulate(emulate);
        } else {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setStoredEmulate(stored);
          }
        }
      }

      // Cleanup
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        }
      };
    } catch (error) {
      console.error('Error in RootLayout useEffect:', error);
    }
  }, [emulate]);

  let insetsToUse = actualInsets;

  try {
    if (Platform.OS === 'web') {
      const simulatedInsets = {
        ios: { top: 47, bottom: 20, left: 0, right: 0 },
        android: { top: 40, bottom: 0, left: 0, right: 0 },
      };

      const deviceToEmulate = storedEmulate || emulate;
      insetsToUse = deviceToEmulate ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
    }
  } catch (error) {
    console.error('Error calculating insets:', error);
    insetsToUse = actualInsets;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1, display: 'contents' as any }}>
            <SafeAreaView style={[commonStyles.wrapper, {
                paddingTop: insetsToUse.top,
                paddingBottom: insetsToUse.bottom,
                paddingLeft: insetsToUse.left,
                paddingRight: insetsToUse.right,
             }]}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'default',
                }}
              />
            </SafeAreaView>
          </GestureHandlerRootView>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
