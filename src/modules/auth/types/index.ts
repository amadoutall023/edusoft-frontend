import { SchoolInfoResponse } from '@/shared/api/types';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    schoolId?: string | null;
}

export interface AuthState {
    user: User | null;
    roles: string[];
    school: SchoolInfoResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthContextShape extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// Types de notifications
export type NotificationType =
    | 'NOUVELLE'
    | 'INSCRIPTION'
    | 'SESSION_ANNULEE'
    | 'COURS_TERMINEE'
    | 'EMARGEMENT'
    | 'EVALUATION'
    | 'NOTE';

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
}
