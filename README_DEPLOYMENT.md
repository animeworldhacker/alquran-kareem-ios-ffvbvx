
# 🚀 Natively.dev Deployment Guide

## ✅ Pre-Deployment Checklist

### Project Status
- ✅ Expo SDK 53 configured
- ✅ All dependencies compatible with Expo Go
- ✅ Babel configured with react-native-reanimated plugin
- ✅ TypeScript configured
- ✅ ESLint configured
- ✅ Splash screen implemented
- ✅ Error boundaries in place
- ✅ Offline support implemented

### ⚠️ Known Limitations (Expo Go)
- **react-native-maps**: Present in dependencies but NOT USED in code. Will require EAS Build if you want to use maps in the future.

## 🔧 Local Validation

Run these commands before deploying:

```bash
# 1. Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Run Expo Doctor
npm run doctor

# 3. Type check
npm run typecheck

# 4. Lint check
npm run lint

# 5. Start with cache clear
npm run start:clear
```

## 📱 Testing in Expo Go

1. Install Expo Go on your iOS/Android device
2. Run: `npm run start:tunnel`
3. Scan QR code with Expo Go app
4. Test all features:
   - ✅ Surah browsing
   - ✅ Audio playback
   - ✅ Tafsir viewing
   - ✅ Bookmarks
   - ✅ Settings
   - ✅ Offline mode
   - ✅ Theme switching

## 🌐 Natively.dev Deployment

### Required Information
- **Repository**: Your GitHub repository URL
- **Branch**: main (or your deployment branch)
- **Start Command**: `npm run start:tunnel`
- **Node Version**: 18.x or higher

### Environment Variables
No environment variables required for basic functionality. All APIs are public.

### Build Configuration
- **Platform**: Expo Go (Managed Workflow)
- **SDK Version**: 53
- **Entry Point**: index.ts

## 🔍 Validation Checklist

After deployment on natively.dev:

- [ ] App loads without red screen errors
- [ ] Splash screen displays correctly
- [ ] Navigation works smoothly
- [ ] Quran text loads and displays properly
- [ ] Audio playback works
- [ ] Tafsir loads correctly
- [ ] Bookmarks can be added/removed
- [ ] Settings persist
- [ ] Offline mode works
- [ ] Theme switching works
- [ ] Arabic text renders correctly
- [ ] All tabs accessible

## 🐛 Common Issues & Solutions

### Issue: App crashes on startup
**Solution**: Ensure react-native-reanimated Babel plugin is last in babel.config.js

### Issue: Fonts not loading
**Solution**: Check that expo-google-fonts packages are installed and loaded in _layout.tsx

### Issue: Audio not playing
**Solution**: Verify network connectivity and check audioService.ts for errors

### Issue: Import errors
**Solution**: Run `npm run start:clear` to clear Metro cache

## 📊 Performance Optimization

- ✅ Hermes enabled for better performance
- ✅ Metro cache configured
- ✅ Images optimized
- ✅ Fonts preloaded
- ✅ Splash screen prevents premature rendering

## 🔄 Future EAS Build Requirements

If you need these features, you'll need EAS Build:

- Custom native modules
- react-native-maps integration
- Push notifications (native)
- In-app purchases
- Custom native code

## 📞 Support

For issues specific to natively.dev deployment, contact their support.
For app-specific issues, check the error logs in the app.

---

**Last Updated**: 2024
**Expo SDK**: 53
**Deployment Target**: Expo Go (Managed Workflow)
