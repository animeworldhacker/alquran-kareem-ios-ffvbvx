
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { useAudio } from '../../hooks/useAudio';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export default function SettingsTab() {
  const { reciters, selectedReciter, setSelectedReciter } = useAudio();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '70%'], []);
  const [open, setOpen] = useState(false);

  const selected = reciters.find(r => r.id === selectedReciter);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      sheetRef.current?.snapToIndex(1);
    }, 0);
  };

  const handleClose = () => {
    sheetRef.current?.close();
    setOpen(false);
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>القارئ الحالي</Text>
          <Text style={styles.currentText}>{selected ? selected.name : 'غير محدد'}</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={handleOpen}>
            <Icon name="musical-notes" size={18} style={{ color: colors.backgroundAlt, marginLeft: 6 }} />
            <Text style={styles.selectBtnText}>اختر القارئ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {open && (
        <BottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={handleClose}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} pressBehavior="close" opacity={0.3} />
          )}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>اختر القارئ</Text>
            <ScrollView style={{ flex: 1 }}>
              {reciters.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.reciterItem, r.id === selectedReciter && styles.reciterItemActive]}
                  onPress={() => {
                    setSelectedReciter(r.id);
                    handleClose();
                  }}
                >
                  <Icon name="person" size={20} style={{ color: r.id === selectedReciter ? colors.backgroundAlt : colors.text }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reciterName, r.id === selectedReciter && { color: colors.backgroundAlt }]}>{r.name}</Text>
                    <Text style={[styles.reciterMeta, r.id === selectedReciter && { color: colors.backgroundAlt }]}>{r.rewaya || ''}</Text>
                  </View>
                  {r.id === selectedReciter && <Icon name="checkmark-circle" size={20} style={{ color: colors.backgroundAlt }} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Amiri_700Bold',
    color: colors.text,
    textAlign: 'right',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Amiri_700Bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  currentText: {
    fontSize: 18,
    color: colors.text,
    fontFamily: 'Amiri_700Bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  selectBtn: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectBtnText: {
    color: colors.backgroundAlt,
    fontFamily: 'Amiri_700Bold',
    fontSize: 14,
  },
  sheetContent: {
    flex: 1,
    padding: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Amiri_700Bold',
    color: colors.text,
    textAlign: 'right',
    marginBottom: 8,
  },
  reciterItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reciterItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reciterName: {
    fontSize: 16,
    fontFamily: 'Amiri_700Bold',
    color: colors.text,
    textAlign: 'right',
  },
  reciterMeta: {
    fontSize: 12,
    fontFamily: 'Amiri_400Regular',
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
