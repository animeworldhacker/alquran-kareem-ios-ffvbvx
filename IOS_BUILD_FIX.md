
# iOS Build Fix - Expo Updates Error

## Problem
The iOS build was failing with the error:
```
PhaseScriptExecution [CP-User]\ Generate\ updates\ resources\ for\ expo-updates
```

This error occurs when `expo-updates` is disabled in `app.json` but the package is still installed, causing the iOS build process to fail when trying to generate update resources.

## Solution Applied

### 1. Removed expo-updates configuration from app.json
- Removed the `updates` section entirely from `app.json`
- When expo-updates is not configured, it won't try to generate update resources during the build

### 2. Keep expo-updates package installed
- The package remains in `package.json` as it's a peer dependency of other Expo packages
- Without the configuration in `app.json`, it simply won't be active

## What Changed

**app.json:**
- Removed the `updates` section:
  ```json
  "updates": {
    "enabled": false,
    "fallbackToCacheTimeout": 0
  }
  ```

## Testing the Fix

1. Clean your build cache:
   ```bash
   npm run clean
   npm install
   ```

2. Try building again with EAS:
   ```bash
   eas build --platform ios --profile production
   ```

## If You Want to Enable OTA Updates Later

If you want to use Expo Updates (Over-The-Air updates) in the future, add this to your `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

And configure it in `eas.json`:

```json
{
  "build": {
    "production": {
      "channel": "production",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      }
    }
  }
}
```

## Additional Troubleshooting

If the build still fails:

1. **Clear iOS build cache:**
   ```bash
   rm -rf ios/Pods ios/Podfile.lock
   cd ios && pod install && cd ..
   ```

2. **Check bundle identifier:**
   - Ensure `com.quranapp.alkareem` is properly registered in your Apple Developer account
   - Verify provisioning profiles are up to date

3. **Verify code signing:**
   - Check that your certificates are valid
   - Ensure provisioning profiles match your bundle identifier

4. **Check EAS credentials:**
   ```bash
   eas credentials
   ```

5. **Try a clean build:**
   ```bash
   eas build --platform ios --profile production --clear-cache
   ```

## Related Files
- `app.json` - Main Expo configuration
- `eas.json` - EAS Build configuration
- `package.json` - Dependencies

## References
- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Fastlane Code Signing Guide](https://docs.fastlane.tools/codesigning/getting-started/)
