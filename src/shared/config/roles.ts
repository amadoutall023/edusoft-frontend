import { LayoutGrid, Book, Users, UserCheck, Calendar, Settings, Building2, ClipboardList, User } from 'lucide-react';

// Types de rôles dans l'application (correspondance avec le backend)
export type UserRole = 'ROLE_ADMIN' | 'ROLE_RP' | 'ROLE_ATTACHE_CLASSE' | 'ROLE_DIRECTRICE' | 'ROLE_PROFESSEUR' | 'ROLE_SUPER_ADMIN' | 'ROLE_ETUDIANT';

// Labels lisibles pour chaque rôle
export const RoleLabels: Record<UserRole, string> = {
    'ROLE_SUPER_ADMIN': 'Super Administrateur',
    'ROLE_ADMIN': 'Administrateur',
    'ROLE_RP': 'Responsable Pédagogique',
    'ROLE_ATTACHE_CLASSE': 'Attaché de Classe',
    'ROLE_DIRECTRICE': 'Directrice',
    'ROLE_PROFESSEUR': 'Professeur',
    'ROLE_ETUDIANT': 'Étudiant',
};

// Interface pour les éléments de menu
export interface MenuItem {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
    path: string;
    roles: UserRole[];
}


export const menuItemsByRole: MenuItem[] = [
    // Tableau de bord - pour tous les rôles
    { icon: LayoutGrid, label: 'Tableau de bord', path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR', 'ROLE_SUPER_ADMIN', 'ROLE_ETUDIANT'] },

    // Cours - pour tous les rôles
    { icon: Book, label: 'Cours', path: '/dashboard/cours', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Planning - pour tous les rôles
    { icon: Calendar, label: 'Planning', path: '/dashboard/planning', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Étudiants - pour admin, RP, AC, Directrice (PAS pour PROFESSEUR et ETUDIANT)
    { icon: Users, label: 'Étudiants', path: '/dashboard/etudiant', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_SUPER_ADMIN'] },

    // Mon Profil - pour les étudiants
    { icon: User, label: 'Mon Profil', path: '/dashboard/etudiant/profil', roles: ['ROLE_ETUDIANT'] },

    // Mes Cours - pour les étudiants
    { icon: Book, label: 'Mes Cours', path: '/dashboard/etudiant/cours', roles: ['ROLE_ETUDIANT'] },

    // Mon Planning - pour les étudiants
    { icon: Calendar, label: 'Mon Planning', path: '/dashboard/etudiant/planning', roles: ['ROLE_ETUDIANT'] },

    // Mes Évaluations - pour les étudiants
    { icon: ClipboardList, label: 'Mes Évaluations', path: '/dashboard/etudiant/evaluation', roles: ['ROLE_ETUDIANT'] },

    // Professeurs - pour admin, RP, AC, Directrice (PAS pour PROFESSEUR)
    { icon: UserCheck, label: 'Professeurs', path: '/dashboard/prof', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_SUPER_ADMIN'] },

    // Administration - pour admin, RP, AC, Directrice (PAS pour PROFESSEUR)
    { icon: Users, label: 'Administration', path: '/dashboard/administration', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_SUPER_ADMIN'] },

    // Structure académique - pour admin, RP, AC, Directrice (PAS pour PROFESSEUR)
    { icon: Building2, label: 'Structure académique', path: '/dashboard/structure', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_SUPER_ADMIN'] },

    // Paramètres - pour admin, RP, Directrice (PAS pour PROFESSEUR et ATTACHE_CLASSE)
    // { icon: Settings, label: 'Paramètre', path: '/dashboard/parametres', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_DIRECTRICE', 'ROLE_SUPER_ADMIN'] },
];

// Fonction pour filtrer les éléments du menu par rôle
export function getMenuItemsByRoles(userRoles: string[]): MenuItem[] {
    // Mapper les rôles frontend vers les rôles backend
    const mappedRoles = userRoles.map(role => {
        // ROLE_ADMINISTRATEUR -> ROLE_ADMIN
        if (role === 'ROLE_ADMINISTRATEUR') return 'ROLE_ADMIN';
        // ROLE_AC -> ROLE_ATTACHE_CLASSE
        if (role === 'ROLE_AC') return 'ROLE_ATTACHE_CLASSE';
        return role;
    });

    return menuItemsByRole.filter(item =>
        item.roles.some(role => mappedRoles.includes(role))
    );
}
