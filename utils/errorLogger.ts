
// Global error logging for runtime errors

import { Platform } from 'react-native';

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: number } = {};
const ERROR_DEBOUNCE_MS = 1000;

const clearErrorAfterDelay = (errorKey: string): void => {
  setTimeout(() => {
    delete recentErrors[errorKey];
  }, ERROR_DEBOUNCE_MS);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any): void => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}`;

  // Skip if we've seen this exact error recently
  const now = Date.now();
  if (recentErrors[errorKey] && (now - recentErrors[errorKey]) < ERROR_DEBOUNCE_MS) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = now;
  clearErrorAfterDelay(errorKey);

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent && window.parent !== window) {
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
      // Fallback to console if no parent window or not web
      console.error('🚨 ERROR:', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) {
    return '';
  }

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
}

export const setupErrorLogging = (): void => {
  try {
    // Only setup web-specific error handlers on web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Override window.onerror to catch JavaScript errors
      const originalOnError = window.onerror;
      window.onerror = (message, source, lineno, colno, error): boolean => {
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
        
        // Call original handler if it exists
        if (originalOnError) {
          return originalOnError(message, source, lineno, colno, error);
        }
        
        return false; // Don't prevent default error handling
      };
      
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const errorData = {
          reason: event.reason,
          timestamp: new Date().toISOString()
        };

        console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
        sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
      });
    }

    console.log('✅ Error logging initialized for platform:', Platform.OS);
  } catch (error) {
    console.error('❌ Failed to setup error logging:', error);
  }
};
