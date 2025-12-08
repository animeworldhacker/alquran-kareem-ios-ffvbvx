
# Deployment Checklist

## Pre-Deployment Checks

### 1. Code Quality ✅
- [x] All TypeScript errors resolved
- [x] No console errors in development
- [x] Error boundaries in place
- [x] Proper error logging implemented

### 2. Configuration ✅
- [x] `app.json` properly configured
- [x] No EAS project ID in `extra` field
- [x] Bundle identifiers set correctly
- [x] Version numbers updated

### 3. Dependencies ✅
- [x] All dependencies installed
- [x] No conflicting versions
- [x] Peer dependencies satisfied

### 4. Testing ✅
- [ ] Tested in Expo Go
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Tested offline functionality
- [ ] Tested error scenarios

## Deployment Steps

### Step 1: Clean Build
```bash
# Clear all caches
npm run clean

# Reinstall dependencies
npm install

# Verify installation
npm run doctor
```

### Step 2: Test in Expo Go
```bash
# Start development server
npm run dev

# Scan QR code with Expo Go
# Verify app loads and works correctly
```

### Step 3: Create EAS Build (if needed)
```bash
# Login to EAS
eas login

# Configure EAS (if not already done)
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### Step 4: Test Production Build
- Download and install the build on a physical device
- Test all features thoroughly
- Verify offline functionality
- Check error handling

### Step 5: Submit to App Stores

#### iOS App Store
```bash
eas submit --platform ios
```

Requirements:
- Apple Developer account
- App Store Connect app created
- Screenshots prepared
- App description ready

#### Google Play Store
```bash
eas submit --platform android
```

Requirements:
- Google Play Developer account
- App listing created
- Screenshots prepared
- App description ready

## Post-Deployment

### Monitor
- Check crash reports
- Monitor user feedback
- Track analytics (if implemented)

### Update
- Fix any reported issues
- Increment version numbers
- Create new builds
- Submit updates

## Quick Commands

```bash
# Development
npm run dev                    # Start with tunnel
npm start                      # Start normally
npm run start:clear           # Start with cache cleared

# Building
npm run build:ios             # Prebuild iOS
npm run build:android         # Prebuild Android

# Maintenance
npm run clean                 # Clean caches
npm run reset                 # Full reset
npm run doctor                # Check health

# Quality
npm run lint                  # Check linting
npm run typecheck             # Check types
npm run validate              # Run all checks
```

## Troubleshooting

### Expo Go Issues
- Clear Expo Go cache
- Restart Expo Go app
- Check network connection
- Verify QR code scanning

### Build Issues
- Run `eas build:configure` again
- Check `eas.json` configuration
- Verify credentials
- Check build logs

### Submission Issues
- Verify app metadata
- Check screenshots meet requirements
- Ensure privacy policy is set
- Verify bundle identifiers match

## Important Files

- `app.json` - Main configuration
- `eas.json` - EAS build configuration
- `package.json` - Dependencies and scripts
- `babel.config.js` - Babel configuration
- `metro.config.js` - Metro bundler configuration

## Version Management

Current versions:
- App Version: 1.0.1
- iOS Build Number: 1
- Android Version Code: 3

To update:
1. Update `version` in `app.json`
2. Update `buildNumber` (iOS) in `app.json`
3. Update `versionCode` (Android) in `app.json`

## Support Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Guidelines](https://play.google.com/about/developer-content-policy/)
