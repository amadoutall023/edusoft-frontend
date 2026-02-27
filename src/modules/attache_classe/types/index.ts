// Types pour l'Attaché de Classe (AC)

export interface EtudiantAC {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    classe: string;
    niveau: string;
    matricule: string;
    statut: 'actif' | 'inactif' | 'suspendu';
}

export interface ClasseAC {
    id: string;
    nom: string;
    niveau: string;
    filiere: string;
    effectif: number;
    professeurPrincipal?: string;
}

export interface StatistiqueAC {
    titre: string;
    valeur: number;
    icon: string;
    couleur: string;
}

export interface SessionCoursAC {
    id: string;
    cours: string;
    niveau: string;
    professeur: string;
    date: string;
    heure: string;
    salle: string;
    statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
}

export interface AbsenceAC {
    id: string;
    etudiant: string;
    cours: string;
    date: string;
    justifiee: boolean;
}

export interface NoteAC {
    id: string;
    etudiant: string;
    cours: string;
    evaluation: string;
    note: number;
    date: string;
}

export interface DashboardACData {
    statistiques: StatistiqueAC[];
    sessionsJour: SessionCoursAC[];
    absencesRecentes: AbsenceAC[];
    alertes: string[];
}
