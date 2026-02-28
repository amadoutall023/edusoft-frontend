'use client';

import { useAuth } from '@/modules/auth/context/AuthContext';
import ProfesseursContent from '@/modules/prof/components/ProfesseursContent';
import AttacheProfesseurContent from '@/modules/prof/components/AttacheProfesseurContent';
import ProfessorDashboardContent from '@/modules/prof/components/ProfessorDashboardContent';

export default function ProfesseursPage() {
    const { roles } = useAuth();

    // Pour le professeur, afficher son dashboard personnel
    const isProfesseur = roles.includes('ROLE_PROFESSEUR');
    
    // Pour les attachés de classe, afficher la version sans boutons d'action
    const isAttache = roles.includes('ROLE_ATTACHE_CLASSE');

    if (isProfesseur) {
        return <ProfessorDashboardContent />;
    }

    if (isAttache) {
        return <AttacheProfesseurContent />;
    }

    return <ProfesseursContent />;
}
