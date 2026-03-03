import { ApiError } from '@/shared/errors/ApiError';
import { ApiResponse, AuthResponse } from './types';
import { tokenStorage } from './tokenStorage';
import { getStoredActiveYearId } from './activeYearStorage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions extends RequestInit {
    skipAuth?: boolean;
    method?: HttpMethod;
    suppressErrorLog?: boolean; // Suppress console.error for expected errors (e.g., 403 on optional endpoints)
    skipYearFilter?: boolean; // Skip adding anneeScolaireId to the request
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

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
    const activeYearId = getStoredActiveYearId();
    
    // Add academic year as query parameter instead of header to avoid CORS issues
    // Only add if not explicitly skipped and there's an active year
    let url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    if (activeYearId && !options.skipYearFilter && !path.includes('anneeScolaireId=')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}anneeScolaireId=${activeYearId}`;
    }
    
    const headers = new Headers(options.headers || {});

    if (!options.skipAuth) {
        const token = tokenStorage.getAccessToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    // For FormData, don't set Content-Type - let the browser set it with the boundary
    // For other bodies, set JSON content type if not already set
    if (options.body) {
        if (options.body instanceof FormData) {
            // Don't set Content-Type for FormData - browser will do it with boundary
        } else if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
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
        // Only log errors if not suppressed
        const suppressLog = (options as HttpRequestOptions)?.suppressErrorLog;
        if (!suppressLog) {
            console.error('Erreur API:', response.status, details);
        }
        
        // Extraire le message d'erreur de la réponse JSON ou du texte brut
        let message = response.statusText;
        
        if (details) {
            const detailsObj = details as Record<string, unknown>;
            // Priorité 1: message dans la réponse JSON (notre structure d'API)
            if (typeof detailsObj.message === 'string') {
                message = detailsObj.message;
            }
            // Priorité 2: code d'erreur s'il y a un objet data avec un code
            if (detailsObj.data && typeof detailsObj.data === 'object') {
                const data = detailsObj.data as Record<string, unknown>;
                if (data.code === 'DATA_INTEGRITY_ERROR' && data.message) {
                    message = data.message as string;
                }
            }
        }
        
        throw new ApiError(response.status, message, details);
    }

    return parseResponse<T>(response);
}
