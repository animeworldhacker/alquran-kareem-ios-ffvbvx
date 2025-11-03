
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Top-level error handler that catches all errors in the app
 * This is a fallback for errors that escape other error boundaries
 */
export default class AppErrorHandler extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🚨 AppErrorHandler caught error:', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 AppErrorHandler componentDidCatch:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReload = async () => {
    try {
      console.log('Attempting to reload app...');
      
      // Reset state first
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });

      // Try to reload using Expo Updates
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Error during reload:', error);
      // If reload fails, just reset the error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'حدث خطأ غير متوقع';
      const errorName = this.state.error?.name || 'Error';

      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.errorCard}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>عذراً، حدث خطأ</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى.
              </Text>

              {/* Error Details */}
              <View style={styles.errorBox}>
                <Text style={styles.errorLabel}>تفاصيل الخطأ:</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
                {errorName !== 'Error' && (
                  <Text style={styles.errorType}>النوع: {errorName}</Text>
                )}
              </View>

              {/* Debug Info (Development Only) */}
              {__DEV__ && this.state.error?.stack && (
                <View style={styles.debugBox}>
                  <Text style={styles.debugLabel}>معلومات المطور:</Text>
                  <ScrollView
                    style={styles.debugScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    <Text style={styles.debugText}>
                      {this.state.error.stack}
                    </Text>
                    {this.state.errorInfo && (
                      <>
                        <Text style={styles.debugLabel}>Component Stack:</Text>
                        <Text style={styles.debugText}>
                          {this.state.errorInfo}
                        </Text>
                      </>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Reload Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={this.handleReload}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>إعادة المحاولة</Text>
              </TouchableOpacity>

              {/* Help Text */}
              <Text style={styles.helpText}>
                إذا استمرت المشكلة، يرجى إغلاق التطبيق وإعادة فتحه
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
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: '#D4AF37',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2416',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6D6558',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Amiri_400Regular',
  },
  errorBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D6558',
    marginBottom: 8,
    fontFamily: 'Amiri_700Bold',
  },
  errorText: {
    fontSize: 14,
    color: '#2C2416',
    lineHeight: 22,
    fontFamily: 'Amiri_400Regular',
  },
  errorType: {
    fontSize: 12,
    color: '#6D6558',
    marginTop: 8,
    fontStyle: 'italic',
  },
  debugBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
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
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Amiri_700Bold',
  },
  helpText: {
    fontSize: 14,
    color: '#6D6558',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Amiri_400Regular',
  },
});
