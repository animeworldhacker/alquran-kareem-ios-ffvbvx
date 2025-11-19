
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('خطأ في تسجيل الدخول', error.message);
    } else {
      Alert.alert('نجح', 'تم تسجيل الدخول بنجاح');
      router.replace('/home');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>
            قم بتسجيل الدخول لمزامنة بياناتك عبر الأجهزة
          </Text>

          <View style={styles.form}>
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
              placeholder="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.linkText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.secondaryButtonText}>إنشاء حساب جديد</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.back()}
            >
              <Text style={styles.linkText}>المتابعة بدون تسجيل</Text>
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
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
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
