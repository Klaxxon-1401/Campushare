import { API_BASE_URL } from '../config';

/** Error thrown for any non-2xx API response, carrying the server's code. */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  retryAfterSeconds?: number;

  constructor(status: number, code: string | undefined, message: string, extra?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = extra?.details;
    if (typeof extra?.retryAfterSeconds === 'number') this.retryAfterSeconds = extra.retryAfterSeconds;
  }
}

let authToken: string | null = null;

/** Sets (or clears) the bearer token sent with authenticated requests. */
export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = 15000 } = options;

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (authToken) headers.authorization = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach the CampusShare server. Check your connection and API URL.'
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const err = data?.error ?? {};
    throw new ApiError(
      response.status,
      typeof err.code === 'string' ? err.code : undefined,
      typeof err.message === 'string' ? err.message : `Request failed (${response.status})`,
      typeof err === 'object' ? err : undefined
    );
  }

  return data as T;
}
