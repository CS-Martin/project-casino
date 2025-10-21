export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 log entries

  log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      error,
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging with appropriate level
    const logMessage = `[${new Date(entry.timestamp).toISOString()}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, context, error);
        break;
      case LogLevel.INFO:
        console.info(logMessage, context, error);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, context, error);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, context, error);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {
        debug: this.logs.filter((l) => l.level === LogLevel.DEBUG).length,
        info: this.logs.filter((l) => l.level === LogLevel.INFO).length,
        warn: this.logs.filter((l) => l.level === LogLevel.WARN).length,
        error: this.logs.filter((l) => l.level === LogLevel.ERROR).length,
      },
      recentErrors: this.logs
        .filter((l) => l.level === LogLevel.ERROR)
        .slice(-10)
        .map((l) => ({
          timestamp: l.timestamp,
          message: l.message,
          context: l.context,
        })),
    };

    return stats;
  }
}

export const logger = new Logger();
