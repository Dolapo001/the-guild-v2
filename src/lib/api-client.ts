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

async function request<T>(method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<T> {
 const { params, headers, ...rest } = options;

 let url = `${BASE_URL}${endpoint}`;
 if (params) {
 const query = new URLSearchParams(params).toString();
 url += `?${query}`;
 }

 const token = typeof window !== 'undefined' ? localStorage.getItem('the-guild-token') : null;

  const defaultHeaders: Record<string, string> = {};
  
  // Only set Content-Type if not FormData (Browser sets it for FormData with boundary)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

 const response = await fetch(url, {
 method,
 headers: {
 ...defaultHeaders,
 ...headers,
 },
 ...rest,
 });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Global 401 Handle: Clear token if session is invalid
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('the-guild-token');
      localStorage.removeItem('the-guild-user');
      // Only redirect if not already on login/register to avoid loops
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    throw new ApiError(response.status, errorData);
  }

 if (response.status === 204) {
 return {} as T;
 }

 const responseData = await response.json();
  
 // Unwrap Django ResponseHandler structure if present
 if (responseData && typeof responseData === 'object' && responseData.status === 'success' && 'data' in responseData) {
   return responseData.data as T;
 }
 
 return responseData as T;
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
