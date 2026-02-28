'use client';

import { useAuth } from '@/modules/auth/context/AuthContext';
import ProfesseursContent from '@/modules/prof/components/ProfesseursContent';
import AttacheProfesseurContent from '@/modules/prof/components/AttacheProfesseurContent';

export default function ProfesseursPage() {
    const { roles } = useAuth();

    // Pour les attachés de classe, afficher la version sans boutons d'action
    const isAttache = roles.includes('ROLE_ATTACHE_CLASSE');

    if (isAttache) {
        return <AttacheProfesseurContent />;
    }

    return <ProfesseursContent />;
}
