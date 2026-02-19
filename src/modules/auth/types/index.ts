export interface User {
    id: number;
    prenom: string;
    nom: string;
    role: string;
    login: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    login: string;
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

