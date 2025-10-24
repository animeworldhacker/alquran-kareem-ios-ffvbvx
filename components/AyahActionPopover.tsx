
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Share, Clipboard, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { router } from 'expo-router';
import Icon from './Icon';

interface AyahActionPopoverProps {
  visible: boolean;
  position: { x: number; y: number };
  ayahNumber: number;
  surahNumber: number;
  surahName: string;
  ayahText: string;
  onAction: (action: string, ayahNumber: number) => void;
  onClose: () => void;
}

export default function AyahActionPopover({
  visible,
  position,
  ayahNumber,
  surahNumber,
  surahName,
  ayahText,
  onAction,
  onClose,
}: AyahActionPopoverProps) {
  const { colors, textSizes } = useTheme();
  const { isBookmarked, addBookmark, removeBookmarkByAyah } = useBookmarks();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const bookmarked = isBookmarked(surahNumber, ayahNumber);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const handlePlay = () => {
    onAction('play', ayahNumber);
    onClose();
  };

  const handleTafsir = () => {
    router.push(`/tafsir/${surahNumber}/${ayahNumber}`);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setString(ayahText);
      Alert.alert('تم النسخ', 'تم نسخ الآية إلى الحافظة');
      onClose();
    } catch (error) {
      console.error('Error copying ayah:', error);
      Alert.alert('خطأ', 'فشل في نسخ الآية');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${surahName} - آية ${ayahNumber}\n\n${ayahText}`,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing ayah:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await removeBookmarkByAyah(surahNumber, ayahNumber);
        Alert.alert('تم الحذف', 'تم حذف العلامة المرجعية');
      } else {
        await addBookmark({
          surahNumber,
          surahName,
          surahEnglishName: '',
          ayahNumber,
          ayahText,
        });
        Alert.alert('تم الحفظ', 'تم حفظ العلامة المرجعية');
      }
      onClose();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('خطأ', 'فشل في حفظ العلامة المرجعية');
    }
  };

  // Calculate popover position to stay on screen
  const popoverWidth = 200;
  const popoverHeight = 240;
  const padding = 16;

  let left = position.x - popoverWidth / 2;
  let top = position.y - popoverHeight - 20;

  // Flip horizontally if too close to edges
  if (left < padding) {
    left = padding;
  } else if (left + popoverWidth > screenWidth - padding) {
    left = screenWidth - popoverWidth - padding;
  }

  // Flip vertically if too close to top
  if (top < padding) {
    top = position.y + 20;
  }

  // Ensure it doesn't go off bottom
  if (top + popoverHeight > screenHeight - padding) {
    top = screenHeight - popoverHeight - padding;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left,
      top,
      width: popoverWidth,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.gold,
      padding: 12,
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
      elevation: 8,
      zIndex: 1000,
    },
    actionButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 6,
      backgroundColor: colors.surfaceVariant,
      gap: 12,
    },
    actionButtonActive: {
      backgroundColor: colors.primary,
    },
    actionText: {
      fontSize: textSizes.body,
      color: colors.text,
      fontFamily: 'Amiri_700Bold',
      textAlign: 'right',
      flex: 1,
    },
    actionTextActive: {
      color: colors.gold,
    },
    icon: {
      color: colors.text,
    },
    iconActive: {
      color: colors.gold,
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity style={styles.actionButton} onPress={handlePlay}>
        <Text style={styles.actionText}>تشغيل</Text>
        <Icon name="play" size={20} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleTafsir}>
        <Text style={styles.actionText}>تفسير</Text>
        <Icon name="book-outline" size={20} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
        <Text style={styles.actionText}>نسخ</Text>
        <Icon name="copy-outline" size={20} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
        <Text style={styles.actionText}>مشاركة</Text>
        <Icon name="share-outline" size={20} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, bookmarked && styles.actionButtonActive]}
        onPress={handleBookmark}
      >
        <Text style={[styles.actionText, bookmarked && styles.actionTextActive]}>
          {bookmarked ? 'إزالة الإشارة' : 'إشارة مرجعية'}
        </Text>
        <Icon
          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          style={bookmarked ? styles.iconActive : styles.icon}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
