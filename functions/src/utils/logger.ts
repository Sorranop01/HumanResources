import * as logger from 'firebase-functions/logger';

/**
 * Structured logging utilities
 */

export function logInfo(message: string, data?: Record<string, unknown>): void {
  logger.info(message, data);
}

export function logWarn(message: string, data?: Record<string, unknown>): void {
  logger.warn(message, data);
}

export function logError(message: string, error?: unknown, data?: Record<string, unknown>): void {
  logger.error(message, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    ...data,
  });
}

export function logDebug(message: string, data?: Record<string, unknown>): void {
  logger.debug(message, data);
}
