
# Supabase Backend Setup - Al-Quran Kareem App

## Overview
This document describes the complete Supabase backend integration for the Al-Quran Kareem iOS app, including database schema, authentication, and data synchronization.

## Database Schema

### 1. Profiles Table
Stores user profile information.

**Columns:**
- `id` (uuid, primary key) - References auth.users
- `email` (text)
- `full_name` (text)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

**Trigger:**
- Automatically creates a profile when a new user signs up

### 2. Bookmarks Table
Stores user bookmarks for Quran verses.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `surah_number` (integer)
- `ayah_number` (integer)
- `surah_name` (text)
- `ayah_text` (text)
- `note` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `bookmarks_user_id_idx` on user_id
- `bookmarks_surah_ayah_idx` on (surah_number, ayah_number)

**Constraints:**
- Unique constraint on (user_id, surah_number, ayah_number)

**RLS Policies:**
- Users can view their own bookmarks
- Users can insert their own bookmarks
- Users can update their own bookmarks
- Users can delete their own bookmarks

### 3. Reading Progress Table
Tracks user reading progress for each surah.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `surah_number` (integer)
- `ayah_number` (integer)
- `last_read_at` (timestamp)

**Indexes:**
- `reading_progress_user_id_idx` on user_id
- `reading_progress_last_read_idx` on last_read_at (descending)

**Constraints:**
- Unique constraint on (user_id, surah_number)

**RLS Policies:**
- Users can view their own reading progress
- Users can insert their own reading progress
- Users can update their own reading progress
- Users can delete their own reading progress

### 4. User Settings Table
Stores user preferences and app settings.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users, unique)
- `text_size` (text, default 'medium')
- `theme` (text, default 'light')
- `show_banner` (boolean, default true)
- `reading_mode` (text, default 'scroll')
- `square_adjustment` (integer, default 50)
- `show_tajweed` (boolean, default true)
- `auto_expand_tafsir` (boolean, default false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Indexes:**
- `user_settings_user_id_idx` on user_id

**RLS Policies:**
- Users can view their own settings
- Users can insert their own settings
- Users can update their own settings
- Users can delete their own settings

### 5. Recitation History Table
Tracks audio recitation playback history.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `reciter_id` (integer)
- `reciter_name` (text)
- `surah_number` (integer)
- `surah_name` (text)
- `played_at` (timestamp)

**Indexes:**
- `recitation_history_user_id_idx` on user_id
- `recitation_history_played_at_idx` on played_at (descending)

**RLS Policies:**
- Users can view their own recitation history
- Users can insert their own recitation history
- Users can delete their own recitation history

## Authentication

### Features
- Email/password authentication
- Email verification required
- Password reset functionality
- Session management with AsyncStorage
- Automatic token refresh

### Auth Screens
1. **Login Screen** (`/auth/login`)
   - Email and password input
   - Link to signup and forgot password
   - Option to continue without login

2. **Signup Screen** (`/auth/signup`)
   - Email, password, and optional full name
   - Password confirmation
   - Email verification reminder

3. **Forgot Password Screen** (`/auth/forgot-password`)
   - Email input for password reset
   - Sends reset link to email

### Auth Context
The `AuthContext` provides:
- `session` - Current user session
- `user` - Current user object
- `loading` - Auth loading state
- `signIn(email, password)` - Sign in function
- `signUp(email, password, fullName?)` - Sign up function
- `signOut()` - Sign out function
- `resetPassword(email)` - Password reset function

## Data Synchronization

### Hybrid Approach
The app uses a hybrid approach for data storage:
- **Offline-first**: Data is stored locally in AsyncStorage
- **Cloud sync**: When authenticated, data syncs to Supabase
- **Automatic sync**: Local data syncs to cloud on login

### Services Updated

#### 1. Bookmark Service
- Checks authentication status before operations
- Uses Supabase when authenticated, AsyncStorage otherwise
- Syncs local bookmarks to Supabase on login
- Handles duplicate bookmarks gracefully

#### 2. Settings Service
- Stores settings in both Supabase and AsyncStorage
- AsyncStorage serves as backup
- Syncs local settings to Supabase on login
- Validates settings before saving

#### 3. Reading Progress Service (New)
- Tracks last read position for each surah
- Stores in Supabase when authenticated
- Falls back to AsyncStorage when offline
- Syncs local progress on login

### Sync Process
When a user logs in:
1. Local bookmarks are uploaded to Supabase
2. Local settings are uploaded to Supabase
3. Local reading progress is uploaded to Supabase
4. Local data is cleared after successful sync
5. Future operations use Supabase directly

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    const { error } = await signIn('user@example.com', 'password');
    if (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      {user ? (
        <Text>Welcome {user.email}</Text>
      ) : (
        <Button onPress={handleLogin}>Login</Button>
      )}
    </View>
  );
}
```

### Bookmarks
```typescript
import { bookmarkService } from '@/services/bookmarkService';

// Add bookmark
await bookmarkService.addBookmark({
  surahNumber: 1,
  surahName: 'الفاتحة',
  surahEnglishName: 'Al-Fatihah',
  ayahNumber: 1,
  ayahText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  note: 'Important verse',
});

// Get all bookmarks
const bookmarks = await bookmarkService.getBookmarks();

// Remove bookmark
await bookmarkService.removeBookmark(bookmarkId);
```

### Settings
```typescript
import { settingsService } from '@/services/settingsService';

// Get settings
const settings = await settingsService.getSettings();

// Update setting
await settingsService.updateSetting('theme', 'dark');

// Save all settings
await settingsService.saveSettings({
  textSize: 'large',
  theme: 'dark',
  showBanner: true,
  readingMode: 'scroll',
  squareAdjustment: 50,
  showTajweed: true,
  autoExpandTafsir: false,
});
```

### Reading Progress
```typescript
import { readingProgressService } from '@/services/readingProgressService';

// Update progress
await readingProgressService.updateProgress(1, 5); // Surah 1, Ayah 5

// Get progress for a surah
const progress = await readingProgressService.getProgress(1);

// Get all progress
const allProgress = await readingProgressService.getAllProgress();
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- No user can view or modify another user's data
- Anonymous users cannot access any data

### Authentication
- Passwords are hashed by Supabase Auth
- JWT tokens are used for authentication
- Tokens are automatically refreshed
- Sessions are persisted securely in AsyncStorage

## Benefits

### For Users
- **Cross-device sync**: Access bookmarks and settings on any device
- **Offline support**: App works without internet connection
- **Data backup**: Data is safely stored in the cloud
- **Privacy**: All data is private and secure

### For Developers
- **Type safety**: Full TypeScript support with generated types
- **Easy queries**: Simple API for database operations
- **Real-time**: Can add real-time features in the future
- **Scalable**: Supabase handles scaling automatically

## Future Enhancements

Possible future features:
1. **Social features**: Share favorite verses with friends
2. **Reading goals**: Track daily reading goals
3. **Achievements**: Gamification with badges and rewards
4. **Community**: Join reading groups and challenges
5. **Real-time**: Live reading sessions with others
6. **Analytics**: Personal reading statistics and insights

## Troubleshooting

### Common Issues

**Issue**: User can't log in
- Check email is verified
- Verify credentials are correct
- Check network connection

**Issue**: Data not syncing
- Ensure user is logged in
- Check network connection
- Verify RLS policies are correct

**Issue**: Duplicate bookmarks
- The unique constraint prevents duplicates
- Error message: "هذه الآية محفوظة مسبقاً"

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify Supabase project is active
3. Check RLS policies in Supabase dashboard
4. Review network requests in browser dev tools

## Conclusion

The Supabase backend provides a robust, scalable, and secure foundation for the Al-Quran Kareem app. With automatic synchronization, offline support, and comprehensive authentication, users can enjoy a seamless experience across all their devices.
