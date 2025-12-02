// Lightweight axios-like wrapper using fetch
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type QueryParams = Record<string, string | number | boolean | undefined>;
type RequestOptions = {
  headers?: Record<string, string>;
  params?: QueryParams;
  onUploadProgress?: (e: { loaded: number; total?: number }) => void;
};

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
  const headers = await buildHeaders(opts);
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (isForm) delete headers['Content-Type'];

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  // best-effort progress notification at completion
  if (opts?.onUploadProgress) opts.onUploadProgress({ loaded: 1, total: 1 });
  return { data: json as T };
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
