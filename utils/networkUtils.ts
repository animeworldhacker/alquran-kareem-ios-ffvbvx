
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

class NetworkUtils {
  private currentState: NetworkState = {
    isConnected: false,
    isInternetReachable: null,
    type: 'unknown',
  };

  private listeners: ((state: NetworkState) => void)[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Subscribe to network state updates
      NetInfo.addEventListener(state => {
        this.currentState = {
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
        };

        // Notify all listeners
        this.listeners.forEach(listener => listener(this.currentState));

        console.log('Network state changed:', this.currentState);
      });

      // Get initial state
      const state = await NetInfo.fetch();
      this.currentState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };

      console.log('Initial network state:', this.currentState);
    } catch (error) {
      console.error('Error initializing network utils:', error);
    }
  }

  /**
   * Check if device is connected to the internet
   */
  async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }

  /**
   * Check if internet is reachable (can actually access the internet)
   */
  async isInternetReachable(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isInternetReachable ?? false;
    } catch (error) {
      console.error('Error checking internet reachability:', error);
      return false;
    }
  }

  /**
   * Get current network state
   */
  async getNetworkState(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
    } catch (error) {
      console.error('Error getting network state:', error);
      return this.currentState;
    }
  }

  /**
   * Subscribe to network state changes
   */
  subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Show offline alert
   */
  showOfflineAlert() {
    Alert.alert(
      'لا يوجد اتصال بالإنترنت',
      'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
      [{ text: 'حسناً', style: 'default' }]
    );
  }

  /**
   * Show error alert with retry option
   */
  showErrorAlert(message: string, onRetry?: () => void) {
    const buttons = onRetry
      ? [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'إعادة المحاولة', onPress: onRetry },
        ]
      : [{ text: 'حسناً', style: 'default' }];

    Alert.alert('خطأ', message, buttons);
  }

  /**
   * Execute a function with network check
   */
  async executeWithNetworkCheck<T>(
    fn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T> {
    const isConnected = await this.isConnected();

    if (!isConnected) {
      this.showOfflineAlert();
      throw new Error('لا يوجد اتصال بالإنترنت');
    }

    try {
      return await fn();
    } catch (error) {
      console.error('Error executing function:', error);
      const message = errorMessage || 'حدث خطأ أثناء تنفيذ العملية';
      throw new Error(message);
    }
  }
}

export const networkUtils = new NetworkUtils();
