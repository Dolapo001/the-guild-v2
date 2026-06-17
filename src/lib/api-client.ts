const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
 params?: Record<string, string>;
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

async function refreshToken(): Promise<string | null> {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem('the-guild-refresh') : null;
  if (!refresh) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json();
    const newAccess = data?.data?.access || data?.access;
    
    if (newAccess && typeof window !== 'undefined') {
      localStorage.setItem('the-guild-token', newAccess);
      return newAccess;
    }
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function request<T>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('the-guild-token') : null;

  const defaultHeaders: Record<string, string> = {};
  
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      ...rest,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/token/refresh/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          return request<T>(method, endpoint, {
            ...options,
            headers: { ...headers, 'Authorization': `Bearer ${newToken}` }
          });
        }).catch((err) => {
          throw err;
        });
      }

      isRefreshing = true;

      const newToken = await refreshToken();
      
      if (newToken) {
        isRefreshing = false;
        processQueue(null, newToken);
        return request<T>(method, endpoint, {
          ...options,
          headers: { ...headers, 'Authorization': `Bearer ${newToken}` }
        });
      } else {
        isRefreshing = false;
        processQueue(new Error('Session expired'));
        if (typeof window !== 'undefined') {
          localStorage.removeItem('the-guild-token');
          localStorage.removeItem('the-guild-refresh');
          localStorage.removeItem('the-guild-user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
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
    
    // Normalize response data recursively if it's an object or array
    const normalize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(normalize);
      }

      const result: any = { ...obj };
      
      // Critical Guild-specific Mappings
      if ('verification_status' in result) result.verificationStatus = result.verification_status;
      if ('verificationStatus' in result) result.verification_status = result.verificationStatus;
      if ('is_solo_operator' in result) result.isSoloOperator = result.is_solo_operator;
      if ('isSoloOperator' in result) result.is_solo_operator = result.isSoloOperator;
      if ('image_url' in result) result.image = result.image_url;
      if ('location_name' in result) result.location = result.location_name;

      // Recurse through all keys
      Object.keys(result).forEach(key => {
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
    throw new Error('Network error or server unreachable');
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
