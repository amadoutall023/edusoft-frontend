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

