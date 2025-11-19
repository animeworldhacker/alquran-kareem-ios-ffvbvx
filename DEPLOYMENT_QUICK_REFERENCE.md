
# Deployment Quick Reference

## Initial Setup (One-time)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure Apple credentials
eas credentials
```

## Building

```bash
# Build for iOS (Production)
eas build --platform ios --profile production

# Build for iOS (Preview/TestFlight)
eas build --platform ios --profile preview

# Build for Android (Production)
eas build --platform android --profile production

# Build for both platforms
eas build --platform all --profile production
```

## Submitting

```bash
# Submit iOS to App Store
eas submit --platform ios --profile production

# Submit Android to Play Store
eas submit --platform android --profile production
```

## Monitoring

```bash
# View build status
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel a build
eas build:cancel [BUILD_ID]
```

## Troubleshooting

```bash
# Check project configuration
npx expo-doctor

# Clear caches
npm run clean
npm install

# View credentials
eas credentials

# Update credentials
eas credentials --platform ios
```

## Pre-Build Checklist

- [ ] Update version in app.json if needed
- [ ] Run `npm run typecheck` - no errors
- [ ] Run `npm run lint` - no errors
- [ ] Test locally with `npm run ios`
- [ ] Verify bundle identifier matches App Store Connect
- [ ] Ensure EAS project ID is correct in app.json
- [ ] Check that all required assets exist (icon, splash screen)

## Post-Build Checklist

- [ ] Build completed successfully
- [ ] Download and test the .ipa file
- [ ] Submit to App Store Connect
- [ ] Fill in app metadata
- [ ] Add screenshots
- [ ] Submit for review

## Important URLs

- **EAS Dashboard**: https://expo.dev/accounts/[your-account]/projects/alquran-kareem
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

## Current Configuration

- **Bundle ID (iOS)**: com.quranapp.alkareem
- **Package Name (Android)**: com.quranapp.alkareem
- **EAS Project ID**: veaigefhopjggahseszb
- **Scheme**: alquran
- **Version**: 1.0.0
- **Build Number**: Auto-incremented

## Common Issues

### "Unknown custom build error"
→ Check bundle identifier and EAS project ID

### "No provisioning profile"
→ Run `eas credentials` and add new profile

### "Build timeout"
→ Check for large assets or dependencies

### "Invalid icon"
→ Ensure icon is 1024x1024 PNG without transparency
