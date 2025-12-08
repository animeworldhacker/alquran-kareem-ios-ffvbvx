
// Import polyfills FIRST before anything else
// This includes react-native-reanimated initialization
import './app/polyfills';

// Add a small delay to ensure Reanimated is fully initialized
// This is especially important for Expo Go
setTimeout(() => {
  console.log('✅ Starting Expo Router');
}, 0);

// Then import expo-router entry
import 'expo-router/entry';
