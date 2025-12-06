
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAudio } from '../../hooks/useAudio';
import Icon from '../../components/Icon';

export default function RecitersTab() {
  const { colors, textSizes } = useTheme();
  const { reciters, selectedReciter, setSelectedReciter, loadingReciters } = useAudio();

  const handleSelectReciter = async (reciterId: number) => {
    try {
      await setSelectedReciter(reciterId);
      console.log('Selected reciter:', reciterId);
    } catch (error) {
      console.error('Error selecting reciter:', error);
      Alert.alert(
        'خطأ',
        'فشل في اختيار القارئ. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً' }]
      );
    }
  };

  const getReciterDisplayName = (index: number) => {
    return `قارئ عربي ${index + 1}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 48,
    },
    ornateHeader: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      elevation: 5,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.gold,
      fontFamily: 'Amiri_700Bold',
    },
    headerSubtitle: {
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_400Regular',
      color: colors.gold,
      textAlign: 'center',
      marginTop: 4,
      opacity: 0.9,
    },
    content: {
      padding: 16,
    },
    reciterCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: colors.border,
      boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
      elevation: 2,
    },
    reciterCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
      borderWidth: 3,
    },
    reciterInfo: {
      flex: 1,
      alignItems: 'flex-end',
    },
    reciterName: {
      fontSize: textSizes.title,
      fontFamily: 'Amiri_700Bold',
      color: colors.text,
      textAlign: 'right',
    },
    selectButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    selectButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    selectedBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    selectedBadgeText: {
      color: colors.gold,
      fontSize: textSizes.caption,
      fontFamily: 'Amiri_700Bold',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: textSizes.body,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Amiri_400Regular',
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    infoBox: {
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    infoText: {
      fontSize: textSizes.caption,
      color: colors.text,
      textAlign: 'right',
      fontFamily: 'Amiri_400Regular',
      lineHeight: 20,
    },
  });

  if (loadingReciters) {
    return (
      <View style={styles.container}>
        <View style={styles.ornateHeader}>
          <Text style={styles.headerTitle}>القراء</Text>
          <Text style={styles.headerSubtitle}>اختر القارئ المفضل لديك</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>جاري تحميل قائمة القراء...</Text>
        </View>
      </View>
    );
  }

  if (reciters.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.ornateHeader}>
          <Text style={styles.headerTitle}>القراء</Text>
          <Text style={styles.headerSubtitle}>اختر القارئ المفضل لديك</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="volume-high" size={48} style={{ color: colors.textSecondary }} />
          <Text style={styles.emptyText}>
            لا توجد قائمة قراء متاحة حالياً{'\n'}
            يرجى التحقق من اتصالك بالإنترنت
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.ornateHeader}>
        <Text style={styles.headerTitle}>القراء</Text>
        <Text style={styles.headerSubtitle}>
          {reciters.length} قارئ متاح • اضغط لاختيار القارئ
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          اختر القارئ المفضل لديك للاستماع إلى تلاوة القرآن الكريم. سيتم تطبيق اختيارك على جميع الآيات.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reciters.map((reciter, index) => (
          <TouchableOpacity
            key={reciter.id}
            style={[
              styles.reciterCard,
              selectedReciter === reciter.id && styles.reciterCardActive,
            ]}
            onPress={() => handleSelectReciter(reciter.id)}
            activeOpacity={0.7}
          >
            {selectedReciter === reciter.id && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ مختار</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.selectButton,
                selectedReciter === reciter.id && styles.selectButtonActive,
              ]}
              onPress={() => handleSelectReciter(reciter.id)}
            >
              <Icon
                name={selectedReciter === reciter.id ? "checkmark" : "person"}
                size={24}
                style={{ color: selectedReciter === reciter.id ? colors.gold : colors.textSecondary }}
              />
            </TouchableOpacity>

            <View style={styles.reciterInfo}>
              <Text style={styles.reciterName}>{getReciterDisplayName(index)}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
