
# دليل الاستخدام بدون إنترنت - Offline Usage Guide

## Overview

This Quran app now supports **full offline functionality**, allowing you to use all features without an internet connection after downloading the necessary data.

## What Can Be Used Offline

### 1. **Quran Text Data** 📖
- **Size**: ~2 MB
- **Content**: Complete Quran text in Uthmani script
- **Features**:
  - All 114 Surahs
  - All 6,236 Ayahs
  - Surah names and metadata
  - Verse numbers and markers

### 2. **Tafsir (Ibn Kathir)** 📚
- **Size**: ~50 MB (for complete Quran)
- **Content**: Arabic Tafsir Ibn Kathir from Quran.com
- **Features**:
  - Detailed explanations for each verse
  - Automatically cached when viewed
  - Can be pre-downloaded for all verses

### 3. **Audio Recitations** 🎵
- **Size**: ~500 MB (for complete Quran with one reciter)
- **Content**: Verse-by-verse audio recitations
- **Features**:
  - Multiple reciters available
  - Download specific Surahs or complete Quran
  - Continuous playback support
  - Stored locally for offline playback

## How to Download Data

### Method 1: Download Everything at Once
1. Open **Settings** (الإعدادات)
2. Scroll to **"تنزيل للاستخدام بدون إنترنت"** section
3. Tap **"تنزيل كل شيء"** (Download Everything)
4. Confirm the download (~552 MB total)
5. Wait for the download to complete

### Method 2: Download Selectively

#### Download Quran Data
1. Go to Settings → Download Section
2. Tap **"تنزيل بيانات القرآن"** (~2 MB)
3. This is **required** for offline use

#### Download Tafsir
1. Go to Settings → Download Section
2. Tap **"تنزيل تفسير ابن كثير"** (~50 MB)
3. This downloads Tafsir for all verses
4. Alternatively, Tafsir is auto-cached when you view it

#### Download Audio Recitations
1. Go to Settings → Download Section
2. Tap **"تنزيل التلاوات الصوتية"**
3. Choose from:
   - **Single Surah**: Enter Surah number (1-114)
   - **Multiple Surahs**: Enter comma-separated numbers (e.g., 1,2,3)
   - **Complete Quran**: Downloads all 6,236 verses (~500 MB)

## Checking Offline Status

### View Download Status
1. Open **Settings**
2. Check the **"حالة الاستخدام بدون إنترنت"** section
3. You'll see:
   - ✅ Quran Data: Downloaded size
   - ✅ Tafsir: Number of cached verses
   - ✅ Audio: Number of downloaded verses
   - Total storage used

### Offline Capability Badge
When you have Quran data and some Tafsir downloaded, you'll see:
```
✅ جاهز للاستخدام بدون إنترنت
(Ready for offline use)
```

## Using the App Offline

### What Works Offline
- ✅ Reading all Surahs and Ayahs
- ✅ Viewing downloaded Tafsir
- ✅ Playing downloaded audio recitations
- ✅ Adding and managing bookmarks
- ✅ Changing settings and appearance
- ✅ Switching between light/dark mode
- ✅ Adjusting text size
- ✅ Tajweed highlighting

### What Requires Internet
- ❌ Downloading new data
- ❌ Viewing Tafsir not yet cached
- ❌ Playing audio not yet downloaded
- ❌ Updating Quran data

### Offline Indicator
When offline, you'll see a banner at the top:
- 🔴 **Red**: No internet, limited functionality
- 🟠 **Orange**: No internet, but offline data available

## Managing Storage

### View Storage Usage
1. Go to Settings
2. Check **"حالة الاستخدام بدون إنترنت"**
3. See breakdown by data type

### Clear Downloaded Data
1. Go to Settings → Download Section
2. Tap **"مسح جميع البيانات المحملة"**
3. Confirm to delete all offline data
4. This frees up storage space

### Selective Deletion
Currently, you can only clear all data at once. Individual Surah deletion will be added in future updates.

## Best Practices

### 1. Download on Wi-Fi
- Use Wi-Fi for large downloads to save mobile data
- Complete Quran audio is ~500 MB

### 2. Prioritize Essential Data
- **Must have**: Quran text data (~2 MB)
- **Recommended**: Tafsir for frequently read Surahs
- **Optional**: Audio recitations (download as needed)

### 3. Download Frequently Read Surahs First
- Start with Surahs you read often
- Examples: Al-Fatiha (1), Al-Baqarah (2), Yasin (36), Ar-Rahman (55)

### 4. Monitor Storage
- Check available device storage before downloading
- Complete offline package requires ~552 MB

### 5. Update Periodically
- When online, refresh Quran data occasionally
- Tap **"تحديث حالة التنزيل"** to check for updates

## Troubleshooting

### Problem: Download Fails
**Solution**:
- Check internet connection
- Ensure sufficient storage space
- Try downloading in smaller chunks (individual Surahs)
- Restart the app and try again

### Problem: Offline Data Not Working
**Solution**:
- Go to Settings → Download Section
- Tap **"تحديث حالة التنزيل"** to refresh status
- Verify data is actually downloaded
- Try clearing and re-downloading

### Problem: Audio Won't Play Offline
**Solution**:
- Ensure audio was downloaded (not just cached URLs)
- Check Settings → Audio section
- Tap **"عرض التلاوات المحملة"** to see downloaded audio
- Re-download the specific Surah if needed

### Problem: Tafsir Shows "Loading..."
**Solution**:
- Tafsir must be downloaded or previously viewed
- Download Tafsir from Settings
- Or view it once while online to cache it

### Problem: App Uses Too Much Storage
**Solution**:
- Clear unnecessary data: Settings → **"مسح جميع البيانات المحملة"**
- Download only essential Surahs
- Keep Quran text data, remove audio if needed

## Technical Details

### Storage Locations
- **Quran Data**: AsyncStorage (persistent)
- **Tafsir Cache**: AsyncStorage (persistent)
- **Audio Files**: FileSystem cache directory

### Data Persistence
- All downloaded data persists across app restarts
- Data remains until manually cleared
- Survives app updates (usually)

### Automatic Caching
- Tafsir is automatically cached when viewed
- Audio URLs are cached for faster loading
- Quran data is cached on first load

### Network Detection
- App automatically detects online/offline status
- Shows appropriate indicators
- Gracefully handles network changes

## Future Enhancements

Planned features for offline mode:
- [ ] Selective Surah deletion
- [ ] Download progress persistence (resume downloads)
- [ ] Automatic background sync when online
- [ ] Download scheduling (download at specific times)
- [ ] Multiple reciter downloads
- [ ] Offline search functionality
- [ ] Export/import offline data

## Support

If you encounter issues with offline functionality:
1. Check this guide first
2. Try the troubleshooting steps
3. Clear data and re-download
4. Report persistent issues with details:
   - Device model and OS version
   - Available storage space
   - Specific error messages
   - Steps to reproduce

---

**Note**: This app requires an initial internet connection to download data. Once downloaded, all features work completely offline.

**Recommended Setup**: Download Quran data + your favorite Surahs' audio + Tafsir for commonly read verses = ~50-100 MB for excellent offline experience.
