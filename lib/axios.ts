// Lightweight axios-like wrapper using fetch with enhanced error handling
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const isDevelopment = process.env.NODE_ENV === 'development';

type QueryParams = Record<string, string | number | boolean | undefined>;
type RequestOptions = {
  headers?: Record<string, string>;
  params?: QueryParams;
  onUploadProgress?: (e: { loaded: number; total?: number }) => void;
  skipErrorInterceptor?: boolean;
  timeout?: number;
};

// Request interceptor type
type RequestInterceptor = (config: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}) => Promise<void> | void;

// Response interceptors for error handling
type ResponseInterceptor = (error: ApiError) => Promise<ApiError>;
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

// Performance monitoring
interface PerformanceMetric {
  url: string;
  method: string;
  duration: number;
  status?: number;
  timestamp: number;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
  response?: {
    status: number;
    data: any;
  };
}

// Logging utility
const log = {
  info: (...args: any[]) => isDevelopment && console.log('[API]', ...args),
  warn: (...args: any[]) => console.warn('[API]', ...args),
  error: (...args: any[]) => console.error('[API]', ...args),
  debug: (...args: any[]) => isDevelopment && console.debug('[API]', ...args),
};

// Add request interceptor
export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) requestInterceptors.splice(index, 1);
  };
}

// Add response error interceptor
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) responseInterceptors.splice(index, 1);
  };
}

// Performance tracking
const performanceMetrics: PerformanceMetric[] = [];
const MAX_METRICS = 50;

function trackPerformance(metric: PerformanceMetric) {
  performanceMetrics.push(metric);
  if (performanceMetrics.length > MAX_METRICS) {
    performanceMetrics.shift();
  }
  
  // Log slow requests
  if (metric.duration > 3000) {
    log.warn(`Slow API request detected: ${metric.method} ${metric.url} took ${metric.duration}ms`);
  }
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...performanceMetrics];
}

export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

// Default error interceptor for common error handling
addResponseInterceptor(async (error: ApiError) => {
  // Handle authentication errors
  if (error.status === 401) {
    log.warn('Authentication error detected, redirecting to login');
    if (typeof window !== 'undefined') {
      // Clear authentication and redirect to login
      try {
        const { cookieService } = await import('./cookie.service');
        cookieService.remove('token');
        localStorage.removeItem('token');
      } catch (err) {
        log.error('Failed to clear authentication tokens:', err);
      }
      
      // Don't redirect immediately if we're already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
        const redirectUrl = window.location.pathname + window.location.search;
        window.location.href = '/login?redirect=' + encodeURIComponent(redirectUrl);
      }
    }
  }
  
  // Handle forbidden errors
  if (error.status === 403) {
    log.error('Forbidden: Insufficient permissions');
  }
  
  // Handle not found errors
  if (error.status === 404) {
    log.warn('Resource not found:', error.message);
  }
  
  // Handle validation errors
  if (error.status === 400) {
    log.warn('Validation error:', error.data);
  }
  
  // Handle rate limiting
  if (error.status === 429) {
    log.warn('Rate limit exceeded. Please slow down your requests.');
  }
  
  // Handle server errors
  if (error.status && error.status >= 500) {
    log.error('Server Error:', {
      status: error.status,
      message: error.message,
      data: error.data
    });
  }
  
  return error;
});

// Default request interceptor for logging
addRequestInterceptor((config) => {
  log.debug(`${config.method} ${config.url}`);
});

async function buildHeaders(opts?: RequestOptions) {
  const headers: Record<string, string> = { ...(opts?.headers || {}) };
  if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
  try {
    const { getAccessToken } = await import('./cookies');
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch { }
  return headers;
}

function withParams(url: string, params?: QueryParams) {
  if (!params || Object.keys(params).length === 0) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) usp.append(k, String(v));
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${usp.toString()}`;
}

async function request<T>(method: string, url: string, body?: unknown, opts?: RequestOptions) {
  const startTime = performance.now();
  const headers = await buildHeaders(opts);
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (isForm) delete headers['Content-Type'];

  // Run request interceptors
  for (const interceptor of requestInterceptors) {
    await interceptor({ url, method, headers, body });
  }

  // Setup timeout
  const timeout = opts?.timeout || 30000; // 30 seconds default
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    log.debug(`→ ${method} ${url}`, body ? { body } : {});

    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = performance.now() - startTime;
    
    const json = await res.json().catch(() => ({}));
    
    // Track performance
    trackPerformance({
      url,
      method,
      duration,
      status: res.status,
      timestamp: Date.now(),
    });

    log.debug(`← ${method} ${url} [${res.status}] ${duration.toFixed(0)}ms`);
    
    if (!res.ok) {
      const error: ApiError = new Error(json?.error || json?.message || `HTTP ${res.status}`) as ApiError;
      error.status = res.status;
      error.data = json;
      error.response = {
        status: res.status,
        data: json,
      };
      
      // Run through response interceptors unless skipped
      if (!opts?.skipErrorInterceptor) {
        for (const interceptor of responseInterceptors) {
          await interceptor(error);
        }
      }
      
      throw error;
    }
    
    // best-effort progress notification at completion
    if (opts?.onUploadProgress) {
      opts.onUploadProgress({ loaded: 1, total: 1 });
    }
    
    return { 
      data: json as T,
      status: res.status,
      headers: res.headers,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const duration = performance.now() - startTime;

    // Track failed request
    trackPerformance({
      url,
      method,
      duration,
      status: error?.status,
      timestamp: Date.now(),
    });

    // Handle abort/timeout
    if (error.name === 'AbortError') {
      const timeoutError: ApiError = new Error(`Request timeout after ${timeout}ms`) as ApiError;
      timeoutError.code = 'ECONNABORTED';
      log.error(`✗ ${method} ${url} - Request timeout`);
      throw timeoutError;
    }

    if (error instanceof Error && 'status' in error) {
      log.error(`✗ ${method} ${url} [${error.status}] - ${error.message}`);
      throw error; // Already processed
    }
    
    // Network or other errors
    const apiError: ApiError = new Error(error instanceof Error ? error.message : 'Network error') as ApiError;
    log.error(`✗ ${method} ${url} - ${apiError.message}`);
    throw apiError;
  }
}

const api = {
  get<T = unknown>(url: string, opts?: RequestOptions) {
    return request<T>('GET', withParams(url, opts?.params), undefined, opts);
  },
  post<T = unknown>(url: string, data?: unknown, opts?: RequestOptions) {
    return request<T>('POST', url, data, opts);
  },
  put<T = unknown>(url: string, data?: unknown, opts?: RequestOptions) {
    return request<T>('PUT', url, data, opts);
  },
  patch<T = unknown>(url: string, data?: unknown, opts?: RequestOptions) {
    return request<T>('PATCH', url, data, opts);
  },
  delete<T = unknown>(url: string, opts?: RequestOptions) {
    return request<T>('DELETE', url, undefined, opts);
  },
};

export default api;
