
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark } from '../types';
import { supabase } from '../app/integrations/supabase/client';

const BOOKMARKS_KEY = 'quran_bookmarks';

class BookmarkService {
  private async isUserAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        // Get from Supabase
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading bookmarks from Supabase:', error);
          // Fallback to AsyncStorage
          return this.getLocalBookmarks();
        }

        return data.map(bookmark => ({
          id: bookmark.id,
          surahNumber: bookmark.surah_number,
          surahName: bookmark.surah_name,
          surahEnglishName: '', // Not stored in DB
          ayahNumber: bookmark.ayah_number,
          ayahText: bookmark.ayah_text,
          createdAt: new Date(bookmark.created_at),
          note: bookmark.note || undefined,
        }));
      } else {
        // Get from AsyncStorage
        return this.getLocalBookmarks();
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return this.getLocalBookmarks();
    }
  }

  private async getLocalBookmarks(): Promise<Bookmark[]> {
    try {
      const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (!bookmarksJson) return [];
      
      const bookmarks = JSON.parse(bookmarksJson);
      return bookmarks.map((bookmark: any) => ({
        ...bookmark,
        createdAt: new Date(bookmark.createdAt)
      }));
    } catch (error) {
      console.error('Error loading local bookmarks:', error);
      return [];
    }
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        // Add to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            surah_number: bookmark.surahNumber,
            surah_name: bookmark.surahName,
            ayah_number: bookmark.ayahNumber,
            ayah_text: bookmark.ayahText,
            note: bookmark.note || null,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            throw new Error('هذه الآية محفوظة مسبقاً');
          }
          throw error;
        }

        const newBookmark: Bookmark = {
          id: data.id,
          surahNumber: data.surah_number,
          surahName: data.surah_name,
          surahEnglishName: bookmark.surahEnglishName,
          ayahNumber: data.ayah_number,
          ayahText: data.ayah_text,
          createdAt: new Date(data.created_at),
          note: data.note || undefined,
        };

        console.log('Bookmark added to Supabase:', newBookmark);
        return newBookmark;
      } else {
        // Add to AsyncStorage
        return this.addLocalBookmark(bookmark);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  private async addLocalBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    const bookmarks = await this.getLocalBookmarks();
    
    const existingBookmark = bookmarks.find(
      b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
    );
    
    if (existingBookmark) {
      throw new Error('هذه الآية محفوظة مسبقاً');
    }
    
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `${bookmark.surahNumber}-${bookmark.ayahNumber}-${Date.now()}`,
      createdAt: new Date()
    };
    
    const updatedBookmarks = [...bookmarks, newBookmark];
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    
    console.log('Bookmark added locally:', newBookmark);
    return newBookmark;
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        // Remove from Supabase
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', bookmarkId);

        if (error) throw error;
        console.log('Bookmark removed from Supabase:', bookmarkId);
      } else {
        // Remove from AsyncStorage
        const bookmarks = await this.getLocalBookmarks();
        const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        console.log('Bookmark removed locally:', bookmarkId);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async isBookmarked(surahNumber: number, ayahNumber: number): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      return bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  async updateBookmarkNote(bookmarkId: string, note: string): Promise<void> {
    try {
      const isAuthenticated = await this.isUserAuthenticated();

      if (isAuthenticated) {
        // Update in Supabase
        const { error } = await supabase
          .from('bookmarks')
          .update({ note, updated_at: new Date().toISOString() })
          .eq('id', bookmarkId);

        if (error) throw error;
        console.log('Bookmark note updated in Supabase:', bookmarkId);
      } else {
        // Update in AsyncStorage
        const bookmarks = await this.getLocalBookmarks();
        const updatedBookmarks = bookmarks.map(b => 
          b.id === bookmarkId ? { ...b, note } : b
        );
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        console.log('Bookmark note updated locally:', bookmarkId);
      }
    } catch (error) {
      console.error('Error updating bookmark note:', error);
      throw error;
    }
  }

  // Sync local bookmarks to Supabase when user logs in
  async syncLocalToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const localBookmarks = await this.getLocalBookmarks();
      if (localBookmarks.length === 0) return;

      console.log(`Syncing ${localBookmarks.length} local bookmarks to Supabase...`);

      for (const bookmark of localBookmarks) {
        try {
          await supabase.from('bookmarks').insert({
            user_id: user.id,
            surah_number: bookmark.surahNumber,
            surah_name: bookmark.surahName,
            ayah_number: bookmark.ayahNumber,
            ayah_text: bookmark.ayahText,
            note: bookmark.note || null,
          });
        } catch (error: any) {
          // Ignore duplicate errors
          if (error.code !== '23505') {
            console.error('Error syncing bookmark:', error);
          }
        }
      }

      // Clear local bookmarks after successful sync
      await AsyncStorage.removeItem(BOOKMARKS_KEY);
      console.log('Local bookmarks synced and cleared');
    } catch (error) {
      console.error('Error syncing bookmarks:', error);
    }
  }
}

export const bookmarkService = new BookmarkService();
