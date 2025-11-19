
# iOS Build Troubleshooting Guide

## Issues Fixed

### 1. Missing EAS Project ID
**Problem**: The `app.json` had a placeholder `"your-project-id-here"` instead of the actual project ID.
**Solution**: Updated to use the correct project ID: `veaigefhopjggahseszb`

### 2. Duplicate Scheme Definition
**Problem**: The scheme was defined twice in `app.json` (both inside and outside the expo object).
**Solution**: Removed the duplicate definition outside the expo object.

### 3. Missing iOS Build Configuration
**Problem**: The `eas.json` lacked proper iOS-specific build settings.
**Solution**: Added comprehensive build configurations for development, preview, and production.

### 4. Missing Build Properties Plugin
**Problem**: The app needed the `expo-build-properties` plugin for proper iOS builds.
**Solution**: Added the plugin to `app.json` and installed the dependency.

## Steps to Deploy to App Store

### Prerequisites
1. **Apple Developer Account**: You need an active Apple Developer Program membership ($99/year)
2. **EAS CLI**: Install with `npm install -g eas-cli`
3. **Login to EAS**: Run `eas login`

### Step 1: Configure Your Apple Credentials
```bash
eas credentials
```
Select iOS, then follow the prompts to:
- Add your Apple ID
- Add your Apple Team ID
- Configure distribution certificate
- Configure provisioning profile

### Step 2: Update eas.json Submit Configuration
In `eas.json`, update the submit.production.ios section with your actual values:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-actual-apple-id@example.com",
      "ascAppId": "your-app-store-connect-app-id",
      "appleTeamId": "your-10-character-team-id"
    }
  }
}
```

### Step 3: Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: Al-Quran Kareem
   - Primary Language: Arabic or English
   - Bundle ID: com.quranapp.alkareem (must match app.json)
   - SKU: A unique identifier (e.g., alquran-kareem-001)
4. Note the App Store Connect App ID (numeric, like 1234567890)

### Step 4: Build for Production
```bash
eas build --platform ios --profile production
```

This will:
- Upload your code to EAS servers
- Build the iOS app
- Sign it with your distribution certificate
- Create an .ipa file

### Step 5: Submit to App Store
After the build completes successfully:
```bash
eas submit --platform ios --profile production
```

Or submit manually:
1. Download the .ipa from the EAS build page
2. Use Transporter app (from Mac App Store) to upload to App Store Connect
3. Go to App Store Connect and complete the app information
4. Submit for review

## Common Build Errors and Solutions

### Error: "Unknown custom build error"
**Causes**:
- Missing or incorrect bundle identifier
- Invalid provisioning profile
- Missing required capabilities
- Incorrect EAS project ID

**Solutions**:
- Verify bundle identifier matches in app.json and App Store Connect
- Run `eas credentials` to reconfigure
- Check that all required info is in app.json

### Error: "No valid code signing identity found"
**Solution**:
```bash
eas credentials
# Select "iOS" → "Distribution Certificate" → "Add new"
```

### Error: "No provisioning profile found"
**Solution**:
```bash
eas credentials
# Select "iOS" → "Provisioning Profile" → "Add new"
```

### Error: "Bundle identifier mismatch"
**Solution**:
- Ensure `ios.bundleIdentifier` in app.json matches the one in App Store Connect
- Current value: `com.quranapp.alkareem`

### Error: "Missing required icon sizes"
**Solution**:
- Ensure your icon is at least 1024x1024 pixels
- Use a PNG file without transparency
- Update the icon path in app.json if needed

## App Store Review Checklist

### Required Information
- [ ] App name and description (in Arabic and English)
- [ ] Screenshots (required for all supported device sizes)
- [ ] App icon (1024x1024 PNG)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App category
- [ ] Age rating

### App Metadata
- [ ] Keywords for search optimization
- [ ] Promotional text
- [ ] What's new in this version

### Privacy Information
Since your app:
- Plays audio: Declare audio usage
- Uses network: Declare network usage
- Has user accounts (Supabase): Declare data collection practices

### Testing Notes for Reviewers
Provide test account credentials if your app requires login.

## Debugging Build Issues

### View Build Logs
1. Go to https://expo.dev
2. Navigate to your project
3. Click on "Builds"
4. Click on the failed build
5. Expand the "Build iOS app" section to see detailed logs

### Local Testing Before Build
```bash
# Run iOS simulator locally
npm run ios

# Check for TypeScript errors
npm run typecheck

# Check for linting errors
npm run lint

# Run Expo doctor to check for issues
npm run doctor
```

### Clear Cache and Rebuild
```bash
# Clear all caches
npm run clean

# Reinstall dependencies
npm install

# Clear Expo cache
expo start --clear
```

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [Expo Forums](https://forums.expo.dev/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)

## Next Steps

1. Run `eas build --platform ios --profile production` to create a new build
2. Monitor the build progress on https://expo.dev
3. If the build succeeds, proceed with submission
4. If it fails, check the build logs and refer to this guide

## Important Notes

- **Build Number**: Automatically incremented with each build (autoIncrement: true)
- **Version**: Update in app.json when releasing new features (currently 1.0.0)
- **Scheme**: Used for deep linking (alquran://)
- **Background Audio**: Configured in infoPlist for Quran recitation playback
