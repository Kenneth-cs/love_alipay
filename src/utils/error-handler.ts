import Taro from '@tarojs/taro';

export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  userAgent?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogs: ErrorInfo[] = [];
  private maxLogs = 50; // 最多保存50条错误日志

  private constructor() {
    this.setupGlobalErrorHandler();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandler() {
    // 设置全局错误处理
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          message: event.message,
          stack: event.error?.stack,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        });
      });
    }
  }

  public logError(error: ErrorInfo) {
    this.errorLogs.unshift(error);
    
    // 保持日志数量在限制内
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogs);
    }

    // 在开发环境下输出错误
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }

    // 尝试保存到本地存储
    try {
      Taro.setStorageSync('error_logs', JSON.stringify(this.errorLogs));
    } catch (e) {
      console.warn('Failed to save error logs:', e);
    }
  }

  public getErrorLogs(): ErrorInfo[] {
    return [...this.errorLogs];
  }

  public clearErrorLogs() {
    this.errorLogs = [];
    try {
      Taro.removeStorageSync('error_logs');
    } catch (e) {
      console.warn('Failed to clear error logs:', e);
    }
  }

  public handleStorageError(operation: string, error: any) {
    const errorInfo: ErrorInfo = {
      message: `Storage ${operation} failed: ${error.message || error}`,
      stack: error.stack,
      timestamp: Date.now(),
    };

    this.logError(errorInfo);

    // 根据错误类型显示不同的用户提示
    if (error.message && error.message.includes('exceed')) {
      Taro.showModal({
        title: '存储空间不足',
        content: '设备存储空间不足，部分数据可能无法保存。建议清理设备存储空间。',
        showCancel: false,
      });
    } else if (error.message && error.message.includes('quota')) {
      Taro.showModal({
        title: '存储配额超限',
        content: '应用存储配额已满，请清理一些数据后重试。',
        showCancel: false,
      });
    } else {
      Taro.showToast({
        title: '数据操作失败',
        icon: 'none',
        duration: 2000,
      });
    }
  }

  public async recoverData() {
    try {
      // 尝试从本地存储恢复错误日志
      const savedLogs = Taro.getStorageSync('error_logs');
      if (savedLogs) {
        this.errorLogs = JSON.parse(savedLogs);
      }
    } catch (e) {
      console.warn('Failed to recover error logs:', e);
    }
  }

  public async clearAllAppData() {
    try {
      // 清除所有应用数据
      const result = await Taro.getStorageInfo();
      if (result.errMsg === 'getStorageInfo:ok') {
        const keys = (result as any).keys || [];
        
        for (const key of keys) {
          if (key.startsWith('love-app-')) {
            await Taro.removeStorage({ key });
          }
        }
      }

      Taro.showToast({
        title: '数据已清除',
        icon: 'success',
      });

      return true;
    } catch (error) {
      this.handleStorageError('clear', error);
      return false;
    }
  }

  public async getStorageUsage() {
    try {
      const result = await Taro.getStorageInfo();
      if (result.errMsg === 'getStorageInfo:ok') {
        const storageInfo = result as any;
        return {
          currentSize: storageInfo.currentSize || 0,
          limitSize: storageInfo.limitSize || 0,
          keys: storageInfo.keys || [],
          usage: storageInfo.limitSize > 0
            ? Math.round((storageInfo.currentSize / storageInfo.limitSize) * 100)
            : 0
        };
      }
      return null;
    } catch (error) {
      console.warn('Failed to get storage usage:', error);
      return null;
    }
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 便捷函数
export const logError = (message: string, error?: any) => {
  errorHandler.logError({
    message,
    stack: error?.stack,
    timestamp: Date.now(),
  });
};

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage: string = '操作失败'
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    logError(errorMessage, error);
    return null;
  }
};