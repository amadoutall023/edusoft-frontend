'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';
import PedagogiqueContent from '@/modules/pedagogic/components/PedagogiqueContent';

export default function DashboardPage() {
    const router = useRouter();
    const { roles, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && roles.length > 0) {
            // Rediriger selon le rôle
            if (roles.includes('ROLE_ATTACHE_CLASSE')) {
                router.replace('/dashboard/attache-classe');
            } else if (roles.includes('ROLE_PROFESSOR')) {
                router.replace('/dashboard/cours');
            } else if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_RP')) {
                // Admin et RP voient le dashboard pédagogique
            }
            // Pour les autres rôles (RP, ADMIN), rester sur ce dashboard pédagogique
        }
    }, [roles, isLoading, router]);

    // Afficher le dashboard pédagogique par défaut pour Admin/RP
    return <PedagogiqueContent />;
}
