
// Global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 100);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${JSON.stringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'expo-template'
      }, '*');
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  try {
    const stack = new Error().stack || '';
    const lines = stack.split('\n');

    // Skip the first few lines (Error, getCallerInfo, console override)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.indexOf('app/') !== -1 || line.indexOf('components/') !== -1 || line.indexOf('.tsx') !== -1 || line.indexOf('.ts') !== -1) {
        const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
        if (match) {
          return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
        }
      }
    }
  } catch (error) {
    console.error('Error getting caller info:', error);
  }

  return '';
};

export const setupErrorLogging = () => {
  console.log('🔧 Setting up error logging...');

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        const sourceFile = source ? source.split('/').pop() : 'unknown';
        const errorData = {
          message: message,
          source: `${sourceFile}:${lineno}:${colno}`,
          line: lineno,
          column: colno,
          error: error?.stack || error,
          timestamp: new Date().toISOString()
        };

        console.error('🚨 RUNTIME ERROR:', errorData);
        sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }

      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      
      return false; // Don't prevent default error handling
    };

    // Capture unhandled promise rejections (Web only)
    if (Platform.OS === 'web') {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        try {
          const errorData = {
            reason: event.reason,
            promise: event.promise,
            stack: event.reason?.stack || 'No stack trace',
            timestamp: new Date().toISOString()
          };

          console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
          sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
        } catch (handlerError) {
          console.error('Error in rejection handler:', handlerError);
        }
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
  }

  // For React Native, set up native error handlers
  if (Platform.OS !== 'web' && typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      try {
        console.error('🚨 NATIVE ERROR:', {
          error,
          isFatal,
          message: error?.message,
          stack: error?.stack,
          timestamp: new Date().toISOString()
        });

        sendErrorToParent('error', 'Native Error', {
          message: error?.message,
          stack: error?.stack,
          isFatal
        });
      } catch (handlerError) {
        console.error('Error in native error handler:', handlerError);
      }

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }

  console.log('✅ Error logging initialized');
};
