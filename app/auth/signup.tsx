
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../styles/commonStyles';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      Alert.alert('خطأ في إنشاء الحساب', error.message);
    } else {
      Alert.alert(
        'تم إنشاء الحساب',
        'تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. الرجاء التحقق من بريدك لتفعيل الحساب.',
        [
          {
            text: 'حسناً',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>إنشاء حساب جديد</Text>
          <Text style={styles.subtitle}>
            قم بإنشاء حساب لمزامنة بياناتك عبر الأجهزة
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="الاسم الكامل (اختياري)"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={styles.input}
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>إنشاء حساب</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.back()}
            >
              <Text style={styles.linkText}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'right',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
});
