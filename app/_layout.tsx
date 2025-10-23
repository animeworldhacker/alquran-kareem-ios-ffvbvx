
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
  console.log('🔧 Setting up global error handlers...');

  // Handle unhandled promise rejections (Web)
  if (typeof window !== 'undefined') {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled Promise Rejection (Web):', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack || 'No stack trace'
      });
      
      // Prevent the default behavior (which would crash the app)
      event.preventDefault();
      
      // Log detailed error information
      if (event.reason instanceof Error) {
        console.error('Error message:', event.reason.message);
        console.error('Error stack:', event.reason.stack);
      } else {
        console.error('Rejection reason:', event.reason);
      }
      
      return true;
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Add global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Uncaught Error (Web):', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      event.preventDefault();
      return true;
    };
    
    window.addEventListener('error', handleError);

    console.log('✅ Web error handlers registered');
  }

  // For React Native (non-web), set up a global error handler
  if (Platform.OS !== 'web') {
    // Track unhandled promise rejections
    const rejectionTracking = {
      allRejections: new Map<Promise<any>, any>(),
      onUnhandled: (id: any, error: any) => {
        console.error('🚨 Unhandled Promise Rejection (Native):', {
          id,
          error,
          stack: error?.stack || 'No stack trace'
        });
      },
      onHandled: (id: any) => {
        console.log('✅ Promise rejection was handled:', id);
      }
    };

    // Set up promise rejection tracking
    if (typeof global !== 'undefined') {
      // Override the global promise rejection handler
      const originalPromise = global.Promise;
      
      if (originalPromise && !global.__promiseRejectionTrackingInstalled) {
        global.__promiseRejectionTrackingInstalled = true;

        // Enable promise rejection tracking
        if (typeof (global as any).HermesInternal !== 'undefined') {
          // Hermes engine
          (global as any).HermesInternal?.enablePromiseRejectionTracker?.({
            allRejections: rejectionTracking.allRejections,
            onUnhandled: rejectionTracking.onUnhandled,
            onHandled: rejectionTracking.onHandled
          });
          console.log('✅ Hermes promise rejection tracking enabled');
        } else {
          // JSC or other engines - use polyfill
          const originalThen = originalPromise.prototype.then;
          const originalCatch = originalPromise.prototype.catch;

          originalPromise.prototype.then = function(onFulfilled, onRejected) {
            return originalThen.call(this, onFulfilled, (error: any) => {
              if (onRejected) {
                return onRejected(error);
              } else {
                // Unhandled rejection
                setTimeout(() => {
                  console.error('🚨 Unhandled Promise Rejection (JSC):', error);
                }, 0);
                throw error;
              }
            });
          };

          originalPromise.prototype.catch = function(onRejected) {
            return originalCatch.call(this, (error: any) => {
              if (onRejected) {
                return onRejected(error);
              } else {
                console.error('🚨 Unhandled Promise Rejection in catch:', error);
                throw error;
              }
            });
          };

          console.log('✅ JSC promise rejection tracking enabled');
        }
      }
    }

    // Set up global error handler for uncaught exceptions
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      
      ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
        console.error('🚨 Global Error Handler:', {
          error,
          isFatal,
          message: error?.message,
          stack: error?.stack
        });

        // Call original handler if it exists
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });

      console.log('✅ Native global error handler registered');
    }
  }

  console.log('✅ All error handlers initialized');
};

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app...');
        
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
            console.error('⚠️ Error accessing localStorage:', storageError);
          }
        }

        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ Error in RootLayout initialization:', error);
      }
    };

    // Initialize with proper error handling
    initializeApp().catch(error => {
      console.error('❌ Failed to initialize app:', error);
    });

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        // Note: We don't remove the listeners as they need to persist
        console.log('🧹 RootLayout cleanup');
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
    console.error('⚠️ Error calculating insets:', error);
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
