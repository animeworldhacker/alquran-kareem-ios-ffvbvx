
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
      const loadedBookmarks = await bookmarkService.getBookmarks();
      setBookmarks(loadedBookmarks);
      console.log('Bookmarks loaded:', loadedBookmarks.length);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError('خطأ في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (
    surahNumber: number,
    surahName: string,
    surahEnglishName: string,
    ayahNumber: number,
    ayahText: string,
    note?: string
  ) => {
    try {
      const newBookmark = await bookmarkService.addBookmark({
        surahNumber,
        surahName,
        surahEnglishName,
        ayahNumber,
        ayahText,
        note
      });
      setBookmarks(prev => [...prev, newBookmark]);
      return newBookmark;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      throw err;
    }
  }, []);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      throw err;
    }
  }, []);

  const isBookmarked = useCallback(async (surahNumber: number, ayahNumber: number) => {
    try {
      return await bookmarkService.isBookmarked(surahNumber, ayahNumber);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
      return false;
    }
  }, []);

  const updateBookmarkNote = useCallback(async (bookmarkId: string, note: string) => {
    try {
      await bookmarkService.updateBookmarkNote(bookmarkId, note);
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, note } : b
      ));
    } catch (err) {
      console.error('Error updating bookmark note:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateBookmarkNote,
    refreshBookmarks: loadBookmarks
  };
}
