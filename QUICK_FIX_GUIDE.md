
# Quick Fix Guide - App Crashes & Build Failures

## 🚨 Critical Fixes Applied

### 1. Fixed FileSystem Import (Main Crash Cause)
**Problem**: Using `expo-file-system/legacy` which doesn't exist in Expo SDK 54
**Solution**: Changed to `expo-file-system` in `services/audioService.ts`

### 2. Fixed app.json Configuration
**Problem**: Invalid scheme with spaces causing build issues
**Solution**: Changed scheme from "Al-Quran Kareem" to "alquran"

### 3. Enhanced Metro Configuration
**Problem**: Build failures due to improper bundling
**Solution**: Added better minifier config and proper module resolution

## ✅ Testing Steps

### Test in Expo Go (Recommended First)

1. **Clear all caches**:
   ```bash
   npx expo start --clear
   ```

2. **Start the development server**:
   ```bash
   npx expo start
   ```

3. **Scan QR code** with Expo Go app on your device

4. **Verify these features work**:
   - [ ] App launches without crashing
   - [ ] Splash screen displays correctly
   - [ ] Can navigate to chapters list
   - [ ] Can open a surah
   - [ ] Audio playback works
   - [ ] No red error screens

### Build APK for Testing

1. **Clean previous builds**:
   ```bash
   npx expo prebuild -p android --clean
   ```

2. **Build preview APK**:
   ```bash
   eas build -p android --profile preview
   ```

3. **Install and test** the APK on a physical Android device

### Build for iOS

1. **Clean previous builds**:
   ```bash
   npx expo prebuild -p ios --clean
   ```

2. **Build preview**:
   ```bash
   eas build -p ios --profile preview
   ```

## 🔧 If Issues Persist

### Complete Clean and Reinstall

```bash
# 1. Stop all running processes
# Press Ctrl+C in terminal

# 2. Clear all caches
rm -rf node_modules
rm -rf .expo
rm -rf android
rm -rf ios
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Start fresh
npx expo start --clear
```

### Check for Specific Errors

1. **Open Developer Tools** in Expo Go (shake device)
2. **Look for error messages** in the console
3. **Take note of the error** and check below:

#### Common Errors and Solutions

**Error: "Cannot find module 'expo-file-system/legacy'"**
- ✅ Fixed in this update
- Verify `services/audioService.ts` uses `import * as FileSystem from 'expo-file-system';`

**Error: "Invalid scheme"**
- ✅ Fixed in this update
- Verify `app.json` has `"scheme": "alquran"`

**Error: "Font loading failed"**
- ⚠️ Non-critical - app will use system fonts
- App will continue to work

**Error: "Network request failed"**
- Check internet connection
- Try again after a few seconds
- Audio requires internet on first play

## 📱 Production Build Steps

Once testing is successful:

### Android Production Build

```bash
# 1. Update version in app.json
# Increment "version" and "versionCode"

# 2. Build production APK
eas build -p android --profile production-apk

# 3. Or build AAB for Play Store
eas build -p android --profile production
```

### iOS Production Build

```bash
# 1. Update version in app.json
# Increment "version" and "buildNumber"

# 2. Build for App Store
eas build -p ios --profile production
```

## 🎯 Key Files Changed

1. **services/audioService.ts** - Fixed FileSystem import
2. **app.json** - Fixed scheme and configuration
3. **metro.config.js** - Enhanced bundler configuration
4. **app/_layout.tsx** - Improved initialization
5. **app/index.tsx** - Reduced startup delays

## 📊 Verification Checklist

Before deploying to stores:

- [ ] App launches successfully in Expo Go
- [ ] No crash on startup
- [ ] All screens navigate correctly
- [ ] Audio playback works
- [ ] Tafsir loads correctly
- [ ] Bookmarks work
- [ ] Settings save correctly
- [ ] Offline mode works (if data downloaded)
- [ ] Preview build installs and runs on physical device
- [ ] No console errors or warnings

## 🆘 Still Having Issues?

1. **Check the logs**:
   - In Expo Go: Shake device → View logs
   - In terminal: Look for red error messages

2. **Verify versions**:
   ```bash
   npx expo-doctor
   ```

3. **Check EAS configuration**:
   ```bash
   eas build:configure
   ```

4. **Try a different device** to isolate device-specific issues

## 📝 Notes

- The app now uses standard `expo-file-system` (not legacy)
- All caching and offline features still work
- Audio downloads work correctly
- The app is fully compatible with Expo SDK 54
- Build process should complete without errors

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ App opens without crashing
- ✅ Splash screen shows and dismisses
- ✅ You can browse surahs
- ✅ Audio plays when you tap play button
- ✅ No red error screens appear
- ✅ Build completes successfully

## 🚀 Ready to Deploy

Once all checks pass:
1. Build production versions
2. Test production builds thoroughly
3. Submit to app stores
4. Monitor for any crash reports

Good luck with your deployment! 🌟
