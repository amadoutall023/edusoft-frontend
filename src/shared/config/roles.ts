import { LayoutGrid, Book, Users, UserCheck, Calendar, Settings, Building2 } from 'lucide-react';

// Types de rôles dans l'application (correspondance avec le backend)
export type UserRole = 'ROLE_ADMIN' | 'ROLE_RP' | 'ROLE_ATTACHE_CLASSE' | 'ROLE_DIRECTRICE' | 'ROLE_PROFESSEUR' | 'ROLE_SUPER_ADMIN';

// Labels lisibles pour chaque rôle
export const RoleLabels: Record<UserRole, string> = {
    'ROLE_SUPER_ADMIN': 'Super Administrateur',
    'ROLE_ADMIN': 'Administrateur',
    'ROLE_RP': 'Responsable Pédagogique',
    'ROLE_ATTACHE_CLASSE': 'Attaché de Classe',
    'ROLE_DIRECTRICE': 'Directrice',
    'ROLE_PROFESSEUR': 'Professeur',
};

// Interface pour les éléments de menu
export interface MenuItem {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
    path: string;
    roles: UserRole[];
}

// Configuration des menus par rôle
// Le menu est identique pour tous les profils
// C'est le CONTENU des pages qui change selon le rôle
// "Tableau de bord" et "Cours" redirigent vers des pages spécifiques pour l'Attaché
export const menuItemsByRole: MenuItem[] = [
    // Tableau de bord - redirige dynamiquement selon le rôle
    { icon: LayoutGrid, label: 'Tableau de bord', path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Cours - redirige vers la page appropriée selon le rôle
    { icon: Book, label: 'Cours', path: '/dashboard/cours', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Étudiants - pour tous les rôles
    { icon: Users, label: 'Étudiants', path: '/dashboard/etudiant', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Professeurs - redirection dynamique selon le rôle dans la page
    { icon: UserCheck, label: 'Professeurs', path: '/dashboard/prof', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR', 'ROLE_SUPER_ADMIN'] },

    // Administration - pour tous les rôles
    { icon: Users, label: 'Administration', path: '/dashboard/administration', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Planning - pour tous les rôles
    { icon: Calendar, label: 'Planning', path: '/dashboard/planning', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Structure académique - pour tous les rôles
    { icon: Building2, label: 'Structure académique', path: '/dashboard/structure', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },

    // Paramètres - pour tous
    { icon: Settings, label: 'Paramètre', path: '/dashboard/parametres', roles: ['ROLE_ADMIN', 'ROLE_RP', 'ROLE_ATTACHE_CLASSE', 'ROLE_DIRECTRICE', 'ROLE_PROFESSEUR'] },
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
