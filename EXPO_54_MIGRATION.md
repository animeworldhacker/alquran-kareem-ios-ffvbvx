
# Expo 54 Migration Guide

This document outlines the changes made to migrate the Al-Quran Kareem app from Expo SDK 53 to Expo SDK 54.

## Changes Made

### 1. Package.json Updates

#### Core Expo Packages
- **expo**: `~53.0.9` → `~54.0.0`
- **react-native**: `0.79.2` → `0.80.0`

#### Expo Modules (Updated to Expo 54 compatible versions)
- **@expo/config-plugins**: `~10.0.2` → `~11.0.0`
- **@expo/metro-runtime**: `~5.0.4` → `~6.0.0`
- **expo-av**: `^15.1.7` → `^16.0.0`
- **expo-blur**: `^14.1.4` → `^15.0.0`
- **expo-build-properties**: `^1.0.9` → `~1.1.0`
- **expo-clipboard**: `^8.0.7` → `~9.0.0`
- **expo-constants**: `~17.1.6` → `~18.0.0`
- **expo-file-system**: `^19.0.17` → `~20.0.0`
- **expo-font**: `^13.3.1` → `~14.0.0`
- **expo-haptics**: `^14.1.4` → `~15.0.0`
- **expo-image-picker**: `^16.1.4` → `~17.0.0`
- **expo-linear-gradient**: `^14.1.4` → `~15.0.0`
- **expo-linking**: `^7.1.4` → `~8.0.0`
- **expo-router**: `^5.0.7` → `~6.0.0`
- **expo-splash-screen**: `^0.30.8` → `~1.0.0`
- **expo-status-bar**: `~2.2.3` → `~2.3.0`
- **expo-symbols**: `^0.4.4` → `~1.0.0`
- **expo-system-ui**: `^5.0.7` → `~6.0.0`
- **expo-updates**: `^29.0.12` → `~30.0.0`
- **expo-web-browser**: `^14.1.6` → `~15.0.0`

#### React Native Packages
- **react-native-reanimated**: `~3.17.5` → `~3.18.0`
- **react-native-screens**: `~4.10.0` → `~4.11.0`

### 2. Metro Config Updates

Updated `metro.config.js` to enable package exports support (required for Expo 54):

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports support for Expo 54
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

### 3. File System API

The project already uses the legacy file system API (`expo-file-system/legacy`), which is the correct approach for Expo 54. This is used in:
- `services/audioService.ts`

### 4. Configuration Files

#### app.json
No changes required. The configuration is compatible with Expo 54.

#### eas.json
No changes required. The EAS build configuration is compatible with Expo 54.

## Breaking Changes in Expo 54

### 1. Package Exports
Expo 54 introduces better support for package exports. The Metro config has been updated to enable `unstable_enablePackageExports`.

### 2. File System API
Expo 54 changes the file system API. The legacy API is still available via `expo-file-system/legacy` import, which we're already using.

### 3. React Native 0.80
React Native 0.80 includes various improvements and bug fixes. Most changes are internal and shouldn't affect the app's functionality.

## Migration Steps

To complete the migration, follow these steps:

1. **Clean the project**:
   ```bash
   npm run clean
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Clear Expo cache**:
   ```bash
   npx expo start --clear
   ```

4. **Test the app**:
   - Test on iOS simulator/device
   - Test on Android emulator/device
   - Test all major features:
     - Quran reading
     - Audio playback
     - Bookmarks
     - Settings
     - Authentication
     - Offline mode

5. **Rebuild native projects** (if using bare workflow or custom native code):
   ```bash
   npm run build:ios
   npm run build:android
   ```

6. **Update EAS builds**:
   ```bash
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```

## Known Issues and Solutions

### Issue 1: Metro Bundler Errors
**Solution**: Clear the Metro cache with `npx expo start --clear`

### Issue 2: Native Module Not Found
**Solution**: Rebuild the native projects with `npm run build:ios` or `npm run build:android`

### Issue 3: File System Errors
**Solution**: Ensure you're using `expo-file-system/legacy` for file system operations

## Testing Checklist

- [ ] App starts without errors
- [ ] Splash screen displays correctly
- [ ] Authentication works (login, signup, logout)
- [ ] Quran text displays correctly
- [ ] Audio playback works
- [ ] Continuous audio playback works
- [ ] Bookmarks can be added/removed
- [ ] Settings can be changed
- [ ] Offline mode works
- [ ] Data syncs with Supabase when online
- [ ] App works on iOS
- [ ] App works on Android
- [ ] App works on web (if applicable)

## Rollback Plan

If issues arise after migration, you can rollback by:

1. Restore the previous `package.json` from git:
   ```bash
   git checkout HEAD~1 package.json
   ```

2. Restore the previous `metro.config.js`:
   ```bash
   git checkout HEAD~1 metro.config.js
   ```

3. Clean and reinstall:
   ```bash
   npm run clean
   npm install
   ```

## Additional Resources

- [Expo 54 Release Notes](https://expo.dev/changelog/2024/expo-sdk-54)
- [Expo Router 6 Documentation](https://docs.expo.dev/router/introduction/)
- [React Native 0.80 Release Notes](https://reactnative.dev/blog/2024/12/03/release-0.80)
- [Expo File System Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)

## Support

If you encounter any issues during or after migration, please:
1. Check the Expo documentation
2. Search for similar issues on GitHub
3. Ask for help in the Expo Discord community
4. Create an issue in the project repository
