
// Import polyfills FIRST before anything else
import './app/polyfills';

// Import and initialize Reanimated BEFORE expo-router
// This is critical for Android to avoid NullPointerException
import 'react-native-gesture-handler';

// Log Reanimated initialization
console.log('✅ Reanimated module loading...');

// Then import expo-router entry
import 'expo-router/entry';
