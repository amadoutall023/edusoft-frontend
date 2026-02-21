import { ApiError } from '@/shared/errors/ApiError';
import { ApiResponse, AuthResponse } from './types';
import { tokenStorage } from './tokenStorage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions extends RequestInit {
    skipAuth?: boolean;
    method?: HttpMethod;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8089';

let refreshPromise: Promise<void> | null = null;

async function performRefresh(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
        tokenStorage.clear();
        throw new ApiError(401, 'Session expirée');
    }

    const body = JSON.stringify({ refreshToken });

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });

    if (!response.ok) {
        tokenStorage.clear();
        throw new ApiError(response.status, 'Impossible de rafraîchir le token');
    }

    const payload = (await response.json()) as ApiResponse<AuthResponse>;
    if (!payload.data) {
        tokenStorage.clear();
        throw new ApiError(500, 'Réponse de rafraîchissement invalide');
    }
    tokenStorage.saveAuthResponse(payload.data);
}

async function refreshAccessToken(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

async function parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
    }
    return (await response.text()) as unknown as T;
}

export async function httpClient<T>(path: string, options: HttpRequestOptions = {}, retry = false): Promise<T> {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const headers = new Headers(options.headers || {});

    if (!options.skipAuth) {
        const token = tokenStorage.getAccessToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store'
    });

    if (response.status === 401 && !options.skipAuth) {
        if (retry) {
            tokenStorage.clear();
            throw new ApiError(401, 'Session expirée');
        }
        try {
            await refreshAccessToken();
        } catch (error) {
            throw error;
        }
        return httpClient<T>(path, options, true);
    }

    if (!response.ok) {
        let details: unknown;
        try {
            details = await parseResponse(response);
        } catch {
            details = null;
        }
        const message = (details as { message?: string })?.message ?? response.statusText;
        throw new ApiError(response.status, message, details);
    }

    return parseResponse<T>(response);
}
