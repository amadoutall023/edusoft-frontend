import {
    StatistiqueDashboard,
    SessionAVenir,
    StatutCours,
    ProgressionCours,
    SessionAnnulee
} from '../types';

export const statistiques: StatistiqueDashboard[] = [
    {
        titre: 'Nombre de classes',
        valeur: 68,
        icon: '📚',
        couleur: '#5B8DEF'
    },
    {
        titre: "Nombre d'élèves",
        valeur: 860,
        icon: '🎓',
        couleur: '#10b981'
    },
    {
        titre: 'Nombre de filières',
        valeur: 40,
        icon: '📋',
        couleur: '#f59e0b'
    },
    {
        titre: 'Professeurs actifs',
        valeur: 45,
        icon: '👨‍🏫',
        couleur: '#8b5cf6'
    }
];

export const sessionsAVenir: SessionAVenir[] = [
    {
        id: 1,
        cours: 'Typescript',
        niveau: 'L3 - CDSD',
        professeur: 'Prof. Aly TALL',
        couleur: '#10b981'
    },
    {
        id: 2,
        cours: 'UX Design',
        niveau: 'L1 - CPD',
        professeur: 'Prof. Melba ORLIE',
        couleur: '#10b981'
    },
    {
        id: 3,
        cours: 'English for IT',
        niveau: 'L3 - MAIE',
        professeur: 'Prof. Mansour DIALLO',
        couleur: '#10b981'
    }
];

export const statutsCours: StatutCours[] = [
    { label: 'En retard', nombre: 5, couleur: '#ef4444' },
    { label: 'Attention', nombre: 3, couleur: '#f59e0b' },
    { label: 'En cours', nombre: 18, couleur: '#3b82f6' },
    { label: 'Terminé', nombre: 22, couleur: '#10b981' }
];

export const progressionMensuelle: ProgressionCours[] = [
    { mois: 'Sep', enRetard: 2, attention: 1, enCours: 5, termine: 0 },
    { mois: 'Oct', enRetard: 3, attention: 2, enCours: 8, termine: 2 },
    { mois: 'Nov', enRetard: 4, attention: 2, enCours: 12, termine: 5 },
    { mois: 'Déc', enRetard: 4, attention: 3, enCours: 15, termine: 8 },
    { mois: 'Jan', enRetard: 5, attention: 2, enCours: 16, termine: 12 },
    { mois: 'Fév', enRetard: 5, attention: 3, enCours: 17, termine: 15 },
    { mois: 'Mars', enRetard: 5, attention: 3, enCours: 18, termine: 18 },
    { mois: 'Avr', enRetard: 5, attention: 3, enCours: 18, termine: 20 },
    { mois: 'Mai', enRetard: 5, attention: 3, enCours: 18, termine: 22 }
];

export const sessionAnnulee: SessionAnnulee = {
    cours: 'Session de management',
    niveau: 'L2 - CPD',
    professeur: 'Prof. Amadou SALL',
    date: 'demain'
};

