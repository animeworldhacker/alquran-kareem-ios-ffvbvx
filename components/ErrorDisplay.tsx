
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

export default function ErrorDisplay({
  title = 'حدث خطأ',
  message,
  onRetry,
  showIcon = true,
}: ErrorDisplayProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showIcon && (
        <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
          <Icon name="alert-circle" size={48} color={colors.error} />
        </View>
      )}

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Amiri_700Bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Amiri_400Regular',
    maxWidth: 400,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
});
