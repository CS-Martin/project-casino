/**
 * Structured logging utility for the Casino Intelligence Platform
 *
 * Production-optimized logger that only logs errors by default to minimize
 * resource consumption. Additional log levels can be enabled via LOG_LEVEL env var.
 *
 * Environment variables:
 * - LOG_LEVEL: 'error' (default) | 'warn' | 'info' | 'debug'
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  service?: string;
  function?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';
  private logLevel: LogLevel;

  constructor() {
    // Default to 'error' in production to minimize costs
    // Can be overridden with LOG_LEVEL environment variable
    const envLogLevel = process.env.LOG_LEVEL as LogLevel;

    if (this.isDev) {
      this.logLevel = envLogLevel || 'debug'; // More verbose in dev
    } else {
      this.logLevel = envLogLevel || 'error'; // Only errors in production
    }
  }

  /**
   * Check if a log level should be logged based on current log level setting
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.isTest) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log entry as structured JSON
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      environment: process.env.NODE_ENV,
      ...context,
    };

    // In development, make it more readable
    if (this.isDev) {
      return logEntry;
    }

    // In production, use JSON string for log aggregation tools
    return JSON.stringify(logEntry);
  }

  /**
   * Get the appropriate console method and emoji for log level
   */
  private getLogMethod(level: LogLevel): {
    method: typeof console.log;
    emoji: string;
  } {
    switch (level) {
      case 'debug':
        return { method: console.debug, emoji: '🔍' };
      case 'info':
        return { method: console.info, emoji: 'ℹ️' };
      case 'warn':
        return { method: console.warn, emoji: '⚠️' };
      case 'error':
        return { method: console.error, emoji: '❌' };
    }
  }

  /**
   * Log a debug message (only when LOG_LEVEL=debug)
   */
  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return;

    const { method, emoji } = this.getLogMethod('debug');
    method(emoji, this.formatLog('debug', message, context));
  }

  /**
   * Log an info message (only when LOG_LEVEL=info or lower)
   */
  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return;

    const { method, emoji } = this.getLogMethod('info');
    method(emoji, this.formatLog('info', message, context));
  }

  /**
   * Log a warning message (only when LOG_LEVEL=warn or lower)
   */
  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return;

    const { method, emoji } = this.getLogMethod('warn');
    method(emoji, this.formatLog('warn', message, context));
  }

  /**
   * Log an error message (always logged unless in test mode)
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (!this.shouldLog('error')) return;

    const errorContext: LogContext = {
      ...context,
    };

    // Extract error details if provided
    if (error instanceof Error) {
      errorContext.errorMessage = error.message;
      errorContext.errorName = error.name;
      errorContext.errorStack = error.stack;
    } else if (error) {
      errorContext.error = String(error);
    }

    const { method, emoji } = this.getLogMethod('error');
    method(emoji, this.formatLog('error', message, errorContext));
  }

  /**
   * Log the start of an operation (disabled in production to save costs)
   */
  startOperation(operation: string, context?: LogContext) {
    this.debug(`Starting: ${operation}`, {
      ...context,
      operation,
      phase: 'start',
    });
  }

  /**
   * Log the completion of an operation (disabled in production to save costs)
   */
  endOperation(operation: string, duration: number, context?: LogContext) {
    this.debug(`Completed: ${operation}`, {
      ...context,
      operation,
      phase: 'end',
      duration,
      durationUnit: 'ms',
    });
  }

  /**
   * Log API request (disabled in production to save costs)
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.debug(`API Request: ${method} ${path}`, {
      ...context,
      type: 'api_request',
      method,
      path,
    });
  }

  /**
   * Log API response (only errors logged in production to save costs)
   */
  apiResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    // Only log errors in production to minimize resource usage
    if (statusCode >= 400) {
      this.error(`API Error: ${method} ${path} - ${statusCode}`, undefined, {
        ...context,
        type: 'api_response',
        method,
        path,
        statusCode,
        duration,
        durationUnit: 'ms',
      });
    } else {
      // Success responses only logged in debug mode
      this.debug(`API Success: ${method} ${path} - ${statusCode}`, {
        ...context,
        type: 'api_response',
        method,
        path,
        statusCode,
        duration,
        durationUnit: 'ms',
      });
    }
  }

  /**
   * Log database operation (disabled in production to save costs)
   */
  dbOperation(operation: string, table: string, context?: LogContext) {
    this.debug(`DB Operation: ${operation} on ${table}`, {
      ...context,
      type: 'db_operation',
      operation,
      table,
    });
  }

  /**
   * Log AI/LLM operation (disabled in production to save costs)
   */
  aiOperation(operation: string, model: string, context?: LogContext) {
    this.debug(`AI Operation: ${operation}`, {
      ...context,
      type: 'ai_operation',
      operation,
      model,
    });
  }

  /**
   * Log cache operation (disabled in production to save costs)
   */
  cacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, context?: LogContext) {
    this.debug(`Cache ${operation}: ${key}`, {
      ...context,
      type: 'cache_operation',
      operation,
      key,
    });
  }
}

// Export singleton instance
export const logger = new Logger();
