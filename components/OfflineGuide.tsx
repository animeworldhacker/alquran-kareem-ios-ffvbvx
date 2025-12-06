
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from './Icon';

interface OfflineGuideProps {
  onClose: () => void;
  colors: any;
}

export default function OfflineGuide({ onClose, colors }: OfflineGuideProps) {
  const router = useRouter();

  const handleGoToSettings = () => {
    onClose();
    router.push('/(tabs)/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.gold} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.gold }]}>
          دليل الاستخدام بدون إنترنت
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📥 كيفية تنزيل البيانات
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            1. افتح صفحة الإعدادات{'\n'}
            2. اختر "تنزيل للاستخدام بدون إنترنت"{'\n'}
            3. يمكنك تنزيل:{'\n'}
            • بيانات القرآن الكريم (~2 MB){'\n'}
            • تفسير ابن كثير (~50 MB){'\n'}
            • التلاوات الصوتية (حسب الاختيار){'\n'}
            • أو تنزيل كل شيء دفعة واحدة (~552 MB)
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            ✅ ما يمكنك فعله بدون إنترنت
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            بعد تنزيل البيانات، يمكنك:{'\n'}
            • قراءة القرآن الكريم كاملاً{'\n'}
            • الاستماع للتلاوات المحملة{'\n'}
            • قراءة تفسير ابن كثير{'\n'}
            • إضافة وإدارة العلامات المرجعية{'\n'}
            • تغيير الإعدادات والمظهر
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            🎯 نصائح للاستخدام الأمثل
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            • قم بتنزيل البيانات عند الاتصال بشبكة Wi-Fi{'\n'}
            • يمكنك تنزيل سور محددة بدلاً من القرآن كاملاً{'\n'}
            • التفسير يتم تحميله تلقائياً عند قراءته{'\n'}
            • تحقق من حالة التنزيل في الإعدادات{'\n'}
            • يمكنك مسح البيانات لتوفير المساحة
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            💾 إدارة المساحة
          </Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            • بيانات القرآن: ~2 MB (ضرورية){'\n'}
            • التفسير: ~50 MB (اختياري){'\n'}
            • التلاوات: ~500 MB للقرآن كاملاً{'\n'}
            • يمكنك تنزيل سور محددة لتوفير المساحة{'\n'}
            • راجع حالة التنزيل في الإعدادات
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleGoToSettings}
        >
          <Text style={[styles.buttonText, { color: colors.gold }]}>
            الذهاب إلى الإعدادات
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  sectionText: {
    fontSize: 15,
    fontFamily: 'Amiri_400Regular',
    lineHeight: 24,
    textAlign: 'right',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
});
