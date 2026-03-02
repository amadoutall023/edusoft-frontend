import { LucideIcon } from 'lucide-react';

export interface Etudiant {
    id: string;
    matricule: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    photo?: string;
    classe: string;
    classeInfo?: {
        id: string | null;
        libelle: string | null;
        filiere: { id: string; libelle: string } | null;
        niveau: { id: string; libelle: string } | null;
    };
    anneeInscription?: number;
    qrToken?: string;
    qrCodeImage?: string;
    dateOfBirth?: string;
    lieuNaissance?: string;
    nationalite?: string;
    address?: string;
    gender?: string;
    presence?: number;
    prochainCours?: {
        matiere: string;
        heure: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface EtudiantFormData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    lieuNaissace: string;
    nationalite: string;
    address: string;
    phone: string;
    gender: string;
    classeId: string;
}

export interface MenuAction {
    id: string;
    titre: string;
    sousTitre: string;
    icon: LucideIcon;
    couleur: string;
    route: string;
}

/*
 * Les types AbsenceRecord et EvaluationEtudiant sont maintenant definis 
 * dans src/modules/etudiant/services/dashboardService.ts
 * pour correspondre aux donnees retournees par l'API.
 */

// Type legacy pour compatibilite - utilise maintenant StudentAbsenceRecord dans dashboardService
export interface AbsenceRecord {
    id: string;
    date: string;
    matiere: string;
    type: 'absence' | 'retard';
    justifiee: boolean;
    heures: number;
}

// Type legacy pour compatibilite - utilise maintenant EvaluationEtudiant dans dashboardService
export interface EvaluationEtudiant {
    id: string;
    module: string;
    professeur: string;
    date: string;
    type: string;
    note?: number;
    moyenneClasse?: number;
}
