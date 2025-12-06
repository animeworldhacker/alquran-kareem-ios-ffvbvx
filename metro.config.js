
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports support for Expo 54
config.resolver.unstable_enablePackageExports = true;

// Ensure proper source extensions - ADD .mjs and .cjs support
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

// Add node modules that need to be transformed
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let Metro handle the resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure proper transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
