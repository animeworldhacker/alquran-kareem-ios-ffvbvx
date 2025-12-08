
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

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
    console.error('🔴 App Error Handler caught error:', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 App Error Details:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReset = () => {
    console.log('🔄 Resetting error state...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>حدث خطأ في التطبيق</Text>
            <Text style={styles.subtitle}>Something went wrong</Text>
            
            {this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
                
                {__DEV__ && this.state.error.stack && (
                  <View style={styles.stackContainer}>
                    <Text style={styles.stackTitle}>Stack Trace:</Text>
                    <Text style={styles.stackText}>{this.state.error.stack}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>إعادة المحاولة</Text>
              <Text style={styles.buttonTextEn}>Try Again</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              إذا استمرت المشكلة، يرجى إعادة تشغيل التطبيق{'\n'}
              If the problem persists, please restart the app
            </Text>
            
            {__DEV__ && (
              <Text style={styles.devNote}>
                Platform: {Platform.OS} | Debug Mode: {__DEV__ ? 'Yes' : 'No'}
              </Text>
            )}
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2416',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6D6558',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#6D6558',
    lineHeight: 18,
  },
  stackContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C2416',
    marginBottom: 4,
  },
  stackText: {
    fontSize: 10,
    color: '#6D6558',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonTextEn: {
    color: '#fff',
    fontSize: 14,
  },
  helpText: {
    fontSize: 14,
    color: '#6D6558',
    textAlign: 'center',
    lineHeight: 20,
  },
  devNote: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
