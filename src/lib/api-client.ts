// Same-origin by default: the browser calls the Next.js origin, which proxies
// to the backend (see next.config.ts rewrites). This keeps the httpOnly auth
// cookies first-party. Override with NEXT_PUBLIC_API_URL only for non-proxied
// setups.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Hard ceiling on any single request. Without this a slow/unreachable backend
// leaves the fetch pending forever, which keeps AuthContext.isLoading=true and
// traps the PWA on its launch splash/spinner. On timeout we abort and surface a
// normal network error so callers (e.g. session rehydration) can move on.
const REQUEST_TIMEOUT_MS = 15000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
 params?: Record<string, string>;
 // When true, a failed 401 (after refresh) will NOT hard-redirect to /login.
 // Used by background/bootstrap probes (e.g. session rehydration) where "not
 // authenticated" is an expected, silent outcome — not a session expiry.
 skipAuthRedirect?: boolean;
}

class ApiError extends Error {
 status: number;
 data: any;

 constructor(status: number, data: any) {
 super(data?.error || `API Error: ${status}`);
 this.status = status;
 this.data = data;
 }
}

// Cookie-based refresh: the httpOnly refresh cookie is sent automatically with
// credentials:'include'; the backend rotates it and sets a fresh access cookie.
// No tokens ever touch JavaScript.
async function refreshToken(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

let isRefreshing = false;
let failedQueue: { resolve: (v: boolean) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, success = false) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(success);
  });
  failedQueue = [];
};

async function request<T>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, skipAuthRedirect, ...rest } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  const defaultHeaders: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      credentials: 'include', // send/receive httpOnly auth cookies
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      signal: controller.signal,
      ...rest,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/token/refresh/')) {
      if (isRefreshing) {
        return new Promise<boolean>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((ok) => {
          if (!ok) throw new ApiError(401, { message: 'Session expired' });
          return request<T>(method, endpoint, options);
        });
      }

      isRefreshing = true;
      const ok = await refreshToken();
      isRefreshing = false;

      if (ok) {
        processQueue(null, true);
        return request<T>(method, endpoint, options);
      } else {
        processQueue(null, false);
        // Silent probes (session rehydration) just want to know auth state; a
        // 401 there is "logged out", not an expiry — never bounce to /login or
        // we get a landing<->login redirect loop for logged-out browser users.
        if (!skipAuthRedirect && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        throw new ApiError(401, { message: 'Session expired' });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const responseData = await response.json();

    // The backend now emits camelCase on the wire (DRF CamelCaseJSONRenderer),
    // so NO snake_case↔camelCase translation happens here anymore. The only
    // remaining transform is two display-field ALIASES (`image`/`location`),
    // provided so generic cards can read a single field regardless of source.
    const normalize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(normalize);

      const result: any = { ...obj };
      if ('imageUrl' in result && !('image' in result)) result.image = result.imageUrl;
      if ('locationName' in result && !('location' in result)) result.location = result.locationName;

      Object.keys(result).forEach((key) => {
        result[key] = normalize(result[key]);
      });
      return result;
    };

    if (responseData && typeof responseData === 'object' && responseData.status === 'success' && 'data' in responseData) {
      const data = responseData.data;
      if (data && typeof data === 'object' && 'results' in data && 'count' in data && Array.isArray(data.results)) {
        return normalize(data.results) as T;
      }
      return normalize(data) as T;
    }

    if (responseData && typeof responseData === 'object' && 'results' in responseData && 'count' in responseData && Array.isArray(responseData.results)) {
      return normalize(responseData.results) as T;
    }

    return normalize(responseData) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // AbortError (timeout) and genuine network failures both land here.
    throw new Error('Network error or server unreachable');
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>('GET', endpoint, options),
  
  post: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>('POST', endpoint, { 
      ...options, 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>('PUT', endpoint, { 
      ...options, 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>('PATCH', endpoint, { 
      ...options, 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },

  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>('DELETE', endpoint, options),
};
