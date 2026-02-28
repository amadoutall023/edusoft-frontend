'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextShape, AuthUser, LoginCredentials } from '../types';
import { tokenStorage } from '@/shared/api/tokenStorage';
import { login as loginRequest, logout as logoutRequest } from '@/shared/api/authService';
import { ApiError } from '@/shared/errors/ApiError';

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [school, setSchool] = useState<AuthContextShape['school']>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        const session = tokenStorage.getSession();
        if (session) {
            setUser(session.user);
            setRoles(session.roles);
            setSchool(session.school ?? null);
        }

        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const auth = await loginRequest(credentials);
        const authUser: AuthUser = {
            id: auth.userId,
            email: auth.email,
            firstName: auth.firstName,
            lastName: auth.lastName,
            schoolId: auth.ecoleId ?? null
        };
        setUser(authUser);
        setRoles(auth.roles);
        setSchool(auth.ecole ?? null);
    };

    const logout = async () => {
        try {
            await logoutRequest();
        } catch (error) {
            if (error instanceof ApiError) {
                console.warn('Erreur lors de la déconnexion:', error.message);
            } else {
                console.warn('Erreur inattendue lors de la déconnexion:', error);
            }
        } finally {
            setUser(null);
            setRoles([]);
            setSchool(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            roles,
            school,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
