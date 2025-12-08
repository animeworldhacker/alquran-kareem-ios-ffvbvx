
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

// Ensure proper transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Add watchFolders if needed
config.watchFolders = [__dirname];

// Fix for getDevServer error - disable WebSocket connection in dev mode
// This is a workaround for Expo SDK 54 Metro bundler issue
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return middleware;
  },
};

module.exports = config;
