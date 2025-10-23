
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

// Global promise rejection handler for all platforms
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: any) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason || event);
    
    // Prevent the default behavior (which would crash the app)
    if (event.preventDefault) {
      event.preventDefault();
    }
    
    // Log the error for debugging
    if (event.reason instanceof Error) {
      console.error('Error message:', event.reason.message);
      console.error('Error stack:', event.reason.stack);
    } else if (event.reason) {
      console.error('Rejection reason:', event.reason);
    }
    
    // Return true to mark as handled
    return true;
  };

  // Add event listener for unhandled promise rejections (web)
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }

  // Add global error handler for uncaught errors
  if (typeof window !== 'undefined') {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Uncaught Error:', event.error || event.message);
      event.preventDefault();
      return true;
    };
    window.addEventListener('error', handleError);
  }

  // For React Native (non-web), set up a global error handler
  if (Platform.OS !== 'web') {
    // Override the global Promise rejection handler
    const originalHandler = global.Promise.prototype.catch;
    
    // Add a default catch handler to all promises
    if (typeof global !== 'undefined' && global.Promise) {
      // Track if we've already set up the handler
      if (!(global as any).__promiseRejectionHandlerSet) {
        (global as any).__promiseRejectionHandlerSet = true;
        
        // Set up tracking for unhandled rejections
        const unhandledRejections = new Set();
        
        // Override Promise constructor to track rejections
        const OriginalPromise = global.Promise;
        (global as any).Promise = class extends OriginalPromise {
          constructor(executor: any) {
            super((resolve: any, reject: any) => {
              return executor(
                resolve,
                (error: any) => {
                  // Track this rejection
                  const rejectionId = Symbol('rejection');
                  unhandledRejections.add(rejectionId);
                  
                  // Remove from unhandled after a tick if it gets handled
                  Promise.resolve().then(() => {
                    setTimeout(() => {
                      if (unhandledRejections.has(rejectionId)) {
                        console.error('🚨 Unhandled Promise Rejection (Native):', error);
                        unhandledRejections.delete(rejectionId);
                      }
                    }, 100);
                  });
                  
                  return reject(error);
                }
              );
            });
            
            // Mark rejections as handled when .catch() is called
            const originalCatch = this.catch.bind(this);
            this.catch = function(onRejected: any) {
              return originalCatch(onRejected);
            };
          }
        };
      }
    }
  }
};

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set up error logging first
        setupErrorLogging();
        
        // Set up global error handlers
        setupGlobalErrorHandlers();
        
        console.log('✅ Error handlers initialized');

        // Handle web-specific storage
        if (Platform.OS === 'web') {
          try {
            if (emulate) {
              localStorage.setItem(STORAGE_KEY, emulate);
              setStoredEmulate(emulate);
            } else {
              const stored = localStorage.getItem(STORAGE_KEY);
              if (stored) {
                setStoredEmulate(stored);
              }
            }
          } catch (storageError) {
            console.error('Error accessing localStorage:', storageError);
          }
        }
      } catch (error) {
        console.error('Error in RootLayout initialization:', error);
      }
    };

    initializeApp().catch(error => {
      console.error('Failed to initialize app:', error);
    });

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        // Remove event listeners on cleanup
        window.removeEventListener('unhandledrejection', () => {});
        window.removeEventListener('error', () => {});
      }
    };
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
