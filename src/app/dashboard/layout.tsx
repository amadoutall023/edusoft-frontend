'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/connexion');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #5B8DEF 0%, #4A7ACC 50%, #3E6AB8 100%)',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                        Chargement...
                    </span>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

