'use client';

import { useAuth } from '@/modules/auth/context/AuthContext';
import AdministrationContent from '@/modules/admin/components/AdministrationContent';
import AttacheAdministrationContent from '@/modules/admin/components/AttacheAdministrationContent';

export default function AdministrationPage() {
    const { roles } = useAuth();

    // Pour les attachés de classe, afficher la version sans boutons d'action
    const isAttache = roles.includes('ROLE_ATTACHE_CLASSE');

    if (isAttache) {
        return <AttacheAdministrationContent />;
    }

    return <AdministrationContent />;
}
