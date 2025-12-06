
# Expo Go Troubleshooting Guide

## Common Errors and Solutions

### 1. **Reanimated Plugin Error**
**Error:** "Reanimated 2 failed to create a worklet"

**Solution:** 
- The `react-native-reanimated/plugin` MUST be the last plugin in `babel.config.js`
- Clear cache: `npx expo start --clear`
- Restart Expo Go app completely

### 2. **Font Loading Errors**
**Error:** Font fails to load or causes crashes

**Solution:**
- The app now gracefully handles font loading errors
- If fonts fail, the app will continue with system fonts
- Check console logs for font loading status

### 3. **Network/Supabase Errors**
**Error:** "Failed to fetch" or Supabase connection issues

**Solution:**
- Ensure you have internet connection
- The app includes URL polyfill for React Native
- Check if Supabase URL and keys are correct
- The app will work offline if data is cached

### 4. **Context Provider Errors**
**Error:** "useTheme must be used within ThemeProvider"

**Solution:**
- All context providers are properly wrapped in `_layout.tsx`
- Error boundaries catch and display context errors
- Check that you're not calling hooks outside components

### 5. **GestureHandler Errors**
**Error:** "GestureHandlerRootView not found"

**Solution:**
- `GestureHandlerRootView` is now properly wrapped in `_layout.tsx`
- This is required for bottom sheets and swipeable components

## Testing Steps

### Step 1: Clear Everything
```bash
npx expo start --clear
```

### Step 2: Enable Debug Mode
In `app/index.tsx`, set:
```typescript
const DEBUG_MODE = true;
```

This will show a simple test screen to verify basic functionality.

### Step 3: Check Console Logs
Look for these success messages:
- ✅ Error logging initialized
- ✅ Fonts loaded successfully
- ✅ Splash screen hidden
- ✅ App ready
- ✅ Supabase client initialized
- ✅ Settings loaded successfully
- ✅ Theme initialization complete

### Step 4: Common Error Patterns

#### White Screen
- Check if splash screen is stuck
- Look for JavaScript errors in console
- Try clearing cache and restarting

#### App Crashes on Launch
- Check for syntax errors in recent changes
- Verify all imports are correct
- Check if all required dependencies are installed

#### Navigation Not Working
- Verify file structure in `app/` directory
- Check that all routes are properly defined
- Ensure `expo-router` is properly configured

## Key Fixes Applied

1. **Added GestureHandlerRootView** - Required for gesture-based components
2. **Fixed Babel Config** - Reanimated plugin is now last
3. **Added URL Polyfill** - Required for Supabase in React Native
4. **Improved Error Handling** - Better error boundaries and fallbacks
5. **Fixed Context Providers** - Proper cleanup and error handling
6. **Added Mounted Checks** - Prevents state updates on unmounted components

## Still Having Issues?

1. **Restart Everything:**
   ```bash
   # Kill all processes
   # Clear cache
   npx expo start --clear
   # Restart Expo Go app on your device
   ```

2. **Check Expo Go Version:**
   - Make sure you're using the latest Expo Go app
   - Expo SDK 54 requires Expo Go 2.32.0 or later

3. **Check Device Compatibility:**
   - iOS: Requires iOS 13.4 or later
   - Android: Requires Android 6.0 (API 23) or later

4. **Network Issues:**
   - Try using tunnel mode: `npx expo start --tunnel`
   - Make sure your device and computer are on the same network
   - Check firewall settings

5. **Enable Debug Mode:**
   - Set `DEBUG_MODE = true` in `app/index.tsx`
   - This shows a simple test screen to verify basic functionality

## Error Log Analysis

When you see errors, look for these patterns:

### JavaScript Errors
- Usually show file name and line number
- Check the specific file mentioned
- Look for typos or missing imports

### Native Module Errors
- Usually mention a specific package
- Try reinstalling: `npm install <package-name>`
- Check if package is compatible with Expo SDK 54

### Build Errors
- Usually happen during app startup
- Check `babel.config.js` and `metro.config.js`
- Verify all plugins are properly configured

## Success Indicators

Your app is working correctly when you see:
1. Splash screen with dedication message
2. Smooth transition to chapters list
3. No red error screens
4. Console shows success messages (✅)
5. Navigation between tabs works smoothly

## Contact Support

If issues persist after trying all solutions:
1. Check the console logs carefully
2. Note the exact error message
3. Check which screen/action causes the error
4. Try the debug mode to isolate the issue
