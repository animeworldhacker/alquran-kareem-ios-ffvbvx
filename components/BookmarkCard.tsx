
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bookmark } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onPress: () => void;
  onDelete: (bookmarkId: string) => void;
}

export default function BookmarkCard({ bookmark, onPress, onDelete }: BookmarkCardProps) {
  const { colors, textSizes } = useTheme();

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

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      elevation: 3,
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
      fontSize: textSizes.subtitle,
      fontWeight: 'bold',
      color: colors.primary,
      fontFamily: 'Amiri_700Bold',
    },
    ayahNumber: {
      fontSize: textSizes.caption,
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
      fontSize: textSizes.arabic,
      lineHeight: textSizes.arabic * 1.6,
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
      fontSize: textSizes.caption,
      fontWeight: 'bold',
      color: colors.textSecondary,
      marginBottom: 4,
      fontFamily: 'Amiri_700Bold',
    },
    noteText: {
      fontSize: textSizes.body,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dateText: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
    englishName: {
      fontSize: textSizes.caption,
      color: colors.textSecondary,
      fontFamily: 'Amiri_400Regular',
    },
  });

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


