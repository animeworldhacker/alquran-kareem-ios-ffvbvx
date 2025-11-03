
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark } from '../types';

const BOOKMARKS_KEY = 'quran_bookmarks';

class BookmarkService {
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (!bookmarksJson) return [];
      
      const bookmarks = JSON.parse(bookmarksJson);
      // Convert date strings back to Date objects
      return bookmarks.map((bookmark: any) => ({
        ...bookmark,
        createdAt: new Date(bookmark.createdAt)
      }));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    try {
      const bookmarks = await this.getBookmarks();
      
      // Check if bookmark already exists
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
      
      console.log('Bookmark added:', newBookmark);
      return newBookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      console.log('Bookmark removed:', bookmarkId);
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
      const bookmarks = await this.getBookmarks();
      const updatedBookmarks = bookmarks.map(b => 
        b.id === bookmarkId ? { ...b, note } : b
      );
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      console.log('Bookmark note updated:', bookmarkId);
    } catch (error) {
      console.error('Error updating bookmark note:', error);
      throw error;
    }
  }
}

export const bookmarkService = new BookmarkService();
