'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';
import PedagogiqueContent from '@/modules/pedagogic/components/PedagogiqueContent';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { roles, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && roles.length > 0) {
            // Rediriger selon le rôle
            if (roles.includes('ROLE_ATTACHE_CLASSE')) {
                router.replace('/dashboard/attache-classe');
            } else if (roles.includes('ROLE_PROFESSEUR')) {
                router.replace('/dashboard/prof');
            }
            // Pour les autres rôles (RP, ADMIN), rester sur ce dashboard pédagogique
        }
    }, [roles, isLoading, router]);

    // Afficher un loader pendant le chargement ou la redirection
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Ne pas afficher le dashboard pédagogique pour les rôles qui seront redirigés
    if (roles.includes('ROLE_ATTACHE_CLASSE') || roles.includes('ROLE_PROFESSEUR')) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Afficher le dashboard pédagogique par défaut pour Admin/RP
    return <PedagogiqueContent />;
}
