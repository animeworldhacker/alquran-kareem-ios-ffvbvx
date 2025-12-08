
// This file contains all polyfills needed for the app
// It should be imported at the very beginning of the app

// URL polyfill for React Native (required for Supabase)
import 'react-native-url-polyfill/auto';

// Initialize react-native-reanimated
// This MUST be done before any other imports that use Reanimated
import 'react-native-reanimated';

// Log that polyfills are loaded
console.log('✅ Polyfills loaded');
console.log('✅ Reanimated initialized');
