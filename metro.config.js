
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports support for Expo 54
config.resolver.unstable_enablePackageExports = true;

// Ensure proper source extensions - ADD .mjs support
config.resolver.sourceExts = [
  'expo.ts',
  'expo.tsx',
  'expo.js',
  'expo.jsx',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'wasm',
  'svg',
  'mjs',
  'cjs',
];

// Add asset extensions
config.resolver.assetExts = [
  'glb',
  'gltf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ttf',
  'otf',
  'mp4',
  'mp3',
  'wav',
  'm4a',
];

module.exports = config;
