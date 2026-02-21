import { AuthResponse, TokenResponse } from './types';

const STORAGE_KEY = 'edusoft_session';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    schoolId?: string | null;
}

export interface StoredSession {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: AuthUser;
    roles: string[];
    school?: AuthResponse['ecole'];
}

const isBrowser = () => typeof window !== 'undefined';

function readSession(): StoredSession | null {
    if (!isBrowser()) {
        return null;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }
    try {
        const parsed = JSON.parse(raw) as StoredSession;
        return parsed;
    } catch (error) {
        console.warn('[tokenStorage] Impossible de parser la session, suppression.', error);
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

function persistSession(session: StoredSession | null) {
    if (!isBrowser()) {
        return;
    }
    if (!session) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function computeExpiresAt(tokens: TokenResponse) {
    return Date.now() + tokens.expiresIn * 1000 - 5_000; // marge de sécurité
}

export const tokenStorage = {
    getSession(): StoredSession | null {
        return readSession();
    },

    getAccessToken(): string | null {
        return readSession()?.accessToken ?? null;
    },

    getRefreshToken(): string | null {
        return readSession()?.refreshToken ?? null;
    },

    hasValidAccessToken(): boolean {
        const session = readSession();
        if (!session) {
            return false;
        }
        return session.expiresAt > Date.now();
    },

    saveAuthResponse(auth: AuthResponse) {
        const session: StoredSession = {
            accessToken: auth.tokens.accessToken,
            refreshToken: auth.tokens.refreshToken,
            expiresAt: computeExpiresAt(auth.tokens),
            user: {
                id: auth.userId,
                email: auth.email,
                firstName: auth.firstName,
                lastName: auth.lastName,
                schoolId: auth.ecoleId ?? null
            },
            roles: auth.roles,
            school: auth.ecole
        };
        persistSession(session);
    },

    updateTokens(tokens: TokenResponse) {
        const session = readSession();
        if (!session) {
            return;
        }
        session.accessToken = tokens.accessToken;
        session.refreshToken = tokens.refreshToken;
        session.expiresAt = computeExpiresAt(tokens);
        persistSession(session);
    },

    clear() {
        persistSession(null);
    }
};
