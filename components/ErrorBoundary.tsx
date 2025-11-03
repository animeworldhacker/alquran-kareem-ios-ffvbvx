
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      stack: error.stack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = async () => {
    try {
      // Try to reload the app using Expo Updates
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
      } else {
        // Fallback: reset error state
        this.setState({ hasError: false, error: null, errorInfo: null });
      }
    } catch (error) {
      console.error('Error reloading app:', error);
      // Reset error state as fallback
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'خطأ غير معروف';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              
              <Text style={styles.errorTitle}>حدث خطأ غير متوقع</Text>
              
              <Text style={styles.errorSubtitle}>
                نعتذر عن هذا الإزعاج
              </Text>
              
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorLabel}>تفاصيل الخطأ:</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>

              {__DEV__ && errorStack && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugLabel}>Stack Trace (Dev Only):</Text>
                  <ScrollView 
                    style={styles.debugScroll}
                    nestedScrollEnabled
                  >
                    <Text style={styles.debugText}>{errorStack}</Text>
                    {componentStack && (
                      <>
                        <Text style={styles.debugLabel}>Component Stack:</Text>
                        <Text style={styles.debugText}>{componentStack}</Text>
                      </>
                    )}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity 
                style={styles.retryButton}
                onPress={this.handleReload}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
              </TouchableOpacity>

              <Text style={styles.helpText}>
                إذا استمرت المشكلة، يرجى إعادة تشغيل التطبيق
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EEE3',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    maxWidth: 500,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2416',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6D6558',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Amiri_400Regular',
  },
  errorMessageContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D6558',
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
  },
  errorMessage: {
    fontSize: 14,
    color: '#2C2416',
    lineHeight: 20,
    fontFamily: 'Amiri_400Regular',
  },
  debugContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    maxHeight: 200,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  debugScroll: {
    maxHeight: 150,
  },
  debugText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  helpText: {
    fontSize: 14,
    color: '#6D6558',
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
    lineHeight: 20,
  },
});
