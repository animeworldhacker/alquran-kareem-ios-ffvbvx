
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class AppErrorHandler extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('AppErrorHandler caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('AppErrorHandler componentDidCatch:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      stack: error.stack
    });
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null
    });
  }

  reloadApp = (): void => {
    try {
      console.log('Resetting error state...');
      // Simply reset error state to retry rendering
      this.setState({ hasError: false, error: null, errorInfo: null });
    } catch (error) {
      console.error('Error resetting state:', error);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'خطأ غير معروف';
      const errorStack = this.state.error?.stack || '';

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
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity 
                style={styles.retryButton}
                onPress={this.reloadApp}
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
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6D6558',
    textAlign: 'center',
    marginBottom: 24,
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
  },
  errorMessage: {
    fontSize: 14,
    color: '#2C2416',
    lineHeight: 20,
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
  },
  helpText: {
    fontSize: 14,
    color: '#6D6558',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AppErrorHandler;
