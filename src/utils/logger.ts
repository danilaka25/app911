import * as Sentry from '@sentry/react-native';

export const logger = {
  debug: (message: string, data?: any) => {
    Sentry.addBreadcrumb({
      category: 'debug',
      message,
      data,
      level: 'debug',
    });
  },

  info: (message: string, data?: any) => {
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      data,
      level: 'info',
    });
  },

  warn: (message: string, data?: any) => {
    Sentry.addBreadcrumb({
      category: 'warning',
      message,
      data,
      level: 'warning',
    });
  },

  error: (message: string, error?: any) => {
    Sentry.addBreadcrumb({
      category: 'error',
      message,
      data: {error},
      level: 'error',
    });

    if (error instanceof Error) {
      Sentry.captureException(error);
    }
  },
};
