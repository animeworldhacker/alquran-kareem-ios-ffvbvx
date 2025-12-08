
import { Platform } from 'react-native';

interface ErrorLog {
  timestamp: string;
  platform: string;
  error: string;
  stack?: string;
  context?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  logError(error: Error | unknown, context?: string): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    this.logs.push(errorLog);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console
    console.error('🔴 Error logged:', {
      context,
      error: errorLog.error,
      platform: errorLog.platform,
      timestamp: errorLog.timestamp,
    });

    if (errorLog.stack && __DEV__) {
      console.error('Stack trace:', errorLog.stack);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    console.log('🗑️ Error logs cleared');
  }

  getLastError(): ErrorLog | null {
    return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
  }
}

export const errorLogger = new ErrorLogger();

// Export convenience function
export function logError(error: Error | unknown, context?: string): void {
  errorLogger.logError(error, context);
}
