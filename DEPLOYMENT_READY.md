
# App Store Deployment Checklist

## ✅ Fixed Issues

### 1. Android Package Name Error - FIXED
- **Problem**: Package name contained hyphen: `com.animeworldhacker.al-qurankareem`
- **Solution**: Changed to valid format: `com.animeworldhacker.alqurankareem`
- **Note**: Android package names can only contain alphanumeric characters, dots (.), and underscores (_)

## 📱 App Store Deployment Steps

### Prerequisites
1. **Commit all changes to Git**
   ```bash
   git add .
   git commit -m "Fix Android package name and prepare for deployment"
   git push
   ```

2. **Install EAS CLI** (if not already installed)
   ```bash
   npm install -g eas-cli
   ```

3. **Login to Expo**
   ```bash
   eas login
   ```

4. **Configure EAS Project**
   ```bash
   eas build:configure
   ```

### Android Deployment

#### Build APK for Testing
```bash
eas build -p android --profile preview
```

#### Build AAB for Google Play Store
```bash
eas build -p android --profile production
```

#### Submit to Google Play Store
1. Create a Google Play Console account
2. Create a new app in the console
3. Generate a service account key JSON file
4. Update `eas.json` with the path to your service account key
5. Run:
```bash
eas submit -p android --profile production
```

### iOS Deployment

#### Build for TestFlight
```bash
eas build -p ios --profile preview
```

#### Build for App Store
```bash
eas build -p ios --profile production
```

#### Submit to App Store
1. Enroll in Apple Developer Program ($99/year)
2. Create an App Store Connect account
3. Create a new app in App Store Connect
4. Update `eas.json` with your Apple ID, ASC App ID, and Team ID
5. Run:
```bash
eas submit -p ios --profile production
```

## 🔧 Configuration Updates Made

### app.json
- ✅ Fixed Android package name (removed hyphen)
- ✅ Added iOS privacy descriptions
- ✅ Configured adaptive icon for Android
- ✅ Set proper permissions
- ✅ Added deep linking configuration
- ✅ Set proper iOS deployment target (15.1)
- ✅ Configured Android SDK versions (min: 23, target: 34)

### eas.json
- ✅ Added production-apk profile for APK builds
- ✅ Configured proper Gradle commands
- ✅ Set up auto-increment for version codes
- ✅ Added resource class for iOS builds
- ✅ Configured submit profiles for both platforms

## 📋 Before Submitting to Stores

### Required Assets
- ✅ App icon (1024x1024 for iOS, adaptive icon for Android)
- ✅ Splash screen
- ⚠️ Screenshots for all device sizes (required by stores)
- ⚠️ App preview video (optional but recommended)

### Required Information
- ⚠️ App description (short and full)
- ⚠️ Keywords for search optimization
- ⚠️ Privacy policy URL (REQUIRED)
- ⚠️ Support URL or email
- ⚠️ Marketing URL (optional)
- ⚠️ Age rating information
- ⚠️ Content rating questionnaire (Google Play)

### Legal Requirements
- ⚠️ Privacy Policy (MUST be hosted online)
- ⚠️ Terms of Service (recommended)
- ⚠️ Copyright information
- ⚠️ Data collection disclosure

### Testing Checklist
- ✅ Test on physical Android device
- ✅ Test on physical iOS device
- ✅ Test all features work offline
- ✅ Test audio playback
- ✅ Test bookmarks functionality
- ✅ Test Tafsir display
- ✅ Test reciter selection
- ✅ Test settings persistence
- ✅ Test app in both light and dark mode
- ✅ Test app rotation (if supported)

## 🚀 Build Commands Reference

### Development Builds
```bash
# Android APK (development)
eas build -p android --profile development

# iOS Simulator
eas build -p ios --profile development
```

### Preview Builds (Internal Testing)
```bash
# Android APK
eas build -p android --profile preview

# iOS TestFlight
eas build -p ios --profile preview
```

### Production Builds
```bash
# Android AAB (Google Play)
eas build -p android --profile production

# Android APK (Direct distribution)
eas build -p android --profile production-apk

# iOS App Store
eas build -p ios --profile production
```

### Clean Build (if issues occur)
```bash
# Clear Expo cache
expo clean

# Clear EAS build cache
eas build -p android --profile production --clear-cache
eas build -p ios --profile production --clear-cache
```

## 📝 Store Listing Tips

### App Title
- Keep it under 30 characters
- Make it descriptive and searchable
- Current: "Al-Quran Kareem"

### Short Description (Google Play)
- Maximum 80 characters
- Highlight main features
- Example: "Read Quran with Tafsir Ibn Kathir & audio recitations. Offline support."

### Full Description
- Highlight key features:
  - Complete Quran in Uthmani script
  - Ibn Kathir Tafsir
  - Multiple reciters with audio
  - Offline reading and listening
  - Bookmarks and reading progress
  - Beautiful Arabic typography
  - Light and dark mode
  - Dedicated to Maryam Sulaiman, Ahmad Jasim, Shaikha Ahmad, Rashid Badr

### Keywords (iOS)
- quran, koran, islam, muslim, tafsir, recitation, audio, arabic
- Maximum 100 characters total

### Categories
- iOS: Reference, Books
- Android: Books & Reference

## ⚠️ Important Notes

1. **First Build**: The first build may take 15-30 minutes
2. **Version Management**: EAS will auto-increment build numbers in production
3. **Credentials**: EAS will manage signing credentials automatically
4. **Testing**: Always test preview builds before submitting to stores
5. **Review Time**: 
   - Google Play: 1-3 days typically
   - Apple App Store: 1-3 days typically (can be longer)
6. **Rejections**: Be prepared to address any issues raised during review

## 🔐 Security Checklist

- ✅ No hardcoded API keys in source code
- ✅ Using environment variables for sensitive data
- ✅ HTTPS for all network requests
- ✅ Proper error handling
- ✅ No console.logs with sensitive data in production

## 📞 Support

If you encounter issues:
1. Check EAS build logs: `eas build:list`
2. View specific build: `eas build:view [build-id]`
3. Check Expo documentation: https://docs.expo.dev
4. Check EAS Build documentation: https://docs.expo.dev/build/introduction/

## 🎉 Ready to Deploy!

Your app is now configured and ready for app store deployment. Follow the steps above to build and submit your app to Google Play Store and Apple App Store.

**Next Steps:**
1. Commit all changes to Git
2. Run `eas build -p android --profile preview` to test
3. Once verified, run production builds
4. Prepare store listings and assets
5. Submit to stores!

Good luck with your app launch! 🚀
