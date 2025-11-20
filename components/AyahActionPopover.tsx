
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Share, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import Icon from './Icon';
import * as Clipboard from 'expo-clipboard';
import { useBookmarks } from '../hooks/useBookmarks';

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
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(surahNumber, ayahNumber);

  const handlePlayAudio = () => {
    onAction('play', ayahNumber);
    onClose();
  };

  const handleViewTafsir = () => {
    onClose();
    // Navigate to tafsir screen with proper route
    try {
      console.log(`Navigating to tafsir: /tafsir/${surahNumber}/${ayahNumber}`);
      router.push(`/tafsir/${surahNumber}/${ayahNumber}` as any);
    } catch (error) {
      console.error('Error navigating to tafsir:', error);
      Alert.alert('خطأ', 'فشل في فتح التفسير');
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(ayahText);
      Alert.alert('تم النسخ', 'تم نسخ الآية إلى الحافظة');
      onClose();
    } catch (error) {
      console.error('Error copying text:', error);
      Alert.alert('خطأ', 'فشل في نسخ النص');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${ayahText}\n\n${surahName} - الآية ${ayahNumber}`,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await removeBookmark(surahNumber, ayahNumber);
        Alert.alert('تم الحذف', 'تم حذف العلامة المرجعية');
      } else {
        await addBookmark({
          surahNumber,
          ayahNumber,
          surahName,
          ayahText,
          timestamp: Date.now(),
        });
        Alert.alert('تم الحفظ', 'تم إضافة العلامة المرجعية');
      }
      onClose();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('خطأ', 'فشل في حفظ العلامة المرجعية');
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const popoverWidth = 200;
  const popoverHeight = 280;

  // Calculate position to keep popover within screen bounds
  let popoverX = position.x - popoverWidth / 2;
  let popoverY = position.y + 20;

  // Adjust horizontal position
  if (popoverX < 10) {
    popoverX = 10;
  } else if (popoverX + popoverWidth > screenWidth - 10) {
    popoverX = screenWidth - popoverWidth - 10;
  }

  // Adjust vertical position
  if (popoverY + popoverHeight > screenHeight - 100) {
    popoverY = position.y - popoverHeight - 20;
  }

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    popover: {
      position: 'absolute',
      left: popoverX,
      top: popoverY,
      width: popoverWidth,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 8,
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)',
      elevation: 10,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    menuItem: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 12,
    },
    menuItemText: {
      fontSize: textSizes.body,
      color: colors.text,
      fontFamily: 'Amiri_400Regular',
      flex: 1,
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: colors.outline,
      marginVertical: 4,
      opacity: 0.3,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.popover}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePlayAudio}
            activeOpacity={0.7}
          >
            <Icon name="play-circle" size={24} style={{ color: colors.primary }} />
            <Text style={styles.menuItemText}>تشغيل الآية</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleViewTafsir}
            activeOpacity={0.7}
          >
            <Icon name="book" size={24} style={{ color: colors.primary }} />
            <Text style={styles.menuItemText}>عرض التفسير</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <Icon name="copy" size={24} style={{ color: colors.primary }} />
            <Text style={styles.menuItemText}>نسخ النص</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Icon name="share" size={24} style={{ color: colors.primary }} />
            <Text style={styles.menuItemText}>مشاركة</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Icon 
              name={bookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              style={{ color: bookmarked ? colors.gold : colors.primary }} 
            />
            <Text style={styles.menuItemText}>
              {bookmarked ? 'إزالة العلامة' : 'إضافة علامة'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
