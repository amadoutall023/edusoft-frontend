import { DashboardACData, StatistiqueAC, SessionCoursAC, AbsenceAC } from '../types';

export const statistiquesAC: StatistiqueAC[] = [
    {
        titre: 'Étudiants inscrits',
        valeur: 145,
        icon: 'Users',
        couleur: '#5B8DEF'
    },
    {
        titre: "Cours aujourd'hui",
        valeur: 6,
        icon: 'BookOpen',
        couleur: '#10B981'
    },
    {
        titre: "Absences aujourd'hui",
        valeur: 8,
        icon: 'UserX',
        couleur: '#F59E0B'
    },
    {
        titre: 'Messages non lus',
        valeur: 3,
        icon: 'MessageSquare',
        couleur: '#EF4444'
    }
];

export const sessionsJourAC: SessionCoursAC[] = [
    {
        id: '1',
        cours: 'Mathématiques',
        niveau: 'Terminale S',
        professeur: 'M. Diallo',
        date: '2024-01-15',
        heure: '08:00 - 09:30',
        salle: 'Salle 101',
        statut: 'termine'
    },
    {
        id: '2',
        cours: 'Physique-Chimie',
        niveau: 'Terminale S',
        professeur: 'Mme. Kouyaté',
        date: '2024-01-15',
        heure: '10:00 - 11:30',
        salle: 'Laboratoire 1',
        statut: 'en_cours'
    },
    {
        id: '3',
        cours: 'Histoire-Géo',
        niveau: 'Terminale S',
        professeur: 'M. Martin',
        date: '2024-01-15',
        heure: '14:00 - 15:30',
        salle: 'Salle 203',
        statut: 'planifie'
    },
    {
        id: '4',
        cours: 'Philosophie',
        niveau: 'Terminale S',
        professeur: 'Mme. Bernard',
        date: '2024-01-15',
        heure: '16:00 - 17:30',
        salle: 'Salle 105',
        statut: 'planifie'
    }
];

export const absencesRecentesAC: AbsenceAC[] = [
    {
        id: '1',
        etudiant: 'Amadou Diallo',
        cours: 'Mathématiques',
        date: '2024-01-15',
        justifiee: false
    },
    {
        id: '2',
        etudiant: 'Fatou Sow',
        cours: 'Physique-Chimie',
        date: '2024-01-15',
        justifiee: true
    },
    {
        id: '3',
        etudiant: 'Moussa Faye',
        cours: 'Histoire-Géo',
        date: '2024-01-14',
        justifiee: false
    },
    {
        id: '4',
        etudiant: "Aïcha Ndiaye",
        cours: 'Mathématiques',
        date: '2024-01-14',
        justifiee: true
    }
];

export const alertesAC: string[] = [
    "3 étudiants n'ont pas soumis leurs devoirs de mathématiques",
    "Réunion des parents demain à 14h",
    '2 cours nécessitent une validation'
];

export const dashboardACData: DashboardACData = {
    statistiques: statistiquesAC,
    sessionsJour: sessionsJourAC,
    absencesRecentes: absencesRecentesAC,
    alertes: alertesAC
};
