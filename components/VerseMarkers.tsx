
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerseMetadata } from '../types';
import { toArabicIndic, getRubElHizbLabel, getRubElHizbSymbol } from '../utils/tajweedColors';
import Icon from './Icon';

interface VerseMarkersProps {
  metadata: VerseMetadata;
  previousMetadata?: VerseMetadata;
}

export default function VerseMarkers({ metadata, previousMetadata }: VerseMarkersProps) {
  const showJuzMarker = !previousMetadata || metadata.juz_number !== previousMetadata.juz_number;
  const showHizbMarker = !previousMetadata || metadata.hizb_number !== previousMetadata.hizb_number;
  const showRubMarker = metadata.rub_el_hizb_number > 0 && (
    !previousMetadata || metadata.rub_el_hizb_number !== previousMetadata.rub_el_hizb_number
  );
  
  // Check for sajdah - handle both boolean and object types
  const hasSajdah = metadata.sajdah && (
    typeof metadata.sajdah === 'boolean' ? metadata.sajdah : metadata.sajdah.id > 0
  );

  if (!showJuzMarker && !showHizbMarker && !showRubMarker && !hasSajdah) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showJuzMarker && (
        <View style={[styles.marker, styles.juzMarker]}>
          <Text style={styles.markerText}>
            الجزء {toArabicIndic(metadata.juz_number)}
          </Text>
          <Icon name="bookmark" size={16} style={styles.juzIcon} />
        </View>
      )}

      {showHizbMarker && (
        <View style={[styles.marker, styles.hizbMarker]}>
          <Text style={styles.markerText}>
            الحزب {toArabicIndic(metadata.hizb_number)}
          </Text>
          <Icon name="star" size={14} style={styles.hizbIcon} />
        </View>
      )}

      {showRubMarker && (
        <View style={[styles.marker, styles.rubMarker]}>
          <Text style={styles.markerText}>
            {getRubElHizbLabel(metadata.rub_el_hizb_number)}
          </Text>
          <View style={styles.rubIcon}>
            <Text style={styles.rubIconText}>
              {getRubElHizbSymbol(metadata.rub_el_hizb_number)}
            </Text>
          </View>
        </View>
      )}

      {hasSajdah && (
        <View style={[styles.marker, styles.sajdahMarker]}>
          <Text style={styles.sajdahText}>سجدة التلاوة</Text>
          <Icon name="arrow-down-circle" size={16} style={styles.sajdahIcon} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  marker: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    elevation: 2,
  },
  juzMarker: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  hizbMarker: {
    backgroundColor: '#FFA500',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  rubMarker: {
    backgroundColor: '#87CEEB',
    borderWidth: 2,
    borderColor: '#4682B4',
  },
  sajdahMarker: {
    backgroundColor: '#98FB98',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  markerText: {
    fontSize: 14,
    fontFamily: 'Amiri_700Bold',
    color: '#2C2416',
  },
  sajdahText: {
    fontSize: 14,
    fontFamily: 'Amiri_700Bold',
    color: '#1E5B4C',
  },
  juzIcon: {
    color: '#2C2416',
  },
  hizbIcon: {
    color: '#2C2416',
  },
  sajdahIcon: {
    color: '#1E5B4C',
  },
  rubIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4682B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rubIconText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
});
