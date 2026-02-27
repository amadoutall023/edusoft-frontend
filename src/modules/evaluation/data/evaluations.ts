import { Evaluation, StatistiqueEvaluation } from '../types';

export const evaluations: Evaluation[] = [
    {
        id: 1,
        titre: 'Devoir surveiller-Algorithmique',
        classe: 'L1 CPD',
        professeur: 'Prof : Mr Niang',
        dateDepot: '12/12/2026',
        statut: 'A venir',
        statutNote: 'A deposer'
    },
    {
        id: 2,
        titre: 'Examen UX-UI Design',
        classe: 'L3-IAGE',
        professeur: 'Prof : mme Melba',
        dateDepot: '12/12/2026',
        statut: 'Passées',
        statutNote: 'Note deposees',
        fichiersDeposes: ['notes_tp_web.pdf', 'resultats_detailles.xlsx'],
        badges: ['Notes deposees']
    },
    {
        id: 3,
        titre: 'Devoir Afters effects',
        classe: 'L1 CPD',
        professeur: 'Prof : Mr Niang',
        dateDepot: '12/12/2026',
        statut: 'Passées',
        statutNote: 'Note en retard',
        badges: ['Notes En retard']
    },
    {
        id: 4,
        titre: 'TP Python Avancé',
        classe: 'L2 CDSD',
        professeur: 'Prof : Mme Diallo',
        dateDepot: '15/12/2026',
        statut: 'Passées',
        statutNote: 'Note deposees'
    },
    {
        id: 5,
        titre: 'Projet Web Development',
        classe: 'L3 CPD',
        professeur: 'Prof : Mr Sall',
        dateDepot: '20/12/2026',
        statut: 'A venir',
        statutNote: 'A deposer'
    }
];

export const statistiques: StatistiqueEvaluation[] = [
    {
        statut: 'A venir',
        nombre: 3,
        couleur: 'blue',
        icon: 'calendar'
    },
    {
        statut: 'Passées',
        nombre: 3,
        couleur: 'gray',
        icon: 'clipboard'
    },
    {
        statut: 'Note deposees',
        nombre: 3,
        couleur: 'green',
        icon: 'check'
    },
    {
        statut: 'Note en retard',
        nombre: 3,
        couleur: 'red',
        icon: 'x'
    }
];

export const classes = [
    'Toutes les classes',
    'L1 CPD',
    'L1 GRLS',
    'L2 CPD',
    'L2 CDSD',
    'L3 CPD',
    'L3-IAGE'
];
