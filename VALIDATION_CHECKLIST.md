
# Quran App Validation Checklist

## ✅ Pre-Flight Checks

### 1. Clean Installation
```bash
# Clean everything
npm run clean
# or manually:
rm -rf node_modules .expo .turbo
npm cache clean --force

# Fresh install
npm install

# Run doctor
npm run doctor

# Validate code
npm run validate
```

### 2. Start Development Server
```bash
# Clear cache and start
npm run start:clear

# Or with tunnel for device testing
npm run dev
```

---

## 📱 Expo Go Boot Test

**Goal:** App boots without red screen errors

### Steps:
1. Scan QR code with Expo Go on iOS/Android
2. Wait for splash screen (dedication message)
3. Tap splash screen to continue
4. Verify app loads to Chapters tab
5. Check console for errors

**Expected Result:** 
- ✅ No red error screens
- ✅ Splash screen displays properly
- ✅ Navigation works
- ✅ Arabic text renders correctly

---

## 📖 Reading Flow Test

**Goal:** Verify Quran text displays correctly with RTL support

### Steps:
1. Navigate to Chapters tab
2. Tap on any Surah (e.g., Al-Fatiha)
3. Verify Arabic text renders with proper RTL layout
4. Scroll through ayahs
5. Toggle between List and Mushaf view modes
6. Check verse markers and decorations

**Expected Result:**
- ✅ Arabic text displays correctly
- ✅ RTL layout works
- ✅ Verse numbers show in Arabic numerals
- ✅ Smooth scrolling
- ✅ Both view modes work

---

## 🎵 Audio Playback Test

**Goal:** Per-verse audio works with all controls

### Steps:
1. Open any Surah
2. Tap play button on an Ayah
3. Verify audio starts playing
4. Test pause/resume
5. Test stop
6. Test "Play from here" (continuous playback)
7. Verify auto-advance to next ayah
8. Test next/previous ayah navigation

**Expected Result:**
- ✅ Audio plays without errors
- ✅ Play/pause works
- ✅ Stop works
- ✅ Continuous playback advances automatically
- ✅ Audio controls are responsive
- ✅ No 403/CORS errors

**Common Issues:**
- If audio fails, check internet connection
- Verify reciter is selected in Reciters tab
- Check console for URL errors

---

## 📚 Tafsir Loading Test

**Goal:** Ibn Kathir tafsir loads fast with caching

### Steps:
1. Open any Surah
2. Long-press or tap on an Ayah
3. Select "Tafsir" from popover menu
4. Wait for tafsir to load
5. Navigate back
6. Open same ayah tafsir again (should be cached)
7. Try different ayahs in same surah
8. Test offline mode (airplane mode)

**Expected Result:**
- ✅ Tafsir loads within 2-3 seconds
- ✅ Cached tafsir loads instantly
- ✅ Arabic tafsir text displays correctly
- ✅ Copy and share buttons work
- ✅ Cached tafsir available offline

---

## 🔗 Deep Links Test

**Goal:** Deep linking works for direct navigation

### Steps:
1. Create test URLs:
   - `alquran://surah/1/ayah/1` (Al-Fatiha, verse 1)
   - `alquran://surah/2/ayah/255` (Ayat al-Kursi)
2. Open URLs on device (via Notes app or browser)
3. Verify app opens and navigates correctly

**Expected Result:**
- ✅ App opens from deep link
- ✅ Navigates to correct Surah
- ✅ Scrolls to correct Ayah
- ✅ Ayah is highlighted

**Note:** Deep links only work on physical devices, not in Expo Go web preview

---

## 🔖 Bookmarks Test

**Goal:** Bookmarking and search work correctly

### Steps:
1. Open any Surah
2. Tap bookmark icon on an Ayah
3. Navigate to Bookmarks tab
4. Verify bookmark appears
5. Tap bookmark to navigate back
6. Test removing bookmark
7. Test search functionality

**Expected Result:**
- ✅ Bookmarks save correctly
- ✅ Bookmarks persist after app restart
- ✅ Navigation from bookmarks works
- ✅ Search finds ayahs correctly

---

## 🎙️ Reciter Selection Test

**Goal:** Reciter selection persists and works

### Steps:
1. Navigate to Reciters tab
2. Select a different reciter
3. Play any ayah
4. Verify correct reciter's audio plays
5. Close and reopen app
6. Verify reciter selection persisted

**Expected Result:**
- ✅ Reciter list loads
- ✅ Selection saves
- ✅ Audio uses selected reciter
- ✅ Selection persists after restart

---

## 🌐 Offline Mode Test

**Goal:** Basic offline functionality works

### Steps:
1. Use app with internet connection
2. Open several surahs and tafsirs (to cache)
3. Enable airplane mode
4. Reopen app
5. Navigate to cached surahs
6. Try to open cached tafsir
7. Verify offline notice appears

**Expected Result:**
- ✅ Cached Quran text available offline
- ✅ Cached tafsir available offline
- ✅ Offline notice displays when no connection
- ✅ App doesn't crash without internet

---

## 🎨 Theme Test

**Goal:** Light and dark mode work correctly

### Steps:
1. Open Settings tab
2. Toggle between light/dark mode
3. Navigate through different screens
4. Verify colors and contrast

**Expected Result:**
- ✅ Theme switches smoothly
- ✅ All screens respect theme
- ✅ Text remains readable
- ✅ Icons have proper contrast

---

## 📱 Background Audio Test

**Goal:** Audio behavior when backgrounded

### Steps:
1. Start playing audio
2. Press home button (background app)
3. Verify audio pauses
4. Return to app
5. Resume audio

**Expected Result:**
- ✅ Audio pauses when backgrounded (Expo Go limitation)
- ✅ Can resume when returning to app

**Note:** True background audio requires EAS Build (not available in Expo Go)

---

## 🚨 Error Handling Test

**Goal:** App handles errors gracefully

### Steps:
1. Disable internet
2. Try to play audio (should show error)
3. Try to load tafsir (should show cached or error)
4. Enable internet
5. Retry failed operations

**Expected Result:**
- ✅ User-friendly error messages in Arabic
- ✅ Retry buttons work
- ✅ App doesn't crash on errors
- ✅ Network errors handled gracefully

---

## 🔧 Performance Test

**Goal:** App performs smoothly

### Steps:
1. Open long surahs (e.g., Al-Baqarah - 286 verses)
2. Scroll through quickly
3. Play audio while scrolling
4. Switch between tabs rapidly
5. Monitor memory usage

**Expected Result:**
- ✅ Smooth scrolling (60fps)
- ✅ No lag when switching tabs
- ✅ Audio doesn't stutter
- ✅ No memory leaks

---

## ⚠️ Requires EAS Build (Not Expo Go)

The following features require a native build with EAS and will NOT work in Expo Go:

1. **True Background Audio** - Audio continues playing when app is backgrounded
2. **Push Notifications** - If implemented in future
3. **Custom Native Modules** - Any native code beyond Expo SDK
4. **App Store Distribution** - Publishing to App Store/Play Store

To build with EAS:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 📊 Success Criteria

Your app is ready for natively.dev when:

- ✅ All tests pass without errors
- ✅ No red screens in Expo Go
- ✅ Audio plays reliably
- ✅ Tafsir loads and caches correctly
- ✅ Navigation is smooth
- ✅ Deep links work
- ✅ Offline mode functions
- ✅ No console errors (warnings are OK)
- ✅ TypeScript compiles without errors
- ✅ ESLint passes (or only warnings)

---

## 🐛 Common Issues & Fixes

### Issue: "Unable to load resolver babel-module"
**Fix:** Already fixed in `.eslintrc.js` - removed incorrect import resolver

### Issue: "React Hook called conditionally"
**Fix:** Already fixed in `app/index.tsx` - hooks now called at top level

### Issue: Audio 403/CORS errors
**Fix:** Using Quran.com CDN with proper URLs - test on physical device

### Issue: Metro bundler cache issues
**Fix:** Run `npm run start:clear` to clear cache

### Issue: Fonts not loading
**Fix:** Already handled in `app/_layout.tsx` with proper loading states

### Issue: Deep links not working
**Fix:** Ensure scheme is set in `app.json` (already configured as "alquran")

---

## 📝 Notes

- Test on both iOS and Android devices
- Physical devices recommended for audio testing
- Some features limited in Expo Go vs native build
- Check console logs for detailed error information
- Report any persistent issues with console logs

---

## 🎯 Next Steps After Validation

1. Test thoroughly in Expo Go
2. Fix any issues found
3. Create EAS build for production features
4. Submit to App Store/Play Store
5. Deploy to natively.dev

Good luck! 🚀
