
import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '../types';
import { bookmarkService } from '../services/bookmarkService';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedBookmarks = await bookmarkService.getBookmarks().catch(error => {
        console.error('Error from bookmarkService.getBookmarks:', error);
        throw error;
      });
      setBookmarks(loadedBookmarks);
      console.log('Bookmarks loaded:', loadedBookmarks.length);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError('خطأ في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (bookmarkData: {
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahNumber: number;
    ayahText: string;
    note?: string;
  }) => {
    try {
      const newBookmark = await bookmarkService.addBookmark(bookmarkData).catch(error => {
        console.error('Error from bookmarkService.addBookmark:', error);
        throw error;
      });
      setBookmarks(prev => [...prev, newBookmark]);
      console.log('Bookmark added successfully:', newBookmark.id);
      return newBookmark;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      throw err;
    }
  }, []);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId).catch(error => {
        console.error('Error from bookmarkService.removeBookmark:', error);
        throw error;
      });
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      console.log('Bookmark removed successfully:', bookmarkId);
    } catch (err) {
      console.error('Error removing bookmark:', err);
      throw err;
    }
  }, []);

  const removeBookmarkByAyah = useCallback(async (surahNumber: number, ayahNumber: number) => {
    try {
      const bookmark = bookmarks.find(b => 
        b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
      );
      
      if (bookmark) {
        await bookmarkService.removeBookmark(bookmark.id).catch(error => {
          console.error('Error from bookmarkService.removeBookmark:', error);
          throw error;
        });
        setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
        console.log('Bookmark removed by ayah:', bookmark.id);
      } else {
        console.warn('Bookmark not found for removal:', surahNumber, ayahNumber);
      }
    } catch (err) {
      console.error('Error removing bookmark by ayah:', err);
      throw err;
    }
  }, [bookmarks]);

  const getBookmarkByAyah = useCallback((surahNumber: number, ayahNumber: number) => {
    try {
      return bookmarks.find(b => 
        b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
      );
    } catch (error) {
      console.error('Error in getBookmarkByAyah:', error);
      return undefined;
    }
  }, [bookmarks]);

  const isBookmarked = useCallback((surahNumber: number, ayahNumber: number) => {
    try {
      return bookmarks.some(b => 
        b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
      );
    } catch (error) {
      console.error('Error in isBookmarked:', error);
      return false;
    }
  }, [bookmarks]);

  const updateBookmarkNote = useCallback(async (bookmarkId: string, note: string) => {
    try {
      await bookmarkService.updateBookmarkNote(bookmarkId, note).catch(error => {
        console.error('Error from bookmarkService.updateBookmarkNote:', error);
        throw error;
      });
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, note } : b
      ));
      console.log('Bookmark note updated:', bookmarkId);
    } catch (err) {
      console.error('Error updating bookmark note:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadBookmarks().catch(error => {
      console.error('Error in useBookmarks effect:', error);
    });
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    removeBookmarkByAyah,
    getBookmarkByAyah,
    isBookmarked,
    updateBookmarkNote,
    refreshBookmarks: loadBookmarks
  };
}
