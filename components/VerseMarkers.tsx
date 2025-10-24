
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ayah } from '../types';
import { toArabicIndic, getRubElHizbLabel } from '../utils/tajweedColors';
import { useTheme } from '../contexts/ThemeContext';

interface VerseMarkersProps {
  ayah: Ayah;
  previousAyah?: Ayah;
  compact?: boolean;
}

const VerseMarkers = React.memo(({ ayah, previousAyah, compact = false }: VerseMarkersProps) => {
  const { colors } = useTheme();

  // Determine which markers to show based on changes from previous ayah
  const shouldShowJuz = !previousAyah || ayah.juz !== previousAyah.juz;
  const shouldShowHizb = !previousAyah || Math.floor((ayah.hizbQuarter - 1) / 4) !== Math.floor((previousAyah.hizbQuarter - 1) / 4);
  const shouldShowRub = ayah.hizbQuarter && ayah.hizbQuarter > 0 && (!previousAyah || ayah.hizbQuarter !== previousAyah.hizbQuarter);
  
  // Check for sajdah - handle both boolean and object types
  const hasSajdah = ayah.sajda && (
    typeof ayah.sajda === 'boolean' ? ayah.sajda : true
  );

  // If no markers to show, return null
  if (!shouldShowJuz && !shouldShowHizb && !shouldShowRub && !hasSajdah) {
    return null;
  }

  // Calculate hizb number from hizbQuarter (4 quarters per hizb)
  const hizbNumber = ayah.hizbQuarter ? Math.ceil(ayah.hizbQuarter / 4) : 0;
  
  // Calculate rub number (1-4 within current hizb)
  const rubNumber = ayah.hizbQuarter ? ((ayah.hizbQuarter - 1) % 4) + 1 : 0;

  // Get compact labels for small screens
  const getCompactRubLabel = (num: number): string => {
    const labels: { [key: number]: string } = {
      1: '¼ حزب',
      2: '½ حزب',
      3: '¾ حزب',
      4: 'حزب',
    };
    return labels[num] || '¼ حزب';
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
      rowGap: 6,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.outline,
      borderWidth: 1,
      borderRadius: 8,
      height: compact ? 18 : 20,
      paddingHorizontal: compact ? 4 : 6,
      gap: 4,
      flexShrink: 1,
    },
    badgeText: {
      fontSize: compact ? 10 : 11,
      color: colors.onSurfaceVariant,
      fontFamily: 'Amiri_400Regular',
      flexShrink: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* Rub' badge - shown when hizbQuarter changes */}
      {shouldShowRub && rubNumber > 0 && (
        <View 
          style={styles.badge}
          accessibilityLabel={getRubElHizbLabel(rubNumber)}
        >
          <Text style={styles.badgeText} numberOfLines={1}>
            {compact ? getCompactRubLabel(rubNumber) : getRubElHizbLabel(rubNumber)}
          </Text>
        </View>
      )}

      {/* Hizb badge - shown when hizb changes */}
      {shouldShowHizb && hizbNumber > 0 && (
        <View 
          style={styles.badge}
          accessibilityLabel={`الحزب رقم ${toArabicIndic(hizbNumber)}`}
        >
          <Text style={styles.badgeText} numberOfLines={1}>
            {compact ? `حزب ${toArabicIndic(hizbNumber)}` : `الحزب ${toArabicIndic(hizbNumber)}`}
          </Text>
        </View>
      )}

      {/* Juz badge - shown when juz changes */}
      {shouldShowJuz && ayah.juz > 0 && (
        <View 
          style={styles.badge}
          accessibilityLabel={`الجزء رقم ${toArabicIndic(ayah.juz)}`}
        >
          <Text style={styles.badgeText} numberOfLines={1}>
            {compact ? `جزء ${toArabicIndic(ayah.juz)}` : `الجزء ${toArabicIndic(ayah.juz)}`}
          </Text>
        </View>
      )}

      {/* Sajdah badge - shown when sajdah is present */}
      {hasSajdah && (
        <View 
          style={styles.badge}
          accessibilityLabel="سجدة التلاوة"
        >
          <Text style={styles.badgeText} numberOfLines={1}>
            سجدة
          </Text>
        </View>
      )}
    </View>
  );
});

VerseMarkers.displayName = 'VerseMarkers';

export default VerseMarkers;
