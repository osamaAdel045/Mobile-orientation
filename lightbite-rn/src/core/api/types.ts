export interface AppError {
  code: string;
  message: string;
  statusCode: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    trace_id?: string;
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

export function mapApiError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: ApiErrorResponse & { message?: string; errors?: Record<string, string[]> };
      };
    };
    const status = axiosError.response?.status ?? 0;
    const body = axiosError.response?.data;

    if (body?.error) {
      return {
        code: body.error.code,
        message: body.error.message,
        statusCode: status,
      };
    }

    // Laravel 422 validation errors: { message, errors: { field: [...] } }
    if (status === 422 && body?.errors) {
      const firstError = Object.values(body.errors)[0]?.[0] ?? body.message ?? 'Validation failed';
      return { code: 'VALIDATION_ERROR', message: firstError, statusCode: 422 };
    }

    if (status === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please log in again.',
        statusCode: 401,
      };
    }
    if (status === 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Something went wrong. Please try again.',
        statusCode: 500,
      };
    }
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const axiosError = error as { code: string; message: string };
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        code: 'NETWORK_ERROR',
        message: 'No internet connection. Check your network and try again.',
        statusCode: 0,
      };
    }
    if (axiosError.code === 'ECONNABORTED') {
      return { code: 'TIMEOUT', message: 'Request timed out. Please try again.', statusCode: 0 };
    }
  }

  console.error('Unhandled API error:', error);
  return { code: 'UNKNOWN', message: 'An unexpected error occurred.', statusCode: 0 };
}
