'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';
import EtudiantDashboard from '@/modules/etudiant/components/EtudiantDashboard';
import EtudiantsContent from '@/modules/etudiant/components/EtudiantsContent';
import { Loader2 } from 'lucide-react';

export default function EtudiantsPage() {
    const router = useRouter();
    const { roles, isLoading, isAuthenticated } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Si pas connecté, rediriger vers la page de connexion
        if (!isLoading && !isAuthenticated) {
            router.replace('/connexion');
        }
    }, [isLoading, isAuthenticated, router]);

    // Afficher un loader pendant le chargement
    if (isLoading || !mounted) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-[#5B8DEF]" />
            </div>
        );
    }

    // Si pas connecté
    if (!isAuthenticated) {
        return null;
    }

    // Si c'est un étudiant ou un responsable, afficher son dashboard
    if (roles.includes('ROLE_ETUDIANT') || roles.includes('ROLE_RESPONSABLE')) {
        return <EtudiantDashboard />;
    }

    // Sinon (admin, RP, etc.), afficher la liste des étudiants
    return <EtudiantsContent />;
}
