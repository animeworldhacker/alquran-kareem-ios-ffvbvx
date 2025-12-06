
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Enable package exports support for Expo 54
config.resolver.unstable_enablePackageExports = true;

// Ensure proper source extensions
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

// Ensure transformer is properly configured
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('expo/metro-config/babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Server configuration - this is critical for fixing the getDevServer error
config.server = {
  ...config.server,
  port: 8081,
  // Ensure the server is properly initialized
  enhanceMiddleware: (middleware, metroServer) => {
    return middleware;
  },
};

// Watchman configuration
config.watchFolders = [projectRoot];

// Reset cache configuration
config.resetCache = true;

module.exports = config;
