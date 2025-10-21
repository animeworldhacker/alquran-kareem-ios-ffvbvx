
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from './Icon';
import { Bookmark } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onPress: () => void;
  onDelete: (bookmarkId: string) => void;
}

const toArabicNumerals = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

export default function BookmarkCard({ bookmark, onPress, onDelete }: BookmarkCardProps) {
  const { colors, textSizes, isDark } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'حذف الإشارة المرجعية',
      'هل أنت متأكد من حذف هذه الإشارة المرجعية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onDelete(bookmark.id),
        },
      ]
    );
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${toArabicNumerals(day)}/${toArabicNumerals(month)}/${toArabicNumerals(year)}`;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    badgeText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
    },
    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(239, 83, 80, 0.2)' : 'rgba(239, 83, 80, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    surahName: {
      fontSize: textSizes.title,
      fontFamily: 'ScheherazadeNew_700Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 8,
    },
    ayahText: {
      fontSize: textSizes.body,
      fontFamily: 'ScheherazadeNew_700Bold',
      color: colors.text,
      textAlign: 'right',
      lineHeight: textSizes.body * 1.8,
      marginBottom: 12,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    dateText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.textSecondary,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.1)',
      borderWidth: 1,
      borderColor: colors.gold,
    },
    viewButtonText: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
      color: colors.gold,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="trash-outline" size={16} style={{ color: colors.error }} />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>آية {toArabicNumerals(bookmark.ayahNumber)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.surahName}>{bookmark.surahName}</Text>
        <Text style={styles.ayahText} numberOfLines={3}>
          {bookmark.ayahText}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>عرض</Text>
          <Icon name="chevron-back" size={14} style={{ color: colors.gold }} />
        </TouchableOpacity>
        
        <Text style={styles.dateText}>{formatDate(bookmark.createdAt)}</Text>
      </View>
    </View>
  );
}
