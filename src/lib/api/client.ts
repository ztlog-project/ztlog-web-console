const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/admin/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || null;
}

export class AuthExpiredError extends Error {
  constructor() {
    super('인증이 만료되었습니다. 다시 로그인해주세요.');
    this.name = 'AuthExpiredError';
  }
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=UTF-8',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new AuthExpiredError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API 오류 (${response.status})`);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    const url = params
      ? `${endpoint}?${new URLSearchParams(
          Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
        ).toString()}`
      : endpoint;
    return apiClient<T>(url);
  },
  post: <T = any>(endpoint: string, data: unknown): Promise<T> =>
    apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T = any>(endpoint: string, data: unknown): Promise<T> =>
    apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T = any>(endpoint: string): Promise<T> =>
    apiClient<T>(endpoint, { method: 'DELETE' })
};
