export interface StatistiqueDashboard {
    titre: string;
    valeur: number;
    icon: string;
    couleur: string;
}

export interface SessionAVenir {
    id: string;
    cours: string;
    niveau: string;
    professeur: string;
    couleur: string;
    dateLabel?: string;
    heureLabel?: string;
}

export interface StatutCours {
    label: string;
    nombre: number;
    couleur: string;
}

export interface ProgressionCours {
    mois: string;
    enRetard: number;
    attention: number;
    enCours: number;
    termine: number;
}

export interface SessionAnnulee {
    cours: string;
    niveau: string;
    professeur: string;
    date: string;
}
