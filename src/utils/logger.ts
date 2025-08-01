import { getEnvironment } from '../config/environment.js';

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (getEnvironment().LOG_LEVEL === 'info' || getEnvironment().LOG_LEVEL === 'debug') {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...meta
      }));
    }
  },

  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta
    }));
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    if (getEnvironment().LOG_LEVEL === 'warn' || getEnvironment().LOG_LEVEL === 'info' || getEnvironment().LOG_LEVEL === 'debug') {
      console.warn(JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        ...meta
      }));
    }
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (getEnvironment().LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...meta
      }));
    }
  },

  // Specialized method for API calls
  logApiCall({
    endpoint,
    method,
    requestPayload,
    responseStatus,
    responseTime,
    error,
  }: {
    endpoint: string;
    method: string;
    requestPayload?: any;
    responseStatus?: number;
    responseTime?: number;
    error?: Error;
  }): void {
    const logData = {
      endpoint,
      method,
      requestPayload: this.sanitizePayload(requestPayload),
      responseStatus,
      responseTime,
      error: error ? { message: error.message, stack: error.stack } : undefined,
    };

    if (error) {
      this.error('API call failed', error, logData);
    } else {
      this.info('API call completed', logData);
    }
  },

  sanitizePayload(payload: any): any {
    if (!payload) return payload;

    // Deep clone to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(payload));

    // Redact sensitive fields
    if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
    if (sanitized['chave-api-portal']) sanitized['chave-api-portal'] = '[REDACTED]';
    if (sanitized['X-Api-Key']) sanitized['X-Api-Key'] = '[REDACTED]';

    return sanitized;
  }
}; 