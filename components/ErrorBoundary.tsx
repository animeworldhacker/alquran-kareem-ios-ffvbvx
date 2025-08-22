
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>حدث خطأ غير متوقع</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'خطأ غير معروف'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                this.setState({ hasError: false, error: null });
                // Reload the app
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 30,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    maxWidth: 400,
    width: '100%',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Amiri_700Bold',
  },
  errorMessage: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: 'Amiri_400Regular',
  },
  retryButton: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
});
