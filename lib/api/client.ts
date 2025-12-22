/**
 * Base API client with error handling and utilities
 * Used by all API modules for consistent fetch behavior
 */

/**
 * Get the base URL for API requests
 * On server-side, we need an absolute URL since there's no browser context
 */
function getBaseUrl(): string {
  // Browser - use relative URL
  if (typeof window !== 'undefined') {
    return '';
  }

  // Server-side - need absolute URL
  // Check for Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return `http://localhost:${process.env.PORT || 3000}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidationError() {
    return this.status === 400;
  }
}

/**
 * Base fetch wrapper with consistent error handling
 * @param url - The URL to fetch from
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws ApiError on non-2xx responses or network errors
 */
export async function apiFetch<TResponse>(
  url: string,
  options?: RequestInit
): Promise<TResponse> {
  try {
    const fullUrl = `${getBaseUrl()}${url}`;
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.error || `API request failed with status ${response.status}`,
        response.status,
        error.code,
        error.details
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as TResponse;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Network request failed:', error);
    // Network error or other fetch failure
    throw new ApiError(
      'Network request failed',
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Build query string from parameters object
 * Filters out undefined/null values
 * @param params - Parameters object
 * @returns Query string (with leading ?) or empty string
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const str = searchParams.toString();
  return str ? `?${str}` : '';
}
