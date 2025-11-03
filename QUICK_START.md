
# 🚀 Quick Start Guide

## Get Your Quran App Running in 5 Minutes

### Step 1: Clean Install (2 minutes)

```bash
# Clean everything
rm -rf node_modules .expo .turbo
npm cache clean --force

# Fresh install
npm install
```

### Step 2: Validate (1 minute)

```bash
# Check for issues
npm run doctor

# Validate code
npm run validate
```

Expected output:
```
✔ No issues found
✔ TypeScript compiled successfully
✔ ESLint passed
```

### Step 3: Start Development Server (1 minute)

```bash
# Start with clean cache
npm run start:clear
```

### Step 4: Test in Expo Go (1 minute)

1. Open Expo Go app on your phone
2. Scan the QR code
3. Wait for app to load
4. Tap splash screen to continue

### Step 5: Verify Core Features (30 seconds)

- ✅ App loads without red screens
- ✅ Navigate to a Surah
- ✅ Play audio on an Ayah
- ✅ Open tafsir for an Ayah

---

## 🎯 One-Line Commands

### Development
```bash
npm run dev                 # Start with tunnel
npm run start:clear         # Start with clean cache
npm run ios                 # Open in iOS simulator
npm run android             # Open in Android emulator
```

### Code Quality
```bash
npm run lint                # Check for lint errors
npm run lint:fix            # Auto-fix lint errors
npm run typecheck           # Check TypeScript
npm run validate            # Run typecheck + lint
```

### Maintenance
```bash
npm run clean               # Clean node_modules and caches
npm run doctor              # Check for Expo issues
```

---

## ✅ Success Indicators

You're good to go when you see:

1. **Terminal:** "Metro waiting on exp://..."
2. **Expo Go:** App loads without errors
3. **Console:** No red error messages
4. **App:** Splash screen → Chapters tab

---

## 🐛 Quick Fixes

### Problem: Metro bundler errors
```bash
npm run start:clear
```

### Problem: Dependency issues
```bash
npm run clean && npm install
```

### Problem: TypeScript errors
```bash
npm run typecheck
```

### Problem: Lint errors
```bash
npm run lint:fix
```

---

## 📱 Testing Checklist

Quick 2-minute test:

- [ ] App boots ✅
- [ ] Navigate to Surah ✅
- [ ] Play audio ✅
- [ ] Open tafsir ✅
- [ ] No errors ✅

Full test: See VALIDATION_CHECKLIST.md

---

## 🎉 You're Ready!

If all checks pass, your app is ready for:
- ✅ Expo Go testing
- ✅ Development
- ✅ natively.dev deployment

For production build:
```bash
eas build --platform ios
eas build --platform android
```

---

**Need Help?** Check FIXES_SUMMARY.md or VALIDATION_CHECKLIST.md
