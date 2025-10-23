
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerseMetadata } from '../types';
import { toArabicIndic, getRubElHizbLabel } from '../utils/tajweedColors';
import Icon from './Icon';

interface VerseMarkersProps {
  metadata: VerseMetadata;
  previousMetadata?: VerseMetadata;
}

export default function VerseMarkers({ metadata, previousMetadata }: VerseMarkersProps) {
  const showJuzMarker = !previousMetadata || metadata.juz_number !== previousMetadata.juz_number;
  const showHizbMarker = !previousMetadata || metadata.hizb_number !== previousMetadata.hizb_number;
  const showRubMarker = !previousMetadata || metadata.rub_el_hizb_number !== previousMetadata.rub_el_hizb_number;
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
          <Icon name="bookmark" size={16} style={styles.markerIcon} />
          <Text style={styles.markerText}>
            الجزء {toArabicIndic(metadata.juz_number)}
          </Text>
        </View>
      )}

      {showHizbMarker && (
        <View style={[styles.marker, styles.hizbMarker]}>
          <Icon name="star" size={14} style={styles.markerIcon} />
          <Text style={styles.markerText}>
            الحزب {toArabicIndic(metadata.hizb_number)}
          </Text>
        </View>
      )}

      {showRubMarker && (
        <View style={[styles.marker, styles.rubMarker]}>
          <View style={styles.rubIcon}>
            <Text style={styles.rubIconText}>
              {metadata.rub_el_hizb_number === 1 ? '¼' : 
               metadata.rub_el_hizb_number === 2 ? '½' : 
               metadata.rub_el_hizb_number === 3 ? '¾' : '●'}
            </Text>
          </View>
          <Text style={styles.markerText}>
            {getRubElHizbLabel(metadata.rub_el_hizb_number)}
          </Text>
        </View>
      )}

      {hasSajdah && (
        <View style={[styles.marker, styles.sajdahMarker]}>
          <Icon name="arrow-down-circle" size={16} style={styles.sajdahIcon} />
          <Text style={styles.sajdahText}>سجدة التلاوة</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
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
  markerIcon: {
    color: '#2C2416',
  },
  sajdahIcon: {
    color: '#1E5B4C',
  },
  markerText: {
    fontSize: 13,
    fontFamily: 'Amiri_700Bold',
    color: '#2C2416',
  },
  sajdahText: {
    fontSize: 13,
    fontFamily: 'Amiri_700Bold',
    color: '#1E5B4C',
  },
  rubIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4682B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rubIconText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});
