import axios from 'axios';

// Distinct key so Sirine's app and the other frontend don't clash in one browser.
export const TOKEN_KEY = 'steakz_sirine_token';

export const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

/** Pull a readable message out of an API error. */
export function apiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { error?: string } | undefined)?.error ?? e.message;
  }
  return 'Something went wrong';
}

/** Unwrap the { success, data } envelope the backend returns. */
export async function getData<T>(url: string): Promise<T> {
  const res = await api.get<{ data: T }>(url);
  return res.data.data;
}
