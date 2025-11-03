
import NetInfo from '@react-native-community/netinfo';

class NetworkUtils {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Subscribe to network state changes
      NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected ?? true;
        
        console.log('Network state changed:', {
          isConnected: state.isConnected,
          type: state.type,
          isInternetReachable: state.isInternetReachable,
        });

        // Notify listeners if status changed
        if (wasOnline !== this.isOnline) {
          this.notifyListeners();
        }
      });

      console.log('✅ Network monitoring initialized');
    } catch (error) {
      console.error('❌ Failed to initialize network monitoring:', error);
      // Assume online if we can't check
      this.isOnline = true;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected ?? true;
      
      console.log('Network check:', {
        isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });
      
      return isConnected;
    } catch (error) {
      console.error('Error checking network connection:', error);
      // Return true as fallback to allow app to try network requests
      return true;
    }
  }

  async isInternetReachable(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isInternetReachable ?? true;
    } catch (error) {
      console.error('Error checking internet reachability:', error);
      return true;
    }
  }

  getConnectionType(): Promise<string> {
    return NetInfo.fetch().then(state => state.type || 'unknown');
  }

  /**
   * Subscribe to network state changes
   * Returns an unsubscribe function
   */
  subscribe(callback: (state: { isConnected: boolean }) => void): () => void {
    const listener = (isOnline: boolean) => {
      callback({ isConnected: isOnline });
    };
    
    this.addListener(listener);
    
    // Return unsubscribe function
    return () => {
      this.removeListener(listener);
    };
  }

  addListener(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this.isOnline);
  }

  removeListener(callback: (isOnline: boolean) => void) {
    this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  getCurrentStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Retry a network request with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check if we're online before attempting
        const isConnected = await this.isConnected();
        if (!isConnected) {
          throw new Error('لا يوجد اتصال بالإنترنت');
        }

        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt + 1} failed:`, error);

        // Don't retry if it's the last attempt
        if (attempt === maxRetries - 1) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('فشل الطلب بعد عدة محاولات');
  }

  /**
   * Fetch with timeout
   */
  async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.');
        }
        throw error;
      }
      
      throw new Error('فشل الاتصال بالخادم');
    }
  }
}

export const networkUtils = new NetworkUtils();
