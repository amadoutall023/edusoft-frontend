'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { membresAdministrationData } from '@/modules/admin/data/membres';

interface AuthContextType extends AuthState {
    login: (login: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        // Add a timeout to prevent infinite loading state
        const timeoutId = setTimeout(() => {
            console.warn('Auth loading timeout - forcing isLoading to false');
            setIsLoading(false);
        }, 5000); // 5 second timeout fallback

        // Only run on client side
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        try {
            const savedUser = localStorage.getItem('ecole_ism_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                // Validate that the parsed user has required fields
                if (parsedUser && parsedUser.id && parsedUser.login) {
                    setUser(parsedUser);
                    console.log('User loaded from localStorage:', parsedUser);
                }
            }
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            // Clear invalid data from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('ecole_ism_user');
            }
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    }, []);

    const login = (loginInput: string): boolean => {
        // Find user by login
        const foundMember = membresAdministrationData.find(
            m => m.login.toLowerCase() === loginInput.toLowerCase()
        );

        if (foundMember) {
            const user: User = {
                id: foundMember.id,
                prenom: foundMember.prenom,
                nom: foundMember.nom,
                role: foundMember.role,
                login: foundMember.login
            };
            setUser(user);
            localStorage.setItem('ecole_ism_user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ecole_ism_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
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

