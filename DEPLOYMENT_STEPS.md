
# Deployment Steps for Al-Quran Kareem iOS App

## Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged into Expo: `eas login`
- Apple Developer account with valid certificates and provisioning profiles

## Step 1: Clean Build Environment
```bash
# Clean node modules and cache
npm run clean

# Reinstall dependencies
npm install

# Run Expo doctor to check for issues
npm run doctor
```

## Step 2: Verify Configuration
Check that your `app.json` has:
- ✅ Correct bundle identifier: `com.quranapp.alkareem`
- ✅ No `updates` section (removed to fix build error)
- ✅ Proper iOS configuration with background audio mode

## Step 3: Configure EAS Credentials
```bash
# Check current credentials
eas credentials

# If needed, configure iOS credentials
eas credentials -p ios
```

## Step 4: Build for iOS

### Option A: Production Build (for App Store)
```bash
eas build --platform ios --profile production
```

### Option B: Preview Build (for TestFlight/Internal Testing)
```bash
eas build --platform ios --profile preview
```

### Option C: Development Build (for testing with Expo Go)
```bash
eas build --platform ios --profile development
```

## Step 5: Monitor Build Progress
- The build will run on EAS servers
- You can monitor progress at: https://expo.dev/accounts/[your-account]/projects/al-quran-kareem/builds
- Build typically takes 10-20 minutes

## Step 6: Download and Test
Once the build completes:
1. Download the `.ipa` file from the EAS dashboard
2. Install on a physical device using TestFlight or direct installation
3. Test all features:
   - Quran text display (Book Mode and List Mode)
   - Audio playback
   - Tafsir viewing
   - Bookmarks
   - Settings
   - Offline functionality

## Step 7: Submit to App Store (Production Only)
```bash
eas submit --platform ios --profile production
```

## Troubleshooting

### Build Fails with "Archive Failed"
1. Clear cache and rebuild:
   ```bash
   eas build --platform ios --profile production --clear-cache
   ```

2. Check code signing:
   ```bash
   eas credentials -p ios
   ```

3. Verify bundle identifier matches your Apple Developer account

### Build Succeeds but App Crashes
1. Check logs:
   ```bash
   eas build:view [build-id]
   ```

2. Test with development build first:
   ```bash
   eas build --platform ios --profile development
   ```

### Provisioning Profile Issues
1. Regenerate credentials:
   ```bash
   eas credentials -p ios
   # Select "Remove all credentials"
   # Then rebuild - EAS will generate new ones
   ```

## Build Profiles Explained

### Development
- For testing with Expo Go
- Includes development tools
- Larger file size
- Faster build time

### Preview
- For internal testing
- Similar to production but with internal distribution
- Good for TestFlight beta testing

### Production
- For App Store submission
- Optimized and minified
- Smallest file size
- Longest build time

## Important Notes

1. **Bundle Identifier**: `com.quranapp.alkareem`
   - Must match your Apple Developer account
   - Cannot be changed after first submission

2. **Version Management**:
   - Version: `1.0.0` (in app.json)
   - Build Number: Auto-incremented by EAS
   - Update version for each App Store release

3. **Background Audio**:
   - Configured in `app.json` under `ios.infoPlist.UIBackgroundModes`
   - Required for audio playback when app is in background

4. **Expo Updates**:
   - Currently disabled to fix build issues
   - Can be enabled later for OTA updates
   - See `IOS_BUILD_FIX.md` for details

## Next Steps After Successful Build

1. **TestFlight Testing**:
   - Upload to TestFlight
   - Invite beta testers
   - Gather feedback

2. **App Store Submission**:
   - Prepare app screenshots
   - Write app description
   - Set pricing and availability
   - Submit for review

3. **Post-Launch**:
   - Monitor crash reports
   - Respond to user reviews
   - Plan updates and improvements

## Useful Commands

```bash
# Check build status
eas build:list

# View specific build
eas build:view [build-id]

# Cancel a build
eas build:cancel [build-id]

# Check credentials
eas credentials

# Update app configuration
eas update:configure

# View project info
eas project:info
```

## Support Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Expo Forums](https://forums.expo.dev/)
- [Fastlane Documentation](https://docs.fastlane.tools/)
