import { httpClient } from './httpClient';
import { ApiResponse, AuthResponse } from './types';
import { tokenStorage } from './tokenStorage';
import { ApiError } from '@/shared/errors/ApiError';

export interface LoginPayload {
    email: string;
    password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await httpClient<ApiResponse<AuthResponse>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true
    });

    if (!response.data) {
        throw new ApiError(500, 'Réponse d’authentification invalide');
    }

    tokenStorage.saveAuthResponse(response.data);
    return response.data;
}

export async function logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
        tokenStorage.clear();
        return;
    }

    try {
        await httpClient<ApiResponse<null>>('/api/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    } finally {
        tokenStorage.clear();
    }
}
