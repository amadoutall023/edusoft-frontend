import { UUID, SessionType, SessionStatus } from '@/shared/api/types';

export interface Evaluation {
    id: number;
    uuid: string; // UUID original pour les appels API
    titre: string;
    classe: string;
    professeur: string;
    dateDepot: string;
    statut: 'A venir' | 'Passées';
    statutNote: 'A deposer' | 'Note deposees' | 'Note en retard';
    fichiersDeposes?: string[];
    badges?: string[];
}

// Types pour les données du backend (sessions de type EVALUATION)
export interface EvaluationFromBackend {
    id: UUID;
    libelle: string;
    date: string;
    startHour: string;
    endHour: string;
    typeSession: SessionType;
    modeSession: 'PRESENTIEL' | 'EN_LIGNE' | 'HYBRIDE';
    status: SessionStatus;
    sessionSummary?: string | null;
    cours?: {
        id: UUID;
        libelle: string;
    } | null;
    module?: {
        id: UUID;
        libelle: string;
    } | null;
    classe?: {
        id: UUID;
        libelle: string;
    } | null;
    classes?: {
        id: UUID;
        libelle: string;
    }[] | null;
    professor?: {
        id: UUID;
        nom?: string | null;
        prenom?: string | null;
    } | null;
    salle?: {
        id: UUID;
        libelle: string;
    } | null;
}

// Statut de l'évaluation
export type StatutEvaluation = 'A venir' | 'Passées' | 'Note deposees' | 'Note en retard';
export type StatutNote = 'A deposer' | 'Note deposees' | 'Note en retard';

// Statistiques pour les cartes
export interface StatistiqueEvaluation {
    statut: 'A venir' | 'Passées' | 'Note deposees' | 'Note en retard';
    nombre: number;
    couleur: string;
    icon: string;
}

// Filtres
export interface FiltreEvaluation {
    statut?: string;
    classe?: string;
    statutNote?: string;
}

// Données de classe pour les filtres
export interface ClasseOption {
    id: UUID;
    libelle: string;
}
