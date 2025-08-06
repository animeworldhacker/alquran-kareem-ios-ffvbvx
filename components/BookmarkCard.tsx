
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bookmark } from '../types';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onPress: () => void;
  onDelete: (bookmarkId: string) => void;
}

export default function BookmarkCard({ bookmark, onPress, onDelete }: BookmarkCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'حذف المفضلة',
      'هل تريد حذف هذه الآية من المفضلة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => onDelete(bookmark.id)
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{bookmark.surahName}</Text>
          <Text style={styles.ayahNumber}>الآية {bookmark.ayahNumber}</Text>
        </View>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="trash-outline" size={20} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.ayahText} numberOfLines={3}>
        {bookmark.ayahText}
      </Text>
      
      {bookmark.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>ملاحظة:</Text>
          <Text style={styles.noteText}>{bookmark.note}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.dateText}>{formatDate(bookmark.createdAt)}</Text>
        <Text style={styles.englishName}>{bookmark.surahEnglishName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Amiri_700Bold',
  },
  ayahNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Amiri_400Regular',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error || '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: colors.backgroundAlt,
  },
  ayahText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    textAlign: 'right',
    fontFamily: 'ScheherazadeNew_400Regular',
    marginBottom: 12,
  },
  noteContainer: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Amiri_700Bold',
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Amiri_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border || colors.grey + '30',
  },
  dateText: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: 'Amiri_400Regular',
  },
  englishName: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: 'Amiri_400Regular',
  },
});
